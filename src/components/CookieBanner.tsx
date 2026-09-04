'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem('cookie-consent', choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-oven-flame/20 bg-oven-charcoal/98 px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <p className="text-center text-sm text-oven-cream/80 sm:text-left">
          We use cookies to understand site traffic and improve your experience. See our{' '}
          <Link href="/privacy" className="text-oven-flame-light underline">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => handleChoice('declined')}
            className="rounded-full border border-oven-cream/30 px-4 py-2 text-sm font-medium text-oven-cream/80 transition-colors hover:bg-oven-cream/10"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="rounded-full bg-oven-flame px-4 py-2 text-sm font-semibold text-oven-charcoal transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}