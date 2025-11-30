'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/navigation';
import { getCourseById, Course } from '@/lib/api/courses';
import { getCourseEnrollment, Enrollment } from '@/lib/api/enrollments';
import { getTopicProgress, TopicProgress } from '@/lib/api/progress';
import { ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronRight, BookOpen, Menu, X } from 'lucide-react';
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import { DocumentViewer } from '@/components/courses/DocumentViewer';
import { ArticleViewer } from '@/components/courses/ArticleViewer';
import { ExternalLinkViewer } from '@/components/courses/ExternalLinkViewer';

export default function CourseLearnPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const materialId = searchParams.get('material');
  const topicId = searchParams.get('topic');

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [topicProgressMap, setTopicProgressMap] = useState<Map<string, TopicProgress>>(new Map());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<{
    id: string;
    type: string;
    title: string;
    content: any;
    topicId: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, courseId]);

  useEffect(() => {
    if (course && materialId) {
      // Find the material in the course
      for (const topic of course.topics || []) {
        const material = topic.materials?.find((m) => m.id === materialId);
        if (material) {
          setCurrentMaterial({
            id: material.id,
            type: material.type,
            title: material.title,
            content: material.content,
            topicId: topic.id,
          });
          // Expand the topic
          setExpandedTopics((prev) => new Set(prev).add(topic.id));
          break;
        }
      }
    } else if (course && course.topics && course.topics.length > 0) {
      // Load first material if no material specified
      const firstTopic = course.topics.find(t => t.materials && t.materials.length > 0);
      if (firstTopic && firstTopic.materials && firstTopic.materials.length > 0) {
        const firstMaterial = firstTopic.materials[0];
        router.replace(`/dashboard/courses/${courseId}/learn?material=${firstMaterial.id}&topic=${firstTopic.id}`);
      }
    }
  }, [course, materialId, courseId, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, enrollmentData] = await Promise.all([
        getCourseById(courseId),
        getCourseEnrollment(courseId).catch(() => null),
      ]);

      if (!enrollmentData) {
        router.push(`/dashboard/courses/${courseId}`);
        return;
      }

      setCourse(courseData);
      setEnrollment(enrollmentData);

      // Load progress for all topics
      if (courseData.topics) {
        const progressPromises = courseData.topics.map((topic) =>
          getTopicProgress(topic.id).then((progress) => [topic.id, progress] as const)
        );
        const progressResults = await Promise.all(progressPromises);
        setTopicProgressMap(new Map(progressResults));
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

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const selectMaterial = (materialId: string, topicId: string) => {
    router.push(`/dashboard/courses/${courseId}/learn?material=${materialId}&topic=${topicId}`);
    // Close sidebar on mobile after selecting material
    setSidebarOpen(false);
  };

  // Function to refresh progress data (called after material completion)
  const refreshProgress = async () => {
    try {
      // Refresh enrollment to get updated progressPercent and completedAt
      const enrollmentData = await getCourseEnrollment(courseId);
      setEnrollment(enrollmentData);

      // Refresh topic progress if we have a current topic
      if (currentMaterial?.topicId) {
        const topicProgress = await getTopicProgress(currentMaterial.topicId);
        setTopicProgressMap((prev) => {
          const next = new Map(prev);
          next.set(currentMaterial.topicId, topicProgress);
          return next;
        });
      }

      // Also refresh all topics to ensure sidebar is up to date
      if (course?.topics) {
        const progressPromises = course.topics.map((topic) =>
          getTopicProgress(topic.id).then((progress) => [topic.id, progress] as const)
        );
        const progressResults = await Promise.all(progressPromises);
        setTopicProgressMap(new Map(progressResults));
      }
    } catch (err) {
      console.error('Failed to refresh progress:', err);
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

  if (!course || !enrollment) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">
                {!enrollment ? 'Anda belum terdaftar di modul ini' : 'Modul tidak ditemukan'}
              </p>
              <Link href={`/dashboard/courses/${courseId}`}>
                <Button variant="outline" className="mt-4">
                  Kembali ke Detail Modul
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Curriculum */}
        <div
          className={`fixed lg:static inset-y-0 left-0 w-80 border-r bg-background overflow-y-auto z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-3 sm:p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between mb-2">
              <Link href={`/dashboard/courses/${courseId}`} className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2">{course.title}</h2>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
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
          </div>

          <div className="p-3 sm:p-4 space-y-2">
            {course.topics?.map((topic) => {
              const isExpanded = expandedTopics.has(topic.id);
              const progress = topicProgressMap.get(topic.id);
              const progressPercent = progress?.progressPercent || 0;

              return (
                <div key={topic.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className="w-full p-2.5 sm:p-3 flex items-center justify-between hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 text-left min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="font-medium text-xs sm:text-sm truncate">{topic.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {progress?.completedCount || 0}/{progress?.totalCount || topic.materials?.length || 0}
                    </span>
                  </button>

                  {isExpanded && topic.materials && (
                    <div className="border-t bg-muted/30">
                      {topic.materials.map((material) => {
                        const materialProgress = progress?.materials.find(
                          (m) => m.materialId === material.id
                        );
                        const isCompleted = materialProgress?.isCompleted || false;
                        const isActive = currentMaterial?.id === material.id;

                        return (
                          <button
                            key={material.id}
                            onClick={() => selectMaterial(material.id, topic.id)}
                            className={`w-full p-2.5 sm:p-3 pl-6 sm:pl-8 flex items-center gap-2 text-left text-xs sm:text-sm hover:bg-accent transition-colors ${
                              isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={`flex-1 min-w-0 truncate ${isActive ? 'font-medium' : ''}`}>
                              {material.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-background min-w-0">
          {currentMaterial ? (
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Mobile Header with Menu Button */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Kurikulum
                </Button>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">{currentMaterial.title}</h1>
              
              {currentMaterial.type === 'VIDEO' && (
                <VideoPlayer
                  materialId={currentMaterial.id}
                  videoUrl={currentMaterial.content?.videoUrl}
                  title={currentMaterial.title}
                  allowForwardSeek={process.env.NEXT_PUBLIC_ALLOW_FORWARD_SEEK === 'true'}
                  onProgressUpdate={refreshProgress}
                />
              )}
              
              {currentMaterial.type === 'DOCUMENT' && (
                <DocumentViewer
                  materialId={currentMaterial.id}
                  documentUrl={currentMaterial.content?.documentUrl}
                  fileName={currentMaterial.content?.fileName}
                  title={currentMaterial.title}
                  onProgressUpdate={refreshProgress}
                />
              )}
              
              {currentMaterial.type === 'ARTICLE' && (
                <ArticleViewer
                  materialId={currentMaterial.id}
                  content={currentMaterial.content?.articleContent}
                  title={currentMaterial.title}
                  onProgressUpdate={refreshProgress}
                />
              )}
              
              {currentMaterial.type === 'EXTERNAL_LINK' && (
                <ExternalLinkViewer
                  materialId={currentMaterial.id}
                  url={currentMaterial.content?.externalUrl}
                  title={currentMaterial.title}
                  onProgressUpdate={refreshProgress}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">Pilih materi untuk mulai belajar</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="mt-4 lg:hidden"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Buka Kurikulum
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
