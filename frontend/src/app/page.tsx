'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/atoms/Button';

export default function TitleScreen() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  function handleStart() {
    setExiting(true);
    setTimeout(() => router.push('/draft'), 500);
  }

  return (
    <div className={`ts-screen ${exiting ? 'ts-exit' : ''}`}>
      {/* Logo with pixelation */}
      <div className="ts-logo">
        <Logo size={120} fill="var(--primary)" className="ts-logo-img" />
      </div>

      {/* Title + Tagline group */}
      <div className="ts-title-group">
        <h1 className="ts-heading">
          {'PARTY WIPE'.split('').map((char, i) => (
            <span
              key={i}
              className="ts-letter"
              style={{ animationDelay: `${1.2 + i * 0.08}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className="ts-tagline text-body-sm">The dungeon awaits...</p>
      </div>

      {/* Start button */}
      <div className="ts-button">
        <Button size="lg" onClick={handleStart} disabled={exiting}>Begin</Button>
      </div>
    </div>
  );
}
