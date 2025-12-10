'use client';

import { useState, useEffect } from 'react';
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
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const courseInfoSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  thumbnailUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  level: z.nativeEnum(CourseLevel),
  estimatedDuration: z.number().int().min(0, 'Durasi harus positif').optional(),
  prerequisites: z.string().max(500, 'Prasyarat maksimal 500 karakter').optional(),
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

  const watchedThumbnail = watch('thumbnailUrl');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (watchedThumbnail) {
      setThumbnailPreview(watchedThumbnail);
    } else {
      setThumbnailPreview(null);
    }
  }, [watchedThumbnail]);

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
              <textarea
                id="description"
                {...register('description')}
                placeholder="Deskripsi modul..."
                className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {watch('description')?.length || 0} / 1000 karakter
              </p>
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
              <textarea
                id="prerequisites"
                {...register('prerequisites')}
                placeholder="Prasyarat untuk mengikuti modul ini..."
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {watch('prerequisites')?.length || 0} / 500 karakter
              </p>
              {errors.prerequisites && (
                <p className="text-sm text-destructive">{errors.prerequisites.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">URL Thumbnail</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnailUrl"
                  {...register('thumbnailUrl')}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
                {thumbnailPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleThumbnailRemove}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {errors.thumbnailUrl && (
                <p className="text-sm text-destructive">{errors.thumbnailUrl.message}</p>
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
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold mb-4">Preview Thumbnail</h3>
              {thumbnailPreview ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                    onError={() => setThumbnailPreview(null)}
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Tidak ada thumbnail</p>
                  </div>
                </div>
              )}
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
