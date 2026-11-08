import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <div className="rounded-3xl border border-[#d4af37]/30 bg-[#14110e] p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37]">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-serif-luxury text-4xl font-bold text-white">
          404 — Page Not Found
        </h1>
        <p className="mt-3 text-sm text-stone-400">
          The link you accessed does not exist or has been relocated within Ordeno Restaurant.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-7 py-3.5 text-xs font-bold text-[#0c0a09] transition hover:bg-[#e5c349]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}

