'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseById, Course } from '@/lib/api/courses';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const courseData = await getCourseById(courseId);
      setCourse(courseData);
    } catch (err) {
      console.error('Failed to load course:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-6">
          <Link href={`/dashboard/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Edit Kursus: {course.title}
            </CardTitle>
            <CardDescription>
              Curriculum Builder - Tambah dan kelola topik serta materi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Curriculum Builder dengan drag-and-drop akan diimplementasikan di sini.
              </p>
              <p className="text-sm text-muted-foreground">
                Fitur yang akan tersedia:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                <li>Inline topic editing dengan expand/collapse</li>
                <li>Drag-and-drop untuk reorder topics</li>
                <li>Tambahkan materi (Lesson, Quiz, Assignment) per topic</li>
                <li>Preview dan edit materials</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

