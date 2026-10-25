import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { VetExpert, DiagnosisReport } from '../types/index.ts';
import { getStoredVets } from '../utils/storage.ts';
import {
  PhoneCall,
  MessageSquare,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldAlert,
  Languages,
  AlertTriangle,
} from 'lucide-react';

interface VetDirectoryScreenProps {
  reports: DiagnosisReport[];
}

export const VetDirectoryScreen: React.FC<VetDirectoryScreenProps> = ({ reports }) => {
  const { language, t } = useLanguage();
  const [vets] = useState<VetExpert[]>(getStoredVets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedSpecialisation, setSelectedSpecialisation] = useState('All');

  // Check if any recent livestock case is urgent
  const hasUrgentLivestockCase = reports.some(
    (r) => r.category === 'livestock' && r.severity === 'urgent' && r.status !== 'Expert Verified'
  );

  const states = ['All', 'Uttar Pradesh', 'Maharashtra', 'Punjab', 'Haryana', 'West Bengal', 'Karnataka'];
  const specialisations = ['All', 'Livestock & Bovine Health', 'Dairy Cattle & Mastitis Specialist', 'Crops, Cotton & Sugarcane', 'Wheat, Mustard & Vegetable Crops', 'Poultry & Goat Health', 'Sheep & Goat Specialist'];

  const filteredVets = vets.filter((vet) => {
    const matchesSearch =
      vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vet.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vet.specialisation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'All' || vet.state === selectedState;
    const matchesSpec = selectedSpecialisation === 'All' || vet.specialisation === selectedSpecialisation;

    return matchesSearch && matchesState && matchesSpec;
  });

  const openGoogleMapsNearestVet = () => {
    window.open('https://www.google.com/maps/search/veterinary+hospital+near+me', '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          {t('vetDirectoryTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {t('vetDirectorySub')}
        </p>
      </div>

      {/* URGENT LIVESTOCK BANNER IF URGENT CASE EXISTS */}
      {hasUrgentLivestockCase && (
        <div className="bg-red-600 text-white rounded-3xl p-5 shadow-lg border-2 border-red-700 animate-pulse">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-8 h-8 text-white shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide">
                {language === 'hi' ? '🚨 आपातकालीन चेतावनी: गंभीर पशु रोग का मामला दर्ज' : '🚨 EMERGENCY ALERT: URGENT LIVESTOCK CASE DETECTED'}
              </h3>
              <p className="text-xs sm:text-sm text-red-100 mt-1">
                {language === 'hi'
                  ? 'आपकी हालिया जांच में पशु को तत्काल डॉक्टर की आवश्यकता है। कृपया नीचे दिए गए हेल्पलाइन नंबर या निकटतम डॉक्टर को तुरंत कॉल करें।'
                  : 'An active urgent report was identified. Please dial the toll-free emergency vet line 1962 or call a doctor immediately.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* National Helplines Strip */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              {t('emergencyStripTitle')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <a
                href="tel:18001801551"
                className="flex items-center gap-2 text-sm font-bold text-emerald-100 hover:text-white"
              >
                <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{t('kisanCallCenter')}</span>
              </a>
              <a
                href="tel:1962"
                className="flex items-center gap-2 text-sm font-bold text-emerald-100 hover:text-white"
              >
                <PhoneCall className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{t('pashuHelpline')}</span>
              </a>
            </div>
          </div>

          {/* Find Nearest Vet Hospital on Google Maps */}
          <button
            onClick={openGoogleMapsNearestVet}
            className="px-4 py-3 min-h-[48px] bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 self-start sm:self-center shrink-0"
          >
            <Navigation className="w-4 h-4 text-emerald-700" />
            <span>{t('findNearestVetBtn')}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchVetPlaceholder')}
            className="w-full pl-11 pr-4 py-3 min-h-[48px] rounded-2xl border border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">State / राज्य</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2.5 min-h-[44px] rounded-xl border border-gray-200 text-xs font-semibold bg-white"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Specialisation / विशेषता</label>
            <select
              value={selectedSpecialisation}
              onChange={(e) => setSelectedSpecialisation(e.target.value)}
              className="w-full p-2.5 min-h-[44px] rounded-xl border border-gray-200 text-xs font-semibold bg-white"
            >
              {specialisations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sample data notice */}
        <div className="text-[11px] text-gray-400 italic">
          ℹ️ {t('sampleDataNotice')}
        </div>
      </div>

      {/* Vet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVets.map((vet) => (
          <div
            key={vet.id}
            className="bg-white rounded-3xl p-5 border border-emerald-100 hover:border-emerald-300 shadow-xs transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">{vet.name}</h3>
                  <p className="text-xs text-gray-600 font-medium">{vet.qualification}</p>
                </div>
                {vet.verified && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>{t('verifiedBadge')}</span>
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                <div className="font-bold text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg inline-block">
                  {vet.specialisation}
                </div>

                <div className="flex items-center gap-1.5 text-gray-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vet.district}, {vet.state}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-500">
                  <Languages className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vet.languages.join(', ')}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vet.availableHours}</span>
                </div>
              </div>
            </div>

            {/* Action buttons: Call and WhatsApp */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <a
                href={`tel:${vet.phone}`}
                className="py-3 min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <PhoneCall className="w-4 h-4 text-emerald-300" />
                <span>{t('btnCallNow')}</span>
              </a>

              <a
                href={`https://wa.me/?text=Namaste%20Doctor%2C%20I%20need%20veterinary%20advice%20for%20my%20farm%20via%20KisanSeva.`}
                target="_blank"
                rel="noreferrer"
                className="py-3 min-h-[48px] bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>{t('btnWhatsApp')}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
