import { LessonProvider } from '@/engine/LessonProvider';
import { LessonPlayArea } from './LessonPlayArea';
import type { Lesson } from '@/types/content';

interface LessonScreenProps {
  lesson: Lesson;
  onReturnToMap: () => void;
}

export function LessonScreen({ lesson, onReturnToMap }: LessonScreenProps): React.ReactElement {
  return (
    <LessonProvider lesson={lesson}>
      <LessonPlayArea onReturnToMap={onReturnToMap} />
    </LessonProvider>
  );
}
