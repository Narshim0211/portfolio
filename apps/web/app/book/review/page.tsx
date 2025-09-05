'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function randomKey() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function BookReviewInner() {
  const sp = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const subdomain = process.env.NEXT_PUBLIC_PUBLIC_SUBDOMAIN ?? 'demo';

  const payload = useMemo(() => {
    const serviceId = sp.get('serviceId') ?? '';
    const staffId = sp.get('staffId');
    const start = sp.get('start') ?? '';
    const customer = {
      name: sp.get('name') ?? '',
      email: sp.get('email') ?? '',
      phone: sp.get('phone') ?? '',
      notes: sp.get('notes') ?? '',
    };
    return { serviceId, staffId, start, customer };
  }, [sp]);

  async function confirm() {
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/public/${subdomain}/appointments`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': randomKey(),
        },
        body: JSON.stringify({
          serviceId: payload.serviceId,
          staffId: payload.staffId,
          datetimeStart: payload.start,
          customer: payload.customer,
          policyAccepted: true,
          idempotencyKey: randomKey(),
        }),
      });
      if (!res.ok) {
        alert('Failed to create appointment');
        return;
      }
      const data = await res.json();
      if (data.payment?.mode === 'external_required' && data.status === 'pending_payment') {
        const q = new URLSearchParams({ apt: data.appointmentId, url: data.payment.url ?? '', expiresAt: data.payment.expiresAt ?? '' });
        window.location.href = `/book/pay?${q.toString()}`;
      } else {
        window.location.href = `/book/success?apt=${data.appointmentId}`;
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-medium">Review</h2>
      <div className="border rounded p-4 space-y-2 max-w-xl">
        <div><span className="text-gray-600">ServiceId:</span> {payload.serviceId}</div>
        <div><span className="text-gray-600">StaffId:</span> {payload.staffId}</div>
        <div><span className="text-gray-600">Start:</span> {new Date(payload.start).toLocaleString()}</div>
        <div><span className="text-gray-600">Name:</span> {payload.customer.name}</div>
        <div><span className="text-gray-600">Email:</span> {payload.customer.email}</div>
        <div><span className="text-gray-600">Phone:</span> {payload.customer.phone}</div>
        {payload.customer.notes ? <div><span className="text-gray-600">Notes:</span> {payload.customer.notes}</div> : null}
      </div>
      <button disabled={submitting} className="rounded bg-black text-white px-4 py-2" onClick={confirm}>{submitting ? 'Confirming…' : 'Confirm Booking'}</button>
    </main>
  );
}

export default function BookReview() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <BookReviewInner />
    </Suspense>
  );
}

