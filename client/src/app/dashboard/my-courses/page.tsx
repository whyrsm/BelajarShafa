'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from '@/components/courses/CourseCard';
import { getMyEnrollments, Enrollment } from '@/lib/api/enrollments';
import { BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FilterType = 'all' | 'in-progress' | 'completed' | 'not-started';
type SortType = 'recent' | 'progress' | 'enrollment';

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');

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

  const getCourseStatus = (enrollment: Enrollment): 'in-progress' | 'completed' | 'not-started' => {
    if (enrollment.completedAt || enrollment.progressPercent === 100) {
      return 'completed';
    }
    if (enrollment.progressPercent > 0) {
      return 'in-progress';
    }
    return 'not-started';
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === 'all') return true;
    const status = getCourseStatus(enrollment);
    return status === filter;
  });

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    switch (sort) {
      case 'recent':
        return new Date(b.lastAccessedAt || b.enrolledAt).getTime() - 
               new Date(a.lastAccessedAt || a.enrolledAt).getTime();
      case 'progress':
        return b.progressPercent - a.progressPercent;
      case 'enrollment':
        return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      default:
        return 0;
    }
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

        {/* Filters and Sort */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Urutkan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                >
                  <option value="all">Semua Modul</option>
                  <option value="in-progress">Sedang Berjalan</option>
                  <option value="completed">Selesai</option>
                  <option value="not-started">Belum Dimulai</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Urutkan Berdasarkan</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                >
                  <option value="recent">Terakhir Diakses</option>
                  <option value="progress">Progress</option>
                  <option value="enrollment">Tanggal Pendaftaran</option>
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

        {/* Courses Grid */}
        {sortedEnrollments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'all' ? 'Belum ada modul' : 'Tidak ada modul dengan status ini'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filter === 'all'
                    ? 'Mulai jelajahi dan daftar ke modul untuk memulai pembelajaran'
                    : 'Coba ubah filter untuk melihat modul lainnya'}
                </p>
                {filter === 'all' && (
                  <Link href="/dashboard/courses/explore">
                    <Button>
                      Jelajahi Modul
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Menampilkan {sortedEnrollments.length} dari {enrollments.length} modul
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress={true}
                  progressPercent={enrollment.progressPercent}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

