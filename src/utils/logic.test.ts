import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDiagnosisRouting } from './confidenceRouter.ts';
import { evaluatePixelQuality } from './photoQuality.ts';
import { detectRecurringDiseases } from './recurringAlerts.ts';
import { generateReportsCsv } from './dataExport.ts';
import { DiagnosisReport } from '../types/index.ts';

test('confidence router escalates when confidence is below threshold', () => {
  const result = evaluateDiagnosisRouting({
    confidence: 65,
    severity: 'medium',
    needs_expert_review: false,
    threshold: 70,
  });
  assert.equal(result.status, 'Sent to Expert');
  assert.equal(result.isEscalated, true);
  assert.ok(result.escalationReasons[0].includes('65% < 70%'));
});

test('confidence router escalates on urgent severity or model flag', () => {
  const urgentCase = evaluateDiagnosisRouting({
    confidence: 90,
    severity: 'urgent',
    needs_expert_review: false,
  });
  assert.equal(urgentCase.status, 'Sent to Expert');
  assert.equal(urgentCase.isEscalated, true);

  const flaggedCase = evaluateDiagnosisRouting({
    confidence: 88,
    severity: 'low',
    needs_expert_review: true,
  });
  assert.equal(flaggedCase.status, 'Sent to Expert');
  assert.equal(flaggedCase.isEscalated, true);

  const normalCase = evaluateDiagnosisRouting({
    confidence: 85,
    severity: 'medium',
    needs_expert_review: false,
  });
  assert.equal(normalCase.status, 'AI Diagnosed');
  assert.equal(normalCase.isEscalated, false);
});

test('pixel quality checker detects dark or washed-out images', () => {
  // Pure black image (pitch dark)
  const blackPixels = new Uint8ClampedArray(400 * 4); // 400 pixels all 0
  const darkCheck = evaluatePixelQuality(blackPixels);
  assert.equal(darkCheck.isAcceptable, false);
  assert.equal(darkCheck.isTooDark, true);
  assert.ok(darkCheck.advice_en.includes('too dark'));

  // Standard healthy mid-tone image
  const normalPixels = new Uint8ClampedArray(400 * 4);
  for (let i = 0; i < normalPixels.length; i += 4) {
    normalPixels[i] = 120 + ((i % 10) * 10);
    normalPixels[i + 1] = 150 + ((i % 8) * 8);
    normalPixels[i + 2] = 80;
    normalPixels[i + 3] = 255;
  }
  const normalCheck = evaluatePixelQuality(normalPixels);
  assert.equal(normalCheck.isAcceptable, true);
  assert.equal(normalCheck.isTooDark, false);
  assert.equal(normalCheck.isTooBright, false);
});

test('recurring disease detector finds repeated diseases in timeframe', () => {
  const now = new Date().toISOString();
  const sampleReports: DiagnosisReport[] = [
    {
      id: 'rep-1',
      farmerId: 'f1',
      farmerName: 'Ramesh',
      createdAt: now,
      category: 'crop',
      subType: 'Wheat',
      images: [],
      status: 'AI Diagnosed',
      answers: { category: 'crop', subType: 'Wheat', duration: '2 days' },
      disease_name_en: 'Yellow Rust',
      disease_name_hi: 'पीला रतुआ',
      confidence: 88,
      severity: 'high',
      summary_en: '',
      summary_hi: '',
      symptoms_seen_en: [],
      symptoms_seen_hi: [],
      causes_en: [],
      causes_hi: [],
      treatment_steps_en: [],
      treatment_steps_hi: [],
      medicine_or_spray_en: [],
      medicine_or_spray_hi: [],
      home_remedies_en: [],
      home_remedies_hi: [],
      prevention_en: [],
      prevention_hi: [],
      when_to_call_expert_en: '',
      when_to_call_expert_hi: '',
      other_possible_diseases: [],
      needs_expert_review: false,
    },
    {
      id: 'rep-2',
      farmerId: 'f1',
      farmerName: 'Ramesh',
      createdAt: now,
      category: 'crop',
      subType: 'Wheat',
      images: [],
      status: 'AI Diagnosed',
      answers: { category: 'crop', subType: 'Wheat', duration: '2 days' },
      disease_name_en: 'Yellow Rust',
      disease_name_hi: 'पीला रतुआ',
      confidence: 85,
      severity: 'high',
      summary_en: '',
      summary_hi: '',
      symptoms_seen_en: [],
      symptoms_seen_hi: [],
      causes_en: [],
      causes_hi: [],
      treatment_steps_en: [],
      treatment_steps_hi: [],
      medicine_or_spray_en: [],
      medicine_or_spray_hi: [],
      home_remedies_en: [],
      home_remedies_hi: [],
      prevention_en: [],
      prevention_hi: [],
      when_to_call_expert_en: '',
      when_to_call_expert_hi: '',
      other_possible_diseases: [],
      needs_expert_review: false,
    },
  ];

  const alerts = detectRecurringDiseases(sampleReports, 2, 90);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].disease_en, 'Yellow Rust');
  assert.equal(alerts[0].count, 2);
  assert.ok(alerts[0].message_en.includes('Yellow Rust detected 2 times'));
});

test('generateReportsCsv formats valid RFC 4180 CSV with quotes', () => {
  const sampleReports: DiagnosisReport[] = [
    {
      id: 'rep-1',
      farmerId: 'f1',
      farmerName: 'Ramesh',
      createdAt: '2026-03-01T10:00:00Z',
      category: 'crop',
      subType: 'Wheat',
      images: [],
      status: 'AI Diagnosed',
      answers: { category: 'crop', subType: 'Wheat', duration: '2 days' },
      disease_name_en: 'Yellow Rust',
      disease_name_hi: 'पीला रतुआ',
      confidence: 90,
      severity: 'high',
      summary_en: 'Leaf rust seen',
      summary_hi: 'पत्तियों पर पीला रतुआ',
      symptoms_seen_en: ['Yellow pustules', 'Leaf powder'],
      symptoms_seen_hi: [],
      causes_en: [],
      causes_hi: [],
      treatment_steps_en: ['Spray fungicide'],
      treatment_steps_hi: [],
      medicine_or_spray_en: ['Propiconazole 25% EC'],
      medicine_or_spray_hi: [],
      home_remedies_en: [],
      home_remedies_hi: [],
      prevention_en: [],
      prevention_hi: [],
      when_to_call_expert_en: '',
      when_to_call_expert_hi: '',
      other_possible_diseases: [],
      needs_expert_review: false,
    },
  ];

  const csv = generateReportsCsv(sampleReports);
  assert.ok(csv.includes('"Report ID"'));
  assert.ok(csv.includes('"Yellow Rust"'));
  assert.ok(csv.includes('"Propiconazole 25% EC"'));
});
