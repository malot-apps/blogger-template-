import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Play, Tv } from 'lucide-react';
import {
  ButtonId,
  DEFAULT_BUTTON_SETTINGS,
  isSupportedImageUrl,
  TemplateConfig,
} from '../template/bloggerTemplate';

interface LivePreviewProps {
  config: TemplateConfig;
  viewport: 'desktop' | 'mobile';
  forceLoading: boolean;
  simulateFallback: boolean;
  simulateAdBlock: boolean;
  simulatePlaybackError: boolean;
  onCloseAdBlockTest: () => void;
  onImageMetrics: (metrics: { width: number; height: number; ratioText: string; mode: string }) => void;
  onActionTriggered: (source: string) => void;
}

const AdSlotPreview: React.FC<{
  label: string;
  title: string;
  slotId: string;
  sizeText: string;
  isBanner?: boolean;
  isMobile: boolean;
  simulateFallback: boolean;
  fallbackTitle: string;
  fallbackDesc: string;
}> = ({
  label,
  title,
  slotId,
  sizeText,
  isBanner = false,
  isMobile,
  simulateFallback,
  fallbackTitle,
  fallbackDesc,
}) => {
  return (
    <aside className="w-full my-4 p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </span>
      <div
        className={`w-full flex items-center justify-center ${
          isBanner
            ? isMobile
              ? 'max-w-[320px] min-h-[56px]'
              : 'max-w-[728px] min-h-[90px]'
            : isMobile
            ? 'min-h-[96px]'
            : 'min-h-[120px]'
        }`}
      >
        {simulateFallback ? (
          <div className="w-full py-3.5 px-4 rounded-lg border border-dashed border-slate-300 bg-white text-center">
            <strong className="block text-xs font-semibold text-slate-700">{fallbackTitle}</strong>
            <span className="text-xs text-slate-500">{fallbackDesc}</span>
          </div>
        ) : (
          <div className="w-full h-full py-3 px-4 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center gap-0.5">
            <span className="text-xs font-semibold text-slate-700">{title}</span>
            <span className="font-mono text-[11px] text-slate-500">
              {slotId} · {sizeText} · Lazy-Loaded
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

const toBengaliDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export const LivePreview: React.FC<LivePreviewProps> = ({
  config,
  viewport,
  forceLoading,
  simulateFallback,
  simulateAdBlock,
  simulatePlaybackError,
  onCloseAdBlockTest,
  onImageMetrics,
  onActionTriggered,
}) => {
  const rewardEnabled = config.rewardUnlock?.enabled ?? true;
  const adBlockEnabled = config.adBlockDetector?.enabled ?? true;
  const adBlockDismissible = config.adBlockDetector?.allowDismiss ?? false;
  const [adBlockRecheckMsg, setAdBlockRecheckMsg] = useState<string>('');
  const step1Duration = Math.max(1, Math.round(config.rewardUnlock?.step1DurationSec ?? 5));
  const step2Duration = Math.max(1, Math.round(config.rewardUnlock?.step2DurationSec ?? 5));

  const [ratioCss, setRatioCss] = useState<string>('16 / 9');
  const [containerMaxWidth, setContainerMaxWidth] = useState<string>('100%');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);
  const [viewerCount, setViewerCount] = useState<number>(() =>
    Math.floor(Math.random() * (5285 - 1577 + 1)) + 1577
  );
  const [viewerUpdating, setViewerUpdating] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [step1Done, setStep1Done] = useState<boolean>(!rewardEnabled);
  const [step2Done, setStep2Done] = useState<boolean>(!rewardEnabled);
  const [activeCountingStep, setActiveCountingStep] = useState<1 | 2 | null>(null);
  const [step1Remaining, setStep1Remaining] = useState<number>(step1Duration);
  const [step2Remaining, setStep2Remaining] = useState<number>(step2Duration);
  const [cooldownButtons, setCooldownButtons] = useState<Record<ButtonId, boolean>>({
    btn1: false,
    btn2: false,
    btn3: false,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const stepTimerRef = useRef<number | null>(null);
  const lastClickAtRef = useRef<Record<ButtonId, number>>({
    btn1: 0,
    btn2: 0,
    btn3: 0,
  });
  const cooldownTimersRef = useRef<Record<ButtonId, number | null>>({
    btn1: null,
    btn2: null,
    btn3: null,
  });

  useEffect(() => {
    if (stepTimerRef.current) {
      window.clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setActiveCountingStep(null);
    setStep1Done(!rewardEnabled);
    setStep2Done(!rewardEnabled);
    setStep1Remaining(step1Duration);
    setStep2Remaining(step2Duration);
    if (!rewardEnabled) setModalOpen(false);
  }, [rewardEnabled, step1Duration, step2Duration]);

  useEffect(() => {
    let active = true;
    let scheduleTimer: number | null = null;
    let swapTimer: number | null = null;

    const queueNext = () => {
      const delay = 3200 + Math.floor(Math.random() * 2600);
      scheduleTimer = window.setTimeout(() => {
        if (!active) return;
        setViewerUpdating(true);
        swapTimer = window.setTimeout(() => {
          if (!active) return;
          setViewerCount((prev) => {
            const delta = Math.floor(Math.random() * 141) - 70;
            const next = prev + delta;
            if (next < 1577 || next > 5285 || next === prev) {
              return Math.floor(Math.random() * (5285 - 1577 + 1)) + 1577;
            }
            return next;
          });
          setViewerUpdating(false);
          queueNext();
        }, 260);
      }, delay);
    };

    queueNext();
    return () => {
      active = false;
      if (scheduleTimer) window.clearTimeout(scheduleTimer);
      if (swapTimer) window.clearTimeout(swapTimer);
    };
  }, []);

  useEffect(() => {
    setImgError(false);
    setRatioCss('16 / 9');
    setContainerMaxWidth('100%');
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 820;
      const maxComfortableHeight = Math.max(340, Math.min(680, Math.round(viewportHeight * 0.78)));
      const targetWidth = Math.min(w, Math.round(maxComfortableHeight * (w / h)));
      setRatioCss(`${w} / ${h}`);
      setContainerMaxWidth(`${targetWidth}px`);
    }
  }, [config.imageUrl]);

  useEffect(() => {
    setFailureCount(0);
    setIsPlaying(false);
    setIsLoading(false);
  }, [config.videoUrl, simulatePlaybackError]);

  useEffect(() => {
    setAdBlockRecheckMsg('');
  }, [simulateAdBlock]);

  useEffect(() => {
    const handleResize = () => {
      const img = imgRef.current;
      if (!img || !img.naturalWidth || !img.naturalHeight) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 820;
      const maxComfortableHeight = Math.max(340, Math.min(680, Math.round(viewportHeight * 0.78)));
      const targetWidth = Math.min(w, Math.round(maxComfortableHeight * (w / h)));
      setContainerMaxWidth(`${targetWidth}px`);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
      if (stepTimerRef.current) {
        window.clearInterval(stepTimerRef.current);
      }
      (['btn1', 'btn2', 'btn3'] as ButtonId[]).forEach((id) => {
        const timer = cooldownTimersRef.current[id];
        if (timer) window.clearTimeout(timer);
      });
    };
  }, []);

  const isUnlocked = !rewardEnabled || (step1Done && step2Done);

  const startUnlockStep = (step: 1 | 2) => {
    if (activeCountingStep !== null) return;
    if (step === 1 && step1Done) return;
    if (step === 2 && (!step1Done || step2Done)) return;

    const adUrl =
      step === 1 ? config.rewardUnlock?.step1Url || '' : config.rewardUnlock?.step2Url || '';
    onActionTriggered(
      `Unlock Step ${step}: simulated ad tab (${adUrl || 'timer only'}) & countdown started.`
    );

    setActiveCountingStep(step);
    let remaining = step === 1 ? step1Duration : step2Duration;

    stepTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      if (step === 1) {
        setStep1Remaining(Math.max(0, remaining));
      } else {
        setStep2Remaining(Math.max(0, remaining));
      }

      if (remaining <= 0) {
        if (stepTimerRef.current) {
          window.clearInterval(stepTimerRef.current);
          stepTimerRef.current = null;
        }
        setActiveCountingStep(null);
        if (step === 1) setStep1Done(true);
        if (step === 2) setStep2Done(true);
      }
    }, 1000);
  };

  const syncImageDimensions = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 820;
    const maxComfortableHeight = Math.max(340, Math.min(680, Math.round(viewportHeight * 0.78)));
    const targetWidth = Math.min(w, Math.round(maxComfortableHeight * (w / h)));
    setRatioCss(`${w} / ${h}`);
    setContainerMaxWidth(`${targetWidth}px`);
    const mode = h > w ? 'portrait' : w === h ? 'square' : 'landscape';
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    onImageMetrics({
      width: w,
      height: h,
      ratioText: `${Math.round(w / divisor)} : ${Math.round(h / divisor)}`,
      mode: mode.charAt(0).toUpperCase() + mode.slice(1),
    });
  };

  const triggerPlayback = (source: string) => {
    if (!isUnlocked) {
      setModalOpen(true);
      onActionTriggered(
        `Player locked: complete 2 sequential ad-watch steps before playback (${source}).`
      );
      return;
    }

    onActionTriggered(source);
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }

    if (simulatePlaybackError || !config.videoUrl) {
      setIsLoading(true);
      loadingTimerRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setFailureCount((prev) => prev + 1);
      }, 900);
      return;
    }

    setFailureCount(0);
    setIsLoading(true);
    const videoEl = videoRef.current;
    if (videoEl) {
      if (videoEl.src !== config.videoUrl) {
        videoEl.src = config.videoUrl;
        videoEl.load();
      }
      videoEl
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch(() => {
          setIsLoading(false);
          setFailureCount((prev) => prev + 1);
        });
    }
  };

  const handleControlButtonClick = (buttonId: ButtonId, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.nativeEvent.isTrusted) return;

    const cooldownMs = Math.max(0, config.buttonCooldownMs ?? 1200);
    const now = Date.now();
    const lastAt = lastClickAtRef.current[buttonId] || 0;
    if (cooldownMs > 0 && now - lastAt < cooldownMs) {
      return;
    }

    lastClickAtRef.current[buttonId] = now;
    if (cooldownMs > 0) {
      setCooldownButtons((prev) => ({ ...prev, [buttonId]: true }));
      const existing = cooldownTimersRef.current[buttonId];
      if (existing) window.clearTimeout(existing);
      cooldownTimersRef.current[buttonId] = window.setTimeout(() => {
        setCooldownButtons((prev) => ({ ...prev, [buttonId]: false }));
      }, cooldownMs);
    }

    const buttons = config.buttons || DEFAULT_BUTTON_SETTINGS;
    const btnCfg = buttons[buttonId];
    const hasValidUrl = Boolean(btnCfg.enabled && /^https?:\/\//i.test(btnCfg.url.trim()));

    if (hasValidUrl) {
      const modeText = btnCfg.openInNewTab ? 'New Tab' : 'Current Tab';
      const playbackSuffix =
        btnCfg.openInNewTab && btnCfg.triggerPlayback ? ' + Video Playback' : '';
      onActionTriggered(
        `#${buttonId} (${btnCfg.label}) -> Simulated ${modeText} link (${btnCfg.url.trim()})${playbackSuffix}`
      );
      if (btnCfg.openInNewTab && btnCfg.triggerPlayback) {
        triggerPlayback(`#${buttonId} (${btnCfg.label})`);
      }
      return;
    }

    if (btnCfg.triggerPlayback) {
      triggerPlayback(`#${buttonId} (${btnCfg.label})`);
    } else {
      onActionTriggered(`#${buttonId} (${btnCfg.label}) -> Link disabled & playback unchecked`);
    }
  };

  const showLoader = isLoading || forceLoading;
  const showErrorOverlay = !showLoader && !isPlaying && failureCount > 0;
  const isMobile = viewport === 'mobile';

  const displayTitle =
    config.title === '{{TITLE}}'
      ? 'Coastal Highway Sunrise — Full 4K Scenic Drive'
      : config.title;
  const displayCaption =
    config.caption === '{{CAPTION}}'
      ? 'Watch the complete uncut golden-hour coastal drive in crisp 1080p HD'
      : config.caption;
  const hasValidThumbnail =
    Boolean(config.imageUrl) &&
    (config.imageUrl === '{{IMAGE_URL}}' || isSupportedImageUrl(config.imageUrl));

  return (
    <div className="w-full flex justify-center">
      <div
        className={`w-full transition-all duration-300 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${
          isMobile ? 'max-w-[390px]' : 'max-w-[820px]'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[240px]">
            blogger-post-preview.blogspot.com
          </span>
          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
            {isMobile ? '390px' : '800px'}
          </span>
        </div>

        <div className={isMobile ? 'p-3' : 'p-5'}>
          {/* 1. Top Banner Ad */}
          <AdSlotPreview
            label="Advertisement"
            title="1. Top Banner Ad (Beginning of Post)"
            slotId="#ad-top-banner"
            sizeText={isMobile ? '320 × 50' : '728 × 90'}
            isBanner
            isMobile={isMobile}
            simulateFallback={simulateFallback}
            fallbackTitle="Sponsored Banner"
            fallbackDesc="Ad content unavailable right now."
          />

          {/* Blogger Thumbnail Separator */}
          <div className="my-4 text-center">
            {hasValidThumbnail && !imgError ? (
              <img
                src={config.imageUrl}
                alt={displayTitle}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[240px] mx-auto rounded-[10px] shadow-md object-contain"
              />
            ) : (
              <div className="max-w-md mx-auto py-4 px-4 rounded-[10px] border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
                Thumbnail preview unavailable
              </div>
            )}
            <p className="mt-2 text-sm text-slate-600">{displayCaption}</p>
          </div>

          {/* 2. Native Ad (Below Thumbnail) */}
          <AdSlotPreview
            label="Sponsored"
            title="2. Native Ad (Below Thumbnail)"
            slotId="#container-390299b40362a820b12f3db553aff06f"
            sizeText="Fluid Native"
            isMobile={isMobile}
            simulateFallback={simulateFallback}
            fallbackTitle="Recommended Partner"
            fallbackDesc="Native placement reserved for lightweight display."
          />

          {/* Attractive Bengali Heading Above Player */}
          <div className="text-center mt-5 mb-3">
            <h2 className="font-bold text-slate-900 text-xl leading-snug">
              সম্পূর্ণ ভিডিওটি দেখতে প্লে বাটনে ক্লিক করুন
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              মোবাইল ও ডেস্কটপ উপযোগী এইচডি প্লেব্যাক
            </p>
          </div>

          {/* Video Player */}
          <div
            onClick={() => {
              if (!isPlaying) triggerPlayback('Player Frame');
            }}
            style={{ aspectRatio: ratioCss, maxWidth: `min(100%, ${containerMaxWidth})` }}
            className="relative w-full my-3 mx-auto bg-black rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.22)] overflow-hidden cursor-pointer select-none group"
          >
            {/* Live Random Viewer Badge (1577 - 5285) */}
            <div className="absolute top-3 left-3 z-[25] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md pointer-events-none select-none">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.85)] animate-pulse" />
              <span
                className={`tabular-nums transition-all duration-300 ${
                  viewerUpdating ? 'opacity-0 -translate-y-0.5' : 'opacity-100 translate-y-0'
                }`}
              >
                {toBengaliDigits(viewerCount.toLocaleString('en-US'))}
              </span>
              <span>জন দেখছেন</span>
            </div>

            {!isPlaying && (
              <>
                {hasValidThumbnail && !imgError ? (
                  <img
                    ref={imgRef}
                    src={config.imageUrl}
                    alt={displayTitle}
                    referrerPolicy="no-referrer"
                    onLoad={syncImageDimensions}
                    onError={() => {
                      setImgError(true);
                      setRatioCss('16 / 9');
                      setContainerMaxWidth('100%');
                    }}
                    className="w-full h-full object-contain object-center block"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-900 text-slate-300">
                    <Tv className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-medium">
                      {hasValidThumbnail
                        ? 'Unable to load thumbnail image'
                        : 'Enter a valid image URL (JPG, JPEG, PNG, or WebP)'}
                    </span>
                  </div>
                )}

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.08)_55%,rgba(0,0,0,0.36)_100%)] pointer-events-none"
                />
              </>
            )}

            <video
              ref={videoRef}
              playsInline
              controls
              preload="none"
              poster={config.imageUrl}
              onError={() => {
                setIsLoading(false);
                setIsPlaying(false);
                setFailureCount((prev) => prev + 1);
              }}
              className={`absolute inset-0 w-full h-full object-contain bg-black z-20 ${
                isPlaying ? 'block' : 'hidden'
              }`}
            />

            {/* Centered Play Button + Bengali Instruction Below */}
            {!showLoader && !showErrorOverlay && !isPlaying && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20 pointer-events-none">
                <button
                  type="button"
                  aria-label="ভিডিও চালু করুন"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerPlayback('playIcon');
                  }}
                  className={`relative rounded-full border-2 border-white/95 text-white flex items-center justify-center bg-gradient-to-br from-[#6e8efb]/95 to-[#a777e3]/95 shadow-[0_0_26px_rgba(110,142,251,0.7),0_0_48px_rgba(167,119,227,0.45),0_10px_24px_rgba(0,0,0,0.38)] transition-all duration-300 group-hover:scale-110 cursor-pointer pointer-events-auto ${
                    isMobile ? 'w-[62px] h-[62px]' : 'w-[78px] h-[78px]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 w-[calc(100%+20px)] h-[calc(100%+20px)] rounded-full border-2 border-white/75 shadow-[0_0_20px_rgba(110,142,251,0.55)] preview-play-ring pointer-events-none"
                  />
                  <Play className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} fill-current ml-1`} />
                  {!isUnlocked && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-white text-[11px] flex items-center justify-center shadow"
                    >
                      🔒
                    </span>
                  )}
                </button>
                <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-max max-w-[min(82vw,290px)] px-3.5 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold text-center shadow-lg">
                  ভিডিও চালু করতে উপরের প্লে বাটনে চাপ দিন
                </div>
              </div>
            )}

            {/* Friendly Bengali Loading Overlay (no fake progress bar) */}
            {showLoader && (
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[14px] flex items-center justify-center p-5 z-30">
                <div className="w-full max-w-[330px] px-5 py-6 rounded-2xl bg-white/12 border border-white/25 shadow-[0_18px_42px_rgba(0,0,0,0.35)] flex flex-col items-center text-center gap-2.5 text-white">
                  <div className="w-11 h-11 rounded-full border-[3.5px] border-white/20 border-t-[#6e8efb] border-r-[#a777e3] preview-spinner" />
                  <div className="text-base font-bold leading-snug">
                    ভিডিও লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...
                  </div>
                  <div className="text-xs text-white/85">
                    প্লেব্যাকের জন্য ভিডিও সোর্স সংযুক্ত করা হচ্ছে
                  </div>
                </div>
              </div>
            )}

            {/* Real Failure Retry / Repeated Failure Screen */}
            {showErrorOverlay && (
              <div className="absolute inset-0 bg-slate-950/72 backdrop-blur-[14px] flex items-center justify-center p-5 z-30">
                <div className="w-full max-w-[340px] px-5 py-6 rounded-2xl bg-white/12 border border-white/25 shadow-[0_18px_42px_rgba(0,0,0,0.35)] flex flex-col items-center text-center gap-2.5 text-white">
                  <div className="text-base font-bold leading-snug">
                    {failureCount >= 2
                      ? 'দুঃখিত, বারবার চেষ্টা করেও ভিডিওটি চালু করা যায়নি'
                      : 'ভিডিওটি লোড হতে ব্যর্থ হয়েছে'}
                  </div>
                  <div className="text-xs text-white/85 leading-relaxed">
                    {failureCount >= 2
                      ? 'অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা কিছুক্ষণ পর পুনরায় চেষ্টা করুন।'
                      : 'সংযোগে সাময়িক ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerPlayback('retryPlayBtn');
                    }}
                    className="mt-1 px-5 py-2 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white text-xs font-bold border border-white/30 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {failureCount >= 2 ? 'পুনরায় চেষ্টা করুন' : 'আবার চেষ্টা করুন'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center flex-wrap gap-3.5 my-4">
            <button
              type="button"
              onClick={(e) => handleControlButtonClick('btn1', e)}
              className={`px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap touch-manipulation ${
                cooldownButtons.btn1 ? 'opacity-80 scale-[0.98] pointer-events-none' : ''
              }`}
            >
              Play Now
            </button>
            <button
              type="button"
              onClick={(e) => handleControlButtonClick('btn2', e)}
              className={`px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap touch-manipulation ${
                cooldownButtons.btn2 ? 'opacity-80 scale-[0.98] pointer-events-none' : ''
              }`}
            >
              Watch Now
            </button>
            <button
              type="button"
              onClick={(e) => handleControlButtonClick('btn3', e)}
              className={`px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap touch-manipulation ${
                cooldownButtons.btn3 ? 'opacity-80 scale-[0.98] pointer-events-none' : ''
              }`}
            >
              Play &amp; Watch
            </button>
          </div>

          {/* Gentle Floating Downward Scroll Indicator */}
          <div className="flex justify-center my-4">
            <a
              href="#previewPostDescription"
              className="inline-flex flex-col items-center gap-1 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#6e8efb] hover:border-indigo-200 text-xs font-semibold animate-bounce"
            >
              <span>নিচে Scroll করুন</span>
              <ArrowDown className="w-4 h-4 text-[#6e8efb]" />
            </a>
          </div>

          {/* 3. Player Bottom Ad */}
          <AdSlotPreview
            label="Advertisement"
            title="3. Player Bottom Ad (Directly Below Player)"
            slotId="#ad-player-bottom"
            sizeText={isMobile ? '320 × 50 / Fluid' : '728 × 90 / Fluid'}
            isMobile={isMobile}
            simulateFallback={simulateFallback}
            fallbackTitle="Player Sponsor"
            fallbackDesc="Video playback remains unaffected."
          />

          {/* Post Description with 4. In-Content Ad */}
          <section
            id="previewPostDescription"
            className="my-6 p-5 border border-slate-200 rounded-xl bg-white"
          >
            <h2 className="font-display font-bold text-slate-900 text-xl mb-2">{displayTitle}</h2>
            <p className="text-sm text-slate-600 mb-3">{displayCaption}</p>

            <AdSlotPreview
              label="Sponsored Content"
              title="4. In-Content Ad (Middle of Description)"
              slotId="#ad-in-content"
              sizeText="Responsive In-Article"
              isMobile={isMobile}
              simulateFallback={simulateFallback}
              fallbackTitle="Sponsored Highlight"
              fallbackDesc="Content continues smoothly below."
            />

            <p className="text-sm text-slate-600">
              পোর্ট্রেট, স্কয়ার কিংবা ল্যান্ডস্কেপ—যেকোনো থাম্বনেইল অনুপাতের সাথে স্বয়ংক্রিয়ভাবে মানিয়ে
              নেওয়া পরিচ্ছন্ন ও দ্রুতগতির ভিডিও প্লেয়ার।
            </p>
          </section>

          {/* Related Videos with 5. Related Content Ad */}
          <section className="my-6">
            <h3 className="font-display font-bold text-slate-900 text-lg mb-3">
              সম্পর্কিত আরও ভিডিও
            </h3>
            <div className={`grid gap-3.5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Featured Stream
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900 truncate">{displayTitle}</div>
                  <div className="text-xs text-slate-500 mt-0.5">এইচডি স্ট্রিম · দেখার জন্য প্রস্তুত</div>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Full Version
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900 truncate">{displayCaption}</div>
                  <div className="text-xs text-slate-500 mt-0.5">মোবাইল অপ্টিমাইজড</div>
                </div>
              </div>
            </div>

            <AdSlotPreview
              label="Sponsored Suggestion"
              title="5. Related Content Ad (Between Related Videos)"
              slotId="#ad-related-content"
              sizeText="Responsive Feed Slot"
              isMobile={isMobile}
              simulateFallback={simulateFallback}
              fallbackTitle="More to Explore"
              fallbackDesc="Additional video suggestions above and below."
            />

            <div className={`grid gap-3.5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Highlights
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900">
                    জনপ্রিয় ক্লিপ ও হাইলাইটস দেখুন
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">দ্রুত লোডিং</div>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Full Cut
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900">
                    সম্পূর্ণ সংস্করণ উপভোগ করুন
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">ফুল রেজোলিউশন</div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Bottom Banner Ad */}
          <AdSlotPreview
            label="Advertisement"
            title="6. Bottom Banner Ad (End of Post)"
            slotId="#ad-bottom-banner"
            sizeText={isMobile ? '320 × 50' : '728 × 90'}
            isBanner
            isMobile={isMobile}
            simulateFallback={simulateFallback}
            fallbackTitle="End of Post Banner"
            fallbackDesc="Thanks for watching."
          />
        </div>
      </div>

      {/* Reward Ad-Watch & Timer Unlock Preview Modal */}
      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="বন্ধ করুন"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-base flex items-center justify-center cursor-pointer"
            >
              ×
            </button>

            <div className="pr-8">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-1.5">
                নিরাপদ ভিডিও আনলক
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                ভিডিওটি আনলক করতে নিচের নিয়মগুলো অনুসরণ করুন:
              </h3>
            </div>

            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-xl border ${
                  step1Done
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-indigo-400 bg-indigo-50/50'
                }`}
              >
                <p className="text-xs font-semibold text-slate-800 mb-2.5 leading-relaxed">
                  ধাপ ১: প্রথম বিজ্ঞাপনটি সম্পূর্ণ দেখুন (অবশিষ্ট সময়:{' '}
                  <span className="font-bold text-indigo-700">
                    {toBengaliDigits(step1Remaining)}
                  </span>{' '}
                  সেকেন্ড)
                </p>
                <button
                  type="button"
                  disabled={step1Done || activeCountingStep !== null}
                  onClick={() => startUnlockStep(1)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    step1Done
                      ? 'bg-emerald-600 text-white cursor-default'
                      : activeCountingStep === 1
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white shadow'
                  }`}
                >
                  {step1Done
                    ? 'ধাপ ১ সম্পন্ন হয়েছে ✓'
                    : activeCountingStep === 1
                    ? `বিজ্ঞাপন যাচাই হচ্ছে (${toBengaliDigits(step1Remaining)} সে.)`
                    : 'বিজ্ঞাপন ১ দেখুন'}
                </button>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  step2Done
                    ? 'border-emerald-500 bg-emerald-50'
                    : step1Done
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className="text-xs font-semibold text-slate-800 mb-2.5 leading-relaxed">
                  ধাপ ২: দ্বিতীয় বিজ্ঞাপনটি সম্পন্ন করুন (অবশিষ্ট সময়:{' '}
                  <span className="font-bold text-indigo-700">
                    {toBengaliDigits(step2Remaining)}
                  </span>{' '}
                  সেকেন্ড)
                </p>
                <button
                  type="button"
                  disabled={!step1Done || step2Done || activeCountingStep !== null}
                  onClick={() => startUnlockStep(2)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    step2Done
                      ? 'bg-emerald-600 text-white cursor-default'
                      : !step1Done || activeCountingStep === 2
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white shadow'
                  }`}
                >
                  {step2Done
                    ? 'ধাপ ২ সম্পন্ন হয়েছে ✓'
                    : activeCountingStep === 2
                    ? `বিজ্ঞাপন যাচাই হচ্ছে (${toBengaliDigits(step2Remaining)} সে.)`
                    : 'বিজ্ঞাপন ২ দেখুন'}
                </button>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs font-semibold text-center leading-relaxed ${
                isUnlocked
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {isUnlocked
                ? 'সফলভাবে সম্পন্ন হয়েছে! এখন প্লে বাটনে ক্লিক করে ভিডিও উপভোগ করুন।'
                : step1Done
                ? 'ধাপ ১ সম্পন্ন! ভিডিও আনলক করতে এবার ধাপ ২ সম্পন্ন করুন।'
                : 'উভয় ধাপ সম্পন্ন না হওয়া পর্যন্ত প্লে বাটনটি লক থাকবে।'}
            </div>

            <button
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                setModalOpen(false);
                triggerPlayback('Unlocked Play Button');
              }}
              className={`w-full py-2.5 px-5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                isUnlocked
                  ? 'bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white shadow-md hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isUnlocked ? 'এখন ভিডিও প্লে করুন ▶' : 'ভিডিও আনলক করতে ধাপ ২টি সম্পন্ন করুন'}
            </button>
          </div>
        </div>
      )}
      {/* Polite Bengali Ad-Blocker Notice Preview */}
      {simulateAdBlock && adBlockEnabled && (
        <div
          onClick={(e) => {
            if (adBlockDismissible && e.target === e.currentTarget) {
              onCloseAdBlockTest();
            }
          }}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-3.5 text-slate-800">
            <span className="inline-block px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold">
              বিনীত অনুরোধ · অ্যাড-ব্লকার শনাক্ত
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              দয়া করে আপনার অ্যাড-ব্লকার বন্ধ করুন
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              আমাদের সাইটের সমস্ত ভিডিও এবং কনটেন্ট সম্পূর্ণ বিনামূল্যে সবার জন্য উন্মুক্ত রাখতে বিজ্ঞাপনই একমাত্র সহায়ক। কনটেন্টটি দেখতে অনুগ্রহ করে এই পেজের জন্য আপনার অ্যাড-ব্লকারটি সাময়িকভাবে বন্ধ করে পেজটি রিফ্রেশ করুন।
            </p>
            <ol className="list-decimal pl-5 py-3 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 leading-relaxed">
              <li>আপনার ব্রাউজারের অ্যাড-ব্লকার এক্সটেনশন আইকনে ক্লিক করুন।</li>
              <li>এই ওয়েবসাইটের জন্য অ্যাড-ব্লকারটি বন্ধ বা পজ (Pause / Whitelist) করুন।</li>
              <li>নিচের বাটনে ক্লিক করে পেজটি রিফ্রেশ করুন।</li>
            </ol>
            {adBlockRecheckMsg && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold text-center">
                {adBlockRecheckMsg}
              </div>
            )}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onCloseAdBlockTest();
                  onActionTriggered('Ad-Block Notice: simulated page refresh after disabling ad-blocker.');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white text-sm font-bold shadow cursor-pointer"
              >
                আমি বন্ধ করেছি, পেজ রিফ্রেশ করুন
              </button>
              <button
                type="button"
                onClick={() =>
                  setAdBlockRecheckMsg(
                    'এখনও অ্যাড-ব্লকার সক্রিয় রয়েছে। অনুগ্রহ করে এই সাইটের জন্য অ্যাড-ব্লকার বন্ধ করে আবার চেষ্টা করুন।'
                  )
                }
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                পুনরায় যাচাই করুন
              </button>
              {adBlockDismissible && (
                <button
                  type="button"
                  onClick={onCloseAdBlockTest}
                  className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  আপাতত বন্ধ রাখুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
