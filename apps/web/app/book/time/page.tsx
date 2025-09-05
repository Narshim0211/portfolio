'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function BookTimeInner() {
  const sp = useSearchParams();
  const serviceId = sp.get('serviceId') ?? '';
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const subdomain = process.env.NEXT_PUBLIC_PUBLIC_SUBDOMAIN ?? 'demo';

  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      setLoading(true);
      try {
        const url = new URL(`${apiBase}/public/${subdomain}/availability`);
        url.searchParams.set('serviceId', serviceId);
        url.searchParams.set('date', date);
        const res = await fetch(url.toString());
        const data = await res.json();
        setSlots(data.slots ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId, date]);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-medium">Pick a time</h2>
      <div className="flex gap-2 items-center">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2"/>
      </div>
      {loading ? (
        <div className="grid gap-2 grid-cols-2">
          <div className="h-10 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 bg-gray-100 animate-pulse rounded" />
        </div>
      ) : (
        <ul className="grid gap-2 grid-cols-2">
          {slots.map((s) => (
            <li key={`${s.staffId}-${s.start}`}>
              <Link className="block border rounded p-2 hover:bg-gray-50" prefetch href={`/book/details?serviceId=${serviceId}&staffId=${s.staffId}&start=${encodeURIComponent(s.start)}`}>{new Date(s.start).toLocaleTimeString()}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function BookTime() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <BookTimeInner />
    </Suspense>
  );
}

