"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    __GARRISON365_ANIM_OBSERVER__?: IntersectionObserver;
  }
}

export interface Garrison365ElementPayload {
  id: string;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
  visible?: boolean;
  translateX?: number;
  translateY?: number;
  scale?: number;
  opacity?: number;
  mediaType?: "image" | "video";
  videoUrl?: string;
  href?: string;
  letterSpacing?: number;
  lineHeight?: number;
  visibleMobile?: boolean;
  focalX?: number;   // 0-100 — image focal point horizontal
  focalY?: number;   // 0-100 — image focal point vertical
  animation?: string; // 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'slide-up'
  sectionBg?: string; // for GARRISON365_CUSTOMIZE section backgrounds
}

interface OverlayRect {
  id: string;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

type DragType = "move" | "resize";
type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/**
 * Garrison365LivePreview — mounts inside the template iframe.
 *
 * Features:
 *  • GARRISON365_CUSTOMIZE / GARRISON365_ELEMENT_UPDATE — live style overrides
 *  • GARRISON365_EDIT_MODE — activates Canva-style canvas editing:
 *      - Hover: dashed blue outline on [data-cg-el] elements
 *      - Click: blue selection overlay with label badge + 8 resize handles
 *      - Drag center: move element (CSS `translate` property, no layout disruption)
 *      - Drag handle: resize element (font-size)
 *      - Sends GARRISON365_ELEMENT_CLICK / GARRISON365_ELEMENT_MOVED / GARRISON365_ELEMENT_RESIZED to parent
 *  • GARRISON365_SELECT_ELEMENT — parent panel → iframe selection sync
 */
export function Garrison365LivePreview() {
  const [editMode, setEditMode] = useState(false);
  const [overlay, setOverlay] = useState<OverlayRect | null>(null);
  const [hoverOverlay, setHoverOverlay] = useState<OverlayRect | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({}); // snap guide lines
  const [mounted, setMounted] = useState(false);

  const dragRef = useRef<{
    type: DragType;
    handle?: HandlePos;
    startX: number;
    startY: number;
    origFontSize: number;
    origScale: number;
    origTx: number;
    origTy: number;
    isImage: boolean;
    el: HTMLElement;
    id: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Overlay positioning ──────────────────────────────────────────────────

  const refreshOverlay = useCallback((id: string) => {
    const el = document.querySelector(
      `[data-cg-el="${id}"]`,
    ) as HTMLElement | null;
    if (!el) {
      setOverlay(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    // Human-readable label: strip section prefix → "headline 1", "Headline 1"
    const raw = id.replace(/^[a-z]+_/, "").replace(/_/g, " ");
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    setOverlay({
      id,
      label,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  // ── postMessage handler ──────────────────────────────────────────────────

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data?.type) return;

      if (e.data.type === "GARRISON365_CUSTOMIZE") {
        const p = e.data.payload as Record<string, string>;
        const root = document.documentElement;
        if (p.primary_color)
          root.style.setProperty("--cg-primary", p.primary_color);
        if (p.bg_color) root.style.setProperty("--cg-bg", p.bg_color);
        if (p.text_color) root.style.setProperty("--cg-text", p.text_color);
        if (p.border_radius) {
          const r = p.border_radius;
          const px =
            r === "sharp"
              ? "0px"
              : r === "soft"
                ? "6px"
                : r === "round"
                  ? "12px"
                  : r;
          root.style.setProperty("--cg-radius", px);
        }
        // section_backgrounds (#8)
        if (
          p.section_backgrounds &&
          typeof p.section_backgrounds === "object"
        ) {
          Object.entries(
            p.section_backgrounds as Record<string, string>,
          ).forEach(([sectionId, color]) => {
            const el = (document.getElementById(sectionId) ||
              document.querySelector(`[data-section="${sectionId}"]`) ||
              document.querySelector(
                `section.${sectionId}`,
              )) as HTMLElement | null;
            if (el) el.style.backgroundColor = color;
          });
        }
        // section_video_backgrounds — inject/remove <video> elements per section
        if ((p as any).section_video_backgrounds && typeof (p as any).section_video_backgrounds === 'object') {
          Object.entries((p as any).section_video_backgrounds as Record<string, string>).forEach(([sectionId, url]) => {
            const sectionEl = (
              document.getElementById(sectionId) ||
              document.querySelector(`[data-section="${sectionId}"]`) ||
              document.querySelector(`section.${sectionId}`)
            ) as HTMLElement | null;
            if (!sectionEl) return;
            // Remove existing video bg if any
            const existing = sectionEl.querySelector('.garrison365-video-bg') as HTMLElement | null;
            if (existing) existing.remove();
            if (!url) return;
            // Ensure section can contain absolute-positioned children
            const pos = window.getComputedStyle(sectionEl).position;
            if (pos === 'static') sectionEl.style.position = 'relative';
            sectionEl.style.overflow = 'hidden';
            // Create video element
            const wrapper = document.createElement('div');
            wrapper.className = 'garrison365-video-bg';
            wrapper.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;';
            const video = document.createElement('video');
            video.src = url;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
            wrapper.appendChild(video);
            sectionEl.insertBefore(wrapper, sectionEl.firstChild);
            // Ensure section content sits above video
            Array.from(sectionEl.children).forEach((child) => {
              const c = child as HTMLElement;
              if (!c.classList.contains('garrison365-video-bg')) {
                c.style.position = 'relative';
                c.style.zIndex = '1';
              }
            });
          });
        }
        // site_content — dispatch to components
        if ((p as any).site_content) {
          window.dispatchEvent(
            new CustomEvent("garrison365:content", {
              detail: (p as any).site_content,
            }),
          );
        }
        // logo_url / gym_name / colors / hero — dispatch to all brand-aware components
        window.dispatchEvent(
          new CustomEvent("garrison365:brand", {
            detail: {
              logo_url: (p as any).logo_url,
              gym_name: (p as any).gym_name,
              primary_color: (p as any).primary_color,
              bg_color: (p as any).bg_color,
              text_color: (p as any).text_color,
              border_radius: (p as any).border_radius,
              color_mode: (p as any).color_mode,
              hero_url: (p as any).hero_url,
              hero_type: (p as any).hero_type,
              social_instagram: (p as any).social_instagram,
              social_facebook: (p as any).social_facebook,
              gym_slug: (p as any).gym_slug,
              // Integration flags
              booking_enabled: (p as any).booking_enabled,
              portal_enabled: (p as any).portal_enabled,
              announcement_enabled: (p as any).announcement_enabled,
              // Announcement bar
              announcement_text: (p as any).announcement_text,
              announcement_url: (p as any).announcement_url,
              announcement_bg_color: (p as any).announcement_bg_color,
              announcement_text_color: (p as any).announcement_text_color,
              // Contact / hours
              gym_address: (p as any).gym_address,
              gym_phone: (p as any).gym_phone,
              gym_email: (p as any).gym_email,
              gym_hours: (p as any).gym_hours,
              // Portal URL
              portal_url: (p as any).portal_url,
              base_url: (p as any).base_url,
            },
          }),
        );
        return;
      }

      if (e.data.type === "GARRISON365_EDIT_MODE") {
        const active = !!e.data.payload?.active;
        setEditMode(active);
        if (!active) {
          setOverlay(null);
          setHoverOverlay(null);
          stopEditing();
        }
        if (active) {
          // Wait 2 frames so all useGarrison365Element components have registered
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const registry = window.__GARRISON365_REGISTRY__;
              if (!registry) return;
              const elements = Array.from(registry.entries()).map(
                ([id, data]) => ({
                  id,
                  section: data.meta?.section ?? id.split("_")[0],
                  label:
                    data.meta?.label ??
                    id.replace(/^[^_]+_/, "").replace(/_/g, " "),
                  type: data.meta?.type ?? "text",
                  defaults: data.defaults,
                }),
              );
              const templateId =
                document.documentElement.dataset.templateId ?? "unknown";
              const templateVersion =
                document.documentElement.dataset.templateVersion ?? "1";
              window.parent?.postMessage(
                {
                  type: "GARRISON365_MANIFEST",
                  templateId,
                  templateVersion,
                  elements,
                },
                "*",
              );
            }),
          );
        }
        return;
      }

      if (e.data.type === "GARRISON365_HOVER_ELEMENT") {
        const id = e.data.payload?.id;
        if (!id) {
          setHoverOverlay(null);
          return;
        }
        const el = document.querySelector(
          `[data-cg-el="${id}"]`,
        ) as HTMLElement | null;
        if (!el) {
          setHoverOverlay(null);
          return;
        }
        const rect = el.getBoundingClientRect();
        const raw = id.replace(/^[a-z]+_/, "").replace(/_/g, " ");
        const label = raw.charAt(0).toUpperCase() + raw.slice(1);
        setHoverOverlay({
          id,
          label,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        return;
      }

      if (e.data.type === "GARRISON365_SELECT_ELEMENT") {
        const id = e.data.payload?.id;
        if (id) requestAnimationFrame(() => refreshOverlay(id));
        else setOverlay(null);
        return;
      }

      if (e.data.type === "GARRISON365_INLINE_EDIT_REQUEST") {
        const id = e.data.payload?.id as string | undefined;
        if (!id) return;
        const el = document.querySelector(
          `[data-cg-el="${id}"]`,
        ) as HTMLElement | null;
        if (!el) return;
        const isImage =
          el.tagName === "IMG" ||
          (el.querySelector("img") !== null &&
            (el.textContent?.trim() || "").length === 0);
        if (isImage) return;
        if (editingId && editingId !== id) stopEditing();
        setEditingId(id);
        el.contentEditable = "true";
        el.style.outline = "2px solid #3b82f6";
        el.style.cursor = "text";
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        setOverlay(null);
        window.parent?.postMessage(
          { type: "GARRISON365_INLINE_EDIT_START", payload: { id } },
          "*",
        );
        return;
      }


      // ── applyElementPayload — shared DOM/CSS updater ──
      function applyElementPayload(p: Garrison365ElementPayload) {
        const {
          id,
          content,
          fontSize,
          fontWeight,
          fontStyle,
          fontFamily,
          color,
          textAlign,
          visible,
          translateX,
          translateY,
          scale,
          opacity,
          mediaType,
          videoUrl,
          focalX,
          focalY,
          animation,
          letterSpacing,
          lineHeight,
          visibleMobile,
        } = p;
        const root = document.documentElement;
        const cgEl = document.querySelector(
          `[data-cg-el="${id}"]`,
        ) as HTMLElement | null;
        const imgEl = cgEl
          ? cgEl.tagName === "IMG"
            ? (cgEl as HTMLImageElement)
            : (cgEl.querySelector("img") as HTMLImageElement | null)
          : null;

        if (content !== undefined) {
          if (imgEl) {
            imgEl.src = content;
          } else {
            root.style.setProperty(`--cg-el-${id}-content`, content);
            if (cgEl && !cgEl.querySelector("[data-cg-el]")) {
              cgEl.textContent = content;
            }
          }
        }
        if (fontSize !== undefined)
          root.style.setProperty(`--cg-el-${id}-size`, `${fontSize}px`);
        if (fontWeight !== undefined)
          root.style.setProperty(`--cg-el-${id}-weight`, fontWeight);
        if (fontStyle !== undefined)
          root.style.setProperty(`--cg-el-${id}-style`, fontStyle);
        if (fontFamily !== undefined) {
          root.style.setProperty(`--cg-el-${id}-family`, fontFamily);
          if (cgEl) {
            (cgEl as HTMLElement).style.fontFamily = fontFamily;
            const linkId = `gf-${fontFamily.replace(/\s/g, "-")}`;
            if (!document.getElementById(linkId)) {
              const link = document.createElement("link");
              link.id = linkId;
              link.rel = "stylesheet";
              link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700&display=swap`;
              document.head.appendChild(link);
            }
          }
        }
        if (color !== undefined) {
          root.style.setProperty(`--cg-el-${id}-color`, `#${color}`);
          if (cgEl) (cgEl as HTMLElement).style.color = `#${color}`;
        }
        if (textAlign !== undefined)
          root.style.setProperty(`--cg-el-${id}-align`, textAlign);
        if (visible !== undefined)
          root.style.setProperty(
            `--cg-el-${id}-display`,
            visible ? "" : "none",
          );
        if (opacity !== undefined && cgEl) {
          cgEl.style.opacity = String(opacity / 100);
          root.style.setProperty(
            `--cg-el-${id}-opacity`,
            String(opacity / 100),
          );
        }
        if (scale !== undefined && cgEl) {
          cgEl.style.scale = String(scale);
        }
        if (mediaType !== undefined && cgEl && imgEl) {
          if (mediaType === "video") {
            const src = videoUrl || "";
            let vid = cgEl.querySelector("video") as HTMLVideoElement | null;
            if (!vid) {
              vid = document.createElement("video");
              vid.autoplay = true;
              vid.muted = true;
              vid.loop = true;
              (vid as HTMLVideoElement & { playsInline: boolean }).playsInline =
                true;
              vid.style.cssText =
                "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;";
              cgEl.appendChild(vid);
            }
            if (src) vid.src = src;
            vid.style.display = "";
            imgEl.style.display = "none";
          } else {
            imgEl.style.display = "";
            const vid = cgEl.querySelector("video") as HTMLVideoElement | null;
            if (vid) vid.style.display = "none";
          }
        } else if (videoUrl !== undefined && cgEl) {
          const vid = cgEl.querySelector("video") as HTMLVideoElement | null;
          if (vid) vid.src = videoUrl;
        }
        if (translateX !== undefined || translateY !== undefined) {
          if (cgEl) {
            const cur = (cgEl.style.translate || "0px 0px").split(" ");
            const tx =
              translateX !== undefined ? translateX : parseFloat(cur[0]) || 0;
            const ty =
              translateY !== undefined ? translateY : parseFloat(cur[1]) || 0;
            cgEl.style.translate = `${tx}px ${ty}px`;
          }
        }
        if ((focalX !== undefined || focalY !== undefined) && imgEl) {
          const fx = focalX ?? 50;
          const fy = focalY ?? 50;
          imgEl.style.objectPosition = `${fx}% ${fy}%`;
          root.style.setProperty(`--cg-el-${id}-focal`, `${fx}% ${fy}%`);
        }
        if (letterSpacing !== undefined && cgEl) {
          (cgEl as HTMLElement).style.letterSpacing = `${letterSpacing}px`;
        }
        if (lineHeight !== undefined && cgEl) {
          (cgEl as HTMLElement).style.lineHeight = String(lineHeight);
        }
        if (visibleMobile !== undefined && cgEl) {
          if (visibleMobile === false) {
            cgEl.classList.add('k-hide-mobile');
          } else {
            cgEl.classList.remove('k-hide-mobile');
          }
        }
        if (animation !== undefined && cgEl) {
          cgEl.classList.remove('k-anim-fade', 'k-anim-slide-left', 'k-anim-slide-right', 'k-anim-zoom', 'k-anim-slide-up');
          cgEl.classList.remove('k-anim-done');
          if (animation && animation !== 'none') {
            cgEl.classList.add(`k-anim-${animation}`);
            if (window.__GARRISON365_ANIM_OBSERVER__) {
              window.__GARRISON365_ANIM_OBSERVER__.unobserve(cgEl);
              window.__GARRISON365_ANIM_OBSERVER__.observe(cgEl);
            }
          }
        }
        window.dispatchEvent(
          new CustomEvent<Garrison365ElementPayload>("garrison365:element", {
            detail: p,
          }),
        );
      }

      // Batch update — admin sends all canvas_data in one shot for performance
      if (e.data.type === "GARRISON365_ELEMENT_BATCH") {
        const raw = e.data.payload;
        const entries: Garrison365ElementPayload[] = Array.isArray(raw)
          ? raw
          : Object.values(raw);
        entries.forEach((payload) => applyElementPayload(payload));
        return;
      }

      if (e.data.type === "GARRISON365_ELEMENT_UPDATE") {
        const p = e.data.payload as Garrison365ElementPayload;
        applyElementPayload(p);
        if (overlay?.id === p.id) requestAnimationFrame(() => refreshOverlay(p.id));
        return;
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [overlay, refreshOverlay]);

  // ── Stop inline editing ──────────────────────────────────────────────────

  const stopEditing = useCallback(() => {
    if (!editingId) return;
    const el = document.querySelector(
      `[data-cg-el="${editingId}"]`,
    ) as HTMLElement | null;
    if (el) {
      el.contentEditable = "false";
      el.style.outline = "";
      el.style.cursor = "";
      const newContent = el.innerText.trim();
      const payload: Garrison365ElementPayload = {
        id: editingId,
        content: newContent,
      };
      window.parent.postMessage(
        { type: "GARRISON365_ELEMENT_TEXT_CHANGED", payload },
        "*",
      );
      window.dispatchEvent(
        new CustomEvent("garrison365:element", { detail: payload }),
      );
    }
    setEditingId(null);
  }, [editingId]);

  // ── Click-to-select + double-click to edit ───────────────────────────────

  useEffect(() => {
    if (!editMode) return;

    const onClick = (e: MouseEvent) => {
      // If clicking outside any element while editing → stop editing
      if (editingId) {
        const el = (e.target as HTMLElement).closest(
          "[data-cg-el]",
        ) as HTMLElement | null;
        if (!el || el.getAttribute("data-cg-el") !== editingId) {
          stopEditing();
          return;
        }
        return; // let contenteditable handle it
      }

      const el = (e.target as HTMLElement).closest(
        "[data-cg-el]",
      ) as HTMLElement | null;
      if (!el) {
        setOverlay(null);
        window.parent.postMessage(
          { type: "GARRISON365_ELEMENT_CLICK", payload: { id: null } },
          "*",
        );
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const id = el.getAttribute("data-cg-el")!;
      refreshOverlay(id);
      window.parent.postMessage(
        { type: "GARRISON365_ELEMENT_CLICK", payload: { id } },
        "*",
      );
    };

    const onDblClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-cg-el]",
      ) as HTMLElement | null;
      if (!el) return;
      const id = el.getAttribute("data-cg-el")!;
      // Only allow inline editing for text elements (not images)
      const isImage = el.querySelector("img") !== null || el.tagName === "IMG";
      if (isImage) return;
      e.preventDefault();
      e.stopPropagation();
      // Stop any previous editing
      if (editingId && editingId !== id) stopEditing();
      setEditingId(id);
      el.contentEditable = "true";
      el.style.outline = "2px solid #3b82f6";
      el.style.cursor = "text";
      el.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      setOverlay(null); // hide selection overlay while editing
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!editingId) return;
      if (e.key === "Escape") {
        e.preventDefault();
        stopEditing();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        stopEditing();
      }
    };

    const style = document.createElement("style");
    style.id = "cg-edit-style";
    style.textContent = `
      [data-cg-el] { cursor: pointer !important; }
      [data-cg-el]:hover { outline: 2px dashed rgba(59,130,246,0.5) !important; outline-offset: 4px; }
      [contenteditable="true"] { cursor: text !important; outline: 2px solid #3b82f6 !important; }
    `;
    document.head.appendChild(style);
    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDblClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDblClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.getElementById("cg-edit-style")?.remove();
    };
  }, [editMode, editingId, refreshOverlay, stopEditing]);

  // ── Refresh overlay on scroll / resize ──────────────────────────────────

  useEffect(() => {
    if (!overlay) return;
    const refresh = () => refreshOverlay(overlay.id);
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [overlay, refreshOverlay]);

  // ── Global mousemove + mouseup for drag ─────────────────────────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (d.type === "move") {
        const rawTx = d.origTx + dx;
        const rawTy = d.origTy + dy;
        // Snap to viewport center
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = d.el.getBoundingClientRect();
        const elCX =
          rect.left -
          (parseFloat(d.el.style.translate?.split(" ")[0]) || 0) +
          rect.width / 2 +
          rawTx;
        const elCY =
          rect.top -
          (parseFloat(d.el.style.translate?.split(" ")[1]) || 0) +
          rect.height / 2 +
          rawTy;
        const SNAP = 6;
        let snapX: number | undefined;
        let snapY: number | undefined;
        let finalTx = rawTx;
        let finalTy = rawTy;
        if (Math.abs(elCX - vw / 2) < SNAP) {
          snapX = vw / 2;
          finalTx = rawTx - (elCX - vw / 2);
        }
        if (Math.abs(elCY - vh / 2) < SNAP) {
          snapY = vh / 2;
          finalTy = rawTy - (elCY - vh / 2);
        }
        setSnapLines({ x: snapX, y: snapY });
        d.el.style.translate = `${finalTx}px ${finalTy}px`;
      } else {
        const sign =
          d.handle === "sw" || d.handle === "nw" || d.handle === "w" ? -1 : 1;
        if (d.isImage) {
          const newScale = Math.max(
            0.1,
            Math.min(4, d.origScale + dx * sign * 0.008),
          );
          d.el.style.scale = String(newScale);
        } else {
          const newSize = Math.max(8, d.origFontSize + dx * sign * 0.4);
          d.el.style.fontSize = `${newSize}px`;
        }
      }
      refreshOverlay(d.id);
    };

    const onUp = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (d.type === "move") {
        const newTx = Math.round(d.origTx + dx);
        const newTy = Math.round(d.origTy + dy);
        const payload: Garrison365ElementPayload = {
          id: d.id,
          translateX: newTx,
          translateY: newTy,
        };
        window.parent.postMessage(
          { type: "GARRISON365_ELEMENT_MOVED", payload },
          "*",
        );
        window.dispatchEvent(
          new CustomEvent("garrison365:element", { detail: payload }),
        );
      } else if (d.isImage) {
        const newScale = parseFloat(d.el.style.scale) || d.origScale;
        const payload: Garrison365ElementPayload = {
          id: d.id,
          scale: Math.round(newScale * 1000) / 1000,
        };
        window.parent.postMessage(
          { type: "GARRISON365_ELEMENT_RESIZED", payload },
          "*",
        );
        window.dispatchEvent(
          new CustomEvent("garrison365:element", { detail: payload }),
        );
      } else {
        const newSize = Math.round(
          parseFloat(d.el.style.fontSize) || d.origFontSize,
        );
        const payload: Garrison365ElementPayload = { id: d.id, fontSize: newSize };
        window.parent.postMessage(
          { type: "GARRISON365_ELEMENT_RESIZED", payload },
          "*",
        );
        window.dispatchEvent(
          new CustomEvent("garrison365:element", { detail: payload }),
        );
      }
      dragRef.current = null;
      setSnapLines({});
      refreshOverlay(d.id);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [refreshOverlay]);

  // ── Start drag (called from overlay JSX) ────────────────────────────────

  const startDrag = useCallback(
    (e: React.MouseEvent, type: DragType, id: string, handle?: HandlePos) => {
      e.preventDefault();
      e.stopPropagation();
      const el = document.querySelector(`[data-cg-el="${id}"]`) as HTMLElement;
      if (!el) return;
      const cs = window.getComputedStyle(el);
      const origFontSize = parseFloat(cs.fontSize) || 16;
      const origScale = parseFloat(el.style.scale || "1") || 1;
      const parts = (el.style.translate || "0px 0px").split(" ");
      const origTx = parseFloat(parts[0]) || 0;
      const origTy = parseFloat(parts[1]) || 0;
      const isImage = !!(el.querySelector("img") || el.tagName === "IMG");
      dragRef.current = {
        type,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origFontSize,
        origScale,
        origTx,
        origTy,
        isImage,
        el,
        id,
      };
    },
    [],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (!mounted) return null;

  const PAD = 3;
  const H = 8;

  const renderSelectionOverlay = (ov: OverlayRect, isHover = false) => {
    const handles: {
      pos: HandlePos;
      style: React.CSSProperties;
      cursor: string;
    }[] = [
      { pos: "nw", style: { top: -H / 2, left: -H / 2 }, cursor: "nw-resize" },
      {
        pos: "n",
        style: { top: -H / 2, left: ov.width / 2 - H / 2 },
        cursor: "n-resize",
      },
      { pos: "ne", style: { top: -H / 2, right: -H / 2 }, cursor: "ne-resize" },
      {
        pos: "e",
        style: { top: ov.height / 2 - H / 2, right: -H / 2 },
        cursor: "e-resize",
      },
      {
        pos: "se",
        style: { bottom: -H / 2, right: -H / 2 },
        cursor: "se-resize",
      },
      {
        pos: "s",
        style: { bottom: -H / 2, left: ov.width / 2 - H / 2 },
        cursor: "s-resize",
      },
      {
        pos: "sw",
        style: { bottom: -H / 2, left: -H / 2 },
        cursor: "sw-resize",
      },
      {
        pos: "w",
        style: { top: ov.height / 2 - H / 2, left: -H / 2 },
        cursor: "w-resize",
      },
    ];

    return (
      <div
        key={isHover ? "hover" : "select"}
        style={{
          position: "absolute",
          top: ov.top - PAD,
          left: ov.left - PAD,
          width: ov.width + PAD * 2,
          height: ov.height + PAD * 2,
          pointerEvents: isHover ? "none" : "none",
        }}
      >
        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: isHover
              ? "2px dashed rgba(59,130,246,0.7)"
              : "2px solid #3b82f6",
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
        {/* Label badge */}
        <div
          style={{
            position: "absolute",
            top: -22,
            left: -2,
            background: isHover ? "rgba(59,130,246,0.7)" : "#3b82f6",
            color: "#fff",
            fontSize: 10,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.06em",
            padding: "2px 8px",
            borderRadius: "3px 3px 0 0",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            textTransform: "uppercase",
          }}
        >
          {isHover ? `📍 ${ov.label}` : ov.label}
        </div>

        {!isHover && (
          <>
            {/* Move area */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                cursor: "move",
                pointerEvents: "all",
              }}
              onMouseDown={(e) => startDrag(e, "move", ov.id)}
            />
            {/* Resize handles */}
            {handles.map(({ pos, style, cursor }) => (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  width: H,
                  height: H,
                  background: "#fff",
                  border: "2px solid #3b82f6",
                  borderRadius: 1,
                  cursor,
                  pointerEvents: "all",
                  zIndex: 1,
                  ...style,
                }}
                onMouseDown={(e) => startDrag(e, "resize", ov.id, pos)}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483647,
      }}
    >
      {/* Snap guide lines */}
      {snapLines.x !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: snapLines.x,
            width: 1,
            background: "rgba(59,130,246,0.8)",
            pointerEvents: "none",
          }}
        />
      )}
      {snapLines.y !== undefined && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: snapLines.y,
            height: 1,
            background: "rgba(59,130,246,0.8)",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Hover outline (from list hover) */}
      {hoverOverlay && !overlay && renderSelectionOverlay(hoverOverlay, true)}
      {/* Selection overlay */}
      {overlay && editMode && renderSelectionOverlay(overlay, false)}
    </div>,
    document.body,
  );
}
