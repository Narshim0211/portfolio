'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Staff = { id: string; name: string; tz: string; specialties: string[]; active: boolean };

const StaffSchema = z.object({
  name: z.string().min(1),
  tz: z.string().min(1),
  specialties: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true),
});

type StaffForm = z.infer<typeof StaffSchema>;

export default function StaffPage() {
  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? '';

  const form = useForm<StaffForm>({
    resolver: zodResolver(StaffSchema),
    defaultValues: { name: '', tz: 'UTC', specialties: '', active: true },
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/staff`, { headers: { 'x-tenant-id': tenantId } });
      const data = await res.json();
      setItems(data.staff ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(values: StaffForm) {
    const specialties = values.specialties ? values.specialties.split(',').map((s) => s.trim()).filter(Boolean) : [];
    await fetch(`${apiBase}/admin/staff`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
      body: JSON.stringify({ name: values.name, tz: values.tz, specialties, active: values.active }),
    });
    form.reset();
    await load();
  }

  async function addHours(id: string, rrule: string, tz: string) {
    await fetch(`${apiBase}/admin/staff/${id}/hours`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rrule, tz }),
    });
    alert('Hours added');
  }

  async function addPto(id: string, start: string, end: string) {
    await fetch(`${apiBase}/admin/staff/${id}/timeoff`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ start, end }),
    });
    alert('Time off added');
  }

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Staff</h1>

      <section>
        <h2 className="text-lg font-medium mb-2">Create Staff</h2>
        <form className="grid gap-2 max-w-2xl" onSubmit={form.handleSubmit(create)}>
          <input className="border p-2" placeholder="Name" {...form.register('name')} />
          <input className="border p-2" placeholder="Timezone (e.g., America/New_York)" {...form.register('tz')} />
          <input className="border p-2" placeholder="Specialties (comma-separated)" {...form.register('specialties')} />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('active')} /> Active
          </label>
          <button className="rounded bg-black text-white px-4 py-2 w-fit">Create</button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Team</h2>
        {loading ? <p>Loading...</p> : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">TZ</th>
                <th className="p-2 text-left">Specialties</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Availability</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.tz}</td>
                  <td className="p-2">{s.specialties.join(', ')}</td>
                  <td className="p-2">{s.active ? 'Yes' : 'No'}</td>
                  <td className="p-2">
                    <AvailabilityEditor staffId={s.id} tz={s.tz} onAddHours={addHours} onAddPto={addPto} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

function AvailabilityEditor({ staffId, tz, onAddHours, onAddPto }: { staffId: string; tz: string; onAddHours: (id: string, rrule: string, tz: string) => Promise<void>; onAddPto: (id: string, start: string, end: string) => Promise<void>; }) {
  const [rrule, setRrule] = useState('FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0;INTERVAL=1');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <input className="border p-1 w-[420px]" value={rrule} onChange={(e) => setRrule(e.target.value)} />
        <button className="rounded bg-blue-600 text-white px-2 py-1" onClick={() => onAddHours(staffId, rrule, tz)}>Add Hours</button>
      </div>
      <div className="flex gap-2 items-center">
        <input className="border p-1" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        <span>→</span>
        <input className="border p-1" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button className="rounded bg-blue-600 text-white px-2 py-1" onClick={() => onAddPto(staffId, start+':00Z', end+':00Z')}>Add PTO</button>
      </div>
    </div>
  );
}

