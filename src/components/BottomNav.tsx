import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Home, PlusCircle, MessageSquareQuote, PhoneCall, FileText, Stethoscope, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, userRole }) => {
  const { t } = useLanguage();

  const isFarmer = userRole === 'farmer';
  const isExpert = userRole === 'expert';
  const isAdmin = userRole === 'admin';

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Hidden on md+ screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-emerald-100 shadow-lg px-2 py-1.5 md:hidden">
        <div className="flex items-center justify-around">
          {isFarmer && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] rounded-xl py-1 px-1 transition ${
                  currentView === 'dashboard'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight text-center">{t('navHome')}</span>
              </button>

              <button
                onClick={() => onNavigate('wizard')}
                className={`flex flex-col items-center justify-center min-w-[62px] min-h-[50px] rounded-xl py-1 px-1 transition ${
                  currentView === 'wizard'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center mb-0.5 shadow-xs">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight text-center font-bold text-emerald-900">
                  {t('navNewDiagnosis')}
                </span>
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] rounded-xl py-1 px-1 transition ${
                  currentView === 'chat'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <MessageSquareQuote className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight text-center">{t('navAskAI')}</span>
              </button>

              <button
                onClick={() => onNavigate('vets')}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] rounded-xl py-1 px-1 transition ${
                  currentView === 'vets'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <PhoneCall className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight text-center">{t('navCallVet')}</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] rounded-xl py-1 px-1 transition ${
                  currentView === 'reports' || currentView === 'report-detail'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <FileText className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight text-center">{t('navReports')}</span>
              </button>
            </>
          )}

          {isExpert && (
            <>
              <button
                onClick={() => onNavigate('expert')}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[50px] rounded-xl py-1 px-2 transition ${
                  currentView === 'expert'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <Stethoscope className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight text-center">{t('navExpertQueue')}</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[50px] rounded-xl py-1 px-2 transition ${
                  currentView === 'reports'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <FileText className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight text-center">{t('navReports')}</span>
              </button>

              <button
                onClick={() => onNavigate('vets')}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[50px] rounded-xl py-1 px-2 transition ${
                  currentView === 'vets'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <PhoneCall className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight text-center">{t('navCallVet')}</span>
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => onNavigate('admin')}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[50px] rounded-xl py-1 px-2 transition ${
                  currentView === 'admin'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight text-center">{t('navAdmin')}</span>
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[50px] rounded-xl py-1 px-2 transition ${
                  currentView === 'reports'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <FileText className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight text-center">{t('navReports')}</span>
              </button>
              <button
                onClick={() => onNavigate('vets')}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[50px] rounded-xl py-1 px-2 transition ${
                  currentView === 'vets'
                    ? 'text-emerald-800 font-bold bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                <PhoneCall className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight text-center">{t('navCallVet')}</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Desktop / Tablet Sub-Header Bar (Visible on md+ screens) */}
      <div className="hidden md:block bg-emerald-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-1 py-1">
            {isFarmer && (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'dashboard'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navHome')}
                </button>
                <button
                  onClick={() => onNavigate('wizard')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentView === 'wizard'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  {t('navNewDiagnosis')}
                </button>
                <button
                  onClick={() => onNavigate('chat')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'chat'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navAskAI')}
                </button>
                <button
                  onClick={() => onNavigate('vets')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'vets'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navCallVet')}
                </button>
                <button
                  onClick={() => onNavigate('reports')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'reports' || currentView === 'report-detail'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navReports')}
                </button>
              </>
            )}

            {isExpert && (
              <>
                <button
                  onClick={() => onNavigate('expert')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentView === 'expert'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  {t('navExpertQueue')}
                </button>
                <button
                  onClick={() => onNavigate('reports')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'reports'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navReports')}
                </button>
                <button
                  onClick={() => onNavigate('vets')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'vets'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navCallVet')}
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t('navAdmin')}
                </button>
                <button
                  onClick={() => onNavigate('reports')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'reports'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navReports')}
                </button>
                <button
                  onClick={() => onNavigate('vets')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'vets'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {t('navCallVet')}
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-emerald-200">
            {t('appName')} • 24x7 AI Diagnostic Support
          </div>
        </div>
      </div>
    </>
  );
};
