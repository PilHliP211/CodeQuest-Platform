import type {
  AvailableFunction,
  BlockDef,
  BlocklyDef,
  CanvasConfig,
  CanvasSolution,
  CollectibleItem,
  ConceptIntro,
  Course,
  DialogueEmotion,
  DialogueLine,
  Hint,
  Lesson,
  LessonPhase1,
  LessonPhase2,
  LessonPhase3,
  NarrativeScene,
  NarrativeScript,
  Phase1Challenge,
  Phase2Challenge,
  SolutionCall,
} from '@/types/content';

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCourse(data: unknown): data is Course {
  if (!isNonNullObject(data)) return false;

  // Required string fields
  if (typeof data.id !== 'string' || data.id.length === 0) return false;
  if (typeof data.title !== 'string' || data.title.length === 0) return false;
  if (typeof data.description !== 'string') return false;
  if (typeof data.version !== 'string') return false;

  // map must be a non-null object with required fields
  if (!isNonNullObject(data.map)) return false;
  const map = data.map;
  if (typeof map.backgroundImage !== 'string') return false;
  if (typeof map.width !== 'number') return false;
  if (typeof map.height !== 'number') return false;
  if (typeof map.startNodeId !== 'string') return false;
  if (!Array.isArray(map.nodes)) return false;
  if (!Array.isArray(map.edges)) return false;

  // lessons must be a non-empty array
  if (!Array.isArray(data.lessons) || data.lessons.length === 0) return false;

  // xp must be a non-null object with number fields
  if (!isNonNullObject(data.xp)) return false;
  const xp = data.xp;
  if (typeof xp.phaseComplete !== 'number') return false;
  if (typeof xp.lessonComplete !== 'number') return false;
  if (typeof xp.hintUsed !== 'number') return false;
  if (typeof xp.syntaxEditorUsed !== 'number') return false;

  // villain and player must be non-null objects
  if (!isNonNullObject(data.villain)) return false;
  if (typeof data.villain.name !== 'string') return false;
  if (typeof data.villain.sprite !== 'string') return false;

  if (!isNonNullObject(data.player)) return false;
  if (typeof data.player.sprite !== 'string') return false;

  return true;
}

export function isLesson(data: unknown): data is Lesson {
  if (!isNonNullObject(data)) return false;

  return (
    typeof data.id === 'string' &&
    data.id.length > 0 &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    isStringArray(data.concepts) &&
    typeof data.difficulty === 'string' &&
    isLessonPhase1(data.phase1) &&
    isLessonPhase2(data.phase2) &&
    isLessonPhase3(data.phase3) &&
    isBlockDefArray(data.blocks)
  );
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDialogueEmotion(value: unknown): value is DialogueEmotion {
  return value === 'neutral' || value === 'happy' || value === 'shocked' || value === 'worried';
}

function isDialogueLine(value: unknown): value is DialogueLine {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.speaker === 'string' &&
    typeof value.text === 'string' &&
    (typeof value.portrait === 'string' || value.portrait === null) &&
    (value.emotion === undefined || isDialogueEmotion(value.emotion))
  );
}

function isNarrativeScene(value: unknown): value is NarrativeScene {
  if (!isNonNullObject(value)) return false;

  return (
    (value.background === undefined || typeof value.background === 'string') &&
    Array.isArray(value.dialogue) &&
    value.dialogue.every(isDialogueLine) &&
    (value.advanceOnInput === undefined || typeof value.advanceOnInput === 'boolean')
  );
}

function isNarrativeScript(value: unknown): value is NarrativeScript {
  if (!isNonNullObject(value)) return false;

  return Array.isArray(value.scenes) && value.scenes.every(isNarrativeScene);
}

function isConceptIntro(value: unknown): value is ConceptIntro {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.concept === 'string' &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    typeof value.example === 'string'
  );
}

function isHint(value: unknown): value is Hint {
  if (!isNonNullObject(value)) return false;

  return typeof value.afterAttempts === 'number' && typeof value.text === 'string';
}

