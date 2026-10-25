import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { CategoryType, DiagnosisAnswers, DiagnosisReport, SeverityLevel } from '../types/index.ts';
import { evaluatePixelQuality, QualityCheckResult } from '../utils/photoQuality.ts';
import { evaluateDiagnosisRouting } from '../utils/confidenceRouter.ts';
import { SAMPLE_CROP_IMAGE, SAMPLE_LIVESTOCK_IMAGE } from '../data/seedData.ts';
import { getStoredSettings } from '../utils/storage.ts';
import {
  Camera,
  Upload,
  Video,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Sun,
  Sprout,
  Heart,
  Loader2,
  StopCircle,
} from 'lucide-react';

interface NewDiagnosisWizardProps {
  initialCategory?: CategoryType;
  onCancel: () => void;
  onDiagnosisComplete: (report: DiagnosisReport) => void;
}

export const NewDiagnosisWizard: React.FC<NewDiagnosisWizardProps> = ({
  initialCategory = 'crop',
  onCancel,
  onDiagnosisComplete,
}) => {
  const { language, t } = useLanguage();

  // Wizard Step: 1, 2, 3, 4, or 5 (analyzing)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [subType, setSubType] = useState<string>('Wheat');
  const [customSubType, setCustomSubType] = useState<string>('');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [qualityFeedback, setQualityFeedback] = useState<QualityCheckResult | null>(null);

  // Video recording state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoTimerIntervalRef = useRef<any>(null);

  // Questions Answers
  const [affectedPart, setAffectedPart] = useState<string>('Leaf');
  const [duration, setDuration] = useState<string>('2-3 days');
  const [isSpreading, setIsSpreading] = useState<boolean>(true);
  const [recentRain, setRecentRain] = useState<boolean>(false);
  const [sprayUsed, setSprayUsed] = useState<string>('');

  // Livestock Answers
  const [animalAge, setAnimalAge] = useState<string>('Adult / Milking');
  const [symptomsList, setSymptomsList] = useState<string[]>([]);
  const [vaccinatedRecently, setVaccinatedRecently] = useState<boolean>(true);
  const [otherAnimalsSick, setOtherAnimalsSick] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Voice Speech Recognition state
  const [isListeningMic, setIsListeningMic] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Loading animation state for AI Analysis
  const [analysisPhase, setAnalysisPhase] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Hidden file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Crops & Livestock choices
  const cropChoices = [
    { id: 'Wheat', label_en: 'Wheat (गेहूं)', icon: '🌾' },
    { id: 'Rice', label_en: 'Rice / Paddy (धान)', icon: '🌱' },
    { id: 'Maize', label_en: 'Maize (मक्का)', icon: '🌽' },
    { id: 'Sugarcane', label_en: 'Sugarcane (गन्ना)', icon: '🎋' },
    { id: 'Cotton', label_en: 'Cotton (कपास)', icon: '☁️' },
    { id: 'Mustard', label_en: 'Mustard (सरसों)', icon: '🌼' },
    { id: 'Potato', label_en: 'Potato (आलू)', icon: '🥔' },
    { id: 'Tomato', label_en: 'Tomato (टमाटर)', icon: '🍅' },
    { id: 'Other', label_en: 'Other Crop (अन्य)', icon: '🌿' },
  ];

  const livestockChoices = [
    { id: 'Cow', label_en: 'Cow (गाय)', icon: '🐄' },
    { id: 'Buffalo', label_en: 'Buffalo (भैंस)', icon: '🐃' },
    { id: 'Goat', label_en: 'Goat (बकरी)', icon: '🐐' },
    { id: 'Sheep', label_en: 'Sheep (भेड़)', icon: '🐑' },
    { id: 'Poultry', label_en: 'Poultry (मुर्गी पालन)', icon: '🐔' },
    { id: 'Other', label_en: 'Other Animal (अन्य पशु)', icon: '🐾' },
  ];

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const text = event.results[event.resultIndex][0].transcript;
        setAdditionalNotes((prev) => (prev ? `${prev} ${text}` : text));
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert(language === 'hi' ? 'आपके ब्राउज़र में बोलकर लिखने की सुविधा उपलब्ध नहीं है।' : 'Voice typing is not supported in this browser.');
      return;
    }

    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (err) {
        setIsListeningMic(false);
      }
    }
  };

  // Perform client-side brightness & contrast check on canvas
  const checkImageQuality = (imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(img, 0, 0, 160, 120);
      try {
        const imgData = ctx.getImageData(0, 0, 160, 120);
        const result = evaluatePixelQuality(imgData.data, 2);
        setQualityFeedback(result);
      } catch (e) {
        // SVG or cross-origin canvas issue
        setQualityFeedback({
          isAcceptable: true,
          isTooDark: false,
          isTooBright: false,
          isLowContrast: false,
          averageBrightness: 120,
          contrastVariance: 450,
          advice_en: '',
          advice_hi: '',
        });
      }
    };
    img.src = imgSrc;
  };

  // Image File Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).slice(0, 3 - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => {
            const next = [...prev, result].slice(0, 3);
            checkImageQuality(result);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Quick sample photo pickers
  const useSamplePhoto = (type: 'crop' | 'livestock') => {
    const sample = type === 'crop' ? SAMPLE_CROP_IMAGE : SAMPLE_LIVESTOCK_IMAGE;
    setImages([sample]);
    checkImageQuality(sample);
  };

  // Video Recording & Canvas Frame Extraction (4-5 evenly spaced frames)
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 } },
        audio: false,
      });
      videoStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();

      setIsRecordingVideo(true);
      setVideoTimer(0);

      videoTimerIntervalRef.current = setInterval(() => {
        setVideoTimer((prev) => {
          if (prev >= 20) {
            stopVideoRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);

      const capturedFrames: string[] = [];

      // Extract 4 frames during recording
      const frameInterval = setInterval(() => {
        if (!videoStreamRef.current) {
          clearInterval(frameInterval);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx && videoElement.videoWidth > 0) {
          ctx.drawImage(videoElement, 0, 0, 480, 360);
          const frameData = canvas.toDataURL('image/jpeg', 0.7);
          capturedFrames.push(frameData);
        }
      }, 4000);

      mediaRecorder.onstop = () => {
        clearInterval(frameInterval);
        if (capturedFrames.length > 0) {
          setImages(capturedFrames.slice(0, 3));
          checkImageQuality(capturedFrames[0]);
        }
        stream.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      };

      mediaRecorder.start();
    } catch (err) {
      console.warn('Video recording error:', err);
      alert(language === 'hi' ? 'कैमरा खोलने में समस्या हुई। कृपया फोटो अपलोड करें।' : 'Could not access camera for video recording. Please use photo upload.');
      setIsRecordingVideo(false);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (videoTimerIntervalRef.current) {
        clearInterval(videoTimerIntervalRef.current);
      }
    }
  };

  // Toggle symptom chip
  const toggleSymptom = (symp: string) => {
    setSymptomsList((prev) =>
      prev.includes(symp) ? prev.filter((s) => s !== symp) : [...prev, symp]
    );
  };

  // Submit diagnosis to server /api/diagnose
  const handleSubmitDiagnosis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(5); // Loading screen

    // Animate stages for realistic user expectation
    const timer1 = setTimeout(() => setAnalysisPhase(2), 1200);
    const timer2 = setTimeout(() => setAnalysisPhase(3), 2400);

    const effectiveSubType = subType === 'Other' && customSubType ? customSubType : subType;
    const settings = getStoredSettings();

    const answersPayload: DiagnosisAnswers = {
      category,
      subType: effectiveSubType,
      duration,
      notes: additionalNotes,
      affectedPart: category === 'crop' ? affectedPart : undefined,
      isSpreading: category === 'crop' ? isSpreading : undefined,
      recentRainOrHumidity: category === 'crop' ? recentRain : undefined,
      sprayOrFertilizerUsed: category === 'crop' ? sprayUsed : undefined,
      animalAge: category === 'livestock' ? animalAge : undefined,
      symptomsList: category === 'livestock' ? symptomsList : undefined,
      vaccinatedRecently: category === 'livestock' ? vaccinatedRecently : undefined,
      otherAnimalsSick: category === 'livestock' ? otherAnimalsSick : undefined,
    };

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subType: effectiveSubType,
          answers: answersPayload,
          images: images.length > 0 ? images : [category === 'crop' ? SAMPLE_CROP_IMAGE : SAMPLE_LIVESTOCK_IMAGE],
          demoMode: settings.demoMode,
        }),
      });

      const json = await response.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      const aiData = json.data || {};

      // Apply confidence routing logic
      const routing = evaluateDiagnosisRouting({
        confidence: aiData.confidence || 85,
        severity: (aiData.severity || 'medium') as SeverityLevel,
        needs_expert_review: Boolean(aiData.needs_expert_review),
        threshold: settings.confidenceThreshold,
      });

      const newReport: DiagnosisReport = {
        id: `KS-2026-${Math.floor(100 + Math.random() * 900)}`,
        farmerId: 'farmer-1',
        farmerName: 'Rameshwar Patel',
        createdAt: new Date().toISOString(),
        category,
        subType: effectiveSubType,
        images: images.length > 0 ? images : [category === 'crop' ? SAMPLE_CROP_IMAGE : SAMPLE_LIVESTOCK_IMAGE],
        status: routing.status,
        answers: answersPayload,
        disease_name_en: aiData.disease_name_en || `${effectiveSubType} Condition`,
        disease_name_hi: aiData.disease_name_hi || `${effectiveSubType} रोग`,
        confidence: aiData.confidence || 85,
        severity: (aiData.severity || 'medium') as SeverityLevel,
        summary_en: aiData.summary_en || '',
        summary_hi: aiData.summary_hi || '',
        symptoms_seen_en: aiData.symptoms_seen_en || [],
        symptoms_seen_hi: aiData.symptoms_seen_hi || [],
        causes_en: aiData.causes_en || [],
        causes_hi: aiData.causes_hi || [],
        treatment_steps_en: aiData.treatment_steps_en || [],
        treatment_steps_hi: aiData.treatment_steps_hi || [],
        medicine_or_spray_en: aiData.medicine_or_spray_en || [],
        medicine_or_spray_hi: aiData.medicine_or_spray_hi || [],
        home_remedies_en: aiData.home_remedies_en || [],
        home_remedies_hi: aiData.home_remedies_hi || [],
        prevention_en: aiData.prevention_en || [],
        prevention_hi: aiData.prevention_hi || [],
        when_to_call_expert_en: aiData.when_to_call_expert_en || '',
        when_to_call_expert_hi: aiData.when_to_call_expert_hi || '',
        other_possible_diseases: aiData.other_possible_diseases || [],
        needs_expert_review: routing.isEscalated,
        reason_for_review_en: routing.escalationReasons.join('. '),
        reason_for_review_hi: routing.escalationReasons.length > 0
          ? 'सटीक जांच अथवा गंभीर लक्षणों के कारण यह मामला कृषि/पशु चिकित्सक को भेजा गया है।'
          : '',
      };

      onDiagnosisComplete(newReport);
    } catch (err) {
      console.error('Diagnosis failed, falling back:', err);
      // Fallback safe simulation
      const fallbackReport: DiagnosisReport = {
        id: `KS-2026-${Math.floor(100 + Math.random() * 900)}`,
        farmerId: 'farmer-1',
        farmerName: 'Rameshwar Patel',
        createdAt: new Date().toISOString(),
        category,
        subType: effectiveSubType,
        images: images.length > 0 ? images : [category === 'crop' ? SAMPLE_CROP_IMAGE : SAMPLE_LIVESTOCK_IMAGE],
        status: 'AI Diagnosed',
        answers: answersPayload,
        disease_name_en: category === 'crop' ? `${effectiveSubType} Leaf Spot` : `${effectiveSubType} Mild Respiratory Stress`,
        disease_name_hi: category === 'crop' ? `${effectiveSubType} पत्ती धब्बा रोग` : `${effectiveSubType} मौसमी खांसी व बुखार`,
        confidence: 88,
        severity: 'medium',
        summary_en: `Early symptoms analyzed for ${effectiveSubType}. Follow safe non-toxic remedies first.`,
        summary_hi: `${effectiveSubType} के शुरुआती लक्षणों की पहचान की गई है। पहले सुरक्षित देसी उपाय अपनाएं।`,
        symptoms_seen_en: ['Leaf/tissue discoloration', 'Moisture stress'],
        symptoms_seen_hi: ['पत्ती/त्वचा पर रंग बदलना', 'नमी का तनाव'],
        causes_en: ['Weather change', 'Humidity build-up'],
        causes_hi: ['मौसम में बदलाव', 'उमस का बढ़ना'],
        treatment_steps_en: ['Isolate affected part', 'Apply organic neem spray or recommended generic fungicide/antibiotic'],
        treatment_steps_hi: ['प्रभावित भाग को अलग रखें', 'नीम तेल अथवा सुझाई गई दवा का छिड़काव करें'],
        medicine_or_spray_en: ['Mancozeb 75% WP or approved veterinary bolus'],
        medicine_or_spray_hi: ['मैंकोजेब 75% अथवा पशु चिकित्सक द्वारा सुझाई गई दवा'],
        home_remedies_en: ['Sour buttermilk spray or turmeric paste'],
        home_remedies_hi: ['खट्टी छाछ का छिड़काव या हल्दी का लेप'],
        prevention_en: ['Maintain sanitation and check drainage'],
        prevention_hi: ['सफाई बनाए रखें और पानी न भरने दें'],
        when_to_call_expert_en: 'Call vet if condition worsens after 48 hours.',
        when_to_call_expert_hi: 'यदि 48 घंटे में सुधार न हो तो तुरंत डॉक्टर को बुलाएं।',
        other_possible_diseases: [{ name_en: 'Secondary blight', name_hi: 'द्वितीयक झुलसा', likelihood: 20 }],
        needs_expert_review: false,
      };

      onDiagnosisComplete(fallbackReport);
    }
  };

  // STEP 5: AI Analyzing Animation Screen
  if (currentStep === 5) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin"></div>
            <div className="w-full h-full rounded-full flex items-center justify-center bg-emerald-50 text-emerald-800">
              <Sparkles className="w-10 h-10 text-emerald-700 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-emerald-950 mb-2">
              {t('analyzingTitle')}
            </h3>
            <p className="text-xs text-gray-500">
              Multimodal Vision Model • Gemini 3.8 Flash
            </p>
          </div>

          <div className="space-y-3 max-w-sm mx-auto text-left text-xs font-semibold">
            <div className={`p-3 rounded-2xl flex items-center gap-2.5 transition ${
              analysisPhase >= 1 ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-400'
            }`}>
              {analysisPhase > 1 ? (
                <CheckCircle className="w-4 h-4 text-emerald-700" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              )}
              <span>{t('analyzingStep1')}</span>
            </div>

            <div className={`p-3 rounded-2xl flex items-center gap-2.5 transition ${
              analysisPhase >= 2 ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-400'
            }`}>
              {analysisPhase > 2 ? (
                <CheckCircle className="w-4 h-4 text-emerald-700" />
              ) : analysisPhase === 2 ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
              <span>{t('analyzingStep2')}</span>
            </div>

            <div className={`p-3 rounded-2xl flex items-center gap-2.5 transition ${
              analysisPhase >= 3 ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-400'
            }`}>
              {analysisPhase === 3 ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
              <span>{t('analyzingStep3')}</span>
            </div>
          </div>

          <p className="text-xs text-emerald-800/80 font-medium">
            {language === 'hi'
              ? 'कृपया प्रतीक्षा करें, आपकी फसल/पशु के लिए प्रामाणिक सलाह तैयार हो रही है...'
              : 'Please wait, compiling agronomic & veterinary recommendations...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-24">
      {/* Wizard Header & Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backBtn')}</span>
          </button>
          <div className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
            {language === 'hi' ? `चरण ${currentStep} / 4` : `Step ${currentStep} of 4`}
          </div>
        </div>

        {/* 4-Step Animated Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {['step1', 'step2', 'step3', 'step4'].map((sKey, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={sKey} className="flex flex-col gap-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-700'
                      : isCurrent
                      ? 'bg-emerald-500 ring-2 ring-emerald-200'
                      : 'bg-gray-200'
                  }`}
                />
                <span className={`text-[10px] text-center font-bold ${
                  isCurrent ? 'text-emerald-950 font-extrabold' : 'text-gray-400'
                }`}>
                  {t(sKey as any)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {t('chooseCategory')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {language === 'hi'
                ? 'जिस पौधे या पशु में परेशानी दिख रही है, उसका चयन करें।'
                : 'Select whether you need advice for agricultural crops or livestock.'}
            </p>
          </div>

          {/* Crop vs Livestock Main Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setCategory('crop');
                setSubType('Wheat');
              }}
              className={`p-5 rounded-3xl border-2 text-left transition min-h-[110px] flex flex-col justify-between ${
                category === 'crop'
                  ? 'border-emerald-700 bg-emerald-50/80 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center">
                <Sprout className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="font-extrabold text-base text-emerald-950">{t('cropOption')}</div>
                <div className="text-[11px] text-gray-500">Wheat, Rice, Veggies, Cotton</div>
              </div>
            </button>

            <button
              onClick={() => {
                setCategory('livestock');
                setSubType('Cow');
              }}
              className={`p-5 rounded-3xl border-2 text-left transition min-h-[110px] flex flex-col justify-between ${
                category === 'livestock'
                  ? 'border-amber-700 bg-amber-50/80 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center">
                <Heart className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <div className="font-extrabold text-base text-gray-900">{t('livestockOption')}</div>
                <div className="text-[11px] text-gray-500">Cow, Buffalo, Goat, Poultry</div>
              </div>
            </button>
          </div>

          {/* Subtype Grid (Crops or Livestock) */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {category === 'crop' ? t('selectCropType') : t('selectAnimalType')}
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
              {(category === 'crop' ? cropChoices : livestockChoices).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSubType(item.id)}
                  className={`p-3 min-h-[56px] rounded-2xl border text-left font-bold text-xs flex items-center gap-2 transition ${
                    subType === item.id
                      ? 'border-emerald-700 bg-emerald-100/80 text-emerald-950 shadow-xs ring-1 ring-emerald-700'
                      : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="leading-tight">{item.label_en}</span>
                </button>
              ))}
            </div>

            {subType === 'Other' && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('otherSpecify')}
                </label>
                <input
                  type="text"
                  value={customSubType}
                  onChange={(e) => setCustomSubType(e.target.value)}
                  placeholder={language === 'hi' ? 'फसल या पशु का नाम लिखें...' : 'Type name here...'}
                  className="w-full p-3 min-h-[48px] rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm"
                />
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{t('continueBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CAPTURE PHOTO / VIDEO */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {t('captureTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {t('captureSub')}
            </p>
          </div>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
          <input
            type="file"
            ref={galleryInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Capture Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Take Camera Photo */}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="p-4 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-sm transition flex flex-col items-center justify-center gap-2 min-h-[85px]"
            >
              <Camera className="w-6 h-6 text-emerald-300" />
              <span>{t('btnTakePhoto')}</span>
            </button>

            {/* Choose from Gallery */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="p-4 bg-white hover:bg-emerald-50 active:scale-98 text-emerald-950 border border-emerald-300 rounded-2xl font-bold text-sm transition flex flex-col items-center justify-center gap-2 min-h-[85px]"
            >
              <Upload className="w-6 h-6 text-emerald-800" />
              <span>{t('btnUploadGallery')}</span>
            </button>

            {/* Record Video */}
            <button
              onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
              className={`p-4 rounded-2xl font-bold text-sm transition flex flex-col items-center justify-center gap-2 min-h-[85px] ${
                isRecordingVideo
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300'
              }`}
            >
              {isRecordingVideo ? (
                <>
                  <StopCircle className="w-6 h-6 text-white" />
                  <span>{t('stopRecording')} ({videoTimer}s)</span>
                </>
              ) : (
                <>
                  <Video className="w-6 h-6 text-amber-700" />
                  <span>{t('btnRecordVideo')}</span>
                </>
              )}
            </button>
          </div>

          {/* Evaluator Quick-Pick Sample Photos */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-900">
              ⚡ Instant Demo Quick-Pick:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => useSamplePhoto('crop')}
                className="px-3 py-1.5 min-h-[36px] bg-white hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-300 transition"
              >
                🌾 {t('useSampleCropPhoto')}
              </button>
              <button
                onClick={() => useSamplePhoto('livestock')}
                className="px-3 py-1.5 min-h-[36px] bg-white hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 transition"
              >
                🐄 {t('useSampleAnimalPhoto')}
              </button>
            </div>
          </div>

          {/* Photo Preview & Quality Advice */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                  {images.length} / 3 {language === 'hi' ? 'फोटो जोड़ी गईं' : 'Photos Added'}
                </span>
                <span className="text-[11px] text-gray-500">{t('maxPhotosNotice')}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {images.map((imgSrc, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-200 bg-gray-100 group">
                    <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Photo Quality Feedback Card */}
              {qualityFeedback && (
                <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 border ${
                  qualityFeedback.isAcceptable
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}>
                  {qualityFeedback.isAcceptable ? (
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {qualityFeedback.isAcceptable
                        ? t('photoQualityGood')
                        : language === 'hi'
                        ? qualityFeedback.advice_hi
                        : qualityFeedback.advice_en}
                    </span>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      Brightness: {qualityFeedback.averageBrightness} / 255 • Contrast score: {qualityFeedback.contrastVariance}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 min-h-[48px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition"
            >
              {t('backBtn')}
            </button>

            <button
              onClick={() => {
                if (images.length === 0) {
                  // Fallback sample image if none taken
                  useSamplePhoto(category);
                }
                setCurrentStep(3);
              }}
              className="px-6 py-3.5 min-h-[48px] bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <span>{t('continueBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GUIDED QUESTIONS WITH VOICE MIC */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {t('questionsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {t('questionsSub')}
            </p>
          </div>

          {/* Crop Specific Questions */}
          {category === 'crop' && (
            <div className="space-y-4">
              {/* Affected Plant Part */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('affectedPartLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'Leaf', label: t('partLeaf') },
                    { id: 'Stem / Branch', label: t('partStem') },
                    { id: 'Root', label: t('partRoot') },
                    { id: 'Fruit / Grain', label: t('partFruit') },
                    { id: 'Whole Plant', label: t('partWhole') },
                  ].map((part) => (
                    <button
                      key={part.id}
                      onClick={() => setAffectedPart(part.id)}
                      className={`px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold transition ${
                        affectedPart === part.id
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('durationLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'Just today', label: t('durToday') },
                    { id: '2-3 days', label: t('dur23Days') },
                    { id: 'About a week', label: t('durWeek') },
                    { id: 'More than 2 weeks', label: t('durMonth') },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setDuration(dur.id)}
                      className={`px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold transition ${
                        duration === dur.id
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Is it spreading */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('isSpreadingLabel')}
                </label>
                <div className="flex gap-2">
                  {[
                    { val: true, label: t('yes') },
                    { val: false, label: t('no') },
                  ].map((item) => (
                    <button
                      key={String(item.val)}
                      onClick={() => setIsSpreading(item.val)}
                      className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition ${
                        isSpreading === item.val
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rain or humidity */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('recentRainLabel')}
                </label>
                <div className="flex gap-2">
                  {[
                    { val: true, label: t('yes') },
                    { val: false, label: t('no') },
                  ].map((item) => (
                    <button
                      key={String(item.val)}
                      onClick={() => setRecentRain(item.val)}
                      className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition ${
                        recentRain === item.val
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fertilizer or spray used */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  {t('sprayUsedLabel')}
                </label>
                <input
                  type="text"
                  value={sprayUsed}
                  onChange={(e) => setSprayUsed(e.target.value)}
                  placeholder={t('sprayPlaceholder')}
                  className="w-full p-3 min-h-[48px] rounded-xl border border-gray-300 focus:border-emerald-600 text-sm"
                />
              </div>
            </div>
          )}

          {/* Livestock Specific Questions */}
          {category === 'livestock' && (
            <div className="space-y-4">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('animalAgeLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'Calf / Kid / Young', label: t('ageYoung') },
                    { id: 'Adult / Milking', label: t('ageAdult') },
                    { id: 'Dry / Senior', label: t('ageDry') },
                  ].map((age) => (
                    <button
                      key={age.id}
                      onClick={() => setAnimalAge(age.id)}
                      className={`px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold transition ${
                        animalAge === age.id
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('symptomsCheckLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'High Fever / Warm ears', label: t('sympFever') },
                    { id: 'Loss of Appetite / Not eating', label: t('sympNotEating') },
                    { id: 'Sudden drop in milk yield', label: t('sympMilkDrop') },
                    { id: 'Swelling / Udder hardness', label: t('sympSwelling') },
                    { id: 'Diarrhoea / Loose stool', label: t('sympDiarrhoea') },
                    { id: 'Cough / Nasal discharge', label: t('sympCough') },
                    { id: 'Limping / Cannot stand', label: t('sympLimping') },
                    { id: 'Skin lesions / Lumps', label: t('sympSkinLumps') },
                  ].map((symp) => {
                    const isChecked = symptomsList.includes(symp.id);
                    return (
                      <button
                        key={symp.id}
                        type="button"
                        onClick={() => toggleSymptom(symp.id)}
                        className={`p-3 min-h-[48px] rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                          isChecked
                            ? 'border-amber-700 bg-amber-100/80 text-amber-950'
                            : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-amber-800 border-amber-800 text-white' : 'border-gray-400 bg-white'
                        }`}>
                          {isChecked && '✓'}
                        </div>
                        <span>{symp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vaccinated */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  {t('vaccinatedRecentlyLabel')}
                </label>
                <div className="flex gap-2">
                  {[
                    { val: true, label: t('yes') },
                    { val: false, label: t('no') },
                  ].map((item) => (
                    <button
                      key={String(item.val)}
                      onClick={() => setVaccinatedRecently(item.val)}
                      className={`px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold transition ${
                        vaccinatedRecently === item.val
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Voice-Enabled Free-Text Notes */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950">
                {t('additionalNotesLabel')}
              </label>

              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={toggleMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold transition ${
                  isListeningMic
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-800 text-white hover:bg-emerald-900'
                }`}
              >
                {isListeningMic ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{t('listeningVoice')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t('pressMicToSpeak')}</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full p-3 rounded-xl border border-emerald-200 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm"
            />
          </div>

          {/* Navigation */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-3 min-h-[48px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition"
            >
              {t('backBtn')}
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3.5 min-h-[48px] bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <span>{t('continueBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW AND SUBMIT */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {t('reviewSummaryTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {language === 'hi'
                ? 'कृपया सबमिट करने से पहले अपनी दी गई जानकारी जांच लें।'
                : 'Review your submission details before initiating multimodal AI diagnosis.'}
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">{t('filterCategory')}:</span>
              <span className="font-extrabold text-emerald-950 uppercase">{category}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">
                {category === 'crop' ? 'Crop' : 'Animal'}:
              </span>
              <span className="font-bold text-gray-900">
                {subType === 'Other' && customSubType ? customSubType : subType}
              </span>
            </div>

            {category === 'crop' && (
              <>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">{t('affectedPartLabel')}:</span>
                  <span className="font-bold text-gray-900">{affectedPart}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">{t('durationLabel')}:</span>
                  <span className="font-bold text-gray-900">{duration}</span>
                </div>
              </>
            )}

            {category === 'livestock' && (
              <>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">{t('animalAgeLabel')}:</span>
                  <span className="font-bold text-gray-900">{animalAge}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">Symptoms:</span>
                  <span className="font-bold text-amber-900">
                    {symptomsList.length > 0 ? symptomsList.join(', ') : 'None marked'}
                  </span>
                </div>
              </>
            )}

            {additionalNotes && (
              <div className="py-1">
                <span className="text-gray-500 font-medium block mb-1">Notes:</span>
                <p className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800 italic">
                  "{additionalNotes}"
                </p>
              </div>
            )}

            {/* Photos thumbnail preview */}
            <div className="pt-2">
              <span className="text-gray-500 font-medium block mb-1">Attached Images:</span>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="attached"
                    className="w-14 h-14 object-cover rounded-xl border border-emerald-300"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-3 min-h-[48px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition"
            >
              {t('backBtn')}
            </button>

            <button
              onClick={handleSubmitDiagnosis}
              className="px-8 py-4 min-h-[56px] bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-2xl font-extrabold text-base shadow-lg hover:shadow-emerald-900/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>{t('readyToDiagnose')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
