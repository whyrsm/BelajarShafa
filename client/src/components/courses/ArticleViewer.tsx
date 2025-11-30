'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { updateMaterialProgress, markMaterialComplete, getMaterialProgress } from '@/lib/api/progress';
import { CheckCircle2 } from 'lucide-react';

interface ArticleViewerProps {
  materialId: string;
  content?: string;
  title: string;
}

export function ArticleViewer({ materialId, content, title }: ArticleViewerProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load existing progress
    const loadProgress = async () => {
      try {
        const progress = await getMaterialProgress(materialId);
        if (progress) {
          setIsCompleted(progress.isCompleted);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };

    loadProgress();
  }, [materialId]);

  useEffect(() => {
    // Track scroll to detect if user has read the article
    const handleScroll = () => {
      if (!contentRef.current || isCompleted) return;

      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const scrollPercent = (scrollTop + clientHeight) / scrollHeight;

      // Mark as complete when scrolled to 90% of content
      if (scrollPercent >= 0.9 && !hasScrolled) {
        setHasScrolled(true);
        markMaterialComplete(materialId)
          .then(() => {
            setIsCompleted(true);
          })
          .catch(console.error);
      }

      // Update progress
      updateMaterialProgress(materialId, {
        watchedDuration: Math.floor(scrollTop),
        isCompleted: scrollPercent >= 0.9,
      }).catch(console.error);
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      
      // Initial check
      handleScroll();

      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  }, [materialId, isCompleted, hasScrolled]);

  // Mark as viewed when component mounts
  useEffect(() => {
    updateMaterialProgress(materialId, {
      watchedDuration: 0,
      isCompleted: false,
    }).catch(console.error);
  }, [materialId]);

  if (!content) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Konten artikel tidak tersedia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            {isCompleted && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai</span>
              </div>
            )}
          </div>

          <div
            ref={contentRef}
            className="prose prose-sm max-w-none overflow-y-auto max-h-[70vh]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

