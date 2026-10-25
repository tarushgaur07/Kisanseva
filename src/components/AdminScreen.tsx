import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DiagnosisReport, VetExpert, AppSettings } from '../types/index.ts';
import { getStoredSettings, saveSettings, getStoredVets, saveVet, deleteVet } from '../utils/storage.ts';
import {
  ShieldCheck,
  Users,
  FileText,
  Clock,
  Sliders,
  Plus,
  Trash2,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Percent,
} from 'lucide-react';

interface AdminScreenProps {
  reports: DiagnosisReport[];
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ reports }) => {
  const { language, t } = useLanguage();
  const [settings, setSettingsState] = useState<AppSettings>(getStoredSettings);
  const [vets, setVets] = useState<VetExpert[]>(getStoredVets);

  // Confidence threshold edit state
  const [thresholdVal, setThresholdVal] = useState<number>(settings.confidenceThreshold);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Doctor form modal
  const [showAddVet, setShowAddVet] = useState(false);
  const [newVetName, setNewVetName] = useState('');
  const [newVetQual, setNewVetQual] = useState('');
  const [newVetSpec, setNewVetSpec] = useState('Livestock & Bovine Health');
  const [newVetState, setNewVetState] = useState('Uttar Pradesh');
  const [newVetDistrict, setNewVetDistrict] = useState('');
  const [newVetPhone, setNewVetPhone] = useState('');

  // Platform KPIs
  const totalReports = reports.length;
  const expertCases = reports.filter((r) => r.status === 'Sent to Expert' || r.expertReview).length;
  const avgConfidence = totalReports > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.confidence, 0) / totalReports)
    : 85;

  const feedbacks = reports.filter((r) => r.feedback).map((r) => ({
    id: r.id,
    disease: r.disease_name_en,
    helpful: r.feedback!.helpful,
    comment: r.feedback!.comment,
    date: r.feedback!.submittedAt,
  }));

  const handleSaveThreshold = () => {
    const updated = saveSettings({ confidenceThreshold: thresholdVal });
    setSettingsState(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreateVet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVetName || !newVetPhone) return;

    const newVet: VetExpert = {
      id: `vet-${Date.now()}`,
      name: newVetName,
      qualification: newVetQual || 'B.V.Sc & A.H.',
      specialisation: newVetSpec,
      state: newVetState,
      district: newVetDistrict || 'District Center',
      phone: newVetPhone,
      languages: ['Hindi', 'English'],
      availableHours: '9:00 AM - 6:00 PM',
      verified: true,
    };

    saveVet(newVet);
    setVets(getStoredVets());
    setShowAddVet(false);
    setNewVetName('');
    setNewVetPhone('');
    setNewVetQual('');
    setNewVetDistrict('');
  };

  const handleDeleteVet = (id: string) => {
    deleteVet(id);
    setVets(getStoredVets());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 space-y-6">
      {/* Admin Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
            Platform Governance & Control
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          {t('adminTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {t('adminSub')}
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold">{t('adminStatTotalUsers')}</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">1,248</div>
          <div className="text-[10px] text-emerald-700 font-bold">+18 today</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold">{t('adminStatTotalReports')}</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">{totalReports}</div>
          <div className="text-[10px] text-gray-400">Stored in database</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-semibold">{t('adminStatExpertCases')}</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-950">{expertCases}</div>
          <div className="text-[10px] text-blue-700 font-bold">Escalated to humans</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Percent className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold">{t('adminStatAvgConfidence')}</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">{avgConfidence}%</div>
          <div className="text-[10px] text-emerald-700 font-bold">Multimodal accuracy</div>
        </div>
      </div>

      {/* Confidence Routing Threshold Setting */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-800" />
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">
                {t('confidenceThresholdSetting')}
              </h3>
              <p className="text-xs text-gray-500">{t('confidenceSettingHint')}</p>
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-xl">
            {thresholdVal}%
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={50}
            max={90}
            step={1}
            value={thresholdVal}
            onChange={(e) => setThresholdVal(Number(e.target.value))}
            className="flex-1 accent-emerald-800 h-2 bg-gray-200 rounded-lg cursor-pointer"
          />
          <button
            onClick={handleSaveThreshold}
            className="px-5 py-2.5 min-h-[42px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>{t('saveSettings')}</span>
            )}
          </button>
        </div>
      </div>

      {/* Vet Directory Management */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-emerald-950">
              {t('manageVetsTitle')}
            </h3>
            <p className="text-xs text-gray-500">
              {vets.length} registered specialists in directory
            </p>
          </div>
          <button
            onClick={() => setShowAddVet(true)}
            className="px-4 py-2 min-h-[40px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addVetBtn')}</span>
          </button>
        </div>

        <div className="space-y-2">
          {vets.map((v) => (
            <div
              key={v.id}
              className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-900">{v.name}</span>
                  {v.verified && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-sm">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
                  {v.specialisation} • {v.district}, {v.state} • {v.phone}
                </div>
              </div>

              <button
                onClick={() => handleDeleteVet(v.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Vet Modal */}
      {showAddVet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateVet}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="font-extrabold text-base text-emerald-950">Add Registered Doctor</h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Doctor Name</label>
              <input
                type="text"
                required
                value={newVetName}
                onChange={(e) => setNewVetName(e.target.value)}
                placeholder="Dr. Full Name"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Degree / Qualification</label>
              <input
                type="text"
                value={newVetQual}
                onChange={(e) => setNewVetQual(e.target.value)}
                placeholder="e.g. M.V.Sc (IVRI)"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Specialisation</label>
                <select
                  value={newVetSpec}
                  onChange={(e) => setNewVetSpec(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  <option value="Livestock & Bovine Health">Livestock & Bovine</option>
                  <option value="Crops & Plant Pathology">Crops & Pathology</option>
                  <option value="Poultry Specialist">Poultry Specialist</option>
                  <option value="Dairy & Mastitis">Dairy & Mastitis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={newVetState}
                  onChange={(e) => setNewVetState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={newVetDistrict}
                  onChange={(e) => setNewVetDistrict(e.target.value)}
                  placeholder="e.g. Varanasi"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newVetPhone}
                  onChange={(e) => setNewVetPhone(e.target.value)}
                  placeholder="+91 98XXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVet(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white"
              >
                Add Doctor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Farmer Feedback Viewer */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
        <h3 className="font-extrabold text-base text-emerald-950">Farmer Feedback Submissions</h3>
        {feedbacks.length === 0 ? (
          <p className="text-xs text-gray-500">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {feedbacks.map((f, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {f.helpful ? (
                    <ThumbsUp className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-amber-700" />
                  )}
                  <div>
                    <span className="font-bold text-gray-900">{f.disease}:</span>{' '}
                    <span className="text-gray-700">"{f.comment || (f.helpful ? 'Helpful' : 'Needs improvement')}"</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(f.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
