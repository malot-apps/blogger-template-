export interface TemplateConfig {
  title: string;
  caption: string;
  imageUrl: string;
}

/**
 * Generates the complete, Blogger-compatible single-file HTML template with:
 * 1. Exact 6 Ad Placements (Top Banner, Native below thumbnail, Player Bottom,
 *    In-Content middle of description, Related Content between related videos, Bottom Banner)
 * 2. Smart Ad System (IntersectionObserver Lazy Loading, Responsive sizing,
 *    Ad Fallback on load error/block, CLS-Safe reserved slots)
 * 3. Premium UI Animations (Glowing pulse-ring Play Button, Glassmorphism Loading
 *    Spinner + Gradient Progress Bar, Smooth Scrolling)
 * - Zero external libraries, zero forced redirects, zero repeated popups.
 */
export function buildSmartAdsBloggerTemplate(config: TemplateConfig): string {
  const safeTitle = config.title || '{{TITLE}}';
  const safeCaption = config.caption || '{{CAPTION}}';
  const safeImageUrl = config.imageUrl || '{{IMAGE_URL}}';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://pl30161573.effectivecpmnetwork.com/bc/17/d1/bc17d177bcada949929a7511850a6cf0.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.6;
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

    /* =====================================================
       CLS-SAFE RESPONSIVE AD SLOTS & FALLBACK SYSTEM
       ===================================================== */
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

    /* Reserved dimensions prevent Cumulative Layout Shift (CLS) */
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

    /* =====================================================
       AUTO-SIZING VIDEO PLAYER CONTAINER
       ===================================================== */
    .video-container {
      position: relative;
      width: 100%;
      aspect-ratio: var(--video-ratio, 16 / 9);
      height: auto;
      margin: 20px auto;
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
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .video-container:hover #videoThumbnail {
      transform: scale(1.025);
    }

    .video-container::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.05) 55%, rgba(0, 0, 0, 0.28) 100%);
      pointer-events: none;
      z-index: 2;
    }

    /* =====================================================
       PREMIUM ANIMATED PLAY BUTTON
       ===================================================== */
    .play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(110, 142, 251, 0.95), rgba(167, 119, 227, 0.95));
      border: 2px solid rgba(255, 255, 255, 0.92);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      box-shadow:
        0 0 26px rgba(110, 142, 251, 0.65),
        0 0 48px rgba(167, 119, 227, 0.4),
        0 10px 24px rgba(0, 0, 0, 0.38);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, opacity 0.25s ease;
    }

    .play-icon::before,
    .play-icon::after {
      content: '';
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.72);
      box-shadow: 0 0 20px rgba(110, 142, 251, 0.55);
      animation: playPulseRing 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
      pointer-events: none;
    }

    .play-icon::after {
      animation-delay: 1.05s;
    }

    .video-container:hover .play-icon,
    .play-icon:hover {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow:
        0 0 34px rgba(110, 142, 251, 0.85),
        0 0 64px rgba(167, 119, 227, 0.55),
        0 14px 32px rgba(0, 0, 0, 0.45);
    }

    .play-icon:active {
      transform: translate(-50%, -50%) scale(0.97);
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
      transform: translate(-50%, -50%) scale(0.82);
    }

    @keyframes playPulseRing {
      0% { transform: scale(0.92); opacity: 0.85; }
      75% { transform: scale(1.52); opacity: 0; }
      100% { transform: scale(1.52); opacity: 0; }
    }

    /* =====================================================
       SMART GLASSMORPHISM LOADING ANIMATION
       ===================================================== */
    .loading-screen {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      padding: 20px;
      background: rgba(15, 23, 42, 0.58);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 15;
    }

    .loading-card {
      width: min(320px, 92%);
      padding: 24px 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.24);
      box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      color: #ffffff;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: conic-gradient(from 0deg, #6e8efb, #a777e3, rgba(255, 255, 255, 0.15) 75%);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
      animation: spinnerSpin 0.85s linear infinite;
    }

    .loading-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.01em;
      color: #ffffff;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
    }

    .loading-subtitle {
      font-size: 12.5px;
      color: rgba(255, 255, 255, 0.84);
      margin-top: -6px;
    }

    .loading-progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      overflow: hidden;
    }

    .loading-progress-bar {
      width: 0%;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #6e8efb, #a777e3, #6e8efb);
      background-size: 200% 100%;
      animation: progressFill 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards, progressShimmer 1.4s linear infinite;
    }

    @keyframes spinnerSpin {
      to { transform: rotate(360deg); }
    }

    @keyframes progressFill {
      0% { width: 10%; }
      65% { width: 85%; }
      100% { width: 100%; }
    }

    @keyframes progressShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* =====================================================
       CONTROLS, DESCRIPTION & RELATED VIDEOS
       ===================================================== */
    .controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 22px 0;
      flex-wrap: wrap;
    }

    button {
      padding: 12px 25px;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
      line-height: 1.3;
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
      line-height: 1.35;
    }

    .related-meta {
      font-size: 12px;
      color: #64748b;
    }

    /* Mobile Optimization */
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

      .loading-card {
        padding: 18px 16px;
      }

      .controls {
        gap: 10px;
        margin: 18px 0;
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
      .play-icon::after {
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

  <!-- VIDEO PLAYER SECTION -->
  <div class="video-container" id="videoContainer">
    <img alt="${safeTitle}" id="videoThumbnail" src="${safeImageUrl}" />
    <div class="play-icon" id="playIcon" role="button" tabindex="0" aria-label="Play video">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.14v14l11-7-11-7z"></path>
      </svg>
    </div>
    <div class="loading-screen" id="loadingScreen" style="display: none;">
      <div class="loading-card">
        <div class="loading-spinner" aria-hidden="true"></div>
        <div class="loading-title">Loading video stream...</div>
        <div class="loading-subtitle">Preparing HD playback</div>
        <div class="loading-progress-track" aria-hidden="true">
          <div class="loading-progress-bar" id="loadingProgressBar"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="controls">
    <button type="button" id="btn1">Play Now</button>
    <button type="button" id="btn2">Watch Now</button>
    <button type="button" id="btn3">Play &amp; Watch</button>
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

    <p>Enjoy uninterrupted, mobile-optimized playback that automatically adapts to portrait, square, and widescreen thumbnails without cropping or distortion.</p>
  </section>

  <!-- RELATED VIDEOS WITH RELATED CONTENT AD BETWEEN THEM -->
  <section class="related-section" aria-label="Related Videos">
    <h2 class="related-heading">Related Videos</h2>
    <div class="related-grid">
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Featured Stream</div>
        <div class="related-body">
          <div class="related-title">${safeTitle}</div>
          <div class="related-meta">HD Stream &middot; Ready to Play</div>
        </div>
      </a>
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Full Version</div>
        <div class="related-body">
          <div class="related-title">${safeCaption}</div>
          <div class="related-meta">Adaptive Quality &middot; Mobile Ready</div>
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
          <div class="related-title">Watch Highlights &amp; Clips</div>
          <div class="related-meta">Instant Playback</div>
        </div>
      </a>
      <a class="related-card" href="#videoContainer">
        <div class="related-thumb">Behind the Scenes</div>
        <div class="related-body">
          <div class="related-title">Extended Editorial Cut</div>
          <div class="related-meta">Full Resolution</div>
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

    // Core Player Elements
    const videoContainer = document.getElementById('videoContainer');
    const playIcon = document.getElementById('playIcon');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgressBar = document.getElementById('loadingProgressBar');
    const videoThumbnail = document.getElementById('videoThumbnail');

    let playbackTimer = null;

    // 1. Auto Thumbnail Aspect Ratio (9:16, 16:9, 1:1 without cropping or stretching)
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

    function restartProgressAnimation() {
      if (!loadingProgressBar) return;
      loadingProgressBar.style.animation = 'none';
      void loadingProgressBar.offsetWidth;
      loadingProgressBar.style.animation = '';
    }

    function init() {
      if (CUSTOM_THUMBNAIL_URL && videoThumbnail) {
        videoThumbnail.addEventListener('load', adjustAspectRatio);
        videoThumbnail.src = CUSTOM_THUMBNAIL_URL;
        if (videoThumbnail.complete && videoThumbnail.naturalWidth > 0) {
          adjustAspectRatio();
        }
      }
    }

    // Safe non-intrusive playback UI handler (never forces redirects or popups)
    function handleAction() {
      if (!playIcon || !loadingScreen) return;
      if (videoContainer) {
        videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      playIcon.classList.add('loading');
      restartProgressAnimation();
      loadingScreen.style.display = 'flex';

      if (playbackTimer) clearTimeout(playbackTimer);
      playbackTimer = setTimeout(function () {
        playIcon.classList.remove('loading');
        loadingScreen.style.display = 'none';
      }, 2800);
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

    if (videoContainer) {
      videoContainer.addEventListener('click', handleAction);
    }

    // =====================================================
    // 2. SMART LAZY-LOADING & FALLBACK ADVERTISEMENT SYSTEM
    // =====================================================
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

      // Fallback check if network or blocker prevents ad rendering
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
