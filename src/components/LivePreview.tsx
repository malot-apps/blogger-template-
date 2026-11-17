import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Play, Tv } from 'lucide-react';
import { TemplateConfig } from '../template/bloggerTemplate';

interface LivePreviewProps {
  config: TemplateConfig;
  viewport: 'desktop' | 'mobile';
  forceLoading: boolean;
  simulateFallback: boolean;
  simulatePlaybackError: boolean;
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

export const LivePreview: React.FC<LivePreviewProps> = ({
  config,
  viewport,
  forceLoading,
  simulateFallback,
  simulatePlaybackError,
  onImageMetrics,
  onActionTriggered,
}) => {
  const [ratioCss, setRatioCss] = useState<string>('16 / 9');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loadingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [config.imageUrl]);

  useEffect(() => {
    setFailureCount(0);
    setIsPlaying(false);
    setIsLoading(false);
  }, [config.videoUrl, simulatePlaybackError]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const syncImageDimensions = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setRatioCss(`${w} / ${h}`);
    const mode = h > w ? 'portrait' : w === h ? 'square' : 'landscape';
    setOrientation(mode);
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
            <img
              src={config.imageUrl}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[240px] mx-auto rounded-[10px] shadow-md object-contain"
            />
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
            style={{ aspectRatio: ratioCss }}
            className={`relative w-full my-3 mx-auto bg-black rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.22)] overflow-hidden cursor-pointer select-none group ${
              orientation === 'portrait'
                ? 'max-w-[420px]'
                : orientation === 'square'
                ? 'max-w-[560px]'
                : 'max-w-full'
            }`}
          >
            {!isPlaying && (
              <>
                {!imgError ? (
                  <img
                    ref={imgRef}
                    src={config.imageUrl}
                    alt={displayTitle}
                    referrerPolicy="no-referrer"
                    onLoad={syncImageDimensions}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain block transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-900 text-slate-300">
                    <Tv className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-medium">Unable to load custom image URL</span>
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
              className={`absolute inset-0 w-full h-full bg-black z-20 ${
                isPlaying ? 'block' : 'hidden'
              }`}
            />

            {/* Centered Play Button + Bengali Instruction Below */}
            {!showLoader && !showErrorOverlay && !isPlaying && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[46%] flex flex-col items-center gap-3.5 z-20 w-[min(90%,340px)] pointer-events-none">
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
                </button>
                <div className="px-3.5 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold text-center shadow-lg">
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
              onClick={() => triggerPlayback('#btn1 (Play Now)')}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap"
            >
              Play Now
            </button>
            <button
              type="button"
              onClick={() => triggerPlayback('#btn2 (Watch Now)')}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap"
            >
              Watch Now
            </button>
            <button
              type="button"
              onClick={() => triggerPlayback('#btn3 (Play & Watch)')}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap"
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
    </div>
  );
};
