import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  Monitor,
  RotateCcw,
  ShieldAlert,
  ShieldBan,
  Smartphone,
} from 'lucide-react';
import { AuditPanel } from './components/AuditPanel';
import { CodeInspector } from './components/CodeInspector';
import { LivePreview } from './components/LivePreview';
import {
  buildSmartAdsBloggerTemplate,
  ButtonClickSetting,
  ButtonId,
  DEFAULT_ADBLOCK_DETECTOR,
  DEFAULT_BUTTON_SETTINGS,
  DEFAULT_REWARD_UNLOCK,
  extractSourceBlogPost,
  isSupportedImageUrl,
  TemplateConfig,
} from './template/bloggerTemplate';

interface SamplePreset {
  id: 'landscape' | 'portrait' | 'square' | 'classic43' | 'poster23';
  label: string;
  url: string;
  title: string;
  caption: string;
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'landscape',
    label: '16:9',
    url: '/src/assets/images/thumb_landscape_cinema_1794887436592.jpg',
    title: 'Coastal Highway Sunrise — Full 4K Scenic Drive',
    caption: 'Watch the complete uncut golden-hour coastal drive in crisp 1080p HD',
  },
  {
    id: 'portrait',
    label: '9:16',
    url: '/src/assets/images/thumb_vertical_reel_1794888324898.jpg',
    title: 'Mountain Lake Dock Sunrise — Vertical 9:16 Reel',
    caption: 'Vertical 9:16 video thumbnail adapted automatically with zero cropping',
  },
  {
    id: 'square',
    label: '1:1',
    url: '/src/assets/images/thumb_square_editorial_1794887437482.jpg',
    title: 'Nordic Pour-Over Craft — 1:1 Square Stream',
    caption: 'Square editorial stream adapted automatically to 1:1 thumbnail ratio',
  },
  {
    id: 'classic43',
    label: '4:3',
    url: '/src/assets/images/thumb_classic_4_3.png',
    title: 'Coastal Overlook — Classic 4:3 PNG Stream',
    caption: 'PNG 4:3 thumbnail dynamically matched without cropping or distortion',
  },
  {
    id: 'poster23',
    label: '2:3',
    url: '/src/assets/images/thumb_poster_2_3.webp',
    title: 'Studio Portrait — 2:3 WebP Feature',
    caption: 'WebP 2:3 vertical thumbnail sized smoothly for desktop and mobile',
  },
];

