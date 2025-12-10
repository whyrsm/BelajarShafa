'use client';

import { useEffect, useState, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateMaterialProgress, markMaterialComplete, getMaterialProgress } from '@/lib/api/progress';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface ExternalLinkViewerProps {
  materialId: string;
  url?: string;
  title: string;
  onProgressUpdate?: () => void | Promise<void>;
}

function ExternalLinkViewerComponent({ materialId, url, title, onProgressUpdate }: ExternalLinkViewerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

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

  const handleOpenLink = async () => {
    if (url) {
      window.open(url, '_blank');
      
      // Mark as complete when clicked
      try {
        await markMaterialComplete(materialId);
        setIsCompleted(true);
        // Trigger progress update callback
        if (onProgressUpdate) {
          await onProgressUpdate();
        }
      } catch (error) {
        console.error('Failed to mark link as complete:', error);
      }
    }
  };

  if (!url) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Link tidak tersedia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h2>
            {isCompleted && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Selesai</span>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Klik tombol di bawah untuk membuka link eksternal di tab baru.
            </p>
            <Button onClick={handleOpenLink} size="lg" className="w-full sm:w-auto text-sm sm:text-base">
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Buka Link
            </Button>
          </div>

          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">URL:</p>
            <p className="text-xs sm:text-sm break-all text-blue-600">{url}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent re-renders when parent state changes
export const ExternalLinkViewer = memo(ExternalLinkViewerComponent, (prevProps, nextProps) => {
  return (
    prevProps.materialId === nextProps.materialId &&
    prevProps.url === nextProps.url &&
    prevProps.title === nextProps.title
  );
});

ExternalLinkViewer.displayName = 'ExternalLinkViewer';

