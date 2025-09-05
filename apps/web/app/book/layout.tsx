import React from 'react';
import { BrandingProvider } from './BrandingProvider';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Book an Appointment</h1>
        <p className="text-gray-600">Service → Staff → Time → Details → Review → Payment/Success</p>
        <nav className="mt-3 grid grid-cols-6 gap-2 text-xs">
          {['Service','Staff','Time','Details','Review','Pay/Success'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-black text-white grid place-items-center">{i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </nav>
      </div>
      <BrandingProvider>
        <div className="h-1 w-full mb-4" style={{ backgroundColor: 'var(--brand-color)' }} aria-hidden="true" />
        {children}
      </BrandingProvider>
    </section>
  );
}

