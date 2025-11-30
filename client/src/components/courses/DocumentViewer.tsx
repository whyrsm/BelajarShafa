'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateMaterialProgress, markMaterialComplete, getMaterialProgress } from '@/lib/api/progress';
import { Download, ExternalLink, CheckCircle2 } from 'lucide-react';

interface DocumentViewerProps {
  materialId: string;
  documentUrl?: string;
  fileName?: string;
  title: string;
}

export function DocumentViewer({ materialId, documentUrl, fileName, title }: DocumentViewerProps) {
  const [isViewed, setIsViewed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<Date | null>(null);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load existing progress
    const loadProgress = async () => {
      try {
        const progress = await getMaterialProgress(materialId);
        if (progress) {
          setIsCompleted(progress.isCompleted);
          setIsViewed(true);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };

    loadProgress();
  }, [materialId]);

  useEffect(() => {
    // Track viewing time - mark as complete after 30 seconds
    if (isViewed && viewStartTime && !isCompleted) {
      viewTimerRef.current = setTimeout(async () => {
        try {
          await markMaterialComplete(materialId);
          setIsCompleted(true);
        } catch (error) {
          console.error('Failed to mark document as complete:', error);
        }
      }, 30000); // 30 seconds

      return () => {
        if (viewTimerRef.current) {
          clearTimeout(viewTimerRef.current);
        }
      };
    }
  }, [isViewed, viewStartTime, isCompleted, materialId]);

  const handleView = () => {
    if (!isViewed) {
      setIsViewed(true);
      setViewStartTime(new Date());
      
      // Update progress
      updateMaterialProgress(materialId, {
        watchedDuration: 0,
        isCompleted: false,
      }).catch(console.error);
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
      handleView();
    }
  };

  const handlePreview = () => {
    if (documentUrl) {
      // Try to open in Google Docs Viewer or similar
      const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`;
      window.open(previewUrl, '_blank');
      handleView();
    }
  };

  if (!documentUrl) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Dokumen tidak tersedia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            {isCompleted && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Selesai</span>
              </div>
            )}
          </div>

          {fileName && (
            <p className="text-xs sm:text-sm text-muted-foreground break-words">File: {fileName}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={handlePreview} variant="outline" className="w-full sm:w-auto text-sm">
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleDownload} className="w-full sm:w-auto text-sm">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Klik Preview atau Download untuk melihat dokumen. Dokumen akan otomatis ditandai sebagai selesai setelah 30 detik.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

