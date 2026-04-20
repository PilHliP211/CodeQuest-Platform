export interface AnimationHandle {
  cancel(): void;
}

export function animateDrawing(
  steps: Iterable<() => void>,
  delayMs = 150,
  onComplete?: () => void,
): AnimationHandle {
  let cancelled = false;

  async function run(): Promise<void> {
    try {
      for (const step of steps) {
        if (cancelled) {
          return;
        }

        step();
        await delay(delayMs);
      }

      if (!cancelled) {
        onComplete?.();
      }
    } catch {
      return;
    }
  }

  void run();

  return {
    cancel() {
      cancelled = true;
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
