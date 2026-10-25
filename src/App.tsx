import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { FarmerDashboard } from './components/FarmerDashboard.tsx';
import { NewDiagnosisWizard } from './components/NewDiagnosisWizard.tsx';
import { DiagnosisReportScreen } from './components/DiagnosisReportScreen.tsx';
import { AskAiChat } from './components/AskAiChat.tsx';
import { VetDirectoryScreen } from './components/VetDirectoryScreen.tsx';
import { ExpertDashboard } from './components/ExpertDashboard.tsx';
import { HistoryInsightsScreen } from './components/HistoryInsightsScreen.tsx';
import { AdminScreen } from './components/AdminScreen.tsx';
import { SettingsScreen } from './components/SettingsScreen.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import { InitialLanguageModal } from './components/InitialLanguageModal.tsx';
import {
  getStoredReports,
  saveReport,
  getCurrentUser,
  switchRole,
} from './utils/storage.ts';
import { DiagnosisReport, FarmerProfile, CategoryType } from './types/index.ts';

function KisanSevaApp() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<FarmerProfile>(getCurrentUser);
  const [reports, setReports] = useState<DiagnosisReport[]>(getStoredReports);
  const [selectedReport, setSelectedReport] = useState<DiagnosisReport | null>(null);
  const [chatReportContext, setChatReportContext] = useState<DiagnosisReport | null>(null);
  const [wizardInitialCategory, setWizardInitialCategory] = useState<CategoryType>('crop');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Register PWA service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA service worker registration notice:', err);
      });
    }

    // Check URL parameters for autostart or deep link
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setCurrentView('dashboard');
    }
  }, []);

  const handleStartNewDiagnosis = (cat: CategoryType = 'crop') => {
    setWizardInitialCategory(cat);
    setCurrentView('wizard');
  };

  const handleDiagnosisComplete = (newReport: DiagnosisReport) => {
    saveReport(newReport);
    setReports(getStoredReports());
    setSelectedReport(newReport);
    setCurrentView('report-detail');
  };

  const handleSelectReport = (report: DiagnosisReport) => {
    setSelectedReport(report);
    setCurrentView('report-detail');
  };

  const handleSelectReportById = (reportId: string) => {
    const found = reports.find((r) => r.id === reportId);
    if (found) {
      setSelectedReport(found);
      setCurrentView('report-detail');
    }
  };

  const handleAskAiAboutReport = (report: DiagnosisReport) => {
    setChatReportContext(report);
    setCurrentView('chat');
  };

  const handleEnterRole = (profile: FarmerProfile, targetView: string) => {
    setCurrentUser(profile);
    setCurrentView(targetView);
  };

  const handleDataReset = () => {
    setReports(getStoredReports());
    setCurrentUser(getCurrentUser());
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 text-gray-900 flex flex-col font-sans">
      {/* First-launch modal */}
      <InitialLanguageModal />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectReportById={handleSelectReportById}
      />

      {/* Navigation Header (except on pure landing before entry, or always visible) */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'wizard') {
            handleStartNewDiagnosis('crop');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenNotifications={() => setIsNotifOpen(true)}
        currentUser={currentUser}
        onRoleChanged={(newProfile) => setCurrentUser(newProfile)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartDiagnosis={() => handleStartNewDiagnosis('crop')}
            onEnterRole={handleEnterRole}
          />
        )}

        {currentView === 'dashboard' && (
          <FarmerDashboard
            currentUser={currentUser}
            reports={reports}
            onStartNewDiagnosis={handleStartNewDiagnosis}
            onNavigate={(view) => setCurrentView(view)}
            onSelectReport={handleSelectReport}
          />
        )}

        {currentView === 'wizard' && (
          <NewDiagnosisWizard
            initialCategory={wizardInitialCategory}
            onCancel={() => setCurrentView('dashboard')}
            onDiagnosisComplete={handleDiagnosisComplete}
          />
        )}

        {currentView === 'report-detail' && selectedReport && (
          <DiagnosisReportScreen
            report={selectedReport}
            onBack={() => setCurrentView('dashboard')}
            onAskAi={handleAskAiAboutReport}
            onCallVet={() => setCurrentView('vets')}
            onReportUpdated={(updated) => {
              setSelectedReport(updated);
              setReports(getStoredReports());
            }}
          />
        )}

        {currentView === 'chat' && (
          <AskAiChat
            reportContext={chatReportContext}
            onClearContext={() => setChatReportContext(null)}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'vets' && <VetDirectoryScreen reports={reports} />}

        {currentView === 'expert' && (
          <ExpertDashboard
            reports={reports}
            onReportUpdated={(updated) => {
              setReports(getStoredReports());
            }}
            onSelectReport={handleSelectReport}
          />
        )}

        {currentView === 'reports' && (
          <HistoryInsightsScreen
            reports={reports}
            onSelectReport={handleSelectReport}
            onNewDiagnosis={() => handleStartNewDiagnosis('crop')}
          />
        )}

        {currentView === 'admin' && <AdminScreen reports={reports} />}

        {currentView === 'settings' && <SettingsScreen onDataReset={handleDataReset} />}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'wizard') {
            handleStartNewDiagnosis('crop');
          } else {
            setCurrentView(view);
          }
        }}
        userRole={currentUser.role}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <KisanSevaApp />
    </LanguageProvider>
  );
}
