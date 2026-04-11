import React, { useState } from 'react';
import { useProfile } from '@/engine/useProfile';

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps): React.ReactElement {
  const { profile, updateName } = useProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= 20;
  const isChanged = profile !== null && trimmed !== profile.name;
  const errorMessage = trimmed.length > 20 ? 'Name must be 20 characters or fewer' : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!isValid || !isChanged) return;
    updateName(trimmed);
    setSavedFlash(true);
    window.setTimeout(() => {
      setSavedFlash(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <header className="flex items-center justify-between bg-gray-800 px-4 py-3">
        <h1 className="font-pixel text-lg text-green-400">Settings</h1>
        <button
          type="button"
          onClick={onClose}
          className="font-pixel text-sm text-green-300 hover:text-green-200"
        >
          Back
        </button>
      </header>
      <div className="flex-1 px-6 py-6">
        <section aria-labelledby="profile-section">
          <h2 id="profile-section" className="font-pixel mb-4 text-base text-green-300">
            Profile
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="settings-name-input" className="font-pixel text-xs text-green-300">
                Name
              </label>
              <input
                id="settings-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                aria-invalid={errorMessage !== null}
                aria-describedby={errorMessage !== null ? 'settings-name-error' : undefined}
                maxLength={40}
                className="rounded border-2 border-green-400 bg-gray-800 px-4 py-2 font-mono text-white focus:border-green-300 focus:outline-none"
              />
              {errorMessage !== null && (
                <p id="settings-name-error" className="font-pixel text-xs text-red-400">
                  {errorMessage}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!isValid || !isChanged}
              className="font-pixel self-start rounded bg-green-500 px-4 py-2 text-xs text-gray-900 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savedFlash ? 'Saved!' : 'Save Name'}
            </button>
          </form>
        </section>
        {/* Reset Progress — deferred to E-12 */}
      </div>
    </div>
  );
}
