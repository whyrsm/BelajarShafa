'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseById, Course } from '@/lib/api/courses';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { ArrowLeft, Edit, BookOpen } from 'lucide-react';

export default function CourseDetailPage() {
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

  const canEdit = user?.role === 'MANAGER' || user?.role === 'ADMIN';

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

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Kursus tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/dashboard/courses/${courseId}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Kursus
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.description || 'Tidak ada deskripsi'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded">
                {course.category.name}
              </span>
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded">
                {course.level}
              </span>
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded">
                {course.type}
              </span>
            </div>
          </CardContent>
        </Card>

        {course.topics && course.topics.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Topik ({course.topics.length})
            </h2>
            {course.topics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {topic.sequence}. {topic.title}
                  </CardTitle>
                  {topic.description && (
                    <CardDescription>{topic.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {topic.materials && topic.materials.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Materi ({topic.materials.length}):</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {topic.materials.map((material) => (
                          <li key={material.id}>{material.title}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada materi</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum ada topik</h3>
                <p className="text-muted-foreground">
                  {canEdit
                    ? 'Tambahkan topik pertama untuk memulai'
                    : 'Kursus ini belum memiliki topik'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

