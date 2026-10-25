import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DiagnosisReport, FarmerProfile } from '../types/index.ts';
import { WeatherCard } from './WeatherCard.tsx';
import { PlusCircle, Sprout, Heart, MessageSquareQuote, PhoneCall, FileText, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FarmerDashboardProps {
  currentUser: FarmerProfile;
  reports: DiagnosisReport[];
  onStartNewDiagnosis: (initialCategory?: 'crop' | 'livestock') => void;
  onNavigate: (view: string) => void;
  onSelectReport: (report: DiagnosisReport) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentUser,
  reports,
  onStartNewDiagnosis,
  onNavigate,
  onSelectReport,
}) => {
  const { language, t } = useLanguage();

  const awaitingReviewCount = reports.filter((r) => r.status === 'Sent to Expert').length;
  const recentReports = reports.slice(0, 3);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'urgent':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Urgent</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2 py-0.5 rounded-full">High</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Medium</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Low</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Expert Verified':
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t('statusVerified')}</span>
          </span>
        );
      case 'Sent to Expert':
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>{t('statusSentExpert')}</span>
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {t('statusAiDiagnosed')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 space-y-6">
      {/* Farmer Greeting Header */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700 tracking-wide uppercase mb-1">
            {currentUser.district}, {currentUser.state}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {t('welcomeBack')}, {currentUser.name} 🌾
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {language === 'hi'
              ? 'आपकी फसल व पशु की सुरक्षा के लिए किसानसेवा हमेशा तैयार है।'
              : 'AI disease detection and veterinary support ready for your farm.'}
          </p>
        </div>

        <button
          onClick={() => onStartNewDiagnosis()}
          className="self-start sm:self-center px-5 py-3.5 min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-98"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t('navNewDiagnosis')}</span>
        </button>
      </div>

      {/* Banner if case is awaiting expert review */}
      {awaitingReviewCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-950">
                {awaitingReviewCount} {language === 'hi' ? 'मामले डॉक्टर समीक्षा में हैं' : 'Case(s) Sent to Specialist'}
              </h4>
              <p className="text-xs text-blue-800">
                {t('dashAwaitingReviewBanner')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 min-h-[40px] bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 transition"
          >
            {t('dashViewExpertCase')}
          </button>
        </div>
      )}

      {/* Live Farm Weather Card */}
      <WeatherCard />

      {/* Big Action Buttons (Mobile First, large tap targets min 48px) */}
      <div>
        <h3 className="text-lg font-extrabold text-emerald-950 mb-3">
          {t('dashQuickActions')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* New Crop Diagnosis */}
          <button
            onClick={() => onStartNewDiagnosis('crop')}
            className="p-4 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-3xl shadow-sm text-left transition flex flex-col justify-between min-h-[125px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 flex items-center justify-center mb-2">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-tight">
                {t('dashNewCrop')}
              </div>
              <div className="text-[11px] text-emerald-200/90 mt-0.5">
                {t('dashNewCropSub')}
              </div>
            </div>
          </button>

          {/* New Livestock Diagnosis */}
          <button
            onClick={() => onStartNewDiagnosis('livestock')}
            className="p-4 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white rounded-3xl shadow-sm text-left transition flex flex-col justify-between min-h-[125px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-600/80 flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-tight">
                {t('dashNewLivestock')}
              </div>
              <div className="text-[11px] text-amber-100/90 mt-0.5">
                {t('dashNewLivestockSub')}
              </div>
            </div>
          </button>

          {/* Ask KisanSeva Chat */}
          <button
            onClick={() => onNavigate('chat')}
            className="p-4 bg-white hover:bg-emerald-50 active:scale-98 text-emerald-950 border border-emerald-200 rounded-3xl shadow-xs text-left transition flex flex-col justify-between min-h-[125px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center mb-2">
              <MessageSquareQuote className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-tight">
                {t('navAskAI')}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {language === 'hi' ? 'सवाल पूछें व बातचीत' : 'Voice Q&A Companion'}
              </div>
            </div>
          </button>

          {/* Call a Vet Directory */}
          <button
            onClick={() => onNavigate('vets')}
            className="p-4 bg-white hover:bg-emerald-50 active:scale-98 text-emerald-950 border border-emerald-200 rounded-3xl shadow-xs text-left transition flex flex-col justify-between min-h-[125px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center mb-2">
              <PhoneCall className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-tight">
                {t('navCallVet')}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {language === 'hi' ? '500+ डॉक्टर व हेल्पलाइन' : 'Veterinary Helpline'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Diagnoses List (Last 3 Reports) */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-emerald-950">
              {t('dashRecentReports')}
            </h3>
            <p className="text-xs text-gray-500">
              {reports.length} {language === 'hi' ? 'कुल जांचें सुरक्षित' : 'total farm diagnoses'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition"
          >
            <span>{t('dashViewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sprout className="w-10 h-10 mx-auto text-emerald-300 mb-2" />
            <p className="text-sm font-medium">{t('dashNoReports')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-gray-100 hover:border-emerald-300 bg-gray-50/50 hover:bg-emerald-50/30 cursor-pointer transition"
              >
                <div className="flex items-center gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-emerald-100 shrink-0 border border-emerald-200">
                    {report.images && report.images[0] ? (
                      <img
                        src={report.images[0]}
                        alt={report.disease_name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-800 font-bold">
                        {report.category === 'crop' ? '🌾' : '🐄'}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-sm">
                        {report.subType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-gray-900 mt-0.5">
                      {language === 'hi' ? report.disease_name_hi : report.disease_name_en}
                    </h4>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {getStatusBadge(report.status)}
                      {getSeverityBadge(report.severity)}
                      <span className="text-[11px] text-gray-500 font-semibold">
                        {report.confidence}% {t('confidenceScore')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-emerald-800">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
