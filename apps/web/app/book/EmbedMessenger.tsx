'use client';

import { useEffect } from 'react';

export function EmbedMessenger() {
  useEffect(() => {
    function postHeight() {
      try {
        const h = document.body.scrollHeight;
        window.parent.postMessage({ type: 'salon:resize', height: h }, '*');
      } catch {}
    }
    postHeight();
    const id = setInterval(postHeight, 300);
    function onReady(e: MessageEvent) {
      if (e?.data?.type === 'salon:ready') postHeight();
    }
    window.addEventListener('message', onReady);
    return () => { clearInterval(id); window.removeEventListener('message', onReady); };
  }, []);
  return null;
}

