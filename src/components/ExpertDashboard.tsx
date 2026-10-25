import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DiagnosisReport, ExpertReviewData } from '../types/index.ts';
import { saveReport, addNotification } from '../utils/storage.ts';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mic,
  MicOff,
  User,
  ArrowRight,
  ShieldAlert,
  Camera,
  Check,
} from 'lucide-react';

interface ExpertDashboardProps {
  reports: DiagnosisReport[];
  onReportUpdated: (updated: DiagnosisReport) => void;
  onSelectReport: (report: DiagnosisReport) => void;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({
  reports,
  onReportUpdated,
  onSelectReport,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'in_review' | 'completed'>('pending');
  const [selectedCase, setSelectedCase] = useState<DiagnosisReport | null>(null);

  // Review form state
  const [confirmAi, setConfirmAi] = useState(true);
  const [correctedNameEn, setCorrectedNameEn] = useState('');
  const [correctedNameHi, setCorrectedNameHi] = useState('');
  const [notesEn, setNotesEn] = useState('');
  const [notesHi, setNotesHi] = useState('');
  const [markUrgent, setMarkUrgent] = useState(false);
  const [photoRequested, setPhotoRequested] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Filter cases into tabs
  const pendingCases = reports.filter((r) => r.status === 'Sent to Expert' && !r.expertReview);
  const completedCases = reports.filter((r) => r.status === 'Expert Verified' || r.expertReview);

  const displayedCases =
    activeTab === 'pending'
      ? pendingCases
      : activeTab === 'completed'
      ? completedCases
      : pendingCases.slice(0, 1); // in review

  const openReviewModal = (report: DiagnosisReport) => {
    setSelectedCase(report);
    setConfirmAi(true);
    setCorrectedNameEn(report.disease_name_en);
    setCorrectedNameHi(report.disease_name_hi);
    setNotesEn('');
    setNotesHi('');
    setMarkUrgent(report.severity === 'urgent');
    setPhotoRequested(false);
    setReviewSubmitted(false);
  };

  const handleSubmitReview = () => {
    if (!selectedCase) return;

    const expertReview: ExpertReviewData = {
      expertId: 'vet-1',
      expertName: 'Dr. Virendra Yadav',
      expertQualification: 'Senior Agronomist & M.V.Sc, IVRI',
      verifiedAt: new Date().toISOString(),
      confirmedDiagnosis: confirmAi,
      correctedDisease_en: !confirmAi ? correctedNameEn : undefined,
      correctedDisease_hi: !confirmAi ? correctedNameHi : undefined,
      notes_en: notesEn || (confirmAi ? 'Confirmed AI diagnosis and prescription protocol.' : 'Disease corrected based on foliar symptom inspection.'),
      notes_hi: notesHi || (confirmAi ? 'एआई जांच और उपचार की पुष्टि की गई।' : 'पत्तियों के लक्षणों के आधार पर रोग का नाम व उपचार संशोधित किया गया।'),
      isUrgentOverride: markUrgent,
    };

    const updatedReport: DiagnosisReport = {
      ...selectedCase,
      status: 'Expert Verified',
      disease_name_en: !confirmAi && correctedNameEn ? correctedNameEn : selectedCase.disease_name_en,
      disease_name_hi: !confirmAi && correctedNameHi ? correctedNameHi : selectedCase.disease_name_hi,
      severity: markUrgent ? 'urgent' : selectedCase.severity,
      expertReview,
    };

    saveReport(updatedReport);
    onReportUpdated(updatedReport);

    // Push in-app notification to the farmer
    addNotification({
      id: `notif-${Date.now()}`,
      userId: updatedReport.farmerId,
      title_en: `Dr. Virendra Yadav reviewed case ${updatedReport.id}`,
      title_hi: `डॉ. वीरेंद्र यादव ने आपकी रिपोर्ट ${updatedReport.id} की पुष्टि की`,
      message_en: `Specialist verification complete for ${updatedReport.subType}. View personalized treatment advice.`,
      message_hi: `${updatedReport.subType} के लिए डॉक्टर की सलाह तैयार है। कृपया अपनी रिपोर्ट देखें।`,
      type: markUrgent ? 'urgent' : 'expert_reply',
      reportId: updatedReport.id,
      createdAt: new Date().toISOString(),
      read: false,
    });

    setReviewSubmitted(true);
    setTimeout(() => {
      setSelectedCase(null);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Specialist Review Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {t('expertDeskTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t('expertDeskSub')}
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-4 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
          <div>
            <div className="text-lg font-extrabold text-emerald-950">142</div>
            <div className="text-[10px] text-gray-500 font-semibold">{t('expertStatsTotal')}</div>
          </div>
          <div className="w-px h-8 bg-emerald-200" />
          <div>
            <div className="text-lg font-extrabold text-emerald-950">18 min</div>
            <div className="text-[10px] text-gray-500 font-semibold">{t('expertStatsAvgTime')}</div>
          </div>
        </div>
      </div>

      {/* Tabs: Pending, In Review, Completed */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-gray-600 hover:text-emerald-900'
          }`}
        >
          <span>{t('tabPending')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full">
            {pendingCases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('in_review')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'in_review'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-gray-600 hover:text-emerald-900'
          }`}
        >
          {t('tabInReview')}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-gray-600 hover:text-emerald-900'
          }`}
        >
          <span>{t('tabCompleted')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full">
            {completedCases.length}
          </span>
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {displayedCases.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-gray-500 border border-gray-100">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-300 mb-2" />
            <p className="font-bold text-sm">All pending cases are currently cleared!</p>
          </div>
        ) : (
          displayedCases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-5 border border-emerald-100 hover:border-emerald-300 shadow-xs transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {c.images && c.images[0] ? (
                      <img src={c.images[0]} alt="Case" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🌾</div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                        {c.subType}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">{c.id}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-gray-900 mt-1">
                      {language === 'hi' ? c.disease_name_hi : c.disease_name_en}
                    </h3>

                    <p className="text-xs text-gray-500">
                      Farmer: <strong className="text-gray-700">{c.farmerName}</strong> • AI Confidence: <strong>{c.confidence}%</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    c.severity === 'urgent'
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {c.severity.toUpperCase()}
                  </span>

                  <button
                    onClick={() => openReviewModal(c)}
                    className="px-4 py-2.5 min-h-[42px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>{c.expertReview ? 'View Review' : 'Start Review'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Farmer reported symptoms & notes */}
              <div className="bg-gray-50 p-3 rounded-2xl text-xs text-gray-700 space-y-1">
                <div>
                  <strong>Farmer Observation:</strong> {c.answers.notes || 'No extra notes provided.'}
                </div>
                {c.reason_for_review_en && (
                  <div className="text-amber-800 font-semibold">
                    <strong>Flagged because:</strong> {c.reason_for_review_en}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal / Desk Form */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-200 my-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-emerald-950">
                    Clinical Case Evaluation: {selectedCase.id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedCase.category.toUpperCase()} • {selectedCase.subType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Case Photo & Symptoms Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
              <div>
                <span className="text-xs font-bold text-gray-500 block mb-1">Attached Photo:</span>
                <img
                  src={selectedCase.images[0] || ''}
                  alt="Symptom"
                  className="w-full h-36 object-cover rounded-xl border border-emerald-200"
                />
              </div>

              <div className="text-xs space-y-1.5">
                <div>
                  <span className="font-bold text-gray-500">AI Hypothesis:</span>{' '}
                  <span className="font-extrabold text-emerald-950">{selectedCase.disease_name_en}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Confidence:</span> {selectedCase.confidence}%
                </div>
                <div>
                  <span className="font-bold text-gray-500">Severity:</span> {selectedCase.severity}
                </div>
                <div>
                  <span className="font-bold text-gray-500">Symptoms Observed:</span>{' '}
                  {selectedCase.symptoms_seen_en.slice(0, 2).join(', ')}
                </div>
                <div>
                  <span className="font-bold text-gray-500">Farmer Notes:</span>{' '}
                  <span className="italic">"{selectedCase.answers.notes || 'None'}"</span>
                </div>
              </div>
            </div>

            {/* Evaluation Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Specialist Diagnosis Decision:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmAi(true)}
                    className={`flex-1 py-2.5 px-3 min-h-[42px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      confirmAi
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('confirmAiDiagnosis')}</span>
                  </button>

                  <button
                    onClick={() => setConfirmAi(false)}
                    className={`flex-1 py-2.5 px-3 min-h-[42px] rounded-xl text-xs font-bold transition ${
                      !confirmAi
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('correctDiagnosis')}
                  </button>
                </div>
              </div>

              {!confirmAi && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Correct Disease (English):
                    </label>
                    <input
                      type="text"
                      value={correctedNameEn}
                      onChange={(e) => setCorrectedNameEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Correct Disease (Hindi / हिन्दी):
                    </label>
                    <input
                      type="text"
                      value={correctedNameHi}
                      onChange={(e) => setCorrectedNameHi(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Expert Notes in Hindi & English */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  {t('addExpertNotes')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-gray-500 font-semibold block mb-0.5">English Remarks:</span>
                    <textarea
                      rows={2}
                      value={notesEn}
                      onChange={(e) => setNotesEn(e.target.value)}
                      placeholder="e.g., Spray fungicide in calm morning hours..."
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 font-semibold block mb-0.5">हिन्दी निर्देश:</span>
                    <textarea
                      rows={2}
                      value={notesHi}
                      onChange={(e) => setNotesHi(e.target.value)}
                      placeholder="जैसे- दवा का छिड़काव धूप में करें..."
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles: Request clearer photo, mark urgent */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-700 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markUrgent}
                    onChange={(e) => setMarkUrgent(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded-sm"
                  />
                  <span className="text-red-700">{t('markUrgentOverride')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoRequested}
                    onChange={(e) => setPhotoRequested(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                  <span>{t('requestBetterPhoto')}</span>
                </label>
              </div>
            </div>

            {/* Submission Status or Buttons */}
            {reviewSubmitted ? (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl text-center text-xs font-extrabold flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-emerald-800" />
                <span>Verification submitted! Report updated to "Expert Verified".</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2.5 min-h-[42px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-3 min-h-[44px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{t('submitReviewBtn')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
