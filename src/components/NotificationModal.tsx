import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AppNotification } from '../types/index.ts';
import { getStoredNotifications, markNotificationAsRead } from '../utils/storage.ts';
import { Bell, ShieldAlert, Stethoscope, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReportById: (reportId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectReportById,
}) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const notifications = getStoredNotifications();

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.reportId) {
      onSelectReportById(notif.reportId);
      onClose();
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'expert_reply':
        return <Stethoscope className="w-5 h-5 text-emerald-700" />;
      default:
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">
                {language === 'hi' ? 'सूचनाएं एवं अलर्ट' : 'Notifications & Alerts'}
              </h3>
              <p className="text-xs text-gray-500">
                {notifications.length} {language === 'hi' ? 'संदेश' : 'messages'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No new notifications.</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                  notif.read
                    ? 'bg-gray-50 border-gray-200 text-gray-700'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold">
                      {language === 'hi' ? notif.title_hi : notif.title_en}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">
                    {language === 'hi' ? notif.message_hi : notif.message_en}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {notif.reportId && (
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
