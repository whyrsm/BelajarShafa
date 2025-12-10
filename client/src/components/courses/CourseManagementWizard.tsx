'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course, UpdateCourseData } from '@/lib/api/courses';
import { Topic } from '@/lib/api/topics';
import { Material } from '@/lib/api/materials';
import { CourseInfoEditor } from './CourseInfoEditor';
import { AdvancedCurriculumBuilder } from './AdvancedCurriculumBuilder';
import { CourseReviewStep } from './CourseReviewStep';
import { ChevronLeft, ChevronRight, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface WizardContextType {
  courseData: Partial<UpdateCourseData>;
  topics: Topic[];
  materials: Record<string, Material[]>;
  setCourseData: (data: Partial<UpdateCourseData>) => void;
  setTopics: (topics: Topic[]) => void;
  setMaterials: (topicId: string, materials: Material[]) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizardContext must be used within CourseManagementWizard');
  }
  return context;
}

interface CourseManagementWizardProps {
  course: Course;
  courseId: string;
}

type WizardStep = 'info' | 'curriculum' | 'review';

export function CourseManagementWizard({ course, courseId }: CourseManagementWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [courseData, setCourseData] = useState<Partial<UpdateCourseData>>({});
  const [topics, setTopics] = useState<Topic[]>(course.topics || []);
  const [materials, setMaterialsState] = useState<Record<string, Material[]>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize materials map from course topics
  useEffect(() => {
    const materialsMap: Record<string, Material[]> = {};
    if (course.topics) {
      course.topics.forEach((topic) => {
        if (topic.materials) {
          materialsMap[topic.id] = topic.materials;
        }
      });
    }
    setMaterialsState(materialsMap);
  }, [course]);

  const setMaterials = (topicId: string, newMaterials: Material[]) => {
    setMaterialsState((prev) => ({
      ...prev,
      [topicId]: newMaterials,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSetCourseData = (data: Partial<UpdateCourseData>) => {
    setCourseData((prev) => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  };

  const handleSetTopics = (newTopics: Topic[]) => {
    setTopics(newTopics);
    setHasUnsavedChanges(true);
  };

  const steps: { id: WizardStep; label: string; description: string }[] = [
    { id: 'info', label: 'Informasi Modul', description: 'Edit informasi dasar modul' },
    { id: 'curriculum', label: 'Kurikulum', description: 'Kelola topik dan materi' },
    { id: 'review', label: 'Tinjau & Publikasikan', description: 'Tinjau dan publikasikan modul' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1].id;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1].id;
      setCurrentStep(prevStep);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Save course data if there are changes
      if (Object.keys(courseData).length > 0) {
        const { updateCourse } = await import('@/lib/api/courses');
        await updateCourse(courseId, courseData);
      }
      setHasUnsavedChanges(false);
      setNotification({ type: 'success', message: 'Draft berhasil disimpan' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to save draft:', err);
      setNotification({
        type: 'error',
        message: 'Gagal menyimpan draft: ' + (err instanceof Error ? err.message : 'Unknown error'),
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // Save all changes
      const { updateCourse } = await import('@/lib/api/courses');
      await updateCourse(courseId, { ...courseData, isActive: true });
      setHasUnsavedChanges(false);
      setNotification({ type: 'success', message: 'Modul berhasil dipublikasikan' });
      setTimeout(() => {
        router.push(`/dashboard/courses/${courseId}`);
      }, 1000);
    } catch (err) {
      console.error('Failed to publish:', err);
      setNotification({
        type: 'error',
        message: 'Gagal mempublikasikan modul: ' + (err instanceof Error ? err.message : 'Unknown error'),
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const contextValue: WizardContextType = {
    courseData,
    topics,
    materials,
    setCourseData: handleSetCourseData,
    setTopics: handleSetTopics,
    setMaterials,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        index < currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : index === currentStepIndex
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          index === currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-colors ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification */}
        {notification && (
          <Card
            className={`border-2 transition-all duration-300 ${
              notification.type === 'success'
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <p
                  className={`text-sm ${
                    notification.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && !notification && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Anda memiliki perubahan yang belum disimpan
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStepIndex].label}</CardTitle>
          </CardHeader>
          <CardContent className="transition-opacity duration-300">
            {currentStep === 'info' && <CourseInfoEditor course={course} />}
            {currentStep === 'curriculum' && <AdvancedCurriculumBuilder courseId={courseId} />}
            {currentStep === 'review' && (
              <CourseReviewStep course={course} courseId={courseId} onPublish={handlePublish} />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStepIndex < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={isSaving}>
                {isSaving ? 'Mempublikasikan...' : 'Publikasikan Modul'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}
