'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/lib/api/courses';
import { BookOpen, Clock, User } from 'lucide-react';

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return '';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/dashboard/courses/${course.id}`}>
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full bg-gradient-to-r from-gray-100 via-gray-50 to-yellow-400 overflow-hidden">
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
          
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* SHAFA Logo placeholder - top left */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-xs font-bold text-blue-600">SHAFA</span>
            </div>
          </div>

          {/* Course Type Badge - bottom left */}
          <div className="absolute bottom-3 left-3 z-10">
            <Badge
              className={
                course.type === 'PUBLIC'
                  ? 'bg-yellow-500 text-white border-yellow-600'
                  : 'bg-orange-500 text-white border-orange-600'
              }
            >
              {course.type === 'PUBLIC' ? 'SHAFA PREMIUM' : 'Shafa Talks'}
            </Badge>
          </div>

          {/* Decorative dots - top right */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
            ))}
          </div>

          {/* Course Title and Instructor - bottom left area */}
          <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
            <h3 className="text-lg font-bold mb-1 line-clamp-2 drop-shadow-lg">
              {course.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span className="drop-shadow-md">{course.creator.name}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Course Title (repeated for clarity) */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>

          {/* Course Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.estimatedDuration)}</span>
              </div>
              <Badge variant="outline" className={getLevelColor(course.level)}>
                {getLevelLabel(course.level)}
              </Badge>
            </div>

            {/* Category */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{course.category.name}</span>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {showProgress && (
            <div className="mb-4">
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

          {/* Enroll Button */}
          <Button variant="outline" className="w-full" onClick={(e) => e.preventDefault()}>
            {showProgress ? 'Lanjutkan Belajar' : 'Ikuti Modul'}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}

