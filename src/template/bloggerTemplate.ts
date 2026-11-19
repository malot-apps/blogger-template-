export type ButtonId = 'btn1' | 'btn2' | 'btn3';

export interface ButtonClickSetting {
  label: string;
  enabled: boolean;
  url: string;
  openInNewTab: boolean;
  triggerPlayback: boolean;
}

export interface RewardUnlockConfig {
  enabled: boolean;
  step1DurationSec: number;
  step2DurationSec: number;
  step1Url: string;
  step2Url: string;
}

export interface AdBlockDetectorConfig {
  enabled: boolean;
  allowDismiss: boolean;
}

export interface TemplateConfig {
  title: string;
  caption: string;
  imageUrl: string;
  videoUrl: string;
  metaDescription?: string;
  canonicalUrl?: string;
  buttonCooldownMs?: number;
  buttons?: Record<ButtonId, ButtonClickSetting>;
  rewardUnlock?: RewardUnlockConfig;
  adBlockDetector?: AdBlockDetectorConfig;
}

export const DEFAULT_ADBLOCK_DETECTOR: AdBlockDetectorConfig = {
  enabled: true,
  allowDismiss: false,
};

export const DEFAULT_REWARD_UNLOCK: RewardUnlockConfig = {
  enabled: true,
  step1DurationSec: 5,
  step2DurationSec: 5,
  step1Url: 'https://cheflobesofficer.com/b1b9djat?key=a45917b862f040650d5da9b0f6ceac52',
  step2Url: 'https://www.effectivecpmnetwork.com/b1b9djat?key=a45917b862f040650d5da9b0f6ceac52',
};

export const DEFAULT_BUTTON_SETTINGS: Record<ButtonId, ButtonClickSetting> = {
  btn1: {
    label: 'Play Now',
    enabled: true,
    url: 'https://cheflobesofficer.com/b1b9djat?key=a45917b862f040650d5da9b0f6ceac52',
    openInNewTab: true,
    triggerPlayback: true,
  },
  btn2: {
    label: 'Watch Now',
    enabled: true,
    url: 'https://www.effectivecpmnetwork.com/b1b9djat?key=a45917b862f040650d5da9b0f6ceac52',
    openInNewTab: true,
    triggerPlayback: false,
  },
  btn3: {
    label: 'Play & Watch',
    enabled: false,
    url: '',
    openInNewTab: true,
    triggerPlayback: true,
  },
};

