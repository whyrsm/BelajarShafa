# Progress Update Fix: completedAt and progressPercent

## Problem
When a material (video, article, document, or external link) was marked as complete, the enrollment's `completedAt` and `progressPercent` fields were being updated correctly in the backend database, but the frontend UI was not reflecting these changes. The progress bar remained at the old percentage and completion status was not shown.

## Root Cause
The issue was that the frontend components were loading enrollment and progress data once on component mount, but never refreshing it after material completion. The flow was:

1. User completes a material (e.g., watches 95% of a video)
2. Backend correctly updates:
   - `Progress` record (isCompleted = true)
   - `Enrollment` record (progressPercent recalculated)
   - `Enrollment.completedAt` (if 100% complete)
3. Frontend state remains unchanged ❌
4. UI shows old progress percentage

## Solution Overview
Implemented a callback-based progress refresh system:

1. Added `onProgressUpdate` callback prop to all material viewers:
   - `VideoPlayer`
   - `ArticleViewer`
   - `DocumentViewer`
   - `ExternalLinkViewer`

2. Created `refreshProgress()` function in the learn page that:
   - Refetches enrollment data (gets updated progressPercent and completedAt)
   - Refetches topic progress (gets updated material completion states)
   - Updates component state to reflect changes

3. Material viewers call `onProgressUpdate()` when completion status changes

## Implementation Details

### 1. Learn Page (`courses/[id]/learn/page.tsx`)

Added `refreshProgress` function:

```typescript
const refreshProgress = async () => {
  try {
    // Refresh enrollment to get updated progressPercent and completedAt
    const enrollmentData = await getCourseEnrollment(courseId);
    setEnrollment(enrollmentData);

    // Refresh all topic progress to ensure sidebar is up to date
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
```

Pass to all viewers:
```typescript
<VideoPlayer
  materialId={currentMaterial.id}
  videoUrl={currentMaterial.content?.videoUrl}
  title={currentMaterial.title}
  onProgressUpdate={refreshProgress}
/>
```

### 2. VideoPlayer Component

Added callback trigger when material is newly completed:

```typescript
const saveProgress = useCallback(async (timeValue?: number) => {
  // ... progress calculation ...
  
  // Check if this is a new completion
  const wasJustCompleted = !isCompletedRef.current && isComplete;

  await updateMaterialProgress(materialId, {
    watchedDuration: watchedSeconds,
    isCompleted: isComplete,
  });

  // Call progress update callback when material is newly completed
  if (wasJustCompleted && onProgressUpdate) {
    await onProgressUpdate();
  }
}, [isReady, materialId, onProgressUpdate]);
```

Same logic added to `handleVideoComplete` for when video ends naturally.

### 3. ArticleViewer Component

Triggers callback when user scrolls to 90% of content:

```typescript
if (scrollPercent >= 0.9 && !hasScrolled) {
  setHasScrolled(true);
  markMaterialComplete(materialId)
    .then(async () => {
      setIsCompleted(true);
      // Trigger progress update callback
      if (onProgressUpdate) {
        await onProgressUpdate();
      }
    })
    .catch(console.error);
}
```

### 4. DocumentViewer Component

Triggers callback after 30-second viewing timer:

```typescript
viewTimerRef.current = setTimeout(async () => {
  try {
    await markMaterialComplete(materialId);
    setIsCompleted(true);
    // Trigger progress update callback
    if (onProgressUpdate) {
      await onProgressUpdate();
    }
  } catch (error) {
    console.error('Failed to mark document as complete:', error);
  }
}, 30000);
```

### 5. ExternalLinkViewer Component

Triggers callback when link is clicked:

```typescript
const handleOpenLink = async () => {
  if (url) {
    window.open(url, '_blank');
    
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
```

## Backend Flow (Already Working Correctly)

The backend `ProgressService.updateMaterialProgress()` already handles:

1. Update/create Progress record with `isCompleted` status
2. Call `recalculateCourseProgress()` which:
   - Counts total materials in course
   - Counts completed materials
   - Calculates `progressPercent = (completed / total) * 100`
   - Updates Enrollment.progressPercent
   - If progressPercent === 100, sets Enrollment.completedAt

## What Changed

### Before Fix
```
User completes material
  → Backend updates DB ✓
  → Frontend state unchanged ✗
  → UI shows old progress ✗
```

### After Fix
```
User completes material
  → Backend updates DB ✓
  → Component calls onProgressUpdate() ✓
  → Frontend refetches enrollment ✓
  → UI updates immediately ✓
```

## Testing Checklist

- [x] Complete a video → progress bar updates
- [x] Complete multiple materials → progress percent increases
- [x] Complete all materials → completedAt is set, progress shows 100%
- [x] Sidebar material checkmarks update immediately
- [x] Article completion (scroll 90%) triggers refresh
- [x] Document completion (30s timer) triggers refresh
- [x] External link click triggers refresh
- [x] Course completion badge appears when reaching 100%

## Benefits

1. **Real-time UI Updates**: Progress reflects immediately after completion
2. **Accurate Completion Status**: completedAt and 100% status display correctly
3. **Better UX**: Users see instant feedback when completing materials
4. **Consistent Behavior**: All material types trigger progress refresh
5. **No Breaking Changes**: Callback is optional, backwards compatible

## Edge Cases Handled

1. **Already Completed**: Only triggers callback on NEW completions (wasJustCompleted check)
2. **Multiple Completions**: Ref-based checks prevent duplicate triggers
3. **API Failures**: Errors are caught and logged, don't crash UI
4. **Race Conditions**: Async/await ensures proper sequencing
5. **Component Unmount**: No callbacks fired after unmount (isMounted checks in progress load)

## Related Files

- `client/src/app/dashboard/courses/[id]/learn/page.tsx`
- `client/src/components/courses/VideoPlayer.tsx`
- `client/src/components/courses/ArticleViewer.tsx`
- `client/src/components/courses/DocumentViewer.tsx`
- `client/src/components/courses/ExternalLinkViewer.tsx`
- `client/src/lib/api/progress.ts`
- `server/src/progress/progress.service.ts`

