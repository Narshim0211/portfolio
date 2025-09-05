import React from 'react';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Book an Appointment</h1>
        <p className="text-gray-600">Service → Staff → Time → Details → Review → Payment/Success</p>
      </div>
      {children}
    </section>
  );
}

