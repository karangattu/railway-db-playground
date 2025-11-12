'use client';

import { ReactNode } from 'react';
import { useServiceWorker } from '@/lib/pwa/hooks';

export default function PWAProvider({ children }: { children: ReactNode }) {
  // Register service worker on component mount
  useServiceWorker();

  return <>{children}</>;
}
