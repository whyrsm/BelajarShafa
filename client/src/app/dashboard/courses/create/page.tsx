'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCourse, CreateCourseData, CourseLevel, CourseType } from '@/lib/api/courses';
import { getCategories, Category } from '@/lib/api/categories';
import { ArrowLeft, Plus } from 'lucide-react';

const createCourseSchema = z.object({
  title: z.string().min(3, 'Judul modul minimal 3 karakter'),
  description: z.string().optional(),
  level: z.nativeEnum(CourseLevel),
  type: z.nativeEnum(CourseType),
  categoryId: z.string().min(1, 'Harap pilih kategori'),
});

type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      level: CourseLevel.BEGINNER,
      type: CourseType.PUBLIC,
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
      setError(err instanceof Error ? err.message : 'Gagal memuat kategori');
    }
  };

  const onSubmit = async (data: CreateCourseFormValues) => {
    setLoading(true);
    setError('');

    try {
      const courseData: CreateCourseData = {
        title: data.title,
        description: data.description,
        level: data.level,
        type: data.type,
        categoryId: data.categoryId,
      };

      const newCourse = await createCourse(courseData);
      router.push(`/dashboard/courses/${newCourse.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat modul');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary" />
              Buat Modul Baru
            </CardTitle>
            <CardDescription>
              Buat modul baru. Anda dapat menambahkan topik dan materi setelah modul dibuat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Judul Modul <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="contoh: Pengenalan Aqidah Islam"
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  placeholder="Jelaskan tentang modul ini..."
                  {...register('description')}
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">
                    Level <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="level"
                    {...register('level')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value={CourseLevel.BEGINNER}>Pemula</option>
                    <option value={CourseLevel.INTERMEDIATE}>Menengah</option>
                    <option value={CourseLevel.ADVANCED}>Lanjutan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipe Modul <span className="text-destructive">*</span>
                </Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value={CourseType.PUBLIC}>Umum (Semua bisa akses)</option>
                  <option value={CourseType.PRIVATE}>Private (Hanya kelas tertentu)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Link href="/dashboard/courses">
                  <Button type="button" variant="outline" className="flex-1">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Membuat...' : 'Buat Modul'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

