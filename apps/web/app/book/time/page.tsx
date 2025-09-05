'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function BookTime() {
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
      {loading ? <p>Loading...</p> : (
        <ul className="grid gap-2 grid-cols-2">
          {slots.map((s) => (
            <li key={`${s.staffId}-${s.start}`}>
              <a className="block border rounded p-2 hover:bg-gray-50" href={`/book/details?serviceId=${serviceId}&staffId=${s.staffId}&start=${encodeURIComponent(s.start)}`}>{new Date(s.start).toLocaleTimeString()}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

