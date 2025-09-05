'use client';

import { useEffect, useMemo, useState } from 'react';

type Appt = {
  id: string;
  staffId: string;
  serviceId: string;
  start: string;
  end: string;
  status: 'pending_payment'|'confirmed'|'cancelled'|'noshow';
  paymentStatus: 'unpaid'|'paid'|'refunded';
  customerName: string;
};

export default function CalendarPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [items, setItems] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? '';

  const range = useMemo(() => {
    const from = new Date(`${date}T00:00:00Z`).toISOString();
    const to = new Date(`${date}T23:59:59Z`).toISOString();
    return { from, to };
  }, [date]);

  async function load() {
    setLoading(true);
    try {
      const url = new URL(`${apiBase}/admin/calendar`);
      url.searchParams.set('from', range.from);
      url.searchParams.set('to', range.to);
      const res = await fetch(url.toString(), { headers: { 'x-tenant-id': tenantId } });
      const data = await res.json();
      setItems(data.appointments ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [range.from, range.to]);

  async function move(id: string, newStaffId: string, newStart: string) {
    await fetch(`${apiBase}/admin/appointments/${id}/move`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
      body: JSON.stringify({ newStaffId, newStart, keepDuration: true }),
    });
    await load();
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Calendar — Day</h1>
      <div className="flex gap-3 items-center">
        <label className="text-sm">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2"/>
        <button onClick={load} className="rounded bg-black text-white px-3 py-2">Refresh</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <table className="w-full border mt-4 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Staff</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Move</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{new Date(a.start).toLocaleTimeString()} – {new Date(a.end).toLocaleTimeString()}</td>
                <td className="p-2">{a.customerName}</td>
                <td className="p-2">{a.staffId.slice(0,8)}…</td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded text-white" style={{backgroundColor: a.status === 'confirmed' ? '#16a34a' : a.status === 'pending_payment' ? '#f59e0b' : a.status === 'cancelled' ? '#ef4444' : '#64748b'}}>
                    {a.status}
                  </span>
                </td>
                <td className="p-2">
                  <MoveForm id={a.id} start={a.start} onSubmit={move} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function MoveForm({ id, start, onSubmit }: { id: string; start: string; onSubmit: (id: string, newStaffId: string, newStart: string) => Promise<void>; }) {
  const [staff, setStaff] = useState('');
  const [dt, setDt] = useState(() => start.slice(0,16));
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onSubmit(id, staff, dt+':00Z'); }}>
      <input className="border p-1" placeholder="new staffId" value={staff} onChange={(e) => setStaff(e.target.value)} />
      <input className="border p-1" type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
      <button className="rounded bg-blue-600 text-white px-2">Move</button>
    </form>
  );
}

