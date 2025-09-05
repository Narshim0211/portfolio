'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  notes: z.string().optional().or(z.literal('')),
  policyAccepted: z.boolean().refine((v) => v, 'You must accept the policy'),
});

type FormValues = z.infer<typeof Schema>;

export default function BookDetails() {
  const sp = useSearchParams();
  const serviceId = sp.get('serviceId') ?? '';
  const staffId = sp.get('staffId') ?? '';
  const start = sp.get('start') ?? '';

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', email: '', phone: '', notes: '', policyAccepted: false },
  });

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-medium">Your details</h2>
      <form className="grid gap-2 max-w-lg" onSubmit={form.handleSubmit(() => {
        const q = new URLSearchParams({
          serviceId, staffId, start,
          name: form.getValues('name'),
          email: form.getValues('email'),
          phone: form.getValues('phone'),
          notes: form.getValues('notes') || '',
        }).toString();
        window.location.href = `/book/review?${q}`;
      })}>
        <input className="border p-2" placeholder="Full name" {...form.register('name')} />
        <input className="border p-2" placeholder="Email" {...form.register('email')} />
        <input className="border p-2" placeholder="Phone" {...form.register('phone')} />
        <textarea className="border p-2" placeholder="Notes (optional)" {...form.register('notes')} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('policyAccepted')} /> I accept the booking policy
        </label>
        <button className="rounded bg-black text-white px-4 py-2 w-fit">Continue</button>
      </form>
    </main>
  );
}

