'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Course } from '@/lib/api/courses';
import { BookOpen, Clock, Sparkles, GraduationCap } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progressPercent?: number;
}

export function CourseCard({ course, showProgress = false, progressPercent = 0 }: CourseCardProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
  };

  // Generate a color scheme based on course ID for variety
  const getColorScheme = (id: string) => {
    const schemes = [
      { bg: 'from-blue-400 via-purple-400 to-pink-400', accent: 'text-blue-100' },
      { bg: 'from-green-400 via-teal-400 to-cyan-400', accent: 'text-green-100' },
      { bg: 'from-orange-400 via-red-400 to-pink-400', accent: 'text-orange-100' },
      { bg: 'from-indigo-400 via-blue-400 to-purple-400', accent: 'text-indigo-100' },
      { bg: 'from-yellow-400 via-orange-400 to-red-400', accent: 'text-yellow-100' },
      { bg: 'from-purple-400 via-pink-400 to-rose-400', accent: 'text-purple-100' },
    ];
    const index = parseInt(id.slice(-1) || '0', 16) % schemes.length;
    return schemes[index];
  };

  const colorScheme = getColorScheme(course.id);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow p-0">
      <Link href={`/dashboard/courses/${course.id}`} className="block">
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full bg-gradient-to-r from-gray-100 via-gray-50 to-yellow-400 overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} relative overflow-hidden`}>
              {/* Decorative background circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />
              
              {/* Geometric shapes */}
              <div className="absolute top-4 left-4 w-12 h-12 border-2 border-white/20 rotate-45 rounded-sm" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/20 rotate-12 rounded-full" />
              
              {/* Main content */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <BookOpen className={`w-12 h-12 ${colorScheme.accent} drop-shadow-lg`} />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white/80" />
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className={`w-5 h-5 ${colorScheme.accent} opacity-80`} />
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${colorScheme.accent} opacity-60`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Course Title */}
          <h3 className="text-lg font-bold mb-3 line-clamp-2">
            {course.title}
          </h3>

          {/* Course Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(course.estimatedDuration)}</span>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {showProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

