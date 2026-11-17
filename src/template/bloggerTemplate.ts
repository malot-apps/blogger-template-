export interface TemplateConfig {
  title: string;
  caption: string;
  imageUrl: string;
  videoUrl: string;
}

/**
 * Generates the complete, Blogger-compatible single-file HTML template with:
 * - Preserved 6-slot Smart Advertisement System (lazy loading, responsive, fallback, CLS-safe)
 * - Preserved auto-sizing thumbnail aspect ratio (--video-ratio) and #btn1/#btn2/#btn3
 * - Professional Bengali CTA texts (heading above player, instruction below Play button,
 *   floating "নিচে Scroll করুন" indicator, friendly Bengali loading & real failure retry/error states)
 * - Bengali typography (Hind Siliguri + Noto Sans Bengali + system fallbacks)
 * - Genuine HTML5 video playback & real error-event retry handling (no fake progress, no popups/redirects)
 */
export function buildSmartAdsBloggerTemplate(config: TemplateConfig): string {
  const safeTitle = config.title || '{{TITLE}}';
  const safeCaption = config.caption || '{{CAPTION}}';
  const safeImageUrl = config.imageUrl || '{{IMAGE_URL}}';
  const safeVideoUrl = config.videoUrl || '';

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <script src="https://pl30161573.effectivecpmnetwork.com/bc/17/d1/bc17d177bcada949929a7511850a6cf0.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
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
      width: 100%;
      aspect-ratio: var(--video-ratio, 16 / 9);
      height: auto;
      margin: 12px auto 18px;
      background-color: #000;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .video-container.is-portrait {
      max-width: min(100%, 420px);
    }

    .video-container.is-square {
      max-width: min(100%, 560px);
    }

    #videoThumbnail {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
    }

    .video-container:hover #videoThumbnail {
      transform: scale(1.025);
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
      display: none;
      background: #000;
      z-index: 20;
    }

    .video-container.is-playing #videoPlayer {
      display: block;
    }

    /* Centered Play Button + Bengali Instruction Group */
    .play-center-group {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -46%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      z-index: 10;
      width: min(90%, 340px);
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
      animation: bnFadeSlideUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
      transition: opacity 0.2s ease;
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
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
    }

    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }
      .play-icon::before,
      .play-icon::after,
      .scroll-indicator,
      .bn-player-heading-wrap,
      .bn-play-hint {
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
    <img alt="${safeTitle}" id="videoThumbnail" src="${safeImageUrl}" />
    <div class="video-scrim" aria-hidden="true"></div>

    <video id="videoPlayer" playsinline controls preload="none" poster="${safeImageUrl}"></video>

    <div class="play-center-group" id="playCenterGroup">
      <div class="play-icon" id="playIcon" role="button" tabindex="0" aria-label="ভিডিও চালু করুন">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.14v14l11-7-11-7z"></path>
        </svg>
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

  <script>
    // Configuration
    const CUSTOM_THUMBNAIL_URL = "${safeImageUrl}";
    const CUSTOM_VIDEO_URL = "${safeVideoUrl}";

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

    let playbackFailures = 0;
    let loadTimeoutId = null;

    // Auto Thumbnail Aspect Ratio (9:16, 16:9, 1:1 without cropping or stretching)
    function adjustAspectRatio() {
      if (!videoThumbnail || !videoContainer) return;
      const w = videoThumbnail.naturalWidth;
      const h = videoThumbnail.naturalHeight;
      if (w > 0 && h > 0) {
        videoContainer.style.setProperty('--video-ratio', w + ' / ' + h);
        videoContainer.classList.toggle('is-portrait', h > w);
        videoContainer.classList.toggle('is-square', w === h);
      }
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

    function init() {
      if (CUSTOM_THUMBNAIL_URL && videoThumbnail) {
        videoThumbnail.addEventListener('load', adjustAspectRatio);
        videoThumbnail.src = CUSTOM_THUMBNAIL_URL;
        if (videoThumbnail.complete && videoThumbnail.naturalWidth > 0) {
          adjustAspectRatio();
        }
      }

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

    // Real video playback handler (no fake progress, no popups, no forced redirects)
    function handleAction() {
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

    document.querySelectorAll('.controls button').forEach(function (button) {
      button.addEventListener('click', handleAction);
    });

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
    initLazyAds();
  </script>
</body>
</html>`;
}
