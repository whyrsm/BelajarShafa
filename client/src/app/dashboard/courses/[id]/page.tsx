'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseById, Course } from '@/lib/api/courses';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { enrollCourse, getCourseEnrollment, Enrollment } from '@/lib/api/enrollments';
import { ArrowLeft, Edit, BookOpen, Play, Clock, User, CheckCircle2, FileText, ListChecks, GraduationCap, ChevronDown, ChevronRight, Video, File, ExternalLink } from 'lucide-react';
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

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-red-500" />;
      case 'DOCUMENT':
        return <File className="w-4 h-4 text-blue-500" />;
      case 'ARTICLE':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'EXTERNAL_LINK':
        return <ExternalLink className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'Video';
      case 'DOCUMENT':
        return 'Dokumen';
      case 'ARTICLE':
        return 'Artikel';
      case 'EXTERNAL_LINK':
        return 'Tautan Eksternal';
      default:
        return type;
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
            <Link href={`/dashboard/courses/${courseId}/manage`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Kelola Modul
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

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Course Info - First on mobile, Right on desktop (30%) */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Course Thumbnail */}
              <div className="relative aspect-video w-full bg-gradient-to-r from-gray-100 via-gray-50 to-yellow-400">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-blue-300" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <CardHeader>
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
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                    {course.category.name}
                  </span>
                  <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                    {getLevelLabel(course.level)}
                  </span>
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                    {course.type === 'PUBLIC' ? 'Umum' : 'Private'}
                  </span>
                </div>

                {/* Progress (if enrolled) */}
                {enrollment && (
                  <div className="pt-4 border-t">
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
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-2">
                  {enrollment ? (
                    <Link href={`/dashboard/courses/${courseId}/learn`}>
                      <Button size="lg" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        {enrollment.progressPercent > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" className="w-full" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? 'Mendaftar...' : 'Ikuti Modul'}
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Curriculum - Second on mobile, Left on desktop (70%) */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="space-y-6">
              {/* Course Overview */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <GraduationCap className="w-7 h-7 text-primary" />
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Deskripsi Modul</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line pl-7">
                      {course.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t"></div>

                  {/* Prerequisites */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Prasyarat</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line pl-7">
                      {course.prerequisites || 'Tidak ada prasyarat'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    Kurikulum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {course.topics && course.topics.length > 0 ? (
                  <div className="space-y-4">
                    {course.topics.map((topic) => {
                      const isExpanded = expandedTopics.has(topic.id);
                      const materialCount = topic._count?.materials || topic.materials?.length || 0;
                      
                      return (
                        <div key={topic.id} className="border rounded-lg overflow-hidden">
                          {/* Topic Header - Clickable */}
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">
                                    {topic.sequence}. {topic.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                                <span>{materialCount} materi</span>
                                {topic.estimatedDuration && (
                                  <>
                                    <span>•</span>
                                    <span>{formatDuration(topic.estimatedDuration)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Materials List - Collapsible */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t bg-muted/30">
                              {topic.materials && topic.materials.length > 0 ? (
                                <ul className="space-y-2 mt-3">
                                  {topic.materials.map((material) => (
                                    <li
                                      key={material.id}
                                      className="flex items-center gap-3 p-2 rounded-md hover:bg-background transition-colors"
                                    >
                                      {getMaterialIcon(material.type)}
                                      <div className="flex-1">
                                        <span className="text-sm font-medium">{material.title}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                        {getMaterialTypeLabel(material.type)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground mt-3 text-center py-2">
                                  Belum ada materi
                                </p>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

