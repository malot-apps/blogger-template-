import React, { useMemo, useState } from 'react';
import { Check, Copy, Loader2, Monitor, RotateCcw, ShieldAlert, Smartphone } from 'lucide-react';
import { AuditPanel } from './components/AuditPanel';
import { CodeInspector } from './components/CodeInspector';
import { LivePreview } from './components/LivePreview';
import { buildSmartAdsBloggerTemplate, TemplateConfig } from './template/bloggerTemplate';

interface SamplePreset {
  id: 'landscape' | 'portrait' | 'square';
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
];

type ActiveTab = 'preview' | 'code' | 'audit';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPreset, setSelectedPreset] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [exportRawPlaceholders, setExportRawPlaceholders] = useState<boolean>(true);
  const [forceLoading, setForceLoading] = useState<boolean>(false);
  const [simulateFallback, setSimulateFallback] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [config, setConfig] = useState<TemplateConfig>({
    title: SAMPLE_PRESETS[0].title,
    caption: SAMPLE_PRESETS[0].caption,
    imageUrl: SAMPLE_PRESETS[0].url,
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
        }
      : config;

    return buildSmartAdsBloggerTemplate(exportConfig);
  }, [config, exportRawPlaceholders]);

  const applyPreset = (preset: SamplePreset) => {
    setSelectedPreset(preset.id);
    setConfig({
      imageUrl: preset.url,
      title: preset.title,
      caption: preset.caption,
    });
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

  const handleDownloadHtml = () => {
    const blob = new Blob([exportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blogger-smart-ads-template.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleActionTriggered = (source: string) => {
    setActionNotice(
      `Playback loading started via ${source} (non-intrusive mode: zero redirects or popups).`
    );
    window.setTimeout(() => {
      setActionNotice(null);
    }, 3000);
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

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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

          {/* Viewport & Smart Ad State */}
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
              <span>{forceLoading ? 'Hide Loading Overlay' : 'Inspect Loading Overlay'}</span>
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
              <span className="text-xs font-medium text-slate-600">Thumbnail URL</span>
              <input
                type="text"
                value={config.imageUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, imageUrl: e.target.value }))}
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
