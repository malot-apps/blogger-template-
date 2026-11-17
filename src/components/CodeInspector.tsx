import React from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';

interface CodeInspectorProps {
  htmlCode: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  htmlCode,
  copied,
  onCopy,
  onDownload,
}) => {
  const lines = htmlCode.split('\n');
  const byteSize = new Blob([htmlCode]).size;
  const kbSize = (byteSize / 1024).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <FileCode2 className="w-4 h-4 text-blue-600" />
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono tabular-nums">
            <span className="font-semibold text-slate-900">blogger-post-template.html</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>{lines.length} lines</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>{kbSize} KB</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML</span>
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      <div className="max-h-[680px] overflow-auto bg-[#f8fafc] p-4 font-mono text-[12px] leading-relaxed text-slate-800">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-blue-50/50">
                <td className="select-none pr-4 text-right text-slate-400 w-10 align-top tabular-nums">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-800">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
