// @ts-nocheck
// lib/koriva-config.ts — Fetches live config from Koriva Admin Portal (ISR 60s).
import { cache } from 'react';

export interface GymInfo {
  name: string; slug: string; address?: string; phone?: string;
  email?: string; hours?: Record<string, string>; instagram?: string; facebook?: string;
}
export interface BrandConfig {
  tagline?: string; hero_headline?: string; hero_cta_text?: string;
  color_primary?: string; color_bg?: string; color_text?: string;
  color_secondary?: string; color_radius?: string; color_mode?: 'light' | 'dark';
  widgets_schedule?: boolean; widgets_pricing?: boolean;
  widgets_lead_capture?: boolean; widgets_ai_chat?: boolean;
  logo_url?: string | null; instagram_url?: string | null; facebook_url?: string | null;
}
export interface KorivaConfig {
  gym: GymInfo; template: string; brand: BrandConfig;
  seo: { title?: string; description?: string; keywords?: string[]; og_image?: string };
}

const KORIVA_API = process.env.NEXT_PUBLIC_CODEGYM_URL || 'https://app.codegyms.com';
const GYM_SLUG   = process.env.NEXT_PUBLIC_GYM_SLUG;

export const getKorivaConfig = cache(async (): Promise<KorivaConfig | null> => {
  if (!GYM_SLUG) return null;
  try {
    const res = await fetch(`${KORIVA_API}/api/site-config?slug=${GYM_SLUG}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<KorivaConfig>;
  } catch { return null; }
});

export function buildCssVars(brand: BrandConfig | undefined): Record<string, string> {
  if (!brand) return {};
  const vars: Record<string, string> = {};
  if (brand.color_primary) vars['--cg-primary'] = `#${brand.color_primary}`;
  if (brand.color_bg)      vars['--cg-bg']      = `#${brand.color_bg}`;
  if (brand.color_text)    vars['--cg-text']     = `#${brand.color_text}`;
  if (brand.color_secondary) vars['--cg-secondary'] = `#${brand.color_secondary}`;
  if (brand.color_radius !== undefined)
    vars['--cg-radius'] = brand.color_radius === '999' ? '9999px' : `${brand.color_radius}px`;
  return vars;
}
