import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ContentContext, ContentErrorContext } from '@/engine/ContentContext';
import { testCourse } from '@/test/contentFixture';
import { testLesson } from '@/test/lessonFixture';
import { App } from './App';

// Mock all engine modules the app depends on so tests are self-contained
vi.mock('@/engine/useProfile');
vi.mock('@/components/Profile/NameEntryScreen', () => ({
  NameEntryScreen: () => <div>name-entry</div>,
}));
vi.mock('@/components/Profile/SettingsScreen', () => ({
  SettingsScreen: () => <div>settings</div>,
}));
vi.mock('@/components/HUD/HUDLayout', () => ({
  HUDLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/Map/MapScreen', () => ({
  MapScreen: ({ onNodeSelect }: { onNodeSelect: (nodeId: string) => void }) => (
    <button
      type="button"
      onClick={() => {
        onNodeSelect('001-japan');
      }}
    >
      Japan map node
    </button>
  ),
}));
vi.mock('@/components/Lesson/LessonScreen', () => ({
  LessonScreen: ({ lesson }: { lesson: { title: string } }) => <div>lesson-{lesson.title}</div>,
}));

import { useProfile } from '@/engine/useProfile';
const mockUseProfile = vi.mocked(useProfile);

beforeEach(() => {
  vi.resetAllMocks();
  window.history.pushState({}, '', '/');
  mockUseProfile.mockReturnValue({
    profile: { name: 'Hana', createdAt: '2026-01-01T00:00:00.000Z' },
    createProfile: vi.fn(),
    updateName: vi.fn(),
  });
});

function renderWithError(error: string | null): ReturnType<typeof render> {
  return render(
    <ContentErrorContext.Provider value={error}>
      <ContentContext.Provider value={{ course: testCourse, lessons: [testLesson] }}>
        <App />
      </ContentContext.Provider>
    </ContentErrorContext.Provider>,
  );
}

describe('App content error gate', () => {
  it('shows the error UI with role="alert" when the content pack failed to load', () => {
    renderWithError('Schema validation failed: missing id field');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Content Pack Error')).toBeInTheDocument();
    expect(screen.getByText('Schema validation failed: missing id field')).toBeInTheDocument();
  });

  it('shows the normal app flow when there is no content error', () => {
    renderWithError(null);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /japan map node/i })).toBeInTheDocument();
  });

  it('shows NameEntryScreen when there is no content error and profile is null', () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      createProfile: vi.fn(),
      updateName: vi.fn(),
    });

    renderWithError(null);

    expect(screen.getByText('name-entry')).toBeInTheDocument();
  });

  it('opens the selected lesson from the map node', async () => {
    renderWithError(null);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /japan map node/i }));

    expect(screen.getByText('lesson-Japan')).toBeInTheDocument();
  });
});
