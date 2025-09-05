'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function BookPayInner() {
  const sp = useSearchParams();
  const apt = sp.get('apt') ?? '';
  const url = sp.get('url') ?? '';
  const expiresAt = sp.get('expiresAt') ?? '';
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const subdomain = process.env.NEXT_PUBLIC_PUBLIC_SUBDOMAIN ?? 'demo';
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<'pending_payment'|'confirmed'|'cancelled'>('pending_payment');

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    const id = setInterval(() => {
      const now = Date.now();
      setRemaining(Math.max(0, Math.floor((end - now) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch(`${apiBase}/public/${subdomain}/appointments/${apt}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        if (data.status === 'confirmed') {
          window.location.href = `/book/success?apt=${apt}`;
        }
      }
    }, 3000);
    return () => clearInterval(id);
  }, [apt]);

  const expired = useMemo(() => remaining <= 0 && status !== 'confirmed', [remaining, status]);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-medium">Payment</h2>
      <p className="text-gray-600">Complete payment on the secure external page. We will confirm automatically here.</p>
      <a href={url} target="_blank" className="rounded bg-black text-white px-4 py-2 w-fit">Open payment</a>
      <div>
        <span className="font-medium">Time left:</span> {remaining}s
      </div>
      {expired ? <div className="text-red-600">Payment window expired. Please start over.</div> : null}
    </main>
  );
}

export default function BookPay() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <BookPayInner />
    </Suspense>
  );
}

