'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course, CourseLevel } from '@/lib/api/courses';
import { Topic } from '@/lib/api/topics';
import { Material, MaterialType } from '@/lib/api/materials';
import { getTopicsByCourse } from '@/lib/api/topics';
import { getMaterialsByTopic } from '@/lib/api/materials';
import { useWizardContext } from './CourseManagementWizard';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  Eye,
} from 'lucide-react';

interface CourseReviewStepProps {
  course: Course;
  courseId: string;
  onPublish: () => void;
}

interface ValidationResult {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export function CourseReviewStep({ course, courseId, onPublish }: CourseReviewStepProps) {
  const router = useRouter();
  const { courseData, topics: wizardTopics } = useWizardContext();
  const [topics, setTopics] = useState<Topic[]>(wizardTopics);
  const [materials, setMaterials] = useState<Record<string, Material[]>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    validateCourse();
  }, [topics, materials, courseData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicsData = await getTopicsByCourse(courseId);
      setTopics(topicsData);

      const materialsMap: Record<string, Material[]> = {};
      for (const topic of topicsData) {
        const materialsData = await getMaterialsByTopic(topic.id);
        materialsMap[topic.id] = materialsData;
      }
      setMaterials(materialsMap);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateCourse = () => {
    const results: ValidationResult[] = [];

    // Validate course info
    const finalCourse = { ...course, ...courseData };

    if (!finalCourse.title || finalCourse.title.trim().length < 3) {
      results.push({
        type: 'error',
        message: 'Judul modul harus minimal 3 karakter',
      });
    } else {
      results.push({
        type: 'success',
        message: 'Judul modul valid',
      });
    }

    if (!finalCourse.thumbnailUrl) {
      results.push({
        type: 'warning',
        message: 'Thumbnail belum diatur (disarankan untuk menambahkan thumbnail)',
      });
    } else {
      results.push({
        type: 'success',
        message: 'Thumbnail telah diatur',
      });
    }

    if (!finalCourse.description || finalCourse.description.trim().length < 10) {
      results.push({
        type: 'warning',
        message: 'Deskripsi modul terlalu pendek (disarankan minimal 10 karakter)',
      });
    } else {
      results.push({
        type: 'success',
        message: 'Deskripsi modul valid',
      });
    }

    // Validate topics
    if (topics.length === 0) {
      results.push({
        type: 'error',
        message: 'Modul harus memiliki minimal 1 topik',
      });
    } else {
      results.push({
        type: 'success',
        message: `Modul memiliki ${topics.length} topik`,
      });
    }

    // Validate materials in topics
    let topicsWithoutMaterials = 0;
    let totalMaterials = 0;

    topics.forEach((topic) => {
      const topicMaterials = materials[topic.id] || [];
      totalMaterials += topicMaterials.length;

      if (topicMaterials.length === 0) {
        topicsWithoutMaterials++;
        results.push({
          type: 'warning',
          message: `Topik "${topic.title}" belum memiliki materi`,
        });
      }
    });

    if (topicsWithoutMaterials === 0) {
      results.push({
        type: 'success',
        message: `Semua topik memiliki materi (total: ${totalMaterials} materi)`,
      });
    }

    // Validate material content
    Object.values(materials).flat().forEach((material) => {
      if (material.type === MaterialType.VIDEO && !material.content.videoUrl) {
        results.push({
          type: 'error',
          message: `Materi "${material.title}" (Video) tidak memiliki URL`,
        });
      }
      if (material.type === MaterialType.DOCUMENT && !material.content.documentUrl) {
        results.push({
          type: 'error',
          message: `Materi "${material.title}" (Dokumen) tidak memiliki URL`,
        });
      }
      if (material.type === MaterialType.ARTICLE && !material.content.articleContent) {
        results.push({
          type: 'error',
          message: `Materi "${material.title}" (Artikel) tidak memiliki konten`,
        });
      }
      if (material.type === MaterialType.EXTERNAL_LINK && !material.content.externalUrl) {
        results.push({
          type: 'error',
          message: `Materi "${material.title}" (Link Eksternal) tidak memiliki URL`,
        });
      }
    });

    setValidationResults(results);
  };

  const getLevelLabel = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return 'Pemula';
      case CourseLevel.INTERMEDIATE:
        return 'Menengah';
      case CourseLevel.ADVANCED:
        return 'Lanjutan';
      default:
        return level;
    }
  };

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case MaterialType.VIDEO:
        return <Video className="w-4 h-4" />;
      case MaterialType.DOCUMENT:
        return <FileText className="w-4 h-4" />;
      case MaterialType.ARTICLE:
        return <BookOpen className="w-4 h-4" />;
      case MaterialType.EXTERNAL_LINK:
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const hasErrors = validationResults.some((r) => r.type === 'error');
  const warnings = validationResults.filter((r) => r.type === 'warning');
  const successes = validationResults.filter((r) => r.type === 'success');

  const finalCourse = { ...course, ...courseData };
  const totalMaterials = Object.values(materials).reduce((sum, mats) => sum + mats.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ringkasan Modul
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Judul</p>
              <p className="font-semibold">{finalCourse.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tingkat</p>
              <p className="font-semibold">{getLevelLabel(finalCourse.level)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipe</p>
              <p className="font-semibold">
                {finalCourse.type === 'PUBLIC' ? 'Umum' : 'Private'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">
                {finalCourse.isActive ? 'Aktif' : 'Tidak Aktif'}
              </p>
            </div>
          </div>

          {finalCourse.thumbnailUrl && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Thumbnail</p>
              <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                <img
                  src={finalCourse.thumbnailUrl}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {finalCourse.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Deskripsi</p>
              <p className="text-sm">{finalCourse.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Statistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{topics.length}</p>
              <p className="text-sm text-muted-foreground">Topik</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{totalMaterials}</p>
              <p className="text-sm text-muted-foreground">Materi</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {finalCourse.estimatedDuration || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Menit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Struktur Kurikulum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topics.map((topic) => {
              const topicMaterials = materials[topic.id] || [];
              return (
                <div key={topic.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="font-semibold text-lg">
                      {topic.sequence}. {topic.title}
                    </span>
                    {topic.isMandatory && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Wajib
                      </span>
                    )}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>
                  )}
                  {topicMaterials.length > 0 ? (
                    <div className="space-y-2 ml-4">
                      {topicMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                        >
                          {getMaterialIcon(material.type)}
                          <span>{material.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({material.type})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-4 italic">
                      Belum ada materi
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Hasil Validasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {successes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Valid ({successes.length})
                </h4>
                <div className="space-y-1 ml-6">
                  {successes.map((result, index) => (
                    <p key={index} className="text-sm text-green-700 dark:text-green-400">
                      ✓ {result.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Peringatan ({warnings.length})
                </h4>
                <div className="space-y-1 ml-6">
                  {warnings.map((result, index) => (
                    <p key={index} className="text-sm text-yellow-700 dark:text-yellow-400">
                      ⚠ {result.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {hasErrors && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Kesalahan ({validationResults.filter((r) => r.type === 'error').length})
                </h4>
                <div className="space-y-1 ml-6">
                  {validationResults
                    .filter((r) => r.type === 'error')
                    .map((result, index) => (
                      <p key={index} className="text-sm text-red-700 dark:text-red-400">
                        ✗ {result.message}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/courses/${courseId}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Lihat Modul
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/courses/${courseId}/manage`)}
          >
            Kembali ke Edit
          </Button>
          <Button onClick={onPublish} disabled={hasErrors}>
            {hasErrors ? 'Perbaiki Kesalahan Terlebih Dahulu' : 'Publikasikan Modul'}
          </Button>
        </div>
      </div>
    </div>
  );
}
