'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CourseCard } from '@/components/courses/CourseCard';
import { getMyEnrollments, Enrollment } from '@/lib/api/enrollments';
import { BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const enrollmentsData = await getMyEnrollments();
      setEnrollments(enrollmentsData);
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

  // Filter enrollments based on search query
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const searchLower = searchQuery.toLowerCase();
    const course = enrollment.course;
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower) ||
      course.category.name.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Modul Saya</h1>
          <p className="text-muted-foreground">Kelola dan lanjutkan pembelajaran Anda</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari berdasarkan judul, deskripsi, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {filteredEnrollments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'Tidak ada modul' : 'Belum ada modul'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Tidak ditemukan modul yang sesuai dengan pencarian Anda.'
                    : 'Mulai jelajahi dan daftar ke modul untuk memulai pembelajaran'}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/courses/explore">
                    <Button>
                      Jelajahi Modul
                    </Button>
                  </Link>
                )}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="text-primary hover:underline"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                course={enrollment.course}
                showProgress={true}
                progressPercent={enrollment.progressPercent}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

