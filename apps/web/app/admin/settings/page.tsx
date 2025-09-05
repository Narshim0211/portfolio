'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const BrandingSchema = z.object({
  brandColor: z.string().min(1),
  logoUrl: z.string().url().optional().or(z.literal('')),
  postBookingRedirectUrl: z.string().url().optional().or(z.literal('')),
});

const PaymentSchema = z.object({
  mode: z.enum(['confirmation_only', 'in_person', 'external_required']),
  externalPaymentUrl: z.string().url().optional().or(z.literal('')),
  paymentTtlSec: z.coerce.number().min(60).max(3600),
  callbackSecret: z.string().min(12).optional().or(z.literal('')),
});

type BrandingForm = z.infer<typeof BrandingSchema>;
type PaymentForm = z.infer<typeof PaymentSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const brandingForm = useForm<BrandingForm>({
    resolver: zodResolver(BrandingSchema),
    defaultValues: {
      brandColor: '#111827',
      logoUrl: '',
      postBookingRedirectUrl: '',
    },
  });

  const paymentsForm = useForm<PaymentForm>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      mode: 'confirmation_only',
      externalPaymentUrl: '',
      paymentTtlSec: 900,
      callbackSecret: '',
    },
  });

  // NOTE: In production, auth middleware should provide tenant context.
  const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? '';
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/admin/settings`, {
          headers: { 'x-tenant-id': tenantId },
        });
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        if (!mounted) return;
        brandingForm.reset({
          brandColor: data.branding.brandColor ?? '#111827',
          logoUrl: data.branding.logoUrl ?? '',
          postBookingRedirectUrl: data.branding.postBookingRedirectUrl ?? '',
        });
        paymentsForm.reset({
          mode: data.payments.mode,
          externalPaymentUrl: data.payments.externalPaymentUrl ?? '',
          paymentTtlSec: data.payments.paymentTtlSec ?? 900,
          callbackSecret: data.payments.callbackSecret ?? '',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSaveBranding(values: BrandingForm) {
    await fetch(`${apiBase}/admin/settings/branding`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        brandColor: values.brandColor,
        logoUrl: values.logoUrl || undefined,
        postBookingRedirectUrl: values.postBookingRedirectUrl || undefined,
      }),
    });
    alert('Branding saved');
  }

  async function onSavePayments(values: PaymentForm) {
    await fetch(`${apiBase}/admin/settings/payments`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        mode: values.mode,
        externalPaymentUrl: values.externalPaymentUrl || undefined,
        paymentTtlSec: values.paymentTtlSec,
        callbackSecret: values.callbackSecret || undefined,
      }),
    });
    alert('Payments saved');
  }

  if (loading) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Branding</h2>
        <form
          className="grid gap-4 max-w-xl"
          onSubmit={brandingForm.handleSubmit(onSaveBranding)}
        >
          <label className="grid gap-1">
            <span className="text-sm">Brand Color</span>
            <input type="color" className="h-10 w-20" {...brandingForm.register('brandColor')} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Logo URL</span>
            <input className="input border p-2" placeholder="https://..." {...brandingForm.register('logoUrl')} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Post-booking Redirect URL</span>
            <input className="input border p-2" placeholder="https://..." {...brandingForm.register('postBookingRedirectUrl')} />
          </label>
          <button className="mt-2 rounded bg-black text-white px-4 py-2" type="submit">Save Branding</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Payments</h2>
        <form
          className="grid gap-4 max-w-xl"
          onSubmit={paymentsForm.handleSubmit(onSavePayments)}
        >
          <label className="grid gap-1">
            <span className="text-sm">Mode</span>
            <select className="border p-2" {...paymentsForm.register('mode')}>
              <option value="confirmation_only">Confirmation only</option>
              <option value="in_person">In person</option>
              <option value="external_required">External required</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">External Payment URL</span>
            <input className="border p-2" placeholder="https://..." {...paymentsForm.register('externalPaymentUrl')} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Payment TTL (seconds)</span>
            <input className="border p-2" type="number" min={60} max={3600} {...paymentsForm.register('paymentTtlSec', { valueAsNumber: true })} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Callback Secret</span>
            <input className="border p-2" placeholder="min 12 chars" {...paymentsForm.register('callbackSecret')} />
          </label>
          <button className="mt-2 rounded bg-black text-white px-4 py-2" type="submit">Save Payments</button>
        </form>
      </section>
    </main>
  );
}