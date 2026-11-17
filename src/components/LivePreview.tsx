import React, { useEffect, useRef, useState } from 'react';
import { Play, Tv } from 'lucide-react';
import { TemplateConfig } from '../template/bloggerTemplate';

interface LivePreviewProps {
  config: TemplateConfig;
  viewport: 'desktop' | 'mobile';
  forceLoading: boolean;
  simulateFallback: boolean;
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
  onImageMetrics,
  onActionTriggered,
}) => {
  const [ratioCss, setRatioCss] = useState<string>('16 / 9');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const loadingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [config.imageUrl]);

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

  const triggerSimulatedPlay = (source: string) => {
    setIsLoading(true);
    onActionTriggered(source);
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }
    loadingTimerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 2800);
  };

  const showLoader = isLoading || forceLoading;
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
              className="max-w-full max-h-[260px] mx-auto rounded-[10px] shadow-md object-contain"
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

          {/* Video Player */}
          <div
            onClick={() => triggerSimulatedPlay('Player Frame')}
            style={{ aspectRatio: ratioCss }}
            className={`relative w-full my-5 mx-auto bg-black rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.22)] overflow-hidden cursor-pointer select-none group ${
              orientation === 'portrait'
                ? 'max-w-[420px]'
                : orientation === 'square'
                ? 'max-w-[560px]'
                : 'max-w-full'
            }`}
          >
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
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.05)_55%,rgba(0,0,0,0.28)_100%)] pointer-events-none"
            />

            {!showLoader && (
              <button
                type="button"
                aria-label="Play video"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSimulatedPlay('playIcon');
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 text-white flex items-center justify-center bg-gradient-to-br from-[#6e8efb]/95 to-[#a777e3]/95 shadow-[0_0_26px_rgba(110,142,251,0.65),0_0_48px_rgba(167,119,227,0.4),0_10px_24px_rgba(0,0,0,0.38)] transition-all duration-300 group-hover:scale-110 cursor-pointer z-20 ${
                  isMobile ? 'w-[62px] h-[62px]' : 'w-[78px] h-[78px]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 w-[calc(100%+20px)] h-[calc(100%+20px)] rounded-full border-2 border-white/75 shadow-[0_0_20px_rgba(110,142,251,0.55)] preview-play-ring pointer-events-none"
                />
                <Play className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} fill-current ml-1`} />
              </button>
            )}

            {showLoader && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[14px] flex items-center justify-center p-5 z-30">
                <div className="w-full max-w-[310px] px-5 py-6 rounded-2xl bg-white/12 border border-white/25 shadow-[0_18px_42px_rgba(0,0,0,0.35)] flex flex-col items-center text-center gap-3 text-white">
                  <div className="w-12 h-12 rounded-full border-[3.5px] border-white/20 border-t-[#6e8efb] border-r-[#a777e3] preview-spinner" />
                  <div className="text-base font-bold tracking-wide">
                    Loading video stream...
                  </div>
                  <div className="text-xs text-white/80 -mt-1.5">Preparing HD playback</div>
                  <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#6e8efb] via-[#a777e3] to-[#6e8efb] animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center flex-wrap gap-3.5 my-5">
            <button
              type="button"
              onClick={() => triggerSimulatedPlay('#btn1 (Play Now)')}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap"
            >
              Play Now
            </button>
            <button
              type="button"
              onClick={() => triggerSimulatedPlay('#btn2 (Watch Now)')}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap"
            >
              Watch Now
            </button>
            <button
              type="button"
              onClick={() => triggerSimulatedPlay('#btn3 (Play & Watch)')}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6e8efb] to-[#a777e3] text-white font-bold text-base shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all cursor-pointer whitespace-nowrap"
            >
              Play &amp; Watch
            </button>
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

          {/* Post Description with 4. In-Content Ad in the middle */}
          <section className="my-6 p-5 border border-slate-200 rounded-xl bg-white">
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
              Enjoy uninterrupted, mobile-optimized playback that automatically adapts to portrait,
              square, and widescreen thumbnails without cropping or distortion.
            </p>
          </section>

          {/* Related Videos with 5. Related Content Ad between them */}
          <section className="my-6">
            <h3 className="font-display font-bold text-slate-900 text-lg mb-3">Related Videos</h3>
            <div className={`grid gap-3.5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Featured Stream
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900 truncate">{displayTitle}</div>
                  <div className="text-xs text-slate-500 mt-0.5">HD Stream · Ready to Play</div>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Full Version
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900 truncate">{displayCaption}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Adaptive Quality · Mobile Ready</div>
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
                  <div className="text-sm font-bold text-slate-900">Watch Highlights &amp; Clips</div>
                  <div className="text-xs text-slate-500 mt-0.5">Instant Playback</div>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-bold text-[#6e8efb]">
                  Behind the Scenes
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-slate-900">Extended Editorial Cut</div>
                  <div className="text-xs text-slate-500 mt-0.5">Full Resolution</div>
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
