import { DiagnosisReport } from '../types/index.ts';

/**
 * Escapes fields for standard RFC 4180 CSV export
 */
function escapeCsvField(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Converts an array of DiagnosisReports into a valid CSV string
 */
export function generateReportsCsv(reports: DiagnosisReport[]): string {
  const headers = [
    'Report ID',
    'Date',
    'Category',
    'Crop/Animal',
    'Disease (English)',
    'Disease (Hindi)',
    'Confidence (%)',
    'Severity',
    'Status',
    'Summary (English)',
    'Summary (Hindi)',
    'Symptoms Observed',
    'Recommended Medicines',
    'Expert Verified',
  ];

  const rows = reports.map((r) => [
    escapeCsvField(r.id),
    escapeCsvField(new Date(r.createdAt).toLocaleString()),
    escapeCsvField(r.category),
    escapeCsvField(r.subType),
    escapeCsvField(r.disease_name_en),
    escapeCsvField(r.disease_name_hi),
    escapeCsvField(r.confidence),
    escapeCsvField(r.severity),
    escapeCsvField(r.status),
    escapeCsvField(r.summary_en),
    escapeCsvField(r.summary_hi),
    escapeCsvField(r.symptoms_seen_en.join('; ')),
    escapeCsvField(r.medicine_or_spray_en.join('; ')),
    escapeCsvField(r.expertReview ? `Yes (${r.expertReview.expertName})` : 'No'),
  ]);

  return [headers.map(escapeCsvField).join(','), ...rows.map((row) => row.join(','))].join('\n');
}
