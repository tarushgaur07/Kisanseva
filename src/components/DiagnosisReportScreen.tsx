import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DiagnosisReport, SeverityLevel } from '../types/index.ts';
import { saveReport, deleteReport } from '../utils/storage.ts';
import { jsPDF } from 'jspdf';
import {
  Volume2,
  VolumeX,
  Download,
  Share2,
  MessageSquareQuote,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Trash2,
  Stethoscope,
  ThumbsUp,
  ThumbsDown,
  Check,
} from 'lucide-react';

interface DiagnosisReportScreenProps {
  report: DiagnosisReport;
  onBack: () => void;
  onAskAi: (report: DiagnosisReport) => void;
  onCallVet: () => void;
  onReportUpdated: (updatedReport: DiagnosisReport) => void;
}

export const DiagnosisReportScreen: React.FC<DiagnosisReportScreenProps> = ({
  report,
  onBack,
  onAskAi,
  onCallVet,
  onReportUpdated,
}) => {
  const { language, setLanguage, t, speakText, stopSpeaking, isSpeaking } = useLanguage();

  // Collapsible cards state
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    summary: true,
    symptoms: true,
    treatment: true,
    medicines: true,
    homeRemedies: true,
    causes: false,
    prevention: false,
    otherPossible: false,
    whenToCall: true,
  });

  // Checkable treatment steps
  const [completedSteps, setCompletedSteps] = useState<{ [index: number]: boolean }>({});

  // Feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(Boolean(report.feedback));
  const [feedbackHelpful, setFeedbackHelpful] = useState<boolean | null>(
    report.feedback ? report.feedback.helpful : null
  );
  const [feedbackComment, setFeedbackComment] = useState<string>(
    report.feedback?.comment || ''
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Text to speech read-aloud
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const isHi = language === 'hi';
      const diseaseName = isHi ? report.disease_name_hi : report.disease_name_en;
      const summary = isHi ? report.summary_hi : report.summary_en;
      const treatments = (isHi ? report.treatment_steps_hi : report.treatment_steps_en).join('. ');
      const speechText = isHi
        ? `रोग की पहचान: ${diseaseName}। विवरण: ${summary}। मुख्य उपचार कदम: ${treatments}। किसी भी दवा की मात्रा लेबल या डॉक्टर से पुष्टि अवश्य करें।`
        : `Identified condition: ${diseaseName}. Summary: ${summary}. Recommended treatment steps: ${treatments}. Confirm doses with product label or veterinarian.`;

      speakText(speechText, language);
    }
  };

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    const isHi = language === 'hi';
    const diseaseName = isHi ? report.disease_name_hi : report.disease_name_en;
    const summary = isHi ? report.summary_hi : report.summary_en;
    const treatments = (isHi ? report.treatment_steps_hi : report.treatment_steps_en).slice(0, 3).join('\n• ');

    const shareMessage = isHi
      ? `🌾 *किसानसेवा एआई जांच रिपोर्ट* (ID: ${report.id})\n*फसल/पशु:* ${report.subType}\n*रोग:* ${diseaseName}\n*विश्वास:* ${report.confidence}%\n*गंभीरता:* ${report.severity.toUpperCase()}\n\n*विवरण:* ${summary}\n\n*मुख्य उपचार:*\n• ${treatments}\n\n_किसानसेवा - भारतीय अन्नदाता का डिजिटल साथी_`
      : `🌾 *KisanSeva Farm Health Report* (ID: ${report.id})\n*Subject:* ${report.subType}\n*Diagnosis:* ${diseaseName}\n*Confidence:* ${report.confidence}%\n*Severity:* ${report.severity.toUpperCase()}\n\n*Summary:* ${summary}\n\n*Primary Steps:*\n• ${treatments}\n\n_KisanSeva - AI Agricultural Assistant_`;

    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Generate Bilingual PDF Report
  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(27, 94, 32); // Deep green #1B5E20
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('KISANSEVA FARM HEALTH REPORT', 14, 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report ID: ${report.id}  |  Date: ${new Date(report.createdAt).toLocaleDateString()}`, 14, 23);
      doc.text(`Status: ${report.status.toUpperCase()}  |  Category: ${report.category.toUpperCase()} (${report.subType})`, 14, 28);

      // Disease Title & Confidence
      doc.setTextColor(27, 94, 32);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Diagnosis: ${report.disease_name_en}`, 14, 44);

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Confidence Score: ${report.confidence}%    |    Severity Level: ${report.severity.toUpperCase()}`, 14, 51);

      // Safety Disclaimer Box
      doc.setFillColor(254, 243, 199); // Amber-100
      doc.rect(14, 56, 182, 14, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(9);
      doc.text('DISCLAIMER: AI assistive advisory. Confirm exact dosage with local agronomist or veterinarian.', 18, 65);

      let yPos = 78;

      // Expert verification highlight if verified
      if (report.expertReview) {
        doc.setFillColor(236, 253, 245);
        doc.rect(14, yPos - 5, 182, 22, 'F');
        doc.setTextColor(6, 95, 70);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`VERIFIED BY: ${report.expertReview.expertName} (${report.expertReview.expertQualification})`, 18, yPos);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(`Expert Remarks: ${report.expertReview.notes_en}`, 18, yPos + 7);
        yPos += 26;
      }

      // Summary Section
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Condition Summary:', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(report.summary_en, 180);
      doc.text(summaryLines, 14, yPos);
      yPos += summaryLines.length * 5 + 4;

      // Recommended Treatments
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Treatment Steps & Action Plan:', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.treatment_steps_en.forEach((step, i) => {
        const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, 175);
        doc.text(stepLines, 18, yPos);
        yPos += stepLines.length * 5 + 2;
      });

      yPos += 4;

      // Generic Sprays & Medicines
      if (report.medicine_or_spray_en.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Suggested Generic Formulations (Consult Dealer/Vet):', 14, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        report.medicine_or_spray_en.forEach((med) => {
          doc.text(`• ${med}`, 18, yPos);
          yPos += 5;
        });
      }

      // Home Remedies
      if (report.home_remedies_en.length > 0) {
        yPos += 4;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Safe Traditional Farm Remedies:', 14, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        report.home_remedies_en.forEach((rem) => {
          doc.text(`• ${rem}`, 18, yPos);
          yPos += 5;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('KisanSeva Platform - National Agriculture Helpline: 1800-180-1551 | Animal Helpline: 1962', 14, 285);

      doc.save(`KisanSeva_Report_${report.id}.pdf`);
    } catch (pdfErr) {
      console.warn('PDF generation fallback:', pdfErr);
      window.print();
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = (helpful: boolean) => {
    const updated: DiagnosisReport = {
      ...report,
      feedback: {
        helpful,
        comment: feedbackComment,
        submittedAt: new Date().toISOString(),
      },
    };
    saveReport(updated);
    setFeedbackHelpful(helpful);
    setFeedbackSubmitted(true);
    onReportUpdated(updated);
  };

  // Delete Report
  const handleDeleteReport = () => {
    if (confirm(language === 'hi' ? 'क्या आप इस रिपोर्ट को हटाना चाहते हैं?' : 'Are you sure you want to delete this report?')) {
      deleteReport(report.id);
      onBack();
    }
  };

  const isUrgentLivestock = report.category === 'livestock' && report.severity === 'urgent';

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 pb-28 space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-emerald-950 px-3 py-2 rounded-xl bg-white border border-gray-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backBtn')}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 min-h-[38px] rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs hover:bg-emerald-50 transition"
          >
            {language === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>

          {/* Delete Report */}
          <button
            onClick={handleDeleteReport}
            aria-label="Delete report"
            className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URGENT RED BANNER (Emergency livestock or acute severity) */}
      {isUrgentLivestock && (
        <div className="bg-red-600 text-white rounded-3xl p-5 shadow-lg border-2 border-red-700 animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-2xl shrink-0 mt-0.5">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-wide uppercase">
                  {language === 'hi' ? '🚨 अत्यंत गंभीर स्थिति - तुरंत डॉक्टर बुलाएं' : '🚨 EMERGENCY: IMMEDIATE VET CARE REQUIRED'}
                </h3>
                <p className="text-xs sm:text-sm text-red-100 mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'पशु के लक्षण गंभीर हैं। घरेलू इलाज के भरोसे न रहें, तुरंत हेल्पलाइन 1962 या नजदीकी पशु चिकित्सक को बुलाएं।'
                    : 'Acute symptoms detected. Do not rely solely on home remedies. Call national vet helpline 1962 or your local veterinary doctor now.'}
                </p>
              </div>
            </div>

            <button
              onClick={onCallVet}
              className="px-4 py-3 min-h-[46px] bg-white text-red-800 hover:bg-red-50 rounded-2xl font-bold text-xs uppercase tracking-wider shrink-0 shadow-md transition"
            >
              {t('btnCallVet')}
            </button>
          </div>
        </div>
      )}

      {/* Notice if Sent to Expert */}
      {report.status === 'Sent to Expert' && !report.expertReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-900">
            <span className="font-extrabold block mb-0.5">
              {language === 'hi' ? 'यह रिपोर्ट डॉक्टर समीक्षा के लिए भेजी गई है' : 'Sent to Agricultural / Veterinary Specialist'}
            </span>
            <p className="text-blue-800 leading-relaxed">
              {t('sentToExpertNotice')}
            </p>
          </div>
        </div>
      )}

      {/* EXPERT VERIFIED HIGHLIGHT CARD */}
      {report.expertReview && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">
                  {t('expertCardTitle')}
                </h4>
                <p className="text-xs text-emerald-800">
                  {t('expertVerifiedBy')}: <span className="font-bold">{report.expertReview.expertName}</span> ({report.expertReview.expertQualification})
                </p>
              </div>
            </div>
            <span className="bg-emerald-200/90 text-emerald-950 text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase">
              {new Date(report.expertReview.verifiedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-xs font-bold text-gray-500 block mb-1">
              {t('expertNotesLabel')}:
            </span>
            <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
              "{language === 'hi' ? report.expertReview.notes_hi : report.expertReview.notes_en}"
            </p>

            {report.expertReview.additionalPrescriptions && report.expertReview.additionalPrescriptions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-700">
                <span className="font-bold">Prescription note:</span> {report.expertReview.additionalPrescriptions.join('; ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT HEADER CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-md">
                {report.category === 'crop' ? '🌾 ' : '🐄 '}
                {report.subType}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {report.id} • {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
              {language === 'hi' ? report.disease_name_hi : report.disease_name_en}
            </h1>
          </div>

          {/* Confidence Circular Gauge */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={report.confidence >= 80 ? 'text-emerald-700' : 'text-amber-500'}
                  strokeDasharray={`${report.confidence}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-extrabold text-gray-900">{report.confidence}%</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-gray-500">{t('confidenceScore')}</div>
              <div className="text-xs font-extrabold text-emerald-900">
                {report.confidence >= 85 ? 'High Accuracy' : 'Moderate Match'}
              </div>
            </div>
          </div>
        </div>

        {/* Status and Severity Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
            report.status === 'Expert Verified'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : report.status === 'Sent to Expert'
              ? 'bg-blue-100 text-blue-900 border border-blue-300'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {report.status === 'Expert Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
            {report.status === 'Sent to Expert' && <Clock className="w-3.5 h-3.5 text-blue-700" />}
            <span>{report.status}</span>
          </span>

          {/* Severity Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
            report.severity === 'urgent'
              ? 'bg-red-100 text-red-900 border border-red-300'
              : report.severity === 'high'
              ? 'bg-orange-100 text-orange-900'
              : report.severity === 'medium'
              ? 'bg-amber-100 text-amber-900'
              : 'bg-emerald-100 text-emerald-900'
          }`}>
            {report.severity === 'urgent' && t('severityUrgent')}
            {report.severity === 'high' && t('severityHigh')}
            {report.severity === 'medium' && t('severityMedium')}
            {report.severity === 'low' && t('severityLow')}
          </span>
        </div>

        {/* Attached Photos Gallery */}
        {report.images && report.images.length > 0 && (
          <div className="flex gap-3 overflow-x-auto py-1">
            {report.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Case symptom"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl border-2 border-emerald-100 shadow-xs shrink-0"
              />
            ))}
          </div>
        )}

        {/* Key Quick Buttons: Listen, PDF, WhatsApp, Ask AI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {/* Listen Aloud Button */}
          <button
            onClick={handleReadAloud}
            className={`p-3 min-h-[48px] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              isSpeaking
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            <span>{isSpeaking ? t('btnStopListen') : t('btnListen')}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="p-3 min-h-[48px] bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>{t('btnDownloadPdf')}</span>
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="p-3 min-h-[48px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>{t('btnShareWhatsApp')}</span>
          </button>

          {/* Ask AI About Report */}
          <button
            onClick={() => onAskAi(report)}
            className="p-3 min-h-[48px] bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageSquareQuote className="w-4 h-4 text-emerald-800" />
            <span>{t('btnAskAiAboutReport')}</span>
          </button>
        </div>
      </div>

      {/* STATUTORY SAFETY DISCLAIMER (Yellow card) */}
      <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex items-start gap-3 text-xs text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {t('aiDisclaimer')}
        </p>
      </div>

      {/* COLLAPSIBLE DETAIL SECTIONS */}
      <div className="space-y-4">
        {/* 1. Summary */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
          >
            <span>{t('sectionSummary')}</span>
            {openSections.summary ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.summary && (
            <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed border-t border-gray-50 pt-3">
              {language === 'hi' ? report.summary_hi : report.summary_en}
            </div>
          )}
        </div>

        {/* 2. What we saw (Symptoms identified) */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('symptoms')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
          >
            <span>{t('sectionSymptoms')}</span>
            {openSections.symptoms ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.symptoms && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-3 space-y-2">
              {(language === 'hi' ? report.symptoms_seen_hi : report.symptoms_seen_en).map((symp, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>{symp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Treatment Steps (CHECKABLE) */}
        <div className="bg-white rounded-3xl border-2 border-emerald-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('treatment')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left bg-emerald-50/50"
          >
            <div className="flex items-center gap-2">
              <span>{t('sectionTreatment')}</span>
              <span className="text-xs bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>
            {openSections.treatment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.treatment && (
            <div className="p-4 sm:p-5 space-y-3">
              {(language === 'hi' ? report.treatment_steps_hi : report.treatment_steps_en).map((step, idx) => {
                const isChecked = completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 line-through opacity-80'
                        : 'bg-white border-gray-200 hover:border-emerald-300 text-gray-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isChecked ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-gray-400 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs sm:text-sm font-medium leading-relaxed">
                      <strong className="mr-1">{idx + 1}.</strong> {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Medicines / Sprays (Generic Indian Brands) */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('medicines')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
          >
            <span>{t('sectionMedicines')}</span>
            {openSections.medicines ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.medicines && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-3 space-y-2">
              {(language === 'hi' ? report.medicine_or_spray_hi : report.medicine_or_spray_en).map((med, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-emerald-950">
                  <span className="text-emerald-700">💊</span>
                  <span>{med}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Home Remedies (Desi Nuskhe) */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('homeRemedies')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
          >
            <span>{t('sectionHomeRemedies')}</span>
            {openSections.homeRemedies ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.homeRemedies && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-3 space-y-2">
              {(language === 'hi' ? report.home_remedies_hi : report.home_remedies_en).map((rem, i) => (
                <div key={i} className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-emerald-950">
                  <span className="text-emerald-700">🌱</span>
                  <span>{rem}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Prevention */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('prevention')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
          >
            <span>{t('sectionPrevention')}</span>
            {openSections.prevention ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.prevention && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-3 space-y-2">
              {(language === 'hi' ? report.prevention_hi : report.prevention_en).map((prev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                  <span>{prev}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. Other Possibilities Evaluated */}
        {report.other_possible_diseases && report.other_possible_diseases.length > 0 && (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleSection('otherPossible')}
              className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
            >
              <span>{t('sectionOtherPossible')}</span>
              {openSections.otherPossible ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {openSections.otherPossible && (
              <div className="px-5 pb-5 border-t border-gray-50 pt-3 space-y-3">
                {report.other_possible_diseases.map((other, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-800">
                      <span>{language === 'hi' ? other.name_hi : other.name_en}</span>
                      <span>{other.likelihood}% match</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${other.likelihood}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. When to Call an In-Person Expert */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('whenToCall')}
            className="w-full p-4 sm:p-5 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-950 text-left"
          >
            <span>{t('sectionWhenToCall')}</span>
            {openSections.whenToCall ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSections.whenToCall && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-3 text-xs sm:text-sm text-gray-700 leading-relaxed flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{language === 'hi' ? report.when_to_call_expert_hi : report.when_to_call_expert_en}</span>
            </div>
          )}
        </div>
      </div>

      {/* WAS THIS REPORT HELPFUL? FEEDBACK CARD */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3">
        <h4 className="font-extrabold text-sm text-emerald-950">
          {t('btnFeedbackHelpful')}
        </h4>

        {feedbackSubmitted ? (
          <div className="p-3 bg-white rounded-2xl border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{t('feedbackThanks')}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitFeedback(true)}
                className="px-4 py-2.5 min-h-[42px] bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xs transition"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-700" />
                <span>{t('btnFeedbackYes')}</span>
              </button>

              <button
                onClick={() => handleSubmitFeedback(false)}
                className="px-4 py-2.5 min-h-[42px] bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-2xl font-bold text-xs flex items-center gap-2 transition"
              >
                <ThumbsDown className="w-4 h-4 text-gray-500" />
                <span>{t('btnFeedbackNo')}</span>
              </button>
            </div>

            <input
              type="text"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder={language === 'hi' ? 'कोई टिप्पणी या सुधार का सुझाव...' : 'Optional comment for platform agronomists...'}
              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};
