import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { getStoredSettings, saveSettings, resetAllDataToDefault } from '../utils/storage.ts';
import { AppSettings } from '../types/index.ts';
import {
  Settings,
  Languages,
  Type,
  Volume2,
  Cpu,
  MapPin,
  Camera,
  Trash2,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface SettingsScreenProps {
  onDataReset: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onDataReset }) => {
  const { language, setLanguage, textSize, setTextSize, t } = useLanguage();
  const [settings, setSettingsState] = useState<AppSettings>(getStoredSettings);
  const [resetDone, setResetDone] = useState(false);

  const toggleVoiceNarration = () => {
    const updated = saveSettings({ voiceNarrationEnabled: !settings.voiceNarrationEnabled });
    setSettingsState(updated);
  };

  const toggleDemoMode = () => {
    const updated = saveSettings({ demoMode: !settings.demoMode });
    setSettingsState(updated);
  };

  const handleResetData = () => {
    if (confirm(language === 'hi' ? 'क्या आप सभी डेटा को दोबारा रीसेट करना चाहते हैं?' : 'Reset all reports, directory and settings to factory defaults?')) {
      resetAllDataToDefault();
      setResetDone(true);
      onDataReset();
      setTimeout(() => setResetDone(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 pb-28 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          {t('settingsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {language === 'hi' ? 'ऐप की भाषा, आवाज और प्रदर्शन विकल्प' : 'Preferences, voice narration, and farm guides'}
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-emerald-950 mb-2">Display & Audio Options</h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900">{t('prefLanguage')}</div>
              <div className="text-xs text-gray-500">English or सरल हिन्दी</div>
            </div>
          </div>

          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                language === 'en' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                language === 'hi' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Text Size */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900">{t('prefTextSize')}</div>
              <div className="text-xs text-gray-500">Normal or Large font size</div>
            </div>
          </div>

          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setTextSize('normal')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                textSize === 'normal' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              {t('textSizeNormal')}
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                textSize === 'large' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              {t('textSizeLarge')}
            </button>
          </div>
        </div>

        {/* Voice Narration */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900">{t('prefVoiceNarration')}</div>
              <div className="text-xs text-gray-500">Automatically read reports aloud</div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.voiceNarrationEnabled}
              onChange={toggleVoiceNarration}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
          </label>
        </div>

        {/* Demo Mode Toggle (Offline Simulated AI) */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900">{t('prefDemoMode')}</div>
              <div className="text-xs text-gray-500">Run simulations without requiring Gemini API calls</div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.demoMode}
              onChange={toggleDemoMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-700"></div>
          </label>
        </div>
      </div>

      {/* HOW TO TAKE A GOOD PHOTO ILLUSTRATED GUIDE */}
      <div className="bg-emerald-50/60 rounded-3xl p-5 sm:p-6 border border-emerald-200 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-emerald-800" />
          <h3 className="font-extrabold text-base text-emerald-950">
            {t('photoTipsTitle')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-emerald-950">
          <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
            <Sun className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900 mb-0.5">1. Daylight (उजाले में लें)</strong>
              {t('tipLight')}
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
            <Maximize2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900 mb-0.5">2. Close-up (पास से फोटो लें)</strong>
              {t('tipCloseUp')}
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900 mb-0.5">3. Hold Steady (हाथ स्थिर रखें)</strong>
              {t('tipSteady')}
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900 mb-0.5">4. Comparison (स्वस्थ भाग साथ में)</strong>
              {t('tipHealthyPart')}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management & Factory Reset */}
      <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-xs space-y-3">
        <h3 className="font-extrabold text-base text-red-950">{t('dangerZone')}</h3>
        <p className="text-xs text-gray-500">
          Reset all demo reports, veterinarian profiles, and settings back to pristine seed defaults.
        </p>

        <div className="pt-1">
          <button
            onClick={handleResetData}
            className="px-4 py-2.5 min-h-[42px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('clearLocalData')}</span>
          </button>
          {resetDone && (
            <span className="text-xs font-bold text-emerald-700 ml-3">
              Reset successfully completed!
            </span>
          )}
        </div>
      </div>

      {/* About Box */}
      <div className="text-center text-xs text-gray-500 space-y-1 pt-2">
        <p className="font-bold text-gray-700">{t('aboutApp')}</p>
        <p className="max-w-md mx-auto">{t('aboutAppDesc')}</p>
        <p className="text-[11px] text-gray-400">Version 2.4 • Made with pride in India 🇮🇳</p>
      </div>
    </div>
  );
};
