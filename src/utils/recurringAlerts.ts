import { DiagnosisReport } from '../types/index.ts';

export interface RecurringAlert {
  disease_en: string;
  disease_hi: string;
  count: number;
  category: 'crop' | 'livestock';
  subType: string;
  message_en: string;
  message_hi: string;
  severity: 'warning' | 'critical';
}

/**
 * Scans reports within a given timeframe (days) to detect recurring outbreaks
 */
export function detectRecurringDiseases(
  reports: DiagnosisReport[],
  thresholdCount = 2,
  windowDays = 90
): RecurringAlert[] {
  const cutoffTime = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const recentReports = reports.filter((r) => {
    const reportDate = new Date(r.createdAt).getTime();
    return !isNaN(reportDate) && reportDate >= cutoffTime;
  });

  const frequencyMap = new Map<
    string,
    { count: number; disease_hi: string; category: 'crop' | 'livestock'; subType: string }
  >();

  for (const report of recentReports) {
    const key = `${report.category}:${report.subType}:${report.disease_name_en.trim()}`;
    const existing = frequencyMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      frequencyMap.set(key, {
        count: 1,
        disease_hi: report.disease_name_hi,
        category: report.category,
        subType: report.subType,
      });
    }
  }

  const alerts: RecurringAlert[] = [];

  frequencyMap.forEach((val, key) => {
    if (val.count >= thresholdCount) {
      const parts = key.split(':');
      const diseaseEn = parts[2];
      const isCritical = val.count >= 3;

      alerts.push({
        disease_en: diseaseEn,
        disease_hi: val.disease_hi || diseaseEn,
        count: val.count,
        category: val.category,
        subType: val.subType,
        severity: isCritical ? 'critical' : 'warning',
        message_en: `Recurring issue: ${diseaseEn} detected ${val.count} times in ${val.subType} recently. Immediate soil/sanitation check recommended.`,
        message_hi: `बार-बार समस्या: हाल ही में ${val.subType} में ${val.disease_hi || diseaseEn} ${val.count} बार पाया गया है। तुरंत खेत/पशुशाला की रोकथाम जांच करें।`,
      });
    }
  });

  return alerts.sort((a, b) => b.count - a.count);
}