type ActiveTab = 'preview' | 'code' | 'audit';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPreset, setSelectedPreset] = useState<SamplePreset['id']>('landscape');
  const [exportRawPlaceholders, setExportRawPlaceholders] = useState<boolean>(true);
  const [forceLoading, setForceLoading] = useState<boolean>(false);
  const [simulateFallback, setSimulateFallback] = useState<boolean>(false);
  const [simulateAdBlock, setSimulateAdBlock] = useState<boolean>(false);
  const [simulatePlaybackError, setSimulatePlaybackError] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [sourcePostHtml, setSourcePostHtml] = useState<string>('');
  const [sourceParseSummary, setSourceParseSummary] = useState<string | null>(null);

  const [config, setConfig] = useState<TemplateConfig>({
    title: SAMPLE_PRESETS[0].title,
    caption: SAMPLE_PRESETS[0].caption,
    imageUrl: SAMPLE_PRESETS[0].url,
    videoUrl: '',
    metaDescription: '',
    canonicalUrl: '',
    buttonCooldownMs: 1200,
    buttons: DEFAULT_BUTTON_SETTINGS,
    rewardUnlock: DEFAULT_REWARD_UNLOCK,
    adBlockDetector: DEFAULT_ADBLOCK_DETECTOR,
  });

  const [imageMetrics, setImageMetrics] = useState({
    width: 1376,
    height: 768,
    ratioText: '16 : 9',
    mode: 'Landscape',
  });

  const exportHtml = useMemo(() => {
    const exportConfig: TemplateConfig = exportRawPlaceholders
      ? {
          title: '{{TITLE}}',
          caption: '{{CAPTION}}',
          imageUrl: '{{IMAGE_URL}}',
          videoUrl: config.videoUrl,
          metaDescription: config.metaDescription,
          canonicalUrl: config.canonicalUrl,
          buttonCooldownMs: config.buttonCooldownMs,
          buttons: config.buttons,
          rewardUnlock: config.rewardUnlock,
          adBlockDetector: config.adBlockDetector,
        }
      : config;

    return buildSmartAdsBloggerTemplate(exportConfig);
  }, [config, exportRawPlaceholders]);

  const applyPreset = (preset: SamplePreset) => {
    setSelectedPreset(preset.id);
    setConfig((prev) => ({
      ...prev,
      imageUrl: preset.url,
      title: preset.title,
      caption: preset.caption,
    }));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportHtml);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setActionNotice('Clipboard blocked — switch to Single-File HTML tab to copy manually.');
    }
  };

  const handleOptimizeSourcePost = () => {
    if (!sourcePostHtml.trim()) {
      setSourceParseSummary('Paste a source blog post HTML snippet first.');
      return;
    }

    const parsed = extractSourceBlogPost(sourcePostHtml);
    setConfig((prev) => ({
      ...prev,
      title: parsed.title || prev.title,
      caption: parsed.caption || prev.caption,
      imageUrl: parsed.primaryJpgUrl || prev.imageUrl,
    }));

    const jpgCount = parsed.jpgImages.length;
    const skippedCount = parsed.skippedNonJpgCount;
    setSourceParseSummary(
      jpgCount > 0
        ? `Extracted ${jpgCount} JPG image${jpgCount > 1 ? 's' : ''} · Skipped ${skippedCount} PNG/non-JPG asset${skippedCount === 1 ? '' : 's'}.`
        : `No JPG images found · Skipped ${skippedCount} PNG/non-JPG asset${skippedCount === 1 ? '' : 's'}.`
    );
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([exportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blogger-bengali-cta-player-template.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateButtonSetting = (buttonId: ButtonId, patch: Partial<ButtonClickSetting>) => {
    setConfig((prev) => {
      const currentButtons = prev.buttons || DEFAULT_BUTTON_SETTINGS;
      return {
        ...prev,
        buttons: {
          ...currentButtons,
          [buttonId]: {
            ...currentButtons[buttonId],
            ...patch,
          },
        },
      };
    });
  };

  const handleActionTriggered = (source: string) => {
    if (source.startsWith('#btn')) {
      setActionNotice(source);
    } else {
      setActionNotice(
        `Action via ${source}: genuine playback handler triggered (click again on failure to inspect repeated-error state).`
      );
    }
    window.setTimeout(() => {
      setActionNotice(null);
    }, 3600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('preview');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            StreamPress Template
          </a>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Live Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'code'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Single-File HTML
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Ad &amp; ID Audit
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML' : 'Copy HTML Template'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
        <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6">
          {/* Aspect Ratio Tester */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Auto-Ratio Thumbnail Test
              </h2>
              <span className="font-mono text-xs text-blue-600 font-semibold tabular-nums">
                {imageMetrics.ratioText}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPreset === preset.id && config.imageUrl === preset.url
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 tabular-nums">
              <span>Detected: {imageMetrics.mode}</span>
              <span className="font-mono">
                {imageMetrics.width} × {imageMetrics.height}
              </span>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Viewport & State Controls */}
          <div className="space-y-3">
            <h2 className="font-display text-sm font-bold text-slate-900">
              Viewport &amp; State Tests
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  viewport === 'desktop'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  viewport === 'mobile'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile 390px</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setForceLoading((prev) => !prev)}
              className={`w-full min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                forceLoading
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Loader2 className={`w-3.5 h-3.5 ${forceLoading ? 'animate-spin' : ''}`} />
              <span>{forceLoading ? 'Hide Bengali Loading' : 'Inspect Bengali Loading'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSimulatePlaybackError((prev) => !prev)}
              className={`w-full min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                simulatePlaybackError
                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {simulatePlaybackError ? 'Error Test Active (Click Play)' : 'Enable Error Test'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSimulateFallback((prev) => !prev)}
              className={`w-full min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                simulateFallback
                  ? 'border-amber-600 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{simulateFallback ? 'Showing Ad Fallback State' : 'Test Ad Fallback State'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSimulateAdBlock((prev) => !prev)}
              className={`w-full min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                simulateAdBlock
                  ? 'border-orange-600 bg-orange-50 text-orange-800'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldBan className="w-3.5 h-3.5" />
              <span>
                {simulateAdBlock ? 'Showing Bengali Ad-Block Notice' : 'Test Bengali Ad-Block Notice'}
              </span>
            </button>
          </div>

          <hr className="border-slate-200" />

          {/* Source Blog Post Optimizer (JPG-Only) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Source Post Optimizer
              </h2>
              <span className="font-mono text-[11px] font-semibold text-emerald-700">
                JPG Only
              </span>
            </div>
            <textarea
              rows={3}
              value={sourcePostHtml}
              onChange={(e) => setSourcePostHtml(e.target.value)}
              placeholder="Paste raw Blogger source post HTML here (PNG & non-JPG assets are automatically excluded)..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600 resize-y"
            />
            <button
              type="button"
              onClick={handleOptimizeSourcePost}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Extract JPG &amp; Format Post
            </button>
            {sourceParseSummary && (
              <p className="text-[11px] font-medium text-slate-600 leading-snug">
                {sourceParseSummary}
              </p>
            )}
          </div>

          <hr className="border-slate-200" />

          {/* Post Fields & Export Mode */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">Blogger Placeholders</h2>
              <button
                type="button"
                onClick={() => applyPreset(SAMPLE_PRESETS[0])}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Post Title</span>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Post Caption</span>
              <input
                type="text"
                value={config.caption}
                onChange={(e) => setConfig((prev) => ({ ...prev, caption: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">
                Thumbnail URL (JPG / JPEG / PNG / WebP)
              </span>
              <input
                type="text"
                value={config.imageUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600"
              />
              {config.imageUrl &&
                config.imageUrl !== '{{IMAGE_URL}}' &&
                !isSupportedImageUrl(config.imageUrl) && (
                  <span className="block text-[11px] text-amber-700 font-medium">
                    Unsupported image URL scheme.
                  </span>
                )}
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Video Source URL (MP4/WebM)</span>
              <input
                type="text"
                placeholder="https://example.com/video.mp4"
                value={config.videoUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exportRawPlaceholders}
                onChange={(e) => setExportRawPlaceholders(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-xs text-slate-600 leading-snug">
                Keep <code className="font-mono text-slate-800">{'{{TITLE}}'}</code>,{' '}
                <code className="font-mono text-slate-800">{'{{IMAGE_URL}}'}</code>, and{' '}
                <code className="font-mono text-slate-800">{'{{CAPTION}}'}</code> tokens in exported
                HTML
              </span>
            </label>
          </div>

          <hr className="border-slate-200" />

          {/* SEO Meta Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">SEO Meta Tags</h2>
              <span className="font-mono text-[11px] text-slate-500">
                &lt;head&gt; injection
              </span>
            </div>

            <label className="block space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">Meta Description</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    (config.metaDescription || '').trim().length > 160
                      ? 'text-amber-600 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {(config.metaDescription || '').trim().length} / 160
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Write a concise summary of your Blogger video post (recommended 120–160 characters)..."
                value={config.metaDescription || ''}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, metaDescription: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 resize-y"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Canonical URL</span>
              <input
                type="url"
                placeholder="https://yourblog.blogspot.com/2025/01/video-post.html"
                value={config.canonicalUrl || ''}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, canonicalUrl: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600"
              />
              {Boolean((config.canonicalUrl || '').trim()) &&
                !/^https?:\/\/\S+$/i.test((config.canonicalUrl || '').trim()) && (
                  <span className="block text-[11px] text-amber-700 font-medium">
                    Enter a full http:// or https:// URL to inject &lt;link rel=&quot;canonical&quot;&gt;.
                  </span>
                )}
            </label>
          </div>

          <hr className="border-slate-200" />

          {/* Reward Ad-Watch & Timer Unlock System */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Reward Ad Unlock (2 Steps)
              </h2>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.rewardUnlock?.enabled ?? true}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      rewardUnlock: {
                        ...(prev.rewardUnlock || DEFAULT_REWARD_UNLOCK),
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-600">Step 1 Timer (sec)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={config.rewardUnlock?.step1DurationSec ?? 5}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      rewardUnlock: {
                        ...(prev.rewardUnlock || DEFAULT_REWARD_UNLOCK),
                        step1DurationSec: Math.max(1, Number(e.target.value) || 5),
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-600">Step 2 Timer (sec)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={config.rewardUnlock?.step2DurationSec ?? 5}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      rewardUnlock: {
                        ...(prev.rewardUnlock || DEFAULT_REWARD_UNLOCK),
                        step2DurationSec: Math.max(1, Number(e.target.value) || 5),
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-600">Step 1 Ad URL</span>
              <input
                type="url"
                value={config.rewardUnlock?.step1Url ?? DEFAULT_REWARD_UNLOCK.step1Url}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    rewardUnlock: {
                      ...(prev.rewardUnlock || DEFAULT_REWARD_UNLOCK),
                      step1Url: e.target.value,
                    },
                  }))
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-600">Step 2 Ad URL</span>
              <input
                type="url"
                value={config.rewardUnlock?.step2Url ?? DEFAULT_REWARD_UNLOCK.step2Url}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    rewardUnlock: {
                      ...(prev.rewardUnlock || DEFAULT_REWARD_UNLOCK),
                      step2Url: e.target.value,
                    },
                  }))
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </label>
          </div>

          <hr className="border-slate-200" />

          {/* Button Click & Ad Link System */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">Button Click System</h2>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {config.buttonCooldownMs ?? 1200}ms guard
              </span>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Duplicate-Click Cooldown (ms)</span>
              <input
                type="number"
                min={0}
                max={10000}
                step={100}
                value={config.buttonCooldownMs ?? 1200}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    buttonCooldownMs: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </label>

            {(['btn1', 'btn2', 'btn3'] as ButtonId[]).map((btnId) => {
              const btn = (config.buttons || DEFAULT_BUTTON_SETTINGS)[btnId];
              return (
                <div
                  key={btnId}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-800">
                      #{btnId} <span className="font-normal text-slate-500">({btn.label})</span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={btn.enabled}
                        onChange={(e) =>
                          updateButtonSetting(btnId, { enabled: e.target.checked })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>Link Active</span>
                    </label>
                  </div>

                  <input
                    type="url"
                    placeholder="https://approved-ad-or-target-url.com"
                    value={btn.url}
                    onChange={(e) => updateButtonSetting(btnId, { url: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-600"
                  />

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => updateButtonSetting(btnId, { openInNewTab: true })}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          btn.openInNewTab
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        New Tab
                      </button>
                      <button
                        type="button"
                        onClick={() => updateButtonSetting(btnId, { openInNewTab: false })}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          !btn.openInNewTab
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Same Tab
                      </button>
                    </div>

                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={btn.triggerPlayback}
                        onChange={(e) =>
                          updateButtonSetting(btnId, { triggerPlayback: e.target.checked })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>Play Video</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-slate-200" />

          {/* Ad-Block Detection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Ad-Block Detection
              </h2>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.adBlockDetector?.enabled ?? true}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      adBlockDetector: {
                        ...(prev.adBlockDetector || DEFAULT_ADBLOCK_DETECTOR),
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>Enabled</span>
              </label>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Detects cosmetic and script-blocking extensions and displays a polite Bengali notice asking visitors to whitelist your blog.
            </p>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.adBlockDetector?.allowDismiss ?? false}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    adBlockDetector: {
                      ...(prev.adBlockDetector || DEFAULT_ADBLOCK_DETECTOR),
                      allowDismiss: e.target.checked,
                    },
                  }))
                }
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-xs text-slate-600 leading-snug">
                Allow visitor to dismiss notice temporarily
              </span>
            </label>
          </div>
        </aside>

        {/* Main Right Stage */}
        <main className="min-w-0 space-y-4">
          {actionNotice && (
            <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800 flex items-center justify-between gap-4">
              <span>{actionNotice}</span>
              <button
                type="button"
                onClick={() => setActionNotice(null)}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'preview' && (
            <LivePreview
              config={config}
              viewport={viewport}
              forceLoading={forceLoading}
              simulateFallback={simulateFallback}
              simulateAdBlock={simulateAdBlock}
              simulatePlaybackError={simulatePlaybackError}
              onCloseAdBlockTest={() => setSimulateAdBlock(false)}
              onImageMetrics={setImageMetrics}
              onActionTriggered={handleActionTriggered}
            />
          )}

          {activeTab === 'code' && (
            <CodeInspector
              htmlCode={exportHtml}
              copied={copied}
              onCopy={handleCopyCode}
              onDownload={handleDownloadHtml}
            />
          )}

          {activeTab === 'audit' && <AuditPanel />}
        </main>
      </div>
    </div>
  );
}
