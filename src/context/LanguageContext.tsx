import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/index.ts';
import { translations, TranslationKey } from '../i18n/translations.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  hasChosenLanguageInitially: boolean;
  setHasChosenLanguageInitially: (chosen: boolean) => void;
  // Speech Synthesis
  isSpeaking: boolean;
  speakText: (text: string, langOverride?: Language) => void;
  stopSpeaking: () => void;
  // Text Size
  textSize: 'normal' | 'large';
  setTextSize: (size: 'normal' | 'large') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kisanseva_language');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const [hasChosenLanguageInitially, setHasChosenLanguageInitiallyState] = useState<boolean>(() => {
    return localStorage.getItem('kisanseva_lang_selected') === 'true';
  });

  const [textSize, setTextSizeState] = useState<'normal' | 'large'>(() => {
    const saved = localStorage.getItem('kisanseva_text_size');
    return saved === 'large' ? 'large' : 'normal';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kisanseva_language', lang);
    localStorage.setItem('kisanseva_lang_selected', 'true');
    setHasChosenLanguageInitiallyState(true);
  };

  const setHasChosenLanguageInitially = (chosen: boolean) => {
    setHasChosenLanguageInitiallyState(chosen);
    localStorage.setItem('kisanseva_lang_selected', chosen ? 'true' : 'false');
  };

  const setTextSize = (size: 'normal' | 'large') => {
    setTextSizeState(size);
    localStorage.setItem('kisanseva_text_size', size);
  };

  const t = (key: TranslationKey): string => {
    const langDict = translations[language] || translations.en;
    return (langDict as any)[key] || (translations.en as any)[key] || key;
  };

  // Text-To-Speech implementation using window.speechSynthesis
  const speakText = (text: string, langOverride?: Language) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const targetLang = langOverride || language;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95; // slightly slower for clarity

    // Select suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find((v) => 
      targetLang === 'hi' ? v.lang.startsWith('hi') : (v.lang.startsWith('en-IN') || v.lang.startsWith('en'))
    );
    if (langVoice) {
      utterance.voice = langVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        hasChosenLanguageInitially,
        setHasChosenLanguageInitially,
        isSpeaking,
        speakText,
        stopSpeaking,
        textSize,
        setTextSize,
      }}
    >
      <div className={textSize === 'large' ? 'text-lg select-none' : 'text-base select-none'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
