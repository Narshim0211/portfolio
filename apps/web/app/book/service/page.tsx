'use client';

import { useEffect, useState } from 'react';
import { useToast } from '../../../components/ui/ToastProvider';

export default function BookService() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const subdomain = process.env.NEXT_PUBLIC_PUBLIC_SUBDOMAIN ?? 'demo';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/public/${subdomain}/services`);
        const data = await res.json();
        setServices(data.services ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-medium">Choose a Service</h2>
      {loading ? (
        <div className="grid gap-3">
          <div className="h-14 bg-gray-100 animate-pulse rounded" />
          <div className="h-14 bg-gray-100 animate-pulse rounded" />
          <div className="h-14 bg-gray-100 animate-pulse rounded" />
        </div>
      ) : (
        <ul className="grid gap-3">
          {services.map((s) => (
            <li key={s.id} className="border p-3 rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-600">{s.durationMin} min · ${(s.priceCents/100).toFixed(2)}</div>
              </div>
              <a className="rounded bg-black text-white px-3 py-2" href={`/book/time?serviceId=${s.id}`}>Select</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

