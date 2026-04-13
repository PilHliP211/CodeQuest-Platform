import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UsePlayerAnimationResult {
  displayPosition: Position;
  isAnimating: boolean;
}

export function usePlayerAnimation(
  currentPosition: Position,
  animateTo: Position | null,
  onAnimationEnd: () => void,
): UsePlayerAnimationResult {
  const [displayPosition, setDisplayPosition] = useState<Position>(currentPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;

  useEffect(() => {
    if (animateTo === null) return;
    setIsAnimating(true);
    setDisplayPosition(animateTo);

    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationEndRef.current();
    }, 650); // slightly longer than the CSS transition duration

    return () => {
      clearTimeout(timer);
    };
  }, [animateTo]);

  return { displayPosition, isAnimating };
}
