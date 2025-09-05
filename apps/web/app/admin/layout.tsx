import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <nav className="sticky top-0 bg-white border-b p-3 flex gap-4 text-sm">
        <a className="hover:underline" href="/admin">Home</a>
        <a className="hover:underline" href="/admin/calendar">Calendar</a>
        <a className="hover:underline" href="/admin/services">Services</a>
        <a className="hover:underline" href="/admin/staff">Staff</a>
        <a className="hover:underline" href="/admin/settings">Settings</a>
      </nav>
      <div className="p-6">{children}</div>
    </section>
  );
}

