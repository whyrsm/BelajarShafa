'use client';

export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  useEffect(() => {
    // Redirect to the new manage page
    router.replace(`/dashboard/courses/${courseId}/manage`);
  }, [router, courseId]);

  return null;
}

