'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourses, Course, CourseFilters } from '@/lib/api/courses';
import { getCategories, Category } from '@/lib/api/categories';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { Plus, BookOpen, Filter } from 'lucide-react';
import { Select } from '@/components/ui/select';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<CourseFilters>({});

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData, userData] = await Promise.all([
        getCourses(filters),
        getCategories(),
        getProfile(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
      if (err instanceof Error && err.message.includes('401')) {
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const canCreateCourse = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kursus</h1>
            <p className="text-muted-foreground mt-1">Kelola kursus pembelajaran</p>
          </div>
          {canCreateCourse && (
            <Link href="/dashboard/courses/create">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Buat Kursus
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.categoryId || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, categoryId: e.target.value || undefined })
                  }
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.level || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, level: e.target.value as any || undefined })
                  }
                >
                  <option value="">Semua Level</option>
                  <option value="BEGINNER">Pemula</option>
                  <option value="INTERMEDIATE">Menengah</option>
                  <option value="ADVANCED">Lanjutan</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipe</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.type || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value as any || undefined })
                  }
                >
                  <option value="">Semua Tipe</option>
                  <option value="PUBLIC">Umum</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Courses List */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum ada kursus</h3>
                <p className="text-muted-foreground mb-4">
                  {canCreateCourse
                    ? 'Buat kursus pertama Anda untuk memulai'
                    : 'Belum ada kursus yang tersedia'}
                </p>
                {canCreateCourse && (
                  <Link href="/dashboard/courses/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Kursus
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description || 'Tidak ada deskripsi'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                        {course.category.name}
                      </span>
                      <span>{course.level}</span>
                    </div>
                    {course._count && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {course._count.topics} Topik
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

