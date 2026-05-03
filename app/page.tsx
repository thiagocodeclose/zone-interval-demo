// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { siteData } from '@/lib/site-data';

const css = `
  :root {
    --zn-bg: #0A0A0A;
    --zn-surface: #121212;
    --zn-card: #1A1A1A;
    --zn-primary: #FF6B00;
    --zn-primary-light: #FF8C33;
    --zn-accent: #FFB347;
    --zn-text: #F5F5F0;
    --zn-muted: rgba(245,245,240,0.55);
    --zn-border: rgba(255,107,0,0.12);
    --font-display: var(--font-bebas), 'Bebas Neue', sans-serif;
    --font-body: var(--font-inter), 'Inter', sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--zn-bg); color: var(--zn-text); overflow-x: hidden; }

  /* NAV */
  .zn-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 68px;
    transition: background 0.4s, box-shadow 0.4s;
  }
  .zn-nav.scrolled {
    background: rgba(10,10,10,0.97);
    box-shadow: 0 1px 24px rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
  }
  .zn-nav-logo {
    font-family: var(--font-display);
    font-size: 1.8rem; letter-spacing: 0.08em;
    color: var(--zn-text); text-decoration: none;
  }
  .zn-nav-logo span { color: var(--zn-primary); }
  .zn-nav-links { display: flex; gap: 2rem; align-items: center; }
  .zn-nav-links a {
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase;
    color: var(--zn-muted); text-decoration: none; transition: color 0.2s;
  }
  .zn-nav-links a:hover { color: var(--zn-primary); }
  .zn-btn-nav {
    background: var(--zn-primary); color: var(--zn-bg);
    padding: 0.5rem 1.4rem;
    font-family: var(--font-display);
    font-size: 1rem; letter-spacing: 0.08em;
    text-decoration: none; transition: background 0.2s;
  }
  .zn-btn-nav:hover { background: var(--zn-primary-light); }

  /* CINEMATIC VIDEO HERO */
  .zn-video-hero {
    position: relative;
    height: 70vh; min-height: 540px;
    overflow: hidden;
  }
  .zn-video-hero video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; display: block;
  }
  .zn-video-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(10,10,10,0.05) 0%,
      rgba(10,10,10,0.3) 55%,
      rgba(10,10,10,0.95) 100%
    );
  }
  /* HR pulse bars overlaid on video — decorative */
  .zn-pulse-bars {
    position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%);
    display: flex; align-items: flex-end; gap: 4px;
  }
  .zn-bar {
    width: 4px; background: var(--zn-primary);
    border-radius: 2px;
    animation: zn-bar-pulse 1.4s ease-in-out infinite;
    opacity: 0.9;
  }
  @keyframes zn-bar-pulse {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }

  /* HERO CONTENT — below video */
  .zn-hero-content {
    background: var(--zn-bg); padding: 3.5rem 2rem 5rem;
    position: relative;
  }
  .zn-hero-content::before {
    content: '';
    position: absolute; top: -70px; left: 0; right: 0; height: 70px;
    background: linear-gradient(to bottom, transparent, var(--zn-bg));
    pointer-events: none;
  }
  .zn-hero-content-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
  .zn-hero-title {
    font-family: var(--font-display);
    font-size: clamp(4rem, 8vw, 8rem);
    letter-spacing: 0.03em; text-transform: uppercase;
    color: var(--zn-text); line-height: 0.9;
  }
  .zn-hero-title span { color: var(--zn-primary); display: block; }
  .zn-hero-right {}
  .zn-hero-tag {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--zn-primary); margin-bottom: 1rem; display: block;
  }
  .zn-hero-sub { font-size: 1rem; line-height: 1.8; color: var(--zn-muted); margin-bottom: 2rem; }
  .zn-hero-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .zn-btn-primary {
    background: var(--zn-primary); color: var(--zn-bg);
    padding: 0.9rem 2rem;
    font-family: var(--font-display);
    font-size: 1rem; letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; transition: background 0.2s, transform 0.2s;
  }
  .zn-btn-primary:hover { background: var(--zn-primary-light); transform: translateY(-2px); }
  .zn-btn-outline {
    border: 2px solid rgba(245,245,240,0.15); color: var(--zn-muted);
    padding: 0.9rem 2rem;
    font-family: var(--font-display);
    font-size: 1rem; letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; transition: border-color 0.2s, color 0.2s;
  }
  .zn-btn-outline:hover { border-color: var(--zn-primary); color: var(--zn-primary); }

  /* STATS STRIP */
  .zn-stats-strip { background: var(--zn-primary); padding: 2rem; }
  .zn-stats-inner {
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); text-align: center;
  }
  .zn-stat-value {
    font-family: var(--font-display);
    font-size: 2.4rem; letter-spacing: 0.04em;
    color: var(--zn-bg); margin-bottom: 0.2rem;
  }
  .zn-stat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(10,10,10,0.65); }

  /* SECTIONS */
  section { padding: 6rem 2rem; }
  .zn-section-tag {
    font-family: var(--font-display);
    font-size: 0.85rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--zn-primary); margin-bottom: 0.5rem; display: inline-block;
  }
  .zn-section-title {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 4vw, 4.5rem);
    text-transform: uppercase; letter-spacing: 0.03em;
    color: var(--zn-text); line-height: 0.95; margin-bottom: 1rem;
  }
  .zn-section-sub { font-size: 1rem; line-height: 1.8; color: var(--zn-muted); max-width: 540px; }

  /* ZONES */
  .zn-zones-section { background: var(--zn-surface); }
  .zn-zones-inner { max-width: 1200px; margin: 0 auto; }
  .zn-zones-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 2rem; }
  .zn-zones-list { display: flex; flex-direction: column; gap: 1px; background: rgba(255,107,0,0.06); }
  .zn-zone-row {
    background: var(--zn-card);
    display: grid; grid-template-columns: 60px 180px 1fr auto;
    gap: 2rem; align-items: center;
    padding: 1.75rem 2rem;
    transition: background 0.2s;
  }
  .zn-zone-row:hover { background: #202020; }
  .zn-zone-num {
    font-family: var(--font-display);
    font-size: 3rem; letter-spacing: 0; opacity: 0.18; line-height: 1;
  }
  .zn-zone-name {
    font-family: var(--font-display);
    font-size: 1.2rem; letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--zn-text);
  }
  .zn-zone-range {
    font-size: 0.78rem; font-weight: 600; color: var(--zn-muted);
    letter-spacing: 0.05em; text-transform: uppercase; margin-top: 0.25rem;
  }
  .zn-zone-desc { font-size: 0.9rem; line-height: 1.65; color: var(--zn-muted); }
  .zn-zone-dot {
    width: 16px; height: 16px; border-radius: 50%;
    flex-shrink: 0;
  }

  /* CLASSES */
  .zn-classes-section { background: var(--zn-bg); }
  .zn-classes-inner { max-width: 1200px; margin: 0 auto; }
  .zn-classes-header { margin-bottom: 3rem; }
  .zn-classes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,107,0,0.06); border: 1px solid rgba(255,107,0,0.06); }
  .zn-class-cell {
    background: var(--zn-card); padding: 2rem;
    position: relative; overflow: hidden;
    transition: background 0.2s;
  }
  .zn-class-cell:hover { background: #202020; }
  .zn-class-cell::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: var(--zn-primary);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s;
  }
  .zn-class-cell:hover::after { transform: scaleX(1); }
  .zn-class-badges { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .zn-badge {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 0.25rem 0.65rem;
  }
  .zn-badge-level { background: rgba(255,107,0,0.12); color: var(--zn-primary); }
  .zn-badge-dur { background: rgba(245,245,240,0.06); color: var(--zn-muted); }
  .zn-class-name {
    font-family: var(--font-display);
    font-size: 1.3rem; text-transform: uppercase; letter-spacing: 0.04em;
    color: var(--zn-text); margin-bottom: 0.75rem;
  }
  .zn-class-desc { font-size: 0.88rem; line-height: 1.65; color: var(--zn-muted); }

  /* PRICING */
  .zn-pricing-section { background: var(--zn-surface); }
  .zn-pricing-inner { max-width: 1100px; margin: 0 auto; }
  .zn-pricing-header { text-align: center; margin-bottom: 3.5rem; }
  .zn-pricing-header .zn-section-sub { margin: 0 auto; }
  .zn-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,107,0,0.06); border: 1px solid rgba(255,107,0,0.06); }
  .zn-price-card {
    background: var(--zn-card); padding: 2.5rem 2rem;
    position: relative;
  }
  .zn-price-card.highlight { background: #1A0F00; border-left: 2px solid var(--zn-primary); border-right: 2px solid var(--zn-primary); }
  .zn-popular-badge {
    position: absolute; top: 0; left: 0; right: 0;
    background: var(--zn-primary);
    font-family: var(--font-display);
    font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--zn-bg); text-align: center; padding: 0.3rem;
  }
  .zn-price-name {
    font-family: var(--font-display);
    font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--zn-muted); margin-bottom: 0.75rem; margin-top: 1.5rem;
  }
  .zn-price-card.highlight .zn-price-name { margin-top: 2.5rem; }
  .zn-price-amount {
    font-family: var(--font-display);
    font-size: 3.2rem; color: var(--zn-primary); line-height: 1; margin-bottom: 0.2rem;
  }
  .zn-price-period { font-size: 0.82rem; color: var(--zn-muted); margin-bottom: 1.75rem; }
  .zn-price-features { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; margin-bottom: 2rem; }
  .zn-price-features li { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.88rem; color: var(--zn-muted); }
  .zn-check { color: var(--zn-primary); flex-shrink: 0; font-weight: 700; }
  .zn-price-cta {
    display: block; text-align: center; padding: 0.9rem;
    font-family: var(--font-display);
    font-size: 0.95rem; letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; transition: all 0.2s;
  }
  .zn-price-card.highlight .zn-price-cta { background: var(--zn-primary); color: var(--zn-bg); }
  .zn-price-card.highlight .zn-price-cta:hover { background: var(--zn-primary-light); }
  .zn-price-card:not(.highlight) .zn-price-cta { border: 1px solid rgba(245,245,240,0.12); color: var(--zn-muted); }
  .zn-price-card:not(.highlight) .zn-price-cta:hover { border-color: var(--zn-primary); color: var(--zn-primary); }

  /* CTA */
  .zn-cta-section { background: var(--zn-bg); text-align: center; padding: 7rem 2rem; position: relative; overflow: hidden; }
  .zn-cta-section::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,0,0.08) 0%, transparent 100%);
  }
  .zn-cta-inner { max-width: 640px; margin: 0 auto; position: relative; }
  .zn-cta-title {
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 7vw, 7rem);
    text-transform: uppercase; letter-spacing: 0.03em;
    color: var(--zn-text); line-height: 0.9; margin-bottom: 1.25rem;
  }
  .zn-cta-title span { color: var(--zn-primary); display: block; }
  .zn-cta-sub { font-size: 1rem; color: var(--zn-muted); margin-bottom: 2.5rem; line-height: 1.75; }
  .zn-btn-cta {
    background: var(--zn-primary); color: var(--zn-bg);
    padding: 1.1rem 3rem;
    font-family: var(--font-display);
    font-size: 1.1rem; letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; display: inline-block;
    transition: background 0.2s, transform 0.2s;
  }
  .zn-btn-cta:hover { background: var(--zn-primary-light); transform: translateY(-2px); }

  /* FOOTER */
  .zn-footer { background: #060606; padding: 4rem 2rem 2rem; }
  .zn-footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; }
  .zn-footer-logo { font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.08em; color: var(--zn-text); margin-bottom: 0.75rem; }
  .zn-footer-logo span { color: var(--zn-primary); }
  .zn-footer-desc { font-size: 0.88rem; line-height: 1.6; color: var(--zn-muted); max-width: 280px; }
  .zn-footer-h { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,245,240,0.28); margin-bottom: 1rem; }
  .zn-footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.65rem; }
  .zn-footer-links a { color: var(--zn-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
  .zn-footer-links a:hover { color: var(--zn-primary); }
  .zn-footer-bottom {
    max-width: 1200px; margin: 2.5rem auto 0;
    padding-top: 2rem; border-top: 1px solid rgba(245,245,240,0.06);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.78rem; color: var(--zn-muted); flex-wrap: wrap; gap: 0.5rem;
  }
  .zn-footer-brand { color: var(--zn-primary); text-decoration: none; font-weight: 700; }

  /* REVEAL */
  .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.65s ease, transform 0.65s ease; }
  .reveal.visible { opacity: 1; transform: none; }

  @media (max-width: 900px) {
    .zn-hero-content-inner { grid-template-columns: 1fr; gap: 2rem; }
    .zn-zone-row { grid-template-columns: 40px 1fr; }
    .zn-zone-desc, .zn-zone-dot { display: none; }
    .zn-classes-grid { grid-template-columns: 1fr; }
    .zn-pricing-grid { grid-template-columns: 1fr; }
    .zn-stats-inner { grid-template-columns: repeat(2, 1fr); }
    .zn-footer-inner { grid-template-columns: 1fr; }
    .zn-nav-links { display: none; }
  }
`;

