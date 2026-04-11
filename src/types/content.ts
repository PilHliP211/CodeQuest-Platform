// Content pack TypeScript types.
// These mirror the JSON schema in docs/CONTENT_SCHEMA.md exactly.
// No logic lives here — types only.

// --- Map types ---

export interface MapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  unlocksOnComplete: readonly string[];
  initiallyUnlocked: boolean;
  collectedIcon: string;
}

export interface MapEdge {
  from: string;
  to: string;
}

export interface MapConfig {
  backgroundImage: string;
  width: number;
  height: number;
  startNodeId: string;
  nodes: readonly MapNode[];
  edges: readonly MapEdge[];
}

// --- Character types ---

export interface VillainConfig {
  name: string;
  sprite: string;
  trailSprite: string;
}

export interface PlayerConfig {
  sprite: string;
}

// --- XP / reward types ---

export interface XpConfig {
  phaseComplete: number;
  lessonComplete: number;
  hintUsed: number;
  syntaxEditorUsed: number;
}

// --- Narrative scene types ---

export type DialogueEmotion = 'neutral' | 'happy' | 'shocked' | 'worried';

export interface DialogueLine {
  speaker: string;
  text: string;
  portrait: string | null;
  emotion?: DialogueEmotion;
}

export interface NarrativeScene {
  background?: string;
  dialogue: readonly DialogueLine[];
  advanceOnInput?: boolean;
}

export interface NarrativeScript {
  scenes: readonly NarrativeScene[];
}

// --- Block definition types ---

export interface BlocklyDef {
  type: string;
  message0: string;
  previousStatement: null;
  nextStatement: null;
  colour: number;
  tooltip: string;
  helpUrl: string;
}

export interface BlockDef {
  id: string;
  label: string;
  category: string;
  color: number;
  code: string;
  blocklyDef: BlocklyDef;
}

// --- Canvas / renderer types ---

export interface AvailableFunction {
  name: string;
  signature: string;
  description: string;
  example: string;
}

export interface SolutionCall {
  fn: string;
  args: readonly (string | number)[];
}

export interface CanvasSolution {
  calls: readonly SolutionCall[];
}

export interface CanvasConfig {
  width: number;
  height: number;
  availableFunctions: readonly AvailableFunction[];
  solution: CanvasSolution;
  tolerance: number;
}

// --- Hint types ---

export interface Hint {
  afterAttempts: number;
  text: string;
}

// --- Phase types ---

export interface ConceptIntro {
  concept: string;
  title: string;
  body: string;
  example: string;
}

export interface Phase1Challenge {
  prompt: string;
  targetPath: readonly string[];
  startNode: string;
  availableBlocks: readonly string[];
  solution: { code: string };
  hints: readonly Hint[];
}

export interface LessonPhase1 {
  intro: NarrativeScript;
  conceptIntro: ConceptIntro;
  challenge: Phase1Challenge;
  outro: NarrativeScript;
}

export interface CollectibleItem {
  id: string;
  label: string;
  icon: string;
}

export interface Phase2Challenge {
  prompt: string;
  availableBlocks: readonly string[];
  items: readonly CollectibleItem[];
  solution: { code: string };
  hints: readonly Hint[];
}

export interface LessonPhase2 {
  intro: NarrativeScript;
  showSyntaxInBlocks: boolean;
  challenge: Phase2Challenge;
  reveal: NarrativeScript;
}

export interface CelebrationConfig {
  animation: string;
  message: string;
  xpBonus: number;
}

export interface LessonPhase3 {
  intro: NarrativeScript;
  canvas: CanvasConfig;
  prompt: string;
  availableBlocks: readonly string[];
  fallbackAfterAttempts: number;
  hints: readonly Hint[];
  celebration: CelebrationConfig;
}

// --- Top-level lesson and course types ---

export interface Lesson {
  id: string;
  title: string;
  concepts: readonly string[];
  difficulty: string;
  phase1: LessonPhase1;
  phase2: LessonPhase2;
  phase3: LessonPhase3;
  blocks: readonly BlockDef[];
}

export interface LessonRef {
  id: string;
  path: string;
}

export interface EndScene {
  type: string;
  script: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  version: string;
  map: MapConfig;
  lessons: readonly LessonRef[];
  xp: XpConfig;
  endScene?: EndScene;
  villain: VillainConfig;
  player: PlayerConfig;
}
