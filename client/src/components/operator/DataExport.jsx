import { useState } from 'react';
import { getBriefs, getProjects } from '../../api';
import { useToast } from '../../contexts/ToastContext';

function toCSV(rows, headers) {
  const escape = (val) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export default function DataExport() {
  const { addToast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [briefsRes, projectsRes] = await Promise.all([getBriefs(), getProjects()]);
      const briefs = briefsRes.data.briefs || [];
      const projects = projectsRes.data.projects || [];

      const projectByBriefId = {};
      for (const p of projects) {
        const briefId = p.application?.brief?.id;
        if (briefId) projectByBriefId[briefId] = p;
      }

      const headers = [
        'Brief Title',
        'Status',
        'Campaign Goal',
        'Applications',
        'Selected Creator',
        'Project Status',
        'Compensation Type',
        'Compensation ($)',
        'Date Created',
      ];

      const rows = briefs.map((b) => {
        const proj = projectByBriefId[b.id];
        return {
          'Brief Title': b.title || '',
          'Status': b.status || '',
          'Campaign Goal': (b.campaignGoal || '').replace(/_/g, ' '),
          'Applications': b._count?.applications ?? 0,
          'Selected Creator': proj?.creatorName || '',
          'Project Status': proj?.status || '',
          'Compensation Type': (b.compensationType || '').replace(/_/g, ' '),
          'Compensation ($)': b.compensationAmount ? (b.compensationAmount / 100).toFixed(0) : '',
          'Date Created': b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '',
        };
      });

      const csv = toCSV(rows, headers);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'locale-campaign-data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast(`Exported ${rows.length} brief${rows.length !== 1 ? 's' : ''} to CSV.`, 'success');
    } catch {
      addToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-bgWarm rounded-xl border border-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-dark font-body mb-0.5">Campaign Data Export</p>
            <p className="text-xs text-muted font-body leading-relaxed">
              Download all your brief and campaign data as a CSV file. Includes title, status, applications, selected creator, compensation, and dates.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-body font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
        {exporting ? 'Exporting...' : 'Export Campaign Data'}
      </button>

      <p className="text-xs text-muted font-body">
        File: <span className="font-medium text-dark">locale-campaign-data.csv</span>
      </p>
    </div>
  );
}
