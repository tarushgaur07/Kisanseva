import { DiagnosisStatus, SeverityLevel } from '../types/index.ts';

export interface RouteEvaluationInput {
  confidence: number;
  severity: SeverityLevel;
  needs_expert_review: boolean;
  threshold?: number;
}

export interface RouteEvaluationResult {
  status: DiagnosisStatus;
  isEscalated: boolean;
  escalationReasons: string[];
}

/**
 * Determines whether a diagnosis should be routed to an expert
 * based on confidence score, severity level, model flag, and threshold.
 */
export function evaluateDiagnosisRouting(input: RouteEvaluationInput): RouteEvaluationResult {
  const threshold = input.threshold ?? 70;
  const reasons: string[] = [];

  if (input.confidence < threshold) {
    reasons.push(`Low confidence score (${input.confidence}% < ${threshold}%)`);
  }

  if (input.severity === 'urgent') {
    reasons.push('Case marked with urgent severity');
  }

  if (input.needs_expert_review) {
    reasons.push('Model flagged case for mandatory specialist verification');
  }

  const isEscalated = reasons.length > 0;

  return {
    status: isEscalated ? 'Sent to Expert' : 'AI Diagnosed',
    isEscalated,
    escalationReasons: reasons,
  };
}
