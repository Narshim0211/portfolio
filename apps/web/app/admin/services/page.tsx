'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Service = {
  id: string;
  name: string;
  durationMin: number;
  bufferBefore: number;
  bufferAfter: number;
  category?: string;
  priceCents: number;
  active: boolean;
};

const Schema = z.object({
  name: z.string().min(1),
  durationMin: z.coerce.number().int().positive(),
  bufferBefore: z.coerce.number().int().min(0).default(0),
  bufferAfter: z.coerce.number().int().min(0).default(0),
  category: z.string().optional().or(z.literal('')),
  priceCents: z.coerce.number().int().min(0),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof Schema>;

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? '';

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', durationMin: 30, bufferBefore: 0, bufferAfter: 0, category: '', priceCents: 0, active: true },
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/services`, { headers: { 'x-tenant-id': tenantId } });
      const data = await res.json();
      setItems(data.services ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(values: FormValues) {
    await fetch(`${apiBase}/admin/services`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
      body: JSON.stringify({
        ...values,
        category: values.category || undefined,
      }),
    });
    form.reset();
    await load();
  }

  async function update(id: string, next: Partial<Service>) {
    await fetch(`${apiBase}/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
      body: JSON.stringify(next),
    });
    await load();
  }

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Services</h1>

      <section>
        <h2 className="text-lg font-medium mb-2">Create Service</h2>
        <form className="grid gap-2 max-w-2xl" onSubmit={form.handleSubmit(create)}>
          <input className="border p-2" placeholder="Name" {...form.register('name')} />
          <div className="grid grid-cols-3 gap-2">
            <input className="border p-2" type="number" placeholder="Duration (min)" {...form.register('durationMin')} />
            <input className="border p-2" type="number" placeholder="Buffer before (min)" {...form.register('bufferBefore')} />
            <input className="border p-2" type="number" placeholder="Buffer after (min)" {...form.register('bufferAfter')} />
          </div>
          <input className="border p-2" placeholder="Category" {...form.register('category')} />
          <input className="border p-2" type="number" placeholder="Price (cents)" {...form.register('priceCents')} />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('active')} /> Active
          </label>
          <button className="rounded bg-black text-white px-4 py-2 w-fit">Create</button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Existing Services</h2>
        {loading ? <p>Loading...</p> : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.durationMin} min</td>
                  <td className="p-2">${(s.priceCents/100).toFixed(2)}</td>
                  <td className="p-2">{s.active ? 'Yes' : 'No'}</td>
                  <td className="p-2 flex gap-2">
                    <button className="rounded bg-blue-600 text-white px-2 py-1" onClick={() => update(s.id, { active: !s.active })}>{s.active ? 'Disable' : 'Enable'}</button>
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

