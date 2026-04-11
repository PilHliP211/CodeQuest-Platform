import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProfileProvider } from '@/engine/ProfileProvider';
import { ContentProvider } from '@/engine/ContentProvider';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (root === null) throw new Error('Root element #root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <ProfileProvider>
      <ContentProvider>
        <App />
      </ContentProvider>
    </ProfileProvider>
  </StrictMode>,
);