const BAR_HEIGHTS = [16, 24, 32, 40, 52, 64, 52, 40, 56, 36, 24, 48, 60, 44, 32, 20, 36, 52, 40, 28];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0.10 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function ZonePage() {
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <nav className={`zn-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="#" className="zn-nav-logo">ZO<span>NE</span></a>
        <div className="zn-nav-links">
          <a href="#zones">The Zones</a>
          <a href="#classes">Classes</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <a href="#intro" className="zn-btn-nav">Try For $49</a>
        </div>
      </nav>

      {/* CINEMATIC VIDEO HERO — full-bleed, no copy on top */}
      <div id="intro" className="zn-video-hero">
        <video autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1800&q=80"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-a-treadmill-in-a-gym-43696-large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="zn-video-overlay" />
        {/* Decorative HR pulse bars at bottom of video */}
        <div className="zn-pulse-bars">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="zn-bar"
              style={{
                height: `${h}px`,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* HERO CONTENT — below video */}
      <div className="zn-hero-content">
        <div className="zn-hero-content-inner">
          <h1 data-cg-el="hero_headline_1" className="zn-hero-title">
            Find Your<br /><span>Zone.</span>
          </h1>
          <div className="zn-hero-right">
            <span className="zn-hero-tag">Heart-Rate Training · Austin, TX</span>
            <p data-cg-el="hero_subtitle" className="zn-hero-sub">
              Data-driven interval training that puts you in the right zone at the right time. 45 minutes. 5 zones. Measurable progress every single session.
            </p>
            <div className="zn-hero-actions">
              <a data-cg-el="hero_cta_primary" href="#pricing" className="zn-btn-primary">Start for $49</a>
              <a data-cg-el="hero_cta_secondary" href="#zones" className="zn-btn-outline">Learn The Zones</a>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="zn-stats-strip">
        <div className="zn-stats-inner">
          {siteData.stats.map((s, i) => (
            <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="zn-stat-value">{s.value}</div>
              <div className="zn-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ZONES */}
      <section id="zones" className="zn-zones-section">
        <div className="zn-zones-inner">
          <div className="zn-zones-header reveal">
            <div>
              <span className="zn-section-tag">Heart-Rate Science</span>
              <h2 className="zn-section-title">The Five<br />Zones</h2>
            </div>
            <p className="zn-section-sub">
              Each zone triggers a different physiological response. Train them all, in the right sequence, and you build a complete athlete.
            </p>
          </div>
          <div className="zn-zones-list">
            {siteData.zones.map((z, i) => (
              <div key={z.num} className="zn-zone-row reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="zn-zone-num" style={{ color: z.color }}>{z.num}</div>
                <div>
                  <div className="zn-zone-name">{z.name}</div>
                  <div className="zn-zone-range">{z.range}</div>
                </div>
                <p className="zn-zone-desc">{z.desc}</p>
                <div className="zn-zone-dot" style={{ background: z.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLASSES */}
      <section id="classes" className="zn-classes-section">
        <div className="zn-classes-inner">
          <div className="zn-classes-header reveal">
            <span className="zn-section-tag">Class Formats</span>
            <h2 className="zn-section-title">Your Next<br />45 Minutes</h2>
            <p className="zn-section-sub">
              Every format uses heart-rate tracking. Every session generates a personal performance report. Every visit makes you better.
            </p>
          </div>
          <div className="zn-classes-grid">
            {siteData.classes.map((c, i) => (
              <div key={c.name} className="zn-class-cell reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="zn-class-badges">
                  <span className="zn-badge zn-badge-level">{c.level}</span>
                  <span className="zn-badge zn-badge-dur">{c.duration}</span>
                </div>
                <div className="zn-class-name">{c.name}</div>
                <p className="zn-class-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="zn-pricing-section">
        <div className="zn-pricing-inner">
          <div className="zn-pricing-header reveal">
            <span className="zn-section-tag">Membership Options</span>
            <h2 className="zn-section-title">Start Training<br />Today</h2>
            <p className="zn-section-sub">
              New members: 2 weeks unlimited for $49. HR monitor included. No commitment.
            </p>
          </div>
          <div className="zn-pricing-grid">
            {siteData.pricing.map((p, i) => (
              <div key={p.name} className={`zn-price-card reveal${p.highlight ? ' highlight' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
                {p.highlight && <span className="zn-popular-badge">Most Popular</span>}
                <div className="zn-price-name">{p.name}</div>
                <div className="zn-price-amount">{p.price}</div>
                <div className="zn-price-period">{p.period}</div>
                <ul className="zn-price-features">
                  {p.features.map((f) => (
                    <li key={f}><span className="zn-check">→</span>{f}</li>
                  ))}
                </ul>
                <a href="#intro" className="zn-price-cta">Get Started</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="zn-cta-section">
        <div className="zn-cta-inner">
          <h2 className="zn-cta-title reveal">
            Enter The<br /><span>Zone.</span>
          </h2>
          <p className="zn-cta-sub reveal">
            Two weeks unlimited. Heart-rate monitor included. Personal zone calibration on day one. $49 — no catch, no contract.
          </p>
          <a href="#pricing" className="zn-btn-cta reveal">Start for $49</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="zn-footer">
        <div className="zn-footer-inner">
          <div>
            <div className="zn-footer-logo">ZO<span>NE</span> Studio</div>
            <p className="zn-footer-desc">
              {siteData.gym.address}<br />
              {siteData.gym.phone}<br />
              {siteData.gym.email}
            </p>
          </div>
          <div>
            <div className="zn-footer-h">Train</div>
            <ul className="zn-footer-links">
              <li><a href="#classes">Schedule</a></li>
              <li><a href="#zones">The Zones</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#">HR Technology</a></li>
            </ul>
          </div>
          <div>
            <div className="zn-footer-h">Info</div>
            <ul className="zn-footer-links">
              <li><a href="#">New Members</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Corporate Wellness</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="zn-footer-bottom">
          <span>© {new Date().getFullYear()} Zone Interval Studio. All rights reserved.</span>
          <span>Powered by <a href="https://koriva.com" className="zn-footer-brand">Koriva</a></span>
        </div>
      </footer>
    </>
  );
}
