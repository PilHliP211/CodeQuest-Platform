import { describe, expect, it } from 'vitest';

import epicsDoc from '../../docs/EPICS.md?raw';
import e06Readme from '../../docs/stories/E-06/README.md?raw';
import e06Checkpoint from '../../docs/stories/E-06/S-06.07-pixel-art-theme.md?raw';
import e07Readme from '../../docs/stories/E-07/README.md?raw';
import e07Checkpoint from '../../docs/stories/E-07/S-07.03-whats-this-tooltip.md?raw';
import e08Readme from '../../docs/stories/E-08/README.md?raw';
import e08Checkpoint from '../../docs/stories/E-08/S-08.06-blocks-fallback.md?raw';
import e09Readme from '../../docs/stories/E-09/README.md?raw';
import e09Checkpoint from '../../docs/stories/E-09/S-09.07-step-mode.md?raw';
import e10Readme from '../../docs/stories/E-10/README.md?raw';
import e10Checkpoint from '../../docs/stories/E-10/S-10.06-reset-button.md?raw';
import e11Readme from '../../docs/stories/E-11/README.md?raw';
import e11Checkpoint from '../../docs/stories/E-11/S-11.06-lesson-context.md?raw';
import e12Readme from '../../docs/stories/E-12/README.md?raw';
import e12Checkpoint from '../../docs/stories/E-12/S-12.06-reset-progress.md?raw';
import e13Readme from '../../docs/stories/E-13/README.md?raw';
import e13Checkpoint from '../../docs/stories/E-13/S-13.05-collection-navigation.md?raw';
import e14Readme from '../../docs/stories/E-14/README.md?raw';
import e14Checkpoint from '../../docs/stories/E-14/S-14.09-e2e-verification.md?raw';
import e15Readme from '../../docs/stories/E-15/README.md?raw';
import e15Checkpoint from '../../docs/stories/E-15/S-15.03-smoke-test.md?raw';

interface EpicDoc {
  epic: string;
  text: string;
}

interface CheckpointDoc extends EpicDoc {
  humanOutcome: RegExp;
  automatedOutcome: RegExp;
}

interface MasterEpicSection {
  epic: string;
  nextEpic: string | null;
}

const epicReadmes: readonly EpicDoc[] = [
  { epic: 'E-06', text: e06Readme },
  { epic: 'E-07', text: e07Readme },
  { epic: 'E-08', text: e08Readme },
  { epic: 'E-09', text: e09Readme },
  { epic: 'E-10', text: e10Readme },
  { epic: 'E-11', text: e11Readme },
  { epic: 'E-12', text: e12Readme },
  { epic: 'E-13', text: e13Readme },
  { epic: 'E-14', text: e14Readme },
  { epic: 'E-15', text: e15Readme },
];

const checkpointDocs: readonly CheckpointDoc[] = [
  {
    epic: 'E-06',
    text: e06Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-07',
    text: e07Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-08',
    text: e08Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-09',
    text: e09Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-10',
    text: e10Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-11',
    text: e11Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-12',
    text: e12Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-13',
    text: e13Checkpoint,
    humanOutcome: /Human check:/,
    automatedOutcome: /Automated tests cover/,
  },
  {
    epic: 'E-14',
    text: e14Checkpoint,
    humanOutcome: /manual playthrough checkboxes/,
    automatedOutcome: /Playwright golden-path test exists/,
  },
  {
    epic: 'E-15',
    text: e15Checkpoint,
    humanOutcome: /Smoke Test Checklist/,
    automatedOutcome: /Playwright deployment smoke test exists/,
  },
];

const masterEpicSections: readonly MasterEpicSection[] = [
  { epic: 'E-16', nextEpic: 'E-17' },
  { epic: 'E-17', nextEpic: 'E-18' },
  { epic: 'E-18', nextEpic: 'E-19' },
  { epic: 'E-19', nextEpic: null },
];

function getMasterEpicSection({ epic, nextEpic }: MasterEpicSection): string {
  const start = epicsDoc.indexOf(`### ${epic}:`);
  expect(start).toBeGreaterThanOrEqual(0);

  if (nextEpic === null) {
    return epicsDoc.slice(start);
  }

  const end = epicsDoc.indexOf(`### ${nextEpic}:`, start + 1);
  expect(end).toBeGreaterThan(start);
  return epicsDoc.slice(start, end);
}

describe('remaining epic validation docs', () => {
  for (const { epic, text } of epicReadmes) {
    it(`${epic} README defines a human-testable validation contract`, () => {
      expect(text).toContain('## Epic Validation');
      expect(text).toContain('**Human Testable Increment:**');
      expect(text).toContain('**Automated Validation:**');
      expect(text).toContain('**Temporary Surface Decision:**');
    });
  }

  for (const { epic, text, humanOutcome, automatedOutcome } of checkpointDocs) {
    it(`${epic} checkpoint loads the validation skill and closes the loop`, () => {
      expect(text).toContain('human-testable-increments');
      expect(text).toMatch(humanOutcome);
      expect(text).toMatch(automatedOutcome);
    });
  }

  for (const masterEpicSection of masterEpicSections) {
    it(`${masterEpicSection.epic} master epic summary includes validation expectations`, () => {
      const section = getMasterEpicSection(masterEpicSection);
      expect(section).toContain('**Human Testable Increment:**');
      expect(section).toContain('**Automated Validation:**');
    });
  }
});
