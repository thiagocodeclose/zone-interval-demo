'use client';
import { useEffect } from 'react';

/**
 * Listens for KORIVA_CUSTOMIZE postMessage from the Koriva Admin Portal
 * and applies CSS variable overrides live — enabling real-time preview.
 */
export function KorivaLivePreview() {
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data || e.data.type !== 'KORIVA_CUSTOMIZE') return;
      const p = e.data.payload as Record<string, string>;
      const el = document.documentElement;
      if (p.primary_color)   el.style.setProperty('--cg-primary', p.primary_color);
      if (p.bg_color)        el.style.setProperty('--cg-bg',      p.bg_color);
      if (p.text_color)      el.style.setProperty('--cg-text',    p.text_color);
      if (p.border_radius) {
        const r = p.border_radius;
        const px = r === 'sharp' ? '0px' : r === 'soft' ? '6px' : r === 'round' ? '12px' : r;
        el.style.setProperty('--cg-radius', px);
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return null;
}
