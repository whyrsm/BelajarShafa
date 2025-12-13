'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Course, CourseLevel, CourseType, UpdateCourseData } from '@/lib/api/courses';
import { Category, getCategories } from '@/lib/api/categories';
import { useWizardContext } from './CourseManagementWizard';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { uploadImage } from '@/lib/api/upload';

const courseInfoSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  level: z.nativeEnum(CourseLevel),
  estimatedDuration: z.number().int().min(0, 'Durasi harus positif').optional(),
  prerequisites: z.string().optional(),
  type: z.nativeEnum(CourseType),
  categoryId: z.string().uuid('Kategori tidak valid'),
  isActive: z.boolean().optional(),
});

type CourseInfoFormData = z.infer<typeof courseInfoSchema>;

interface CourseInfoEditorProps {
  course: Course;
}

export function CourseInfoEditor({ course }: CourseInfoEditorProps) {
  const { courseData, setCourseData } = useWizardContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course.thumbnailUrl || null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CourseInfoFormData>({
    resolver: zodResolver(courseInfoSchema),
    defaultValues: {
      title: courseData.title || course.title,
      description: courseData.description || course.description || '',
      thumbnailUrl: courseData.thumbnailUrl || course.thumbnailUrl || '',
      level: (courseData.level as CourseLevel) || course.level,
      estimatedDuration: courseData.estimatedDuration || course.estimatedDuration || undefined,
      prerequisites: courseData.prerequisites || course.prerequisites || '',
      type: (courseData.type as CourseType) || course.type,
      categoryId: courseData.categoryId || course.categoryId,
      isActive: courseData.isActive !== undefined ? courseData.isActive : course.isActive,
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const onSubmit = (data: CourseInfoFormData) => {
    const updateData: UpdateCourseData = {
      title: data.title,
      description: data.description || undefined,
      thumbnailUrl: data.thumbnailUrl || undefined,
      level: data.level,
      estimatedDuration: data.estimatedDuration,
      prerequisites: data.prerequisites || undefined,
      type: data.type,
      categoryId: data.categoryId,
      isActive: data.isActive,
    };
    setCourseData(updateData);
  };

  const handleThumbnailRemove = () => {
    setValue('thumbnailUrl', '');
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setUploadingThumbnail(true);
    try {
      const response = await uploadImage(file);
      if (response.success && response.data.imageUrl) {
        setValue('thumbnailUrl', response.data.imageUrl);
        setThumbnailPreview(response.data.imageUrl);
      }
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      alert('Gagal mengunggah thumbnail. Silakan coba lagi.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const getLevelLabel = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return 'Pemula';
      case CourseLevel.INTERMEDIATE:
        return 'Menengah';
      case CourseLevel.ADVANCED:
        return 'Lanjutan';
      default:
        return level;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Judul Modul *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Masukkan judul modul"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <RichTextEditor
                value={watch('description') || ''}
                onChange={(value) => setValue('description', value, { shouldDirty: true })}
                placeholder="Deskripsi modul..."
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Tingkat Kesulitan *</Label>
                <select
                  id="level"
                  {...register('level')}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                >
                  {Object.values(CourseLevel).map((level) => (
                    <option key={level} value={level}>
                      {getLevelLabel(level)}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className="text-sm text-destructive">{errors.level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Durasi Estimasi (menit)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="0"
                  {...register('estimatedDuration', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.estimatedDuration && (
                  <p className="text-sm text-destructive">{errors.estimatedDuration.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Modul *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                >
                  <option value={CourseType.PUBLIC}>Umum (Public)</option>
                  <option value={CourseType.PRIVATE}>Private</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategori *</Label>
                {loadingCategories ? (
                  <div className="w-full px-3 py-2 text-sm rounded-md border border-input bg-muted animate-pulse">
                    Memuat kategori...
                  </div>
                ) : (
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Tambahan</h3>

            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prasyarat</Label>
              <RichTextEditor
                value={watch('prerequisites') || ''}
                onChange={(value) => setValue('prerequisites', value, { shouldDirty: true })}
                placeholder="Prasyarat untuk mengikuti modul ini..."
                maxLength={500}
              />
              {errors.prerequisites && (
                <p className="text-sm text-destructive">{errors.prerequisites.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-4 h-4 rounded border-input"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktifkan modul (modul akan terlihat oleh pengguna)
              </Label>
            </div>
          </div>
        </div>

        {/* Right Column - Thumbnail Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold">Preview Thumbnail</h3>
              {thumbnailPreview ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border group">
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                    onError={() => setThumbnailPreview(null)}
                  />
                  <button
                    type="button"
                    onClick={handleThumbnailRemove}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Tidak ada thumbnail</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={uploadingThumbnail}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                >
                  {uploadingThumbnail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Unggah Thumbnail
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG, GIF, atau WEBP (maks. 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty}>
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}
