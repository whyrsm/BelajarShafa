'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCourses, Course, CourseFilters } from '@/lib/api/courses';
import { getCategories, Category } from '@/lib/api/categories';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { Plus, BookOpen, Eye, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<CourseFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower) ||
      course.category.name.toLowerCase().includes(searchLower)
    );
  });

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
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Modul</h1>
            <p className="text-muted-foreground mt-1">Kelola modul pembelajaran</p>
          </div>
          {canCreateCourse && (
            <Link href="/dashboard/courses/create">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Buat Modul
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Search and Category Filter in One Row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="Cari berdasarkan judul, deskripsi, atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  className="w-full px-3 py-1 border rounded-md h-9 text-sm"
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
                <h3 className="text-lg font-semibold mb-2">Belum ada modul</h3>
                <p className="text-muted-foreground mb-4">
                  {canCreateCourse
                    ? 'Buat modul pertama Anda untuk memulai'
                    : 'Belum ada modul yang tersedia'}
                </p>
                {canCreateCourse && (
                  <Link href="/dashboard/courses/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Modul
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada hasil</h3>
                <p className="text-muted-foreground mb-4">
                  Tidak ditemukan modul yang sesuai dengan pencarian Anda.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Reset Pencarian
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-center">Topik</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {course.description || 'Tidak ada deskripsi'}
                    </TableCell>
                    <TableCell>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        {course.category.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {course.level === 'BEGINNER' && 'Pemula'}
                      {course.level === 'INTERMEDIATE' && 'Menengah'}
                      {course.level === 'ADVANCED' && 'Lanjutan'}
                    </TableCell>
                    <TableCell>
                      {course.type === 'PUBLIC' ? 'Umum' : 'Private'}
                    </TableCell>
                    <TableCell className="text-center">
                      {course._count?.topics || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

