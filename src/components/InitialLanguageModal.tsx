import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Sprout } from 'lucide-react';

export const InitialLanguageModal: React.FC = () => {
  const { hasChosenLanguageInitially, setLanguage } = useLanguage();

  if (hasChosenLanguageInitially) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center">
          <Sprout className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-emerald-950 mb-1">KisanSeva / किसानसेवा</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please select your preferred language
          <br />
          कृपया अपनी पसंदीदा भाषा का चयन करें
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setLanguage('hi')}
            className="w-full py-4 px-6 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-bold text-xl shadow-md transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🌾</span>
              <span>हिन्दी</span>
            </span>
            <span className="text-xs font-normal bg-emerald-700/80 px-2 py-1 rounded-md">
              सरल बोलचाल
            </span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-900 rounded-2xl font-bold text-xl border border-gray-300 transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🌿</span>
              <span>English</span>
            </span>
            <span className="text-xs font-normal bg-gray-200 px-2 py-1 rounded-md text-gray-700">
              Indian English
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          You can change the language anytime from the top bar.
        </p>
      </div>
    </div>
  );
};
