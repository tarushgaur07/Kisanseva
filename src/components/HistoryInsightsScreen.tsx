import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DiagnosisReport } from '../types/index.ts';
import { generateReportsCsv } from '../utils/dataExport.ts';
import { detectRecurringDiseases } from '../utils/recurringAlerts.ts';
import {
  Search,
  Filter,
  Download,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface HistoryInsightsScreenProps {
  reports: DiagnosisReport[];
  onSelectReport: (report: DiagnosisReport) => void;
  onNewDiagnosis: () => void;
}

export const HistoryInsightsScreen: React.FC<HistoryInsightsScreenProps> = ({
  reports,
  onSelectReport,
  onNewDiagnosis,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'reports' | 'insights'>('reports');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'crop' | 'livestock'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'confidence'>('latest');

  // Detect recurring outbreaks
  const recurringAlerts = useMemo(() => {
    return detectRecurringDiseases(reports, 2, 90);
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        const matchesSearch =
          r.disease_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.disease_name_hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
        const matchesSev = severityFilter === 'all' || r.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

        return matchesSearch && matchesCat && matchesSev && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return b.confidence - a.confidence;
      });
  }, [reports, searchQuery, categoryFilter, severityFilter, statusFilter, sortBy]);

  // CSV Export Download
  const handleExportCsv = () => {
    const csvContent = generateReportsCsv(reports);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KisanSeva_Diagnoses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Data Transformation
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map<string, { month: string; crops: number; livestock: number }>();

    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (d.getMonth() - i + 12) % 12;
      const mName = months[monthIdx];
      map.set(mName, { month: mName, crops: 0, livestock: 0 });
    }

    reports.forEach((r) => {
      const repDate = new Date(r.createdAt);
      if (!isNaN(repDate.getTime())) {
        const mName = months[repDate.getMonth()];
        const entry = map.get(mName);
        if (entry) {
          if (r.category === 'crop') entry.crops += 1;
          else entry.livestock += 1;
        }
      }
    });

    return Array.from(map.values());
  }, [reports]);

  const topDiseasesData = useMemo(() => {
    const countMap = new Map<string, number>();
    reports.forEach((r) => {
      const name = language === 'hi' ? r.disease_name_hi : r.disease_name_en;
      countMap.set(name, (countMap.get(name) || 0) + 1);
    });

    const colors = ['#1B5E20', '#2E7D32', '#43A047', '#F57F17', '#E65100', '#B71C1C'];
    const sorted = Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [reports, language]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {t('historyTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {reports.length} {language === 'hi' ? 'जांच रिकॉर्ड दर्ज हैं' : 'total diagnosis reports stored'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-3 min-h-[46px] bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>{t('exportCsvBtn')}</span>
        </button>
      </div>

      {/* Tabs: All Reports vs Farm Insights */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'reports' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-600'
          }`}
        >
          {t('tabAllReports')}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'insights' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-600'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t('tabInsights')}</span>
        </button>
      </div>

      {/* TAB 1: REPORTS LIST WITH FILTERS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchReportsPlaceholder')}
                className="w-full pl-11 pr-4 py-3 min-h-[48px] rounded-2xl border border-gray-200 text-sm focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e: any) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 min-h-[40px] rounded-xl border border-gray-200 bg-white font-medium"
                >
                  <option value="all">{t('filterAll')}</option>
                  <option value="crop">{t('filterCrops')}</option>
                  <option value="livestock">{t('filterLivestock')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full p-2 min-h-[40px] rounded-xl border border-gray-200 bg-white font-medium"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 min-h-[40px] rounded-xl border border-gray-200 bg-white font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="AI Diagnosed">AI Diagnosed</option>
                  <option value="Sent to Expert">Sent to Expert</option>
                  <option value="Expert Verified">Expert Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full p-2 min-h-[40px] rounded-xl border border-gray-200 bg-white font-medium"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="confidence">Highest Confidence</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center text-gray-500 border border-gray-100">
                <p className="font-semibold text-sm">No diagnoses match your search filter.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 hover:border-emerald-300 shadow-xs hover:shadow-sm cursor-pointer transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-100 shrink-0 border border-emerald-200">
                      {report.images && report.images[0] ? (
                        <img
                          src={report.images[0]}
                          alt={report.disease_name_en}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl">
                          {report.category === 'crop' ? '🌾' : '🐄'}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                          {report.subType}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {report.id} • {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-gray-900">
                        {language === 'hi' ? report.disease_name_hi : report.disease_name_en}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Status */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          report.status === 'Expert Verified'
                            ? 'bg-emerald-100 text-emerald-900'
                            : report.status === 'Sent to Expert'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'Expert Verified' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {report.status === 'Sent to Expert' && <Clock className="w-3 h-3 text-blue-700" />}
                          <span>{report.status}</span>
                        </span>

                        {/* Severity */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          report.severity === 'urgent'
                            ? 'bg-red-100 text-red-900'
                            : report.severity === 'high'
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {report.severity.toUpperCase()}
                        </span>

                        <span className="text-xs text-gray-500 font-semibold">
                          {report.confidence}% Match
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INSIGHTS & CHARTS */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Recurring Problem Alerts */}
          {recurringAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>{t('recurringAlertsTitle')}</span>
              </h3>

              {recurringAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-3xl border flex items-start gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-extrabold block mb-0.5">
                      {language === 'hi' ? alert.message_hi : alert.message_en}
                    </span>
                    <p className="text-[11px] text-gray-600">
                      Recommendation: Soil pathogen sanitization and crop rotation recommended to break spore cycle.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Diagnoses Bar Chart */}
            <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <h4 className="font-extrabold text-sm text-emerald-950">
                  {t('chartMonthlyDiagnoses')}
                </h4>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="crops" name="Crops" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="livestock" name="Livestock" fill="#F57F17" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Diseases Pie Chart */}
            <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-700" />
                <h4 className="font-extrabold text-sm text-emerald-950">
                  {t('chartTopDiseases')}
                </h4>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topDiseasesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={35}
                      paddingAngle={3}
                    >
                      {topDiseasesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Seasonal Advisory Banner */}
          <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h4 className="font-extrabold text-sm text-amber-200">
                Seasonal Agronomic Advisory (मौसमी कृषि सलाह)
              </h4>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              {language === 'hi'
                ? 'गेहूं की बालियों के समय तेज हवा और बारिश से पहले पोटाश व आवश्यक फफूंदनाशक का हल्का छिड़काव पौधे की प्रतिरोधक क्षमता को बढ़ाता है। पशुओं में खुरपका-मुंहपका (FMD) का टीका समय से पहले जरूर लगवाएं।'
                : 'Prior to heading stage in cereals, ensure balanced potassium nutrition to enhance stem lodging resistance and immunity against rust. Schedule mandatory bi-annual FMD vaccination for milch cattle.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