function isHintArray(value: unknown): value is readonly Hint[] {
  return Array.isArray(value) && value.every(isHint);
}

function isSolutionCode(value: unknown): value is { readonly code: string } {
  return isNonNullObject(value) && typeof value.code === 'string';
}

function isPhase1Challenge(value: unknown): value is Phase1Challenge {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.prompt === 'string' &&
    isStringArray(value.targetPath) &&
    typeof value.startNode === 'string' &&
    isStringArray(value.availableBlocks) &&
    isSolutionCode(value.solution) &&
    isHintArray(value.hints)
  );
}

function isLessonPhase1(value: unknown): value is LessonPhase1 {
  if (!isNonNullObject(value)) return false;

  return (
    isNarrativeScript(value.intro) &&
    isConceptIntro(value.conceptIntro) &&
    isPhase1Challenge(value.challenge) &&
    isNarrativeScript(value.outro)
  );
}

function isCollectibleItem(value: unknown): value is CollectibleItem {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.icon === 'string'
  );
}

function isPhase2Challenge(value: unknown): value is Phase2Challenge {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.prompt === 'string' &&
    isStringArray(value.availableBlocks) &&
    Array.isArray(value.items) &&
    value.items.every(isCollectibleItem) &&
    isSolutionCode(value.solution) &&
    isHintArray(value.hints)
  );
}

function isLessonPhase2(value: unknown): value is LessonPhase2 {
  if (!isNonNullObject(value)) return false;

  return (
    isNarrativeScript(value.intro) &&
    typeof value.showSyntaxInBlocks === 'boolean' &&
    isPhase2Challenge(value.challenge) &&
    isNarrativeScript(value.reveal)
  );
}

function isAvailableFunction(value: unknown): value is AvailableFunction {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.name === 'string' &&
    typeof value.signature === 'string' &&
    typeof value.description === 'string' &&
    typeof value.example === 'string'
  );
}

function isSolutionArg(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

function isSolutionCall(value: unknown): value is SolutionCall {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.fn === 'string' && Array.isArray(value.args) && value.args.every(isSolutionArg)
  );
}

function isCanvasSolution(value: unknown): value is CanvasSolution {
  if (!isNonNullObject(value)) return false;

  return Array.isArray(value.calls) && value.calls.every(isSolutionCall);
}

function isCanvasConfig(value: unknown): value is CanvasConfig {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    Array.isArray(value.availableFunctions) &&
    value.availableFunctions.every(isAvailableFunction) &&
    isCanvasSolution(value.solution) &&
    typeof value.tolerance === 'number'
  );
}

function isLessonPhase3(value: unknown): value is LessonPhase3 {
  if (!isNonNullObject(value)) return false;

  return (
    isNarrativeScript(value.intro) &&
    isCanvasConfig(value.canvas) &&
    typeof value.prompt === 'string' &&
    isStringArray(value.availableBlocks) &&
    typeof value.fallbackAfterAttempts === 'number' &&
    isHintArray(value.hints) &&
    isNonNullObject(value.celebration) &&
    typeof value.celebration.animation === 'string' &&
    typeof value.celebration.message === 'string' &&
    typeof value.celebration.xpBonus === 'number'
  );
}

function isBlocklyDef(value: unknown): value is BlocklyDef {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.type === 'string' &&
    typeof value.message0 === 'string' &&
    value.previousStatement === null &&
    value.nextStatement === null &&
    typeof value.colour === 'number' &&
    typeof value.tooltip === 'string' &&
    typeof value.helpUrl === 'string'
  );
}

function isBlockDef(value: unknown): value is BlockDef {
  if (!isNonNullObject(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.category === 'string' &&
    typeof value.color === 'number' &&
    typeof value.code === 'string' &&
    isBlocklyDef(value.blocklyDef)
  );
}

function isBlockDefArray(value: unknown): value is readonly BlockDef[] {
  return Array.isArray(value) && value.every(isBlockDef);
}
