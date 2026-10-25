import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DiagnosisReport } from '../types/index.ts';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, User, Bot, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AskAiChatProps {
  reportContext?: DiagnosisReport | null;
  onClearContext?: () => void;
  onBack?: () => void;
}

export const AskAiChat: React.FC<AskAiChatProps> = ({
  reportContext,
  onClearContext,
  onBack,
}) => {
  const { language, t, speakText, stopSpeaking, isSpeaking } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const isHi = language === 'hi';
    const welcomeText = reportContext
      ? isHi
        ? `राम-राम किसान भाई! मैं आपकी रिपोर्ट "${reportContext.disease_name_hi}" के संबंध में प्रश्नों का उत्तर देने के लिए तैयार हूँ। आप दवा, पानी, या दूध की सुरक्षा के बारे में कुछ भी पूछ सकते हैं।`
        : `Namaste Farmer! I am ready to answer your questions regarding your report "${reportContext.disease_name_en}". Feel free to ask about dosages, safety, or field precautions.`
      : isHi
      ? 'राम-राम किसान भाई! मैं किसानसेवा मित्र हूँ। फसल, पशु रोग, खाद या मौसम संबंधी कोई भी सवाल पूछें या बोलकर बताएं।'
      : 'Namaste! I am KisanSeva Mitra, your agricultural AI companion. Ask me anything about crop diseases, animal care, or weather advisory.';

    return [
      {
        id: '1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech Recognition for Mic
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
        setInputVal(text);
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
      alert(language === 'hi' ? 'आपके ब्राउज़र में बोलकर लिखने की सुविधा उपलब्ध नहीं है।' : 'Voice input not supported in this browser.');
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

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.slice(-4),
          reportContext: reportContext || undefined,
          language,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || (language === 'hi' ? 'धन्यवाद, अपनी फसल की देखभाल करते रहें।' : 'Thank you, take good care of your farm.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: language === 'hi'
          ? 'माफ़ कीजियेगा, थोड़ी देर बाद पुनः प्रयास करें।'
          : 'Network error. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    t('chatQuickChip1'),
    t('chatQuickChip2'),
    t('chatQuickChip3'),
    t('chatQuickChip4'),
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 h-[calc(100vh-80px)] flex flex-col">
      {/* Top Bar with Context */}
      <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-xs mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-emerald-950">{t('chatTitle')}</h3>
            <p className="text-[11px] text-gray-500">
              {reportContext
                ? `${t('chatReportContext')} ${language === 'hi' ? reportContext.disease_name_hi : reportContext.disease_name_en}`
                : t('chatSub')}
            </p>
          </div>
        </div>

        {reportContext && onClearContext && (
          <button
            onClick={onClearContext}
            className="text-xs text-emerald-800 hover:underline font-semibold"
          >
            Clear context
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-emerald-50/30 rounded-3xl border border-emerald-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-200" />
              </div>
            )}

            <div
              className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-3xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-800 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white text-gray-900 rounded-tl-xs border border-emerald-100 shadow-xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] ${
                  msg.sender === 'user' ? 'text-emerald-200' : 'text-gray-400'
                }`}
              >
                <span>{msg.timestamp}</span>

                {msg.sender === 'bot' && (
                  <button
                    onClick={() => speakText(msg.text, language)}
                    title="Listen aloud"
                    className="p-1 hover:text-emerald-800 text-gray-400 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-emerald-800" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold p-3 bg-white/80 rounded-2xl max-w-[200px]">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
            <span>KisanSeva is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {quickChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 min-h-[36px] bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form with Mic and Send Button */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={toggleMic}
          className={`p-3 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center transition shadow-xs ${
            isListeningMic
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
          }`}
          title="Speak in Hindi or English"
        >
          {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t('chatPlaceholder')}
          className="flex-1 p-3.5 min-h-[48px] rounded-2xl border border-emerald-300 bg-white focus:outline-emerald-700 text-sm shadow-xs"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputVal.trim() || loading}
          className="p-3.5 min-w-[48px] min-h-[48px] bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
