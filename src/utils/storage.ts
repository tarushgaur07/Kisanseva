import { DiagnosisReport, VetExpert, AppNotification, AppSettings, FarmerProfile, UserRole } from '../types/index.ts';
import { SEED_REPORTS, SEED_VETS, SEED_NOTIFICATIONS } from '../data/seedData.ts';

const STORAGE_KEYS = {
  REPORTS: 'kisanseva_reports',
  VETS: 'kisanseva_vets',
  SETTINGS: 'kisanseva_settings',
  NOTIFICATIONS: 'kisanseva_notifications',
  USER_PROFILE: 'kisanseva_user_profile',
  OFFLINE_QUEUE: 'kisanseva_offline_queue',
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'hi',
  textSize: 'normal',
  voiceNarrationEnabled: false,
  demoMode: false,
  confidenceThreshold: 70,
};

export const DEFAULT_FARMER: FarmerProfile = {
  id: 'farmer-1',
  name: 'Rameshwar Patel',
  phone: '+91 98765 12345',
  role: 'farmer',
  state: 'Uttar Pradesh',
  district: 'Varanasi',
  preferredLanguage: 'hi',
};

export const EXPERT_PROFILE: FarmerProfile = {
  id: 'vet-1',
  name: 'Dr. Virendra Yadav',
  phone: '+91 98765 43210',
  role: 'expert',
  state: 'Uttar Pradesh',
  district: 'Lucknow',
  preferredLanguage: 'hi',
};

export const ADMIN_PROFILE: FarmerProfile = {
  id: 'admin-1',
  name: 'KisanSeva Nodal Officer',
  phone: '+91 99999 88888',
  role: 'admin',
  state: 'New Delhi',
  district: 'Krishi Bhawan',
  preferredLanguage: 'en',
};

export function getStoredReports(): DiagnosisReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
      return SEED_REPORTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_REPORTS;
  }
}

export function saveReport(report: DiagnosisReport): void {
  const current = getStoredReports();
  const index = current.findIndex((r) => r.id === report.id);
  if (index >= 0) {
    current[index] = report;
  } else {
    current.unshift(report);
  }
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(current));
}

export function deleteReport(id: string): void {
  const current = getStoredReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(current));
}

export function getStoredVets(): VetExpert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VETS, JSON.stringify(SEED_VETS));
      return SEED_VETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_VETS;
  }
}

export function saveVet(vet: VetExpert): void {
  const current = getStoredVets();
  const index = current.findIndex((v) => v.id === vet.id);
  if (index >= 0) {
    current[index] = vet;
  } else {
    current.unshift(vet);
  }
  localStorage.setItem(STORAGE_KEYS.VETS, JSON.stringify(current));
}

export function deleteVet(id: string): void {
  const current = getStoredVets().filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEYS.VETS, JSON.stringify(current));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_NOTIFICATIONS;
  }
}

export function addNotification(notif: AppNotification): void {
  const current = getStoredNotifications();
  current.unshift(notif);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current));
}

export function markNotificationAsRead(id: string): void {
  const current = getStoredNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current));
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getStoredSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

export function getCurrentUser(): FarmerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return DEFAULT_FARMER;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_FARMER;
  }
}

export function setCurrentUser(user: FarmerProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
}

export function switchRole(role: UserRole): FarmerProfile {
  let profile = DEFAULT_FARMER;
  if (role === 'expert') {
    profile = EXPERT_PROFILE;
  } else if (role === 'admin') {
    profile = ADMIN_PROFILE;
  }
  setCurrentUser(profile);
  return profile;
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
  localStorage.setItem(STORAGE_KEYS.VETS, JSON.stringify(SEED_VETS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_FARMER));
}
