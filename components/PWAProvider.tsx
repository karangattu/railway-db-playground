'use client';

import { ReactNode } from 'react';
import { useServiceWorker } from '@/lib/pwa/hooks';
import HapticsProvider from './HapticsProvider';

export default function PWAProvider({ children }: { children: ReactNode }) {
  // Register service worker on component mount
  useServiceWorker();

  // Wrap app with Haptics provider so components can read/modify preference
  return <HapticsProvider>{children}</HapticsProvider>;
}
