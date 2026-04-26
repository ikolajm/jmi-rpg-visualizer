'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/atoms/Logo';

export default function TitleScreen() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  function handleStart() {
    setExiting(true);
    setTimeout(() => router.push('/draft'), 800);
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
        <p className="ts-tagline text-body-sm">Prepare to get wiped!</p>
      </div>

      {/* Start button with breathing corner brackets */}
      <button className="ts-button" onClick={handleStart}>
        <span className="ts-corner ts-corner-tl" />
        <span className="ts-corner ts-corner-tr" />
        <span className="ts-corner ts-corner-bl" />
        <span className="ts-corner ts-corner-br" />
        <span className="ts-button-text text-body-md">BEGIN</span>
      </button>
    </div>
  );
}
