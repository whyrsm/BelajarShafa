'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseById, Course } from '@/lib/api/courses';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { enrollCourse, getCourseEnrollment, Enrollment } from '@/lib/api/enrollments';
import { ArrowLeft, Edit, BookOpen, Play, Clock, User, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/navigation';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

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
      const [courseData, userData, enrollmentData] = await Promise.all([
        getCourseById(courseId),
        getProfile(),
        getCourseEnrollment(courseId).catch(() => null),
      ]);
      setCourse(courseData);
      setUser(userData);
      setEnrollment(enrollmentData);
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

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
      setEnrolling(true);
      const newEnrollment = await enrollCourse(course.id);
      setEnrollment(newEnrollment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar ke modul');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'Pemula';
      case 'INTERMEDIATE':
        return 'Menengah';
      case 'ADVANCED':
        return 'Lanjutan';
      default:
        return level;
    }
  };

  const canEdit = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
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
              <p className="text-destructive">Modul tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard/courses/explore">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/dashboard/courses/${courseId}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Modul
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
          {/* Left Column: Topics with Accordion */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Kurikulum
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.topics && course.topics.length > 0 ? (
                  <div className="space-y-2">
                    {course.topics.map((topic) => {
                      const isExpanded = expandedTopics.has(topic.id);
                      return (
                        <div key={topic.id} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                  {topic.sequence}. {topic.title}
                                </h3>
                                {topic.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
                              <span>{topic._count?.materials || topic.materials?.length || 0} materi</span>
                              {topic.estimatedDuration && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(topic.estimatedDuration)}</span>
                                </>
                              )}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="border-t bg-muted/30">
                              {topic.materials && topic.materials.length > 0 ? (
                                <ul className="p-4 space-y-3">
                                  {topic.materials.map((material) => (
                                    <li key={material.id} className="flex items-start gap-3 text-sm">
                                      <span className="text-muted-foreground mt-0.5">•</span>
                                      <div className="flex-1">
                                        <span className="font-medium">{material.title}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ({material.type})
                                        </span>
                                        {material.estimatedDuration && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            • {formatDuration(material.estimatedDuration)}
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-4">
                                  <p className="text-sm text-muted-foreground">Belum ada materi</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Belum ada topik</h3>
                    <p className="text-muted-foreground">
                      {canEdit
                        ? 'Tambahkan topik pertama untuk memulai'
                        : 'Modul ini belum memiliki topik'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Course Info */}
          <div className="space-y-6">
            {/* Course Image */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video w-full bg-gradient-to-r from-gray-100 via-gray-50 to-yellow-400">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-blue-300" />
                  </div>
                )}
              </div>
            </Card>

            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm mt-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{course.creator.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.estimatedDuration)}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
                    {course.category.name}
                  </span>
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm font-medium">
                    {getLevelLabel(course.level)}
                  </span>
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm font-medium">
                    {course.type === 'PUBLIC' ? 'Umum' : 'Private'}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Deskripsi</h4>
                  <p className="text-sm text-muted-foreground">
                    {course.description || 'Tidak ada deskripsi'}
                  </p>
                </div>

                {/* Enrollment Status and Actions */}
                {enrollment ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{enrollment.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/dashboard/courses/${courseId}/learn`}>
                      <Button size="lg" className="w-full">
                        <Play className="w-5 h-5 mr-2" />
                        {enrollment.progressPercent > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <Button size="lg" className="w-full" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? 'Mendaftar...' : 'Ikuti Modul'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {course.prerequisites && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prasyarat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.prerequisites}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

