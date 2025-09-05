'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [brandColor, setBrandColor] = useState<string>('#111827');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  const sp = useSearchParams();
  const subdomain = (sp.get('sub') || process.env.NEXT_PUBLIC_PUBLIC_SUBDOMAIN || 'demo') as string;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/public/${subdomain}/branding`);
        if (res.ok) {
          const data = await res.json();
          setBrandColor(data.brandColor || '#111827');
        }
      } catch {}
    })();
  }, []);

  return (
    <div style={{ ['--brand-color' as any]: brandColor }}>
      {children}
    </div>
  );
}

