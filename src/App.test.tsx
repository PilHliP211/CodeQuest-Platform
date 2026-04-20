import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentErrorContext } from '@/engine/ContentContext';
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
  MapScreen: () => <div>map-screen</div>,
}));
vi.mock('@/devHarnesses/DevBlockEditorScreen', () => ({
  DevBlockEditorScreen: () => <div>dev-block-editor</div>,
}));
vi.mock('@/devHarnesses/DevSyntaxEditorScreen', () => ({
  DevSyntaxEditorScreen: () => <div>dev-syntax-editor</div>,
}));
vi.mock('@/devHarnesses/DevInterpreterScreen', () => ({
  DevInterpreterScreen: () => <div>dev-interpreter</div>,
}));
vi.mock('@/devHarnesses/DevCanvasScreen', () => ({
  DevCanvasScreen: () => <div>dev-canvas</div>,
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
      <App />
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
    expect(screen.getByText('map-screen')).toBeInTheDocument();
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

  it('shows the temporary block editor harness on the dev route', () => {
    window.history.pushState({}, '', '/codequest-platform/__dev/block-editor');

    renderWithError(null);

    expect(screen.getByText('dev-block-editor')).toBeInTheDocument();
  });

  it('shows the temporary syntax editor harness on the dev route', () => {
    window.history.pushState({}, '', '/codequest-platform/__dev/syntax-editor');

    renderWithError(null);

    expect(screen.getByText('dev-syntax-editor')).toBeInTheDocument();
  });

  it('shows the temporary interpreter harness on the dev route', () => {
    window.history.pushState({}, '', '/codequest-platform/__dev/interpreter');

    renderWithError(null);

    expect(screen.getByText('dev-interpreter')).toBeInTheDocument();
  });

  it('shows the temporary canvas harness on the dev route', () => {
    window.history.pushState({}, '', '/codequest-platform/__dev/canvas');

    renderWithError(null);

    expect(screen.getByText('dev-canvas')).toBeInTheDocument();
  });
});
