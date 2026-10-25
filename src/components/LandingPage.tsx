import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Sprout, Camera, Sparkles, Stethoscope, ShieldCheck, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserRole, FarmerProfile } from '../types/index.ts';
import { switchRole } from '../utils/storage.ts';

interface LandingPageProps {
  onStartDiagnosis: () => void;
  onEnterRole: (profile: FarmerProfile, targetView: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDiagnosis, onEnterRole }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleDemo = (role: UserRole) => {
    const profile = switchRole(role);
    onEnterRole(profile, role === 'expert' ? 'expert' : role === 'admin' ? 'admin' : 'dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40">
      {/* Top Banner with Language Toggle */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 font-medium">
          <span>🇮🇳</span>
          <span>Dedicated to the Annadata of India • भारतीय किसान सेवा</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              language === 'en' ? 'bg-white text-emerald-950' : 'text-emerald-200 hover:text-white'
            }`}
          >
            English
          </button>
          <span>|</span>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              language === 'hi' ? 'bg-white text-emerald-950' : 'text-emerald-200 hover:text-white'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100/90 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-emerald-300/60 shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Multimodal AI Vision • Gemini 3.8 Flash • Spoken Hindi & English</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          {t('heroTitle')}
        </h1>

        <p className="text-base sm:text-xl text-gray-700 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto mb-10">
          <button
            onClick={onStartDiagnosis}
            className="w-full sm:w-auto px-8 py-4 min-h-[56px] bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-emerald-900/20 transition flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6 text-emerald-300" />
            <span>{t('startDiagnosis')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleDemo('farmer')}
            className="w-full sm:w-auto px-6 py-4 min-h-[56px] bg-white hover:bg-emerald-50 active:scale-98 text-emerald-900 border-2 border-emerald-800 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2"
          >
            <span>🌾</span>
            <span>{t('tryDemoFarmer')}</span>
          </button>
        </div>

        {/* Evaluator Quick Role Access Pills */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/90 p-2 rounded-2xl border border-emerald-200 text-xs">
          <span className="text-gray-500 font-semibold px-2">Evaluator Access:</span>
          <button
            onClick={() => handleDemo('farmer')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold transition flex items-center gap-1.5"
          >
            <span>🌾 Farmer Demo</span>
          </button>
          <button
            onClick={() => handleDemo('expert')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-bold transition flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
            <span>🩺 Expert Desk</span>
          </button>
          <button
            onClick={() => handleDemo('admin')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>⚙️ Admin Console</span>
          </button>
        </div>
      </section>

      {/* 3-Step "How it works" */}
      <section className="bg-white py-14 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mb-2">
              {t('howItWorks')}
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Simple 3-step diagnosis crafted for quick field use, even on slow 2G/3G networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200/60 relative hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl font-extrabold mb-4 shadow-xs">
                <Camera className="w-6 h-6 text-emerald-200" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                {t('howStep1Title')}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {t('howStep1Desc')}
              </p>
            </div>

            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200/60 relative hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl font-extrabold mb-4 shadow-xs">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                {t('howStep2Title')}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {t('howStep2Desc')}
              </p>
            </div>

            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200/60 relative hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl font-extrabold mb-4 shadow-xs">
                <HeartHandshake className="w-6 h-6 text-emerald-200" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                {t('howStep3Title')}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {t('howStep3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner (Clearly labelled targets / estimates) */}
      <section className="py-14 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-extrabold tracking-widest bg-emerald-700/60 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600">
              {t('impactBannerTitle')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-3xl border border-white/15">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-1">
                {t('impactFarmsTarget')}
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {t('impactFarmsLabel')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-3xl border border-white/15">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 mb-1">
                {t('impactAccuracyTarget')}
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {t('impactAccuracyLabel')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-3xl border border-white/15">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-1">
                {t('impactVetsTarget')}
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {t('impactVetsLabel')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Highlights */}
      <section className="py-14 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-emerald-100 shadow-xs">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base mb-1">
                Spoken Voice Recognition (बोलकर लक्षण बताएं)
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                No complex typing needed. Farmers simply tap the mic to explain symptoms in everyday spoken Hindi or English.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-emerald-100 shadow-xs">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base mb-1">
                Confidence Routing (डॉक्टर का सीधा सहारा)
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                If the model confidence is under 70% or the severity is urgent, cases are immediately escalated to veterinarians and agronomists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-emerald-100 shadow-xs">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base mb-1">
                Downloadable Bilingual PDF & WhatsApp Share
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Print or share the generated prescription summary directly with village chemical shops or veterinary officers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-emerald-100 shadow-xs">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base mb-1">
                Offline PWA Storage (बिना इंटरनेट भी काम करे)
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Service worker caches your farm history and queues submissions when connectivity drops in remote fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 py-8 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-800" />
            <span className="font-bold text-emerald-950">{t('appName')} Platform</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <span>National Helpline: 1800-180-1551</span>
            <span>•</span>
            <span>Vet Line: 1962</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
