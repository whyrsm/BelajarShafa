'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateMaterialProgress, markMaterialComplete, getMaterialProgress } from '@/lib/api/progress';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface ExternalLinkViewerProps {
  materialId: string;
  url?: string;
  title: string;
}

export function ExternalLinkViewer({ materialId, url, title }: ExternalLinkViewerProps) {
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

  const handleOpenLink = () => {
    if (url) {
      window.open(url, '_blank');
      
      // Mark as complete when clicked
      markMaterialComplete(materialId)
        .then(() => {
          setIsCompleted(true);
        })
        .catch(console.error);
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

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Klik tombol di bawah untuk membuka link eksternal di tab baru.
            </p>
            <Button onClick={handleOpenLink} size="lg">
              <ExternalLink className="w-4 h-4 mr-2" />
              Buka Link
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">URL:</p>
            <p className="text-sm break-all text-blue-600">{url}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

