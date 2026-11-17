import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const AD_SLOTS = [
  {
    order: '01',
    zone: 'Top Banner Ad',
    placement: 'Beginning of post',
    dimensions: '728 × 90 px (desktop) / 320 × 50 px (mobile)',
    script: 'highperformanceformat.com (atOptions)',
  },
  {
    order: '02',
    zone: 'Native Ad',
    placement: 'Directly below thumbnail',
    dimensions: 'Fluid 100% width · min-height 120px',
    script: '#container-390299b40362a820b12f3db553aff06f',
  },
  {
    order: '03',
    zone: 'Player Bottom Ad',
    placement: 'Directly below video player & controls',
    dimensions: 'Responsive · min-height 120px',
    script: 'Lazy-loaded via IntersectionObserver',
  },
  {
    order: '04',
    zone: 'In-Content Ad',
    placement: 'Middle of post description',
    dimensions: 'Responsive · min-height 120px',
    script: 'Lazy-loaded via IntersectionObserver',
  },
  {
    order: '05',
    zone: 'Related Content Ad',
    placement: 'Between related video grids',
    dimensions: 'Responsive · min-height 120px',
    script: 'Lazy-loaded via IntersectionObserver',
  },
  {
    order: '06',
    zone: 'Bottom Banner Ad',
    placement: 'End of post',
    dimensions: '728 × 90 px / Social Script',
    script: 'effectivecpmnetwork.com/44/86/88/448688...js',
  },
];

const CORE_GUARDS = [
  {
    item: 'Lazy Loading Ads',
    status: 'IntersectionObserver (rootMargin: 220px) + sequential queue',
  },
  {
    item: 'CLS-Safe Reserved Slots',
    status: 'Explicit min-height + CSS contain: layout style',
  },
  {
    item: 'Ad Fallback System',
    status: 'onerror + 4.5s DOM check displays clean .ad-fallback card',
  },
  {
    item: 'Playback Integrity',
    status: 'Zero forced redirects, zero repeated popups, zero external libraries',
  },
  {
    item: 'Button Click Configuration',
    status: 'Centralized BUTTON_CLICK_CONFIG (per-button URL, enabled flag, new/current tab)',
  },
  {
    item: 'Duplicate Click Guard',
    status: 'Trusted-click check (isTrusted) + per-button cooldownMs debounce + .is-cooldown',
  },
  {
    item: 'Preserved IDs & Tokens',
    status: '#videoThumbnail, #playIcon, #loadingScreen, #btn1-#btn3, {{TITLE}}, {{IMAGE_URL}}, {{CAPTION}}',
  },
];

export const AuditPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-display text-base font-bold text-slate-900">
            Advertisement Placement Architecture (6 Slots)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All six slots reserve layout space upfront and load lazily when scrolled near the viewport.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <th className="py-3 px-5">Slot</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">CLS-Safe Sizing</th>
                <th className="py-3 px-5">Loader / Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {AD_SLOTS.map((slot) => (
                <tr key={slot.order} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {slot.order}. {slot.zone}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{slot.placement}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-700 tabular-nums">
                    {slot.dimensions}
                  </td>
                  <td className="py-3 px-5 font-mono text-xs text-slate-500">{slot.script}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-display text-base font-bold text-slate-900">
            Smart Ad &amp; Core Web Vitals Verification
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {CORE_GUARDS.map((guard) => (
            <div
              key={guard.item}
              className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap text-xs"
            >
              <span className="font-semibold text-slate-900">{guard.item}</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{guard.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