export function isStrictJpgUrl(rawUrl: string): boolean {
  if (typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (/^data:image\/jpeg/i.test(trimmed)) return true;
  if (/^data:image\//i.test(trimmed)) return false;
  if (/\.(png|gif|webp|svg|bmp|ico|avif)(\?|#|$)/i.test(trimmed)) return false;
  return /\.(jpe?g)(\?|#|$)/i.test(trimmed);
}

export function isSupportedImageUrl(rawUrl: string): boolean {
  if (typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (/^(javascript|vbscript|file):/i.test(trimmed)) return false;
  if (/^data:/i.test(trimmed)) {
    return /^data:image\/(jpeg|jpg|png|webp|gif|avif|bmp|svg\+xml)/i.test(trimmed);
  }
  return true;
}

export interface ParsedSourcePost {
  title: string;
  caption: string;
  primaryJpgUrl: string;
  jpgImages: string[];
  skippedNonJpgCount: number;
}

/**
 * Parses a raw source blog post HTML snippet:
 * - Strictly extracts ONLY JPG/JPEG images
 * - Automatically ignores, skips, and counts PNG or non-JPG assets
 */
export function extractSourceBlogPost(rawHtml: string): ParsedSourcePost {
  const input = String(rawHtml || '').trim();
  if (!input) {
    return {
      title: '',
      caption: '',
      primaryJpgUrl: '',
      jpgImages: [],
      skippedNonJpgCount: 0,
    };
  }

  const candidateUrls: string[] = [];
  let title = '';
  let caption = '';

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    doc.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (src) candidateUrls.push(src.trim());
    });
    doc.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href') || '';
      if (/\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?|#|$)/i.test(href)) {
        candidateUrls.push(href.trim());
      }
    });

    const headingEl = doc.querySelector('h1, h2, h3, title');
    if (headingEl && headingEl.textContent) {
      title = headingEl.textContent.trim();
    }
    if (!title) {
      const altImg = doc.querySelector('img[alt]');
      if (altImg) title = (altImg.getAttribute('alt') || '').trim();
    }

    const pEl = doc.querySelector('p, .separator a:last-child, figcaption');
    if (pEl && pEl.textContent) {
      caption = pEl.textContent.trim();
    }
  } else {
    const urlMatches = input.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    candidateUrls.push(...urlMatches);
  }

  const uniqueCandidates = Array.from(new Set(candidateUrls));
  const jpgImages: string[] = [];
  let skippedNonJpgCount = 0;

  uniqueCandidates.forEach((url) => {
    if (isStrictJpgUrl(url)) {
      jpgImages.push(url);
    } else if (
      /\.(png|gif|webp|svg|bmp|ico|avif)(\?|#|$)/i.test(url) ||
      /^data:image\//i.test(url)
    ) {
      skippedNonJpgCount += 1;
    }
  });

  if (!caption) {
    const plainText = input
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (plainText) {
      caption = plainText.slice(0, 180);
    }
  }

  return {
    title,
    caption,
    primaryJpgUrl: jpgImages[0] || '',
    jpgImages,
    skippedNonJpgCount,
  };
}

function escapeJsString(value: string): string {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/<\/script/gi, '<\\/script')
    .replace(/[\r\n]+/g, '');
}

function escapeHtmlAttribute(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/**
 * Generates the complete, Blogger-compatible single-file HTML template with:
 * - Strict JPG-only image enforcement (ignores/skips PNG & non-JPG assets)
 * - Preserved 6-slot Smart Advertisement System (lazy loading, responsive, fallback, CLS-safe)
 * - Floating Bengali downward scroll indicator directly below player controls
 * - Live random viewer badge (1577-5285) with smooth fade-in/out updates
 * - Configurable JavaScript Button Click System & genuine HTML5 video playback
 */
export function buildSmartAdsBloggerTemplate(config: TemplateConfig): string {
  const safeTitle = config.title || '{{TITLE}}';
  const safeCaption = config.caption || '{{CAPTION}}';
  const rawImage = (config.imageUrl || '').trim();
  const safeImageUrl =
    !rawImage || rawImage === '{{IMAGE_URL}}'
      ? '{{IMAGE_URL}}'
      : isSupportedImageUrl(rawImage)
      ? rawImage
      : '';
  const safeVideoUrl = config.videoUrl || '';
  const cleanMetaDescription = escapeHtmlAttribute(config.metaDescription || '');
  const rawCanonicalUrl = (config.canonicalUrl || '').trim();
  const isValidCanonicalUrl = /^https?:\/\/\S+$/i.test(rawCanonicalUrl);
  const metaDescriptionTag = cleanMetaDescription
    ? `\n  <meta name="description" content="${cleanMetaDescription}" />`
    : '';
  const canonicalLinkTag = isValidCanonicalUrl
    ? `\n  <link rel="canonical" href="${escapeHtmlAttribute(rawCanonicalUrl)}" />`
    : '';
  const cooldownMs =
    typeof config.buttonCooldownMs === 'number' && config.buttonCooldownMs >= 0
      ? Math.round(config.buttonCooldownMs)
      : 1200;
  const buttons = config.buttons || DEFAULT_BUTTON_SETTINGS;
  const rewardUnlock = config.rewardUnlock || DEFAULT_REWARD_UNLOCK;
  const adBlockDetector = config.adBlockDetector || DEFAULT_ADBLOCK_DETECTOR;
  const step1Sec = Math.max(1, Math.round(rewardUnlock.step1DurationSec || 5));
  const step2Sec = Math.max(1, Math.round(rewardUnlock.step2DurationSec || 5));
  const toBn = (num: number) =>
    String(num).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <script src="https://pl30161573.effectivecpmnetwork.com/bc/17/d1/bc17d177bcada949929a7511850a6cf0.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>${metaDescriptionTag}${canonicalLinkTag}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.65;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    /* Blogger Post Thumbnail Separator */
    .separator {
      clear: both;
      margin: 16px 0;
      text-align: center;
    }

    .separator a {
      display: block;
      padding: 0.5em 0;
      text-align: center;
      color: #475569;
      text-decoration: none;
      font-size: 14px;
    }

    .separator img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    }

    /* CLS-Safe Responsive Ad Slots & Fallback System */
    .ad-slot-wrapper {
      width: 100%;
      margin: 18px auto;
      padding: 10px 12px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background-color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      contain: layout style;
      overflow: hidden;
    }

    .ad-slot-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 6px;
      line-height: 1;
      user-select: none;
    }

    .ad-slot-inner {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .ad-slot--banner .ad-slot-inner {
      max-width: 728px;
      min-height: 90px;
    }

    .ad-slot--native .ad-slot-inner,
    .ad-slot--incontent .ad-slot-inner,
    .ad-slot--player-bottom .ad-slot-inner,
    .ad-slot--related .ad-slot-inner {
      min-height: 120px;
    }

    .ad-fallback {
      display: none;
      width: 100%;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
      background: #ffffff;
      color: #64748b;
      font-size: 13px;
      text-align: center;
      line-height: 1.45;
    }

    .ad-slot-wrapper.is-fallback .ad-fallback {
      display: block;
    }

    .ad-fallback strong {
      display: block;
      color: #334155;
      font-size: 13.5px;
      margin-bottom: 2px;
    }

    /* Bengali CTA Heading Above Player */
    .bn-player-heading-wrap {
      text-align: center;
      margin: 20px auto 12px;
      animation: bnFadeSlideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .bn-player-heading {
      margin: 0;
      font-size: clamp(1.2rem, 2.8vw, 1.55rem);
      font-weight: 700;
      color: #0f172a;
      line-height: 1.45;
    }

    .bn-player-subheading {
      margin: 4px 0 0;
      font-size: 14px;
      font-weight: 500;
      color: #475569;
    }

    @keyframes bnFadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Auto-Sizing Video Player Container */
    .video-container {
      position: relative;
      width: min(100%, var(--video-max-width, 100%));
      max-width: 100%;
      aspect-ratio: var(--video-ratio, 16 / 9);
      height: auto;
      margin: 12px auto 18px;
      background-color: #000;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      cursor: pointer;
      user-select: none;
      contain: layout style;
      -webkit-tap-highlight-color: transparent;
    }

    #videoThumbnail {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center center;
      display: block;
      transition: opacity 0.25s ease;
    }

    .video-container.has-thumb-error #videoThumbnail {
      opacity: 0;
    }

    .video-container.is-playing #videoThumbnail,
    .video-container.is-playing .video-scrim,
    .video-container.is-playing .play-center-group {
      display: none;
    }

    .video-scrim {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.08) 55%, rgba(0, 0, 0, 0.36) 100%);
      pointer-events: none;
      z-index: 2;
    }

    #videoPlayer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: none;
      background: #000;
      z-index: 20;
    }

    .video-container.is-playing #videoPlayer {
      display: block;
    }

    /* Live Viewer Counter Badge Over Video Player */
    .live-viewer-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 25;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 600;
      line-height: 1.2;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.32);
      pointer-events: none;
      user-select: none;
    }

    .live-viewer-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ef4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.85);
      flex-shrink: 0;
      animation: liveDotPulse 1.6s ease-in-out infinite;
    }

    .live-viewer-count {
      font-variant-numeric: tabular-nums;
      display: inline-block;
      transition: opacity 0.28s ease, transform 0.28s ease;
    }

    .live-viewer-count.is-updating {
      opacity: 0;
      transform: translateY(-2px);
    }

    @keyframes liveDotPulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.45;
        transform: scale(0.85);
      }
    }

    /* Centered Play Button + Bengali Instruction Group */
    .play-center-group {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      pointer-events: none;
    }

    .play-icon {
      position: relative;
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(110, 142, 251, 0.96), rgba(167, 119, 227, 0.96));
      border: 2px solid rgba(255, 255, 255, 0.94);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      box-shadow:
        0 0 26px rgba(110, 142, 251, 0.7),
        0 0 48px rgba(167, 119, 227, 0.45),
        0 10px 24px rgba(0, 0, 0, 0.38);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, opacity 0.25s ease;
    }

    .play-icon::before,
    .play-icon::after {
      content: '';
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.75);
      box-shadow: 0 0 20px rgba(110, 142, 251, 0.58);
      animation: playPulseRing 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
      pointer-events: none;
    }

    .play-icon::after {
      animation-delay: 1.05s;
    }

    .video-container:hover .play-icon,
    .play-icon:hover {
      transform: scale(1.1);
      box-shadow:
        0 0 34px rgba(110, 142, 251, 0.88),
        0 0 64px rgba(167, 119, 227, 0.58),
        0 14px 32px rgba(0, 0, 0, 0.45);
    }

    .play-icon:active {
      transform: scale(0.97);
    }

    .play-icon:focus-visible {
      outline: 3px solid #ffffff;
      outline-offset: 4px;
    }

    .play-icon svg {
      width: 30px;
      height: 30px;
      margin-left: 4px;
      fill: currentColor;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
    }

    .play-icon.loading {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.84);
    }

    /* Short Bengali instruction directly below Play button */
    .bn-play-hint {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      max-width: min(82vw, 290px);
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      line-height: 1.4;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
      animation: bnHintFadeIn 0.55s ease 0.12s both;
      transition: opacity 0.2s ease;
    }

    @keyframes bnHintFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .play-center-group.is-hidden {
      opacity: 0;
      pointer-events: none;
    }

    @keyframes playPulseRing {
      0% { transform: scale(0.92); opacity: 0.85; }
      75% { transform: scale(1.52); opacity: 0; }
      100% { transform: scale(1.52); opacity: 0; }
    }

    /* Friendly Bengali Loading & Error / Retry Overlay */
    .loading-screen,
    .playback-error-screen {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      padding: 20px;
      background: rgba(15, 23, 42, 0.68);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 15;
    }

    .overlay-glass-card {
      width: min(350px, 94%);
      padding: 22px 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.24);
      box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      color: #ffffff;
      animation: bnFadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .loading-spinner {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: conic-gradient(from 0deg, #6e8efb, #a777e3, rgba(255, 255, 255, 0.16) 75%);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
      animation: spinnerSpin 0.85s linear infinite;
    }

    .overlay-title {
      font-size: 16.5px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.45;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
    }

    .overlay-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.88);
      line-height: 1.5;
    }

    .retry-btn {
      margin-top: 4px;
      padding: 10px 22px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: #ffffff;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(110, 142, 251, 0.45);
    }

    @keyframes spinnerSpin {
      to { transform: rotate(360deg); }
    }

    /* Controls & Floating Scroll Indicator */
    .controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 18px 0 14px;
      flex-wrap: wrap;
    }

    button {
      padding: 12px 25px;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-family: inherit;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    button:active {
      transform: scale(0.98);
    }

    button.is-cooldown {
      opacity: 0.82;
      transform: scale(0.98);
      pointer-events: none;
    }

    .scroll-indicator-wrap {
      display: flex;
      justify-content: center;
      margin: 8px 0 22px;
    }

    .scroll-indicator {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 18px;
      border-radius: 999px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      animation: gentleFloat 2.4s ease-in-out infinite;
      transition: color 0.2s ease, border-color 0.2s ease;
    }

    .scroll-indicator:hover {
      color: #6e8efb;
      border-color: #c7d2fe;
    }

    .scroll-indicator svg {
      width: 18px;
      height: 18px;
      color: #6e8efb;
    }

    @keyframes gentleFloat {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(5px);
      }
    }

    .post-description {
      margin: 24px 0;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background-color: #ffffff;
    }

    .post-description h1 {
      margin: 0 0 10px;
      font-size: clamp(1.25rem, 2.5vw, 1.65rem);
      color: #0f172a;
      line-height: 1.35;
    }

    .post-description p {
      margin: 0 0 14px;
      font-size: 15px;
      color: #475569;
    }

    .post-description p:last-child {
      margin-bottom: 0;
    }

    .related-section {
      margin: 26px 0;
    }

    .related-heading {
      margin: 0 0 14px;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .related-card {
      display: flex;
      flex-direction: column;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      background-color: #ffffff;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .related-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    }

    .related-thumb {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, #eef2ff, #f5f3ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6e8efb;
      font-weight: 700;
      font-size: 13px;
    }

    .related-body {
      padding: 12px;
    }

    .related-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px;
      line-height: 1.4;
    }

    .related-meta {
      font-size: 12px;
      color: #64748b;
    }

    @media (max-width: 600px) {
      body {
        padding: 12px;
      }

      .ad-slot--banner .ad-slot-inner {
        min-height: 56px;
      }

      .ad-slot--native .ad-slot-inner,
      .ad-slot--incontent .ad-slot-inner,
      .ad-slot--player-bottom .ad-slot-inner,
      .ad-slot--related .ad-slot-inner {
        min-height: 96px;
      }

      .play-icon {
        width: 62px;
        height: 62px;
      }

      .play-icon svg {
        width: 24px;
        height: 24px;
      }

      .bn-play-hint {
        font-size: 12px;
        padding: 5px 12px;
      }

      .live-viewer-badge {
        top: 10px;
        left: 10px;
        padding: 5px 10px;
        font-size: 11.5px;
        gap: 6px;
      }

      .overlay-glass-card {
        padding: 18px 14px;
      }

      .controls {
        gap: 10px;
        margin: 16px 0 12px;
      }

      button {
        padding: 11px 20px;
        font-size: 14.5px;
        flex: 1 1 auto;
        min-width: 130px;
      }

      .post-description {
        padding: 14px;
      }

      .related-grid {
        grid-template-columns: 1fr;
      }

      .unlock-modal-card {
        padding: 18px 16px;
      }
    }

    /* Reward-Style 2-Step Ad-Watch & Timer Unlock Modal */
    .play-lock-pill {
      position: absolute;
      bottom: -8px;
      right: -6px;
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border-radius: 999px;
      background: #0f172a;
      border: 2px solid #ffffff;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .play-icon[data-unlocked="true"] .play-lock-pill {
      opacity: 0;
      transform: scale(0.7);
      pointer-events: none;
    }

    .unlock-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(15, 23, 42, 0.74);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .unlock-modal-backdrop.is-open {
      display: flex;
    }

    .unlock-modal-card {
      position: relative;
      width: min(460px, 100%);
      max-height: 92vh;
      overflow-y: auto;
      padding: 24px 22px 22px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 24px 56px rgba(15, 23, 42, 0.38);
      color: #1e293b;
      animation: bnFadeSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .unlock-modal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      min-width: 0;
      padding: 0;
      border-radius: 50%;
      background: #f1f5f9;
      color: #475569;
      font-size: 16px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: none;
    }

    .unlock-modal-close:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: none;
      box-shadow: none;
    }

    .unlock-modal-header {
      padding-right: 36px;
      margin-bottom: 14px;
    }

    .unlock-modal-kicker {
      display: inline-block;
      margin-bottom: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 11.5px;
      font-weight: 700;
    }

    .unlock-modal-title {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.45;
    }

    .unlock-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 14px 0 16px;
    }

    .unlock-step-card {
      padding: 13px 14px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      transition: border-color 0.2s ease, background-color 0.2s ease;
    }

    .unlock-step-card.is-active {
      border-color: #6e8efb;
      background: #f5f7ff;
    }

    .unlock-step-card.is-completed {
      border-color: #10b981;
      background: #ecfdf5;
    }

    .unlock-step-text {
      margin: 0 0 10px;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.5;
    }

    .unlock-step-timer {
      font-weight: 700;
      color: #4f46e5;
    }

    .unlock-step-card.is-completed .unlock-step-timer {
      color: #047857;
    }

    .unlock-step-btn {
      width: 100%;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(110, 142, 251, 0.28);
    }

    .unlock-step-btn:disabled {
      background: #cbd5e1;
      color: #64748b;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .unlock-step-card.is-completed .unlock-step-btn {
      background: #10b981;
      color: #ffffff;
      box-shadow: none;
    }

    .unlock-status-banner {
      padding: 11px 14px;
      border-radius: 10px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
      font-size: 13.5px;
      font-weight: 600;
      text-align: center;
      line-height: 1.5;
      margin-bottom: 12px;
      transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
    }

    .unlock-status-banner.is-unlocked {
      background: #ecfdf5;
      border-color: #6ee7b7;
      color: #065f46;
    }

    .unlock-final-play-btn {
      width: 100%;
      padding: 12px 20px;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 700;
    }

    .unlock-final-play-btn:disabled {
      background: #e2e8f0;
      color: #94a3b8;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    /* Polite Bengali Ad-Blocker Detection Notice */
    .adblock-notice-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10050;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .adblock-notice-backdrop.is-open {
      display: flex;
    }

    .adblock-notice-card {
      width: min(460px, 100%);
      max-height: 92vh;
      overflow-y: auto;
      padding: 24px 22px 22px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 24px 56px rgba(15, 23, 42, 0.42);
      color: #1e293b;
      animation: bnFadeSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .adblock-notice-kicker {
      display: inline-block;
      margin-bottom: 8px;
      padding: 4px 11px;
      border-radius: 999px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #c2410c;
      font-size: 11.5px;
      font-weight: 700;
    }

    .adblock-notice-title {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.45;
    }

    .adblock-notice-desc {
      margin: 0 0 14px;
      font-size: 14px;
      color: #475569;
      line-height: 1.65;
    }

    .adblock-notice-steps {
      margin: 0 0 14px;
      padding: 12px 14px 12px 30px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 13.5px;
      color: #334155;
      line-height: 1.6;
    }

    .adblock-notice-steps li + li {
      margin-top: 4px;
    }

    .adblock-notice-status {
      display: none;
      margin-bottom: 12px;
      padding: 9px 12px;
      border-radius: 10px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 12.5px;
      font-weight: 600;
      text-align: center;
      line-height: 1.5;
    }

    .adblock-notice-status.is-visible {
      display: block;
    }

    .adblock-notice-actions {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .adblock-btn-primary {
      width: 100%;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 14.5px;
      font-weight: 700;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(110, 142, 251, 0.28);
    }

    .adblock-btn-secondary {
      width: 100%;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 700;
      background: #f1f5f9;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      box-shadow: none;
    }

    .adblock-btn-secondary:hover {
      background: #e2e8f0;
      box-shadow: none;
      transform: none;
    }

    .adblock-btn-ghost {
      width: 100%;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      background: transparent;
      color: #64748b;
      box-shadow: none;
    }

    .adblock-btn-ghost:hover {
      background: #f8fafc;
      color: #0f172a;
      box-shadow: none;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }
      .play-icon::before,
      .play-icon::after,
      .scroll-indicator,
      .bn-player-heading-wrap,
      .bn-play-hint,
      .live-viewer-dot,
      .unlock-modal-card,
      .adblock-notice-card {
        animation: none;
      }
    }
  </style>
</head>
<body>
  <!-- 1. TOP BANNER AD (At the beginning of the post) -->
  <aside class="ad-slot-wrapper ad-slot--banner" data-ad-slot="top-banner" aria-label="Top Advertisement">
    <span class="ad-slot-label">Advertisement</span>
    <div class="ad-slot-inner" id="ad-top-banner">
      <div class="ad-fallback">
        <strong>Sponsored Banner</strong>
        <span>Ad content unavailable right now.</span>
      </div>
    </div>
  </aside>

  <!-- BLOGGER THUMBNAIL & CAPTION -->
  <div class="separator" style="clear: both;">
    <a href="${safeImageUrl}">
      <img alt="${safeTitle}" border="0" data-original-height="1350" data-original-width="1080" height="320" loading="eager" src="${safeImageUrl}" />
    </a>
    <a href="${safeImageUrl}">${safeCaption}</a>
  </div>

  <!-- 2. NATIVE AD (Below the thumbnail) -->
  <aside class="ad-slot-wrapper ad-slot--native" data-ad-slot="native-below-thumb" aria-label="Native Advertisement">
    <span class="ad-slot-label">Sponsored</span>
    <div class="ad-slot-inner" id="ad-native-thumb">
      <div id="container-390299b40362a820b12f3db553aff06f"></div>
      <div class="ad-fallback">
        <strong>Recommended Partner</strong>
        <span>Native placement reserved for lightweight display.</span>
      </div>
    </div>
  </aside>

  <!-- BENGALI HEADING ABOVE VIDEO PLAYER -->
  <div class="bn-player-heading-wrap">
    <h2 class="bn-player-heading">সম্পূর্ণ ভিডিওটি দেখতে প্লে বাটনে ক্লিক করুন</h2>
    <p class="bn-player-subheading">মোবাইল ও ডেস্কটপ উপযোগী এইচডি প্লেব্যাক</p>
  </div>

  <!-- VIDEO PLAYER SECTION -->
  <div class="video-container" id="videoContainer">
    <div class="live-viewer-badge" aria-live="off">
      <span class="live-viewer-dot" aria-hidden="true"></span>
      <span class="live-viewer-count" id="liveViewerCount">২,৮৪০</span>
      <span>জন দেখছেন</span>
    </div>

    <img alt="${safeTitle}" id="videoThumbnail" decoding="async" loading="eager" src="${safeImageUrl}" />
    <div class="video-scrim" aria-hidden="true"></div>

    <video id="videoPlayer" playsinline controls preload="none" poster="${safeImageUrl}"></video>

    <div class="play-center-group" id="playCenterGroup">
      <div class="play-icon" id="playIcon" data-unlocked="${rewardUnlock.enabled ? 'false' : 'true'}" role="button" tabindex="0" aria-label="ভিডিও চালু করুন">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.14v14l11-7-11-7z"></path>
        </svg>
        <span class="play-lock-pill" aria-hidden="true">&#128274;</span>
      </div>
      <div class="bn-play-hint">ভিডিও চালু করতে উপরের প্লে বাটনে চাপ দিন</div>
    </div>

    <!-- Friendly Bengali Loading Screen (shown only while buffering/loading) -->
    <div class="loading-screen" id="loadingScreen" style="display: none;" aria-live="polite">
      <div class="overlay-glass-card">
        <div class="loading-spinner" aria-hidden="true"></div>
        <div class="overlay-title" id="loadingMessage">ভিডিও লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...</div>
        <div class="overlay-subtitle">প্লেব্যাকের জন্য ভিডিও সোর্স সংযুক্ত করা হচ্ছে</div>
      </div>
    </div>

    <!-- Real Failure Retry / Repeated Failure Error Overlay -->
    <div class="playback-error-screen" id="playbackErrorScreen" style="display: none;" aria-live="assertive">
      <div class="overlay-glass-card">
        <div class="overlay-title" id="errorTitle">ভিডিওটি চালু করতে সমস্যা হয়েছে</div>
        <div class="overlay-subtitle" id="errorSubtitle">অনুগ্রহ করে পুনরায় চেষ্টা করুন।</div>
        <button type="button" class="retry-btn" id="retryPlayBtn">আবার চেষ্টা করুন</button>
      </div>
    </div>
  </div>

  <div class="controls">
    <button type="button" id="btn1">Play Now</button>
    <button type="button" id="btn2">Watch Now</button>
    <button type="button" id="btn3">Play &amp; Watch</button>
  </div>

  <!-- FLOATING DOWNWARD SCROLL INDICATOR -->
  <div class="scroll-indicator-wrap">
    <a class="scroll-indicator" href="#postDescription">
      <span>নিচে Scroll করুন</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 5v14"></path>
        <path d="m19 12-7 7-7-7"></path>
      </svg>
    </a>
  </div>

  <!-- 3. PLAYER BOTTOM AD (Directly below the video player) -->
  <aside class="ad-slot-wrapper ad-slot--player-bottom" data-ad-slot="player-bottom" aria-label="Player Advertisement">
    <span class="ad-slot-label">Advertisement</span>
    <div class="ad-slot-inner" id="ad-player-bottom">
      <div class="ad-fallback">
        <strong>Player Sponsor</strong>
        <span>Video playback remains unaffected.</span>
      </div>
    </div>
  </aside>

  <!-- POST DESCRIPTION WITH IN-CONTENT AD IN THE MIDDLE -->
  <section class="post-description" id="postDescription">
    <h1>${safeTitle}</h1>
    <p>${safeCaption}</p>

    <!-- 4. IN-CONTENT AD (In the middle of the description) -->
    <aside class="ad-slot-wrapper ad-slot--incontent" data-ad-slot="in-content" aria-label="In-Content Advertisement">
      <span class="ad-slot-label">Sponsored Content</span>
      <div class="ad-slot-inner" id="ad-in-content">
        <div class="ad-fallback">
          <strong>Sponsored Highlight</strong>
          <span>Content continues smoothly below.</span>
        </div>
      </div>
    </aside>

    <p>পোর্ট্রেট, স্কয়ার কিংবা ল্যান্ডস্কেপ—যেকোনো থাম্বনেইল অনুপাতের সাথে স্বয়ংক্রিয়ভাবে মানিয়ে নেওয়া পরিচ্ছন্ন ও দ্রুতগতির ভিডিও প্লেয়ার।</p>
  </section>

  <!-- RELATED VIDEOS WITH RELATED CONTENT AD BETWEEN THEM -->
  <section class="related-section" aria-label="Related Videos">
    <h2 class="related-heading">সম্পর্কিত আরও ভিডিও</h2>
    <div class="related-grid">
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Featured Stream</div>
        <div class="related-body">
          <div class="related-title">${safeTitle}</div>
          <div class="related-meta">এইচডি স্ট্রিম &middot; দেখার জন্য প্রস্তুত</div>
        </div>
      </a>
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Full Version</div>
        <div class="related-body">
          <div class="related-title">${safeCaption}</div>
          <div class="related-meta">মোবাইল অপ্টিমাইজড</div>
        </div>
      </a>
    </div>

    <!-- 5. RELATED CONTENT AD (Between related videos) -->
    <aside class="ad-slot-wrapper ad-slot--related" data-ad-slot="related-content" aria-label="Related Content Advertisement">
      <span class="ad-slot-label">Sponsored Suggestion</span>
      <div class="ad-slot-inner" id="ad-related-content">
        <div class="ad-fallback">
          <strong>More to Explore</strong>
          <span>Additional video suggestions above and below.</span>
        </div>
      </div>
    </aside>

    <div class="related-grid">
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Highlights</div>
        <div class="related-body">
          <div class="related-title">জনপ্রিয় ক্লিপ ও হাইলাইটস দেখুন</div>
          <div class="related-meta">দ্রুত লোডিং</div>
        </div>
      </a>
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Full Cut</div>
        <div class="related-body">
          <div class="related-title">সম্পূর্ণ সংস্করণ উপভোগ করুন</div>
          <div class="related-meta">ফুল রেজোলিউশন</div>
        </div>
      </a>
    </div>
  </section>

  <!-- 6. BOTTOM BANNER AD (At the end of the post) -->
  <aside class="ad-slot-wrapper ad-slot--banner" data-ad-slot="bottom-banner" aria-label="Bottom Advertisement">
    <span class="ad-slot-label">Advertisement</span>
    <div class="ad-slot-inner" id="ad-bottom-banner">
      <div class="ad-fallback">
        <strong>End of Post Banner</strong>
        <span>Thanks for watching.</span>
      </div>
    </div>
  </aside>

  <!-- REWARD AD-WATCH & TIMER UNLOCK MODAL -->
  <div class="unlock-modal-backdrop" id="unlockModal" role="dialog" aria-modal="true" aria-labelledby="unlockModalTitle">
    <div class="unlock-modal-card">
      <button type="button" class="unlock-modal-close" id="unlockModalClose" aria-label="বন্ধ করুন">&times;</button>

      <div class="unlock-modal-header">
        <span class="unlock-modal-kicker">নিরাপদ ভিডিও আনলক</span>
        <h3 class="unlock-modal-title" id="unlockModalTitle">ভিডিওটি আনলক করতে নিচের নিয়মগুলো অনুসরণ করুন:</h3>
      </div>

      <div class="unlock-steps">
        <div class="unlock-step-card is-active" id="unlockStep1Card">
          <p class="unlock-step-text">
            ধাপ ১: প্রথম বিজ্ঞাপনটি সম্পূর্ণ দেখুন (অবশিষ্ট সময়: <span class="unlock-step-timer" id="timer1">${toBn(step1Sec)}</span> সেকেন্ড)
          </p>
          <button type="button" class="unlock-step-btn" id="unlockStep1Btn">বিজ্ঞাপন ১ দেখুন</button>
        </div>

        <div class="unlock-step-card" id="unlockStep2Card">
          <p class="unlock-step-text">
            ধাপ ২: দ্বিতীয় বিজ্ঞাপনটি সম্পন্ন করুন (অবশিষ্ট সময়: <span class="unlock-step-timer" id="timer2">${toBn(step2Sec)}</span> সেকেন্ড)
          </p>
          <button type="button" class="unlock-step-btn" id="unlockStep2Btn" disabled>বিজ্ঞাপন ২ দেখুন</button>
        </div>
      </div>

      <div class="unlock-status-banner" id="unlockStatusBanner" aria-live="polite">
        উভয় ধাপ সম্পন্ন না হওয়া পর্যন্ত প্লে বাটনটি লক থাকবে।
      </div>

      <button type="button" class="unlock-final-play-btn" id="unlockedPlayBtn" disabled>
        ভিডিও আনলক করতে ধাপ ২টি সম্পন্ন করুন
      </button>
    </div>
  </div>

  <!-- POLITE BENGALI AD-BLOCKER DETECTION NOTICE -->
  <div class="adblock-notice-backdrop" id="adblockNoticeModal" role="dialog" aria-modal="true" aria-labelledby="adblockNoticeTitle">
    <div class="adblock-notice-card">
      <span class="adblock-notice-kicker">বিনীত অনুরোধ · অ্যাড-ব্লকার শনাক্ত</span>
      <h3 class="adblock-notice-title" id="adblockNoticeTitle">দয়া করে আপনার অ্যাড-ব্লকার বন্ধ করুন</h3>
      <p class="adblock-notice-desc">
        আমাদের সাইটের সমস্ত ভিডিও এবং কনটেন্ট সম্পূর্ণ বিনামূল্যে সবার জন্য উন্মুক্ত রাখতে বিজ্ঞাপনই একমাত্র সহায়ক। কনটেন্টটি দেখতে অনুগ্রহ করে এই পেজের জন্য আপনার অ্যাড-ব্লকারটি সাময়িকভাবে বন্ধ করে পেজটি রিফ্রেশ করুন।
      </p>
      <ol class="adblock-notice-steps">
        <li>আপনার ব্রাউজারের অ্যাড-ব্লকার এক্সটেনশন আইকনে ক্লিক করুন।</li>
        <li>এই ওয়েবসাইটের জন্য অ্যাড-ব্লকারটি বন্ধ বা পজ (Pause / Whitelist) করুন।</li>
        <li>নিচের বাটনে ক্লিক করে পেজটি রিফ্রেশ করুন।</li>
      </ol>
      <div class="adblock-notice-status" id="adblockNoticeStatus" aria-live="polite"></div>
      <div class="adblock-notice-actions">
        <button type="button" class="adblock-btn-primary" id="adblockRefreshBtn">আমি বন্ধ করেছি, পেজ রিফ্রেশ করুন</button>
        <button type="button" class="adblock-btn-secondary" id="adblockRecheckBtn">পুনরায় যাচাই করুন</button>${adBlockDetector.allowDismiss ? '\n        <button type="button" class="adblock-btn-ghost" id="adblockDismissBtn">আপাতত বন্ধ রাখুন</button>' : ''}
      </div>
    </div>
  </div>

  <script>
    // =========================================================================
    // 1. MEDIA & THUMBNAIL CONFIGURATION
    // =========================================================================
    const CUSTOM_THUMBNAIL_URL = "${escapeJsString(safeImageUrl)}";
    const CUSTOM_VIDEO_URL = "${escapeJsString(safeVideoUrl)}";

    // =========================================================================
    // 1B. AD-BLOCK DETECTION CONFIGURATION
    // =========================================================================
    const ADBLOCK_DETECTOR_CONFIG = {
      enabled: ${adBlockDetector.enabled},
      allowDismiss: ${adBlockDetector.allowDismiss}
    };

    // =========================================================================
    // 2. REWARD AD-WATCH & TIMER UNLOCK CONFIGURATION
    // Visitors must complete both sequential steps before the play button unlocks.
    // =========================================================================
    const REWARD_UNLOCK_CONFIG = {
      enabled: ${rewardUnlock.enabled},
      step1DurationSec: ${step1Sec},
      step2DurationSec: ${step2Sec},
      step1Url: "${escapeJsString(rewardUnlock.step1Url)}",
      step2Url: "${escapeJsString(rewardUnlock.step2Url)}"
    };

    // =========================================================================
    // 3. BUTTON CLICK & AD LINK CONFIGURATION
    // Configure individual button URLs, enable/disable actions, tab behavior,
    // and duplicate-click protection in one place.
    // =========================================================================
    const BUTTON_CLICK_CONFIG = {
      cooldownMs: ${cooldownMs}, // Prevents accidental double-clicks & duplicate events
      buttons: {
        btn1: {
          enabled: ${buttons.btn1.enabled},
          url: "${escapeJsString(buttons.btn1.url)}",
          openInNewTab: ${buttons.btn1.openInNewTab},    // true = new tab, false = current tab
          triggerPlayback: ${buttons.btn1.triggerPlayback}  // true = also run video playback
        },
        btn2: {
          enabled: ${buttons.btn2.enabled},
          url: "${escapeJsString(buttons.btn2.url)}",
          openInNewTab: ${buttons.btn2.openInNewTab},
          triggerPlayback: ${buttons.btn2.triggerPlayback}
        },
        btn3: {
          enabled: ${buttons.btn3.enabled},
          url: "${escapeJsString(buttons.btn3.url)}",
          openInNewTab: ${buttons.btn3.openInNewTab},
          triggerPlayback: ${buttons.btn3.triggerPlayback}
        }
      }
    };

    // Core Player Elements
    const videoContainer = document.getElementById('videoContainer');
    const playCenterGroup = document.getElementById('playCenterGroup');
    const playIcon = document.getElementById('playIcon');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingMessage = document.getElementById('loadingMessage');
    const playbackErrorScreen = document.getElementById('playbackErrorScreen');
    const errorTitle = document.getElementById('errorTitle');
    const errorSubtitle = document.getElementById('errorSubtitle');
    const retryPlayBtn = document.getElementById('retryPlayBtn');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoPlayer = document.getElementById('videoPlayer');
    const liveViewerCount = document.getElementById('liveViewerCount');

    const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    function toBengaliDigits(val) {
      return String(val).replace(/\d/g, function (d) {
        return BENGALI_DIGITS[Number(d)];
      });
    }

    const VIEWER_MIN = 1577;
    const VIEWER_MAX = 5285;
    let currentViewerCount = VIEWER_MIN;

    function getRandomViewerCount(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function formatViewerNumber(num) {
      return toBengaliDigits(num.toLocaleString('en-US'));
    }

    function initLiveViewerCounter() {
      if (!liveViewerCount) return;
      currentViewerCount = getRandomViewerCount(VIEWER_MIN, VIEWER_MAX);
      liveViewerCount.textContent = formatViewerNumber(currentViewerCount);

      function scheduleNextUpdate() {
        const delayMs = 3200 + Math.floor(Math.random() * 2600);
        setTimeout(function () {
          const delta = Math.floor(Math.random() * 141) - 70;
          let nextCount = currentViewerCount + delta;
          if (nextCount < VIEWER_MIN || nextCount > VIEWER_MAX || nextCount === currentViewerCount) {
            nextCount = getRandomViewerCount(VIEWER_MIN, VIEWER_MAX);
          }
          currentViewerCount = nextCount;

          liveViewerCount.classList.add('is-updating');
          setTimeout(function () {
            liveViewerCount.textContent = formatViewerNumber(currentViewerCount);
            liveViewerCount.classList.remove('is-updating');
          }, 260);

          scheduleNextUpdate();
        }, delayMs);
      }

      scheduleNextUpdate();
    }

    let playbackFailures = 0;
    let loadTimeoutId = null;

    // Auto Thumbnail Aspect Ratio & Width (16:9, 9:16, 1:1, 4:3, 2:3 & any custom ratio)
    function applyContainerDimensions(w, h) {
      if (!videoContainer || !(w > 0) || !(h > 0)) return;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 820;
      const maxComfortableHeight = Math.max(340, Math.min(680, Math.round(viewportHeight * 0.78)));
      const targetWidth = Math.min(w, Math.round(maxComfortableHeight * (w / h)));
      videoContainer.style.setProperty('--video-ratio', w + ' / ' + h);
      videoContainer.style.setProperty('--video-max-width', targetWidth + 'px');
      videoContainer.classList.toggle('is-portrait', h > w);
      videoContainer.classList.toggle('is-square', w === h);
      videoContainer.classList.toggle('is-landscape', w > h);
    }

    function adjustAspectRatio() {
      if (!videoThumbnail || !videoContainer) return;
      const w = videoThumbnail.naturalWidth;
      const h = videoThumbnail.naturalHeight;
      if (w > 0 && h > 0) {
        videoContainer.classList.remove('has-thumb-error');
        applyContainerDimensions(w, h);
      }
    }

    function handleThumbnailError() {
      if (!videoContainer) return;
      videoContainer.classList.add('has-thumb-error');
      videoContainer.style.setProperty('--video-ratio', '16 / 9');
      videoContainer.style.setProperty('--video-max-width', '100%');
      videoContainer.classList.remove('is-portrait', 'is-square', 'is-landscape');
    }

    function showLoadingState(messageText) {
      if (loadingMessage && messageText) {
        loadingMessage.textContent = messageText;
      }
      if (playbackErrorScreen) playbackErrorScreen.style.display = 'none';
      if (playCenterGroup) playCenterGroup.classList.add('is-hidden');
      if (playIcon) playIcon.classList.add('loading');
      if (loadingScreen) loadingScreen.style.display = 'flex';
    }

    function hideOverlaysForPlayback() {
      if (loadTimeoutId) clearTimeout(loadTimeoutId);
      if (loadingScreen) loadingScreen.style.display = 'none';
      if (playbackErrorScreen) playbackErrorScreen.style.display = 'none';
      if (playIcon) playIcon.classList.remove('loading');
      if (playCenterGroup) playCenterGroup.classList.remove('is-hidden');
      if (videoContainer) videoContainer.classList.add('is-playing');
    }

    function handlePlaybackFailure() {
      if (loadTimeoutId) clearTimeout(loadTimeoutId);
      playbackFailures += 1;

      if (loadingScreen) loadingScreen.style.display = 'none';
      if (playIcon) playIcon.classList.remove('loading');
      if (playCenterGroup) playCenterGroup.classList.add('is-hidden');
      if (videoContainer) videoContainer.classList.remove('is-playing');

      if (playbackFailures >= 2) {
        if (errorTitle) {
          errorTitle.textContent = 'দুঃখিত, বারবার চেষ্টা করেও ভিডিওটি চালু করা যায়নি';
        }
        if (errorSubtitle) {
          errorSubtitle.textContent =
            'অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা কিছুক্ষণ পর পুনরায় চেষ্টা করুন।';
        }
        if (retryPlayBtn) {
          retryPlayBtn.textContent = 'পুনরায় চেষ্টা করুন';
        }
      } else {
        if (errorTitle) {
          errorTitle.textContent = 'ভিডিওটি লোড হতে ব্যর্থ হয়েছে';
        }
        if (errorSubtitle) {
          errorSubtitle.textContent = 'সংযোগে সাময়িক ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }
        if (retryPlayBtn) {
          retryPlayBtn.textContent = 'আবার চেষ্টা করুন';
        }
      }

      if (playbackErrorScreen) {
        playbackErrorScreen.style.display = 'flex';
      }
    }

    function isSupportedImageAsset(url) {
      if (typeof url !== 'string') return false;
      const trimmed = url.trim();
      if (!trimmed || trimmed === '{{IMAGE_URL}}') return false;
      if (/^(javascript|vbscript|file):/i.test(trimmed)) return false;
      if (/^data:/i.test(trimmed)) {
        return /^data:image\/(jpeg|jpg|png|webp|gif|avif|bmp|svg\+xml)/i.test(trimmed);
      }
      return true;
    }

    function initThumbnailSizing() {
      if (!videoThumbnail) return;

      let resolvedImageUrl = isSupportedImageAsset(CUSTOM_THUMBNAIL_URL)
        ? CUSTOM_THUMBNAIL_URL.trim()
        : '';

      if (!resolvedImageUrl) {
        const separatorImages = document.querySelectorAll('.separator img');
        for (let i = 0; i < separatorImages.length; i += 1) {
          const candidate =
            separatorImages[i].getAttribute('data-src') ||
            separatorImages[i].getAttribute('src') ||
            '';
          if (isSupportedImageAsset(candidate)) {
            resolvedImageUrl = candidate.trim();
            break;
          }
        }
      }

      if (!resolvedImageUrl) {
        const thumbDataSrc = videoThumbnail.getAttribute('data-src') || '';
        if (isSupportedImageAsset(thumbDataSrc)) {
          resolvedImageUrl = thumbDataSrc.trim();
        }
      }

      videoThumbnail.addEventListener('load', adjustAspectRatio);
      videoThumbnail.addEventListener('error', handleThumbnailError);

      if (videoPlayer) {
        videoPlayer.addEventListener('loadedmetadata', function () {
          if (
            (!videoThumbnail.naturalWidth || !videoThumbnail.naturalHeight) &&
            videoPlayer.videoWidth > 0 &&
            videoPlayer.videoHeight > 0
          ) {
            applyContainerDimensions(videoPlayer.videoWidth, videoPlayer.videoHeight);
          }
        });
      }

      if (resolvedImageUrl) {
        if (videoThumbnail.getAttribute('src') !== resolvedImageUrl) {
          videoThumbnail.src = resolvedImageUrl;
        }
        if (videoPlayer) {
          videoPlayer.setAttribute('poster', resolvedImageUrl);
        }
        if (videoThumbnail.complete) {
          if (videoThumbnail.naturalWidth > 0) {
            adjustAspectRatio();
          } else {
            handleThumbnailError();
          }
        }
      } else if (CUSTOM_THUMBNAIL_URL && CUSTOM_THUMBNAIL_URL !== '{{IMAGE_URL}}') {
        handleThumbnailError();
      }

      let resizeRaf = null;
      window.addEventListener('resize', function () {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(adjustAspectRatio);
      });
    }

    function initSmoothScrollIndicator() {
      document.querySelectorAll('.scroll-indicator').forEach(function (link) {
        link.addEventListener('click', function (e) {
          const targetId = link.getAttribute('href');
          if (targetId && targetId.charAt(0) === '#') {
            const targetEl = document.getElementById(targetId.slice(1));
            if (targetEl) {
              e.preventDefault();
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }

    // =========================================================================
    // REWARD AD-WATCH & TIMER UNLOCK SYSTEM
    // =========================================================================
    const unlockModal = document.getElementById('unlockModal');
    const unlockModalClose = document.getElementById('unlockModalClose');
    const unlockStep1Card = document.getElementById('unlockStep1Card');
    const unlockStep2Card = document.getElementById('unlockStep2Card');
    const unlockStep1Btn = document.getElementById('unlockStep1Btn');
    const unlockStep2Btn = document.getElementById('unlockStep2Btn');
    const timer1El = document.getElementById('timer1');
    const timer2El = document.getElementById('timer2');
    const unlockStatusBanner = document.getElementById('unlockStatusBanner');
    const unlockedPlayBtn = document.getElementById('unlockedPlayBtn');

    let isVideoUnlocked = !REWARD_UNLOCK_CONFIG.enabled;
    let step1Completed = !REWARD_UNLOCK_CONFIG.enabled;
    let step2Completed = !REWARD_UNLOCK_CONFIG.enabled;
    let activeStepTimer = null;

    function openUnlockModal() {
      if (!unlockModal) return;
      unlockModal.classList.add('is-open');
    }

    function closeUnlockModal() {
      if (!unlockModal) return;
      unlockModal.classList.remove('is-open');
    }

    function runStepCountdown(stepNumber, durationSec, url, buttonEl, timerEl, onComplete) {
      if (activeStepTimer) return; // Prevent overlapping timers

      if (typeof url === 'string' && /^https?:\/\//i.test(url.trim())) {
        window.open(url.trim(), '_blank', 'noopener,noreferrer');
      }

      let remaining = Math.max(1, Number(durationSec) || 5);
      if (timerEl) timerEl.textContent = toBengaliDigits(remaining);
      if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'বিজ্ঞাপন যাচাই হচ্ছে (' + toBengaliDigits(remaining) + ' সে.)';
      }
      if (unlockStatusBanner) {
        unlockStatusBanner.textContent =
          'ধাপ ' + toBengaliDigits(stepNumber) + ' চলমান রয়েছে — অনুগ্রহ করে ' + toBengaliDigits(remaining) + ' সেকেন্ড অপেক্ষা করুন।';
      }

      activeStepTimer = setInterval(function () {
        remaining -= 1;
        if (timerEl) timerEl.textContent = toBengaliDigits(Math.max(0, remaining));
        if (remaining > 0) {
          if (buttonEl) {
            buttonEl.textContent = 'বিজ্ঞাপন যাচাই হচ্ছে (' + toBengaliDigits(remaining) + ' সে.)';
          }
          return;
        }

        clearInterval(activeStepTimer);
        activeStepTimer = null;
        onComplete();
      }, 1000);
    }

    function initRewardUnlockSystem() {
      if (timer1El) timer1El.textContent = toBengaliDigits(REWARD_UNLOCK_CONFIG.step1DurationSec);
      if (timer2El) timer2El.textContent = toBengaliDigits(REWARD_UNLOCK_CONFIG.step2DurationSec);

      if (unlockModalClose) {
        unlockModalClose.addEventListener('click', closeUnlockModal);
      }

      if (unlockModal) {
        unlockModal.addEventListener('click', function (e) {
          if (e.target === unlockModal) {
            closeUnlockModal();
          }
        });
      }

      if (unlockStep1Btn) {
        unlockStep1Btn.addEventListener('click', function (e) {
          if (!e || e.isTrusted === false || step1Completed) return;
          runStepCountdown(
            1,
            REWARD_UNLOCK_CONFIG.step1DurationSec,
            REWARD_UNLOCK_CONFIG.step1Url,
            unlockStep1Btn,
            timer1El,
            function () {
              step1Completed = true;
              if (unlockStep1Card) {
                unlockStep1Card.classList.remove('is-active');
                unlockStep1Card.classList.add('is-completed');
              }
              unlockStep1Btn.textContent = 'ধাপ ১ সম্পন্ন হয়েছে ✓';
              if (unlockStep2Card) unlockStep2Card.classList.add('is-active');
              if (unlockStep2Btn) unlockStep2Btn.disabled = false;
              if (unlockStatusBanner) {
                unlockStatusBanner.textContent =
                  'ধাপ ১ সম্পন্ন! ভিডিও আনলক করতে এবার ধাপ ২ সম্পন্ন করুন।';
              }
            }
          );
        });
      }

      if (unlockStep2Btn) {
        unlockStep2Btn.addEventListener('click', function (e) {
          if (!e || e.isTrusted === false || !step1Completed || step2Completed) return;
          runStepCountdown(
            2,
            REWARD_UNLOCK_CONFIG.step2DurationSec,
            REWARD_UNLOCK_CONFIG.step2Url,
            unlockStep2Btn,
            timer2El,
            function () {
              step2Completed = true;
              isVideoUnlocked = true;

              if (unlockStep2Card) {
                unlockStep2Card.classList.remove('is-active');
                unlockStep2Card.classList.add('is-completed');
              }
              unlockStep2Btn.textContent = 'ধাপ ২ সম্পন্ন হয়েছে ✓';

              if (playIcon) {
                playIcon.setAttribute('data-unlocked', 'true');
              }
              if (unlockStatusBanner) {
                unlockStatusBanner.classList.add('is-unlocked');
                unlockStatusBanner.textContent =
                  'সফলভাবে সম্পন্ন হয়েছে! এখন প্লে বাটনে ক্লিক করে ভিডিও উপভোগ করুন।';
              }
              if (unlockedPlayBtn) {
                unlockedPlayBtn.disabled = false;
                unlockedPlayBtn.textContent = 'এখন ভিডিও প্লে করুন ▶';
              }
            }
          );
        });
      }

      if (unlockedPlayBtn) {
        unlockedPlayBtn.addEventListener('click', function (e) {
          if (!e || e.isTrusted === false || !isVideoUnlocked) return;
          closeUnlockModal();
          handleAction();
        });
      }
    }

    function init() {
      initThumbnailSizing();
      initSmoothScrollIndicator();
      initRewardUnlockSystem();

      if (videoPlayer) {
        videoPlayer.addEventListener('playing', hideOverlaysForPlayback);
        videoPlayer.addEventListener('canplay', function () {
          if (loadingScreen && loadingScreen.style.display === 'flex') {
            hideOverlaysForPlayback();
          }
        });
        videoPlayer.addEventListener('error', handlePlaybackFailure);
      }
    }

    // Real video playback handler (strictly locked until both reward steps complete)
    function handleAction() {
      if (REWARD_UNLOCK_CONFIG.enabled && !isVideoUnlocked) {
        openUnlockModal();
        return;
      }

      if (!videoPlayer) return;
      if (videoContainer) {
        videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const sourceUrl = CUSTOM_VIDEO_URL || videoPlayer.getAttribute('src') || '';
      if (!sourceUrl) {
        handlePlaybackFailure();
        return;
      }

      showLoadingState('ভিডিও লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...');

      if (videoPlayer.src !== sourceUrl) {
        videoPlayer.src = sourceUrl;
        videoPlayer.load();
      }

      if (loadTimeoutId) clearTimeout(loadTimeoutId);
      loadTimeoutId = setTimeout(function () {
        if (videoPlayer.readyState < 2) {
          handlePlaybackFailure();
        }
      }, 10000);

      const playPromise = videoPlayer.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(function () {
            hideOverlaysForPlayback();
          })
          .catch(function (err) {
            // Only trigger failure UI when actual media loading/playback fails
            if (err && err.name !== 'AbortError') {
              handlePlaybackFailure();
            }
          });
      }
    }

    // =========================================================================
    // 3. USER-INITIATED BUTTON CLICK SYSTEM (NO AUTO POPUPS OR REDIRECTS)
    // =========================================================================
    const buttonLastClickAt = {};

    function isValidDestinationUrl(rawUrl) {
      if (typeof rawUrl !== 'string') return false;
      const trimmed = rawUrl.trim();
      return /^https?:\/\//i.test(trimmed);
    }

    function applyButtonCooldown(buttonEl, buttonId, cooldownMs) {
      buttonLastClickAt[buttonId] = Date.now();
      if (!buttonEl || cooldownMs <= 0) return;

      buttonEl.classList.add('is-cooldown');
      buttonEl.setAttribute('aria-busy', 'true');
      setTimeout(function () {
        buttonEl.classList.remove('is-cooldown');
        buttonEl.removeAttribute('aria-busy');
      }, cooldownMs);
    }

    function handleConfiguredButtonClick(buttonId, event) {
      // Only respond to genuine user-initiated clicks
      if (!event || event.isTrusted === false) return;

      const buttonEl = document.getElementById(buttonId);
      const btnSettings = BUTTON_CLICK_CONFIG.buttons[buttonId];
      const cooldownMs = Math.max(0, Number(BUTTON_CLICK_CONFIG.cooldownMs) || 0);
      const now = Date.now();
      const lastClick = buttonLastClickAt[buttonId] || 0;

      // Prevent accidental duplicate click events
      if (cooldownMs > 0 && now - lastClick < cooldownMs) {
        return;
      }
      applyButtonCooldown(buttonEl, buttonId, cooldownMs);

      const hasActiveUrl =
        Boolean(btnSettings && btnSettings.enabled) &&
        isValidDestinationUrl(btnSettings.url);

      if (hasActiveUrl) {
        const destinationUrl = btnSettings.url.trim();
        if (btnSettings.openInNewTab) {
          // Single intentional new-tab open synchronously within the click handler
          window.open(destinationUrl, '_blank', 'noopener,noreferrer');
          if (btnSettings.triggerPlayback) {
            handleAction();
          }
          return;
        } else {
          // Intentional navigation in the current tab when configured
          window.location.assign(destinationUrl);
          return;
        }
      }

      // Preserve original playback functionality when URL action is disabled or empty
      if (!btnSettings || btnSettings.triggerPlayback !== false) {
        handleAction();
      }
    }

    function initButtonClickSystem() {
      Object.keys(BUTTON_CLICK_CONFIG.buttons).forEach(function (buttonId) {
        const buttonEl = document.getElementById(buttonId);
        if (!buttonEl) return;
        buttonEl.addEventListener('click', function (event) {
          handleConfiguredButtonClick(buttonId, event);
        });
      });
    }

    initButtonClickSystem();

    if (playIcon) {
      playIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        handleAction();
      });
      playIcon.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction();
        }
      });
    }

    if (retryPlayBtn) {
      retryPlayBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        handleAction();
      });
    }

    if (videoContainer) {
      videoContainer.addEventListener('click', function () {
        if (!videoContainer.classList.contains('is-playing')) {
          handleAction();
        }
      });
    }

    // Smart Lazy-Loading & Fallback Advertisement System
    const adQueue = [];
    let isProcessingAdQueue = false;

    function markAdFallback(wrapper) {
      if (wrapper) {
        wrapper.classList.add('is-fallback');
      }
    }

    function injectExternalScript(targetEl, src, wrapper, asyncFlag, done) {
      const script = document.createElement('script');
      script.src = src;
      if (asyncFlag) {
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
      }
      script.onload = function () {
        if (done) done();
      };
      script.onerror = function () {
        markAdFallback(wrapper);
        if (typeof notifyAdScriptBlocked === 'function') {
          notifyAdScriptBlocked();
        }
        if (done) done();
      };
      targetEl.appendChild(script);

      setTimeout(function () {
        const hasRenderedAd = targetEl.querySelector('iframe, img, ins, a');
        if (!hasRenderedAd) {
          markAdFallback(wrapper);
        }
      }, 4500);
    }

    // =========================================================================
    // LIGHTWEIGHT AD-BLOCK DETECTION SYSTEM (NO EXTERNAL LIBRARIES)
    // =========================================================================
    const adblockNoticeModal = document.getElementById('adblockNoticeModal');
    const adblockNoticeStatus = document.getElementById('adblockNoticeStatus');
    const adblockRefreshBtn = document.getElementById('adblockRefreshBtn');
    const adblockRecheckBtn = document.getElementById('adblockRecheckBtn');
    const adblockDismissBtn = document.getElementById('adblockDismissBtn');
    let adblockUserDismissed = false;

    function showAdBlockNotice() {
      if (!ADBLOCK_DETECTOR_CONFIG.enabled || adblockUserDismissed || !adblockNoticeModal) return;
      adblockNoticeModal.classList.add('is-open');
    }

    function hideAdBlockNotice() {
      if (!adblockNoticeModal) return;
      adblockNoticeModal.classList.remove('is-open');
      if (adblockNoticeStatus) {
        adblockNoticeStatus.textContent = '';
        adblockNoticeStatus.classList.remove('is-visible');
      }
    }

    function notifyAdScriptBlocked() {
      if (!ADBLOCK_DETECTOR_CONFIG.enabled || navigator.onLine === false) return;
      runAdBlockCheck(function (isBlocked) {
        if (isBlocked) {
          showAdBlockNotice();
        }
      });
    }

    function runAdBlockCheck(callback) {
      if (!ADBLOCK_DETECTOR_CONFIG.enabled || navigator.onLine === false) {
        if (callback) callback(false);
        return;
      }

      // 1. Lightweight DOM cosmetic filter bait
      const bait = document.createElement('div');
      bait.className = 'adsbox ad-banner ad-unit pub_300x250 text-ad';
      bait.setAttribute('aria-hidden', 'true');
      bait.style.cssText =
        'width:1px!important;height:1px!important;position:absolute!important;left:-9999px!important;top:-9999px!important;pointer-events:none!important;';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      setTimeout(function () {
        let baitBlocked = false;
        try {
          const computed = window.getComputedStyle ? window.getComputedStyle(bait) : null;
          baitBlocked =
            bait.offsetParent === null ||
            bait.offsetHeight === 0 ||
            bait.offsetWidth === 0 ||
            (computed &&
              (computed.display === 'none' ||
                computed.visibility === 'hidden' ||
                computed.opacity === '0'));
        } catch (err) {
          baitBlocked = false;
        }
        if (bait.parentNode) {
          bait.parentNode.removeChild(bait);
        }

        if (baitBlocked) {
          if (callback) callback(true);
          return;
        }

        // 2. Lightweight network probe for ad script reachability
        if (typeof window.fetch === 'function') {
          window
            .fetch('https://www.highperformanceformat.com/36d19f913897a5c30f86205584612f58/invoke.js', {
              method: 'HEAD',
              mode: 'no-cors',
              cache: 'no-store'
            })
            .then(function () {
              if (callback) callback(false);
            })
            .catch(function () {
              if (callback) callback(navigator.onLine !== false);
            });
        } else {
          if (callback) callback(false);
        }
      }, 160);
    }

    function initAdBlockDetector() {
      if (!ADBLOCK_DETECTOR_CONFIG.enabled) return;

      if (adblockRefreshBtn) {
        adblockRefreshBtn.addEventListener('click', function () {
          window.location.reload();
        });
      }

      if (adblockRecheckBtn) {
        adblockRecheckBtn.addEventListener('click', function () {
          if (adblockNoticeStatus) {
            adblockNoticeStatus.textContent = 'যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...';
            adblockNoticeStatus.classList.add('is-visible');
          }
          runAdBlockCheck(function (isBlocked) {
            if (!isBlocked) {
              hideAdBlockNotice();
            } else if (adblockNoticeStatus) {
              adblockNoticeStatus.textContent =
                'এখনও অ্যাড-ব্লকার সক্রিয় রয়েছে। অনুগ্রহ করে এই সাইটের জন্য অ্যাড-ব্লকার বন্ধ করে আবার চেষ্টা করুন।';
              adblockNoticeStatus.classList.add('is-visible');
            }
          });
        });
      }

      if (adblockDismissBtn && ADBLOCK_DETECTOR_CONFIG.allowDismiss) {
        adblockDismissBtn.addEventListener('click', function () {
          adblockUserDismissed = true;
          hideAdBlockNotice();
        });
      }

      if (adblockNoticeModal && ADBLOCK_DETECTOR_CONFIG.allowDismiss) {
        adblockNoticeModal.addEventListener('click', function (e) {
          if (e.target === adblockNoticeModal) {
            adblockUserDismissed = true;
            hideAdBlockNotice();
          }
        });
      }

      runAdBlockCheck(function (isBlocked) {
        if (isBlocked) {
          showAdBlockNotice();
        }
      });
    }

    function processNextAd() {
      if (isProcessingAdQueue || adQueue.length === 0) return;
      isProcessingAdQueue = true;

      const wrapper = adQueue.shift();
      const slotType = wrapper.getAttribute('data-ad-slot');
      const isMobileViewport = window.innerWidth <= 600;

      const finish = function () {
        isProcessingAdQueue = false;
        processNextAd();
      };

      if (slotType === 'top-banner') {
        const target = document.getElementById('ad-top-banner');
        if (!target) { finish(); return; }
        window.atOptions = {
          'key': '36d19f913897a5c30f86205584612f58',
          'format': 'iframe',
          'height': isMobileViewport ? 50 : 90,
          'width': isMobileViewport ? 320 : 728,
          'params': {}
        };
        injectExternalScript(
          target,
          'https://www.highperformanceformat.com/36d19f913897a5c30f86205584612f58/invoke.js',
          wrapper,
          false,
          finish
        );
      } else if (slotType === 'native-below-thumb') {
        const target = document.getElementById('ad-native-thumb');
        if (!target) { finish(); return; }
        injectExternalScript(
          target,
          'https://pl30160056.effectivecpmnetwork.com/390299b40362a820b12f3db553aff06f/invoke.js',
          wrapper,
          true,
          finish
        );
      } else if (slotType === 'bottom-banner') {
        const target = document.getElementById('ad-bottom-banner');
        if (!target) { finish(); return; }
        injectExternalScript(
          target,
          'https://pl30160054.effectivecpmnetwork.com/44/86/88/448688bfd2ba5f19d655439d50b8ea0b.js',
          wrapper,
          true,
          finish
        );
      } else {
        const target = wrapper.querySelector('.ad-slot-inner');
        if (!target) { finish(); return; }
        window.atOptions = {
          'key': '36d19f913897a5c30f86205584612f58',
          'format': 'iframe',
          'height': isMobileViewport ? 50 : 90,
          'width': isMobileViewport ? 320 : 728,
          'params': {}
        };
        injectExternalScript(
          target,
          'https://www.highperformanceformat.com/36d19f913897a5c30f86205584612f58/invoke.js',
          wrapper,
          false,
          finish
        );
      }
    }

    function loadAdSlot(wrapper) {
      if (!wrapper || wrapper.dataset.adLoaded === 'true') return;
      wrapper.dataset.adLoaded = 'true';
      adQueue.push(wrapper);
      processNextAd();
    }

    function initLazyAds() {
      const adSlots = document.querySelectorAll('.ad-slot-wrapper[data-ad-slot]');
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadAdSlot(entry.target);
              obs.unobserve(entry.target);
            }
          });
        }, { rootMargin: '220px 0px' });

        adSlots.forEach(function (slot) {
          observer.observe(slot);
        });
      } else {
        adSlots.forEach(loadAdSlot);
      }
    }

    init();
    initLiveViewerCounter();
    initLazyAds();
    initAdBlockDetector();
  </script>
</body>
</html>`;
}
