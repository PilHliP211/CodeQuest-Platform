import React, { useState } from 'react';
import { useProfile } from '@/engine/useProfile';

export function NameEntryScreen(): React.ReactElement {
  const { createProfile } = useProfile();
  const [name, setName] = useState('');

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= 20;
  // Only show an error for the too-long case — empty is handled by disabling submit
  const errorMessage = trimmed.length > 20 ? 'Name must be 20 characters or fewer' : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!isValid) return;
    createProfile(trimmed);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <h1 className="font-pixel mb-8 text-center text-xl text-green-400">
        What&apos;s your name, adventurer?
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="name-input" className="font-pixel text-sm text-green-300">
            Your Name
          </label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            aria-invalid={errorMessage !== null}
            aria-describedby={errorMessage !== null ? 'name-error' : undefined}
            autoFocus
            maxLength={40}
            className="rounded border-2 border-green-400 bg-gray-800 px-4 py-2 font-mono text-white focus:border-green-300 focus:outline-none"
          />
          {errorMessage !== null && (
            <p id="name-error" className="font-pixel text-xs text-red-400">
              {errorMessage}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!isValid}
          className="font-pixel mt-4 rounded bg-green-500 px-6 py-3 text-sm text-gray-900 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Quest!
        </button>
      </form>
    </main>
  );
}
