export type Language = 'en' | 'hi';
export type UserRole = 'farmer' | 'expert' | 'admin';

export type CategoryType = 'crop' | 'livestock';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type DiagnosisStatus = 'AI Diagnosed' | 'Sent to Expert' | 'Expert Verified';

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  state?: string;
  district?: string;
  preferredLanguage: Language;
}

export interface DiagnosisAnswers {
  // Common
  category: CategoryType;
  subType: string; // e.g. "Wheat", "Tomato", "Cow", "Goat"
  duration: string; // e.g. "Today", "2-3 days", "A week", "More"
  notes?: string;

  // Crop specific
  affectedPart?: string; // leaf, stem, root, fruit, whole plant
  isSpreading?: boolean;
  recentRainOrHumidity?: boolean;
  sprayOrFertilizerUsed?: string;

  // Livestock specific
  animalAge?: string;
  symptomsList?: string[]; // fever, not eating, milk drop, diarrhoea, cough, swelling, limping
  vaccinatedRecently?: boolean;
  otherAnimalsSick?: boolean;
}

export interface OtherPossibleDisease {
  name_en: string;
  name_hi: string;
  likelihood: number; // 0-100
}

export interface ExpertReviewData {
  expertId: string;
  expertName: string;
  expertQualification: string;
  verifiedAt: string;
  confirmedDiagnosis: boolean;
  correctedDisease_en?: string;
  correctedDisease_hi?: string;
  notes_en: string;
  notes_hi: string;
  additionalPrescriptions?: string[];
  isUrgentOverride?: boolean;
}

export interface DiagnosisReport {
  id: string;
  farmerId: string;
  farmerName: string;
  createdAt: string;
  category: CategoryType;
  subType: string;
  images: string[]; // base64 or sample URLs
  status: DiagnosisStatus;
  answers: DiagnosisAnswers;

  // AI Output
  disease_name_en: string;
  disease_name_hi: string;
  confidence: number;
  severity: SeverityLevel;
  summary_en: string;
  summary_hi: string;
  symptoms_seen_en: string[];
  symptoms_seen_hi: string[];
  causes_en: string[];
  causes_hi: string[];
  treatment_steps_en: string[];
  treatment_steps_hi: string[];
  medicine_or_spray_en: string[];
  medicine_or_spray_hi: string[];
  home_remedies_en: string[];
  home_remedies_hi: string[];
  prevention_en: string[];
  prevention_hi: string[];
  when_to_call_expert_en: string;
  when_to_call_expert_hi: string;
  other_possible_diseases: OtherPossibleDisease[];
  needs_expert_review: boolean;
  reason_for_review_en?: string;
  reason_for_review_hi?: string;

  // Expert Review
  expertReview?: ExpertReviewData;

  // User Feedback
  feedback?: {
    helpful: boolean;
    comment?: string;
    submittedAt: string;
  };
}

export interface VetExpert {
  id: string;
  name: string;
  qualification: string;
  specialisation: string;
  state: string;
  district: string;
  phone: string;
  languages: string[];
  availableHours: string;
  verified: boolean;
  avatarUrl?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title_en: string;
  title_hi: string;
  message_en: string;
  message_hi: string;
  type: 'urgent' | 'expert_reply' | 'tip' | 'info';
  reportId?: string;
  createdAt: string;
  read: boolean;
}

export interface AppSettings {
  language: Language;
  textSize: 'normal' | 'large';
  voiceNarrationEnabled: boolean;
  demoMode: boolean;
  confidenceThreshold: number; // default 70
}
