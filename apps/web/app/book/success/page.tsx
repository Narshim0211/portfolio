'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function BookSuccessInner() {
  const sp = useSearchParams();
  const apt = sp.get('apt') ?? '';

  useEffect(() => {
    try {
      window.parent.postMessage({ type: 'salon:success', appointmentId: apt }, '*');
    } catch {}
  }, [apt]);

  function downloadICS() {
    const dt = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${apt}\nDTSTAMP:${dt}\nSUMMARY:Salon Appointment\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'appointment.ics'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-medium">Confirmed</h2>
      <p>Your appointment is confirmed. Your reference: <span className="font-mono">{apt}</span></p>
      <div className="flex gap-2">
        <button className="rounded bg-black text-white px-4 py-2" onClick={downloadICS}>Add to Calendar (ICS)</button>
        <a className="rounded border px-4 py-2" href="/">Back home</a>
      </div>
    </main>
  );
}

export default function BookSuccess() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <BookSuccessInner />
    </Suspense>
  );
}

