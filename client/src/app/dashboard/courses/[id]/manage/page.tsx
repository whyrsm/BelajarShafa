'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCourseById, Course } from '@/lib/api/courses';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { DashboardLayout } from '@/components/navigation';
import { CourseManagementWizard } from '@/components/courses/CourseManagementWizard';
import { Card, CardContent } from '@/components/ui/card';

export default function CourseManagePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, userData] = await Promise.all([
        getCourseById(courseId),
        getProfile(),
      ]);
      setCourse(courseData);
      setUser(userData);

      // Check permissions
      if (userData.role !== 'MANAGER' && userData.role !== 'ADMIN') {
        setError('Anda tidak memiliki izin untuk mengelola modul ini');
        return;
      }

      // Check if user is the creator or is admin
      if (courseData.createdById !== userData.id && userData.role !== 'ADMIN') {
        setError('Anda hanya dapat mengelola modul yang Anda buat');
        return;
      }
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

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">{error || 'Modul tidak ditemukan'}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CourseManagementWizard course={course} courseId={courseId} />
      </div>
    </DashboardLayout>
  );
}
