import './globals.css';
import type { Metadata } from 'next';
import StorageCleanup from './storage-cleanup';

export const metadata: Metadata = {
  title: 'Andwell Innovation Command Center',
  description: 'Competitive intelligence, growth planning, staffing, and board-ready strategy for Andwell Health Partners.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><StorageCleanup />{children}</body></html>;
}
