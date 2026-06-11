import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { DashboardStats, Incident } from '../types';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, Flame, Plus, Users, LayoutDashboard, Database } from 'lucide-react';

interface AnalyticsViewProps {
  stats: DashboardStats | null;
  onSelectIncident?: (incident: Incident) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'Fire Outbreak': '#f87171',   // Red
  'Severe Flood': '#60a5fa',   // Blue
  'Traffic Crash': '#fb923c',   // Orange
  'Medical Crisis': '#4ade80',  // Green
  'Criminal Activity': '#c084fc', // Purple
  'Other/Utilities': '#a7f3d0'  // Greenish-gray
};

const SEVERITY_COLORS: Record<string, string> = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#eab308',
  'Low': '#3b82f6'
};

export default function AnalyticsView({ stats, onSelectIncident }: AnalyticsViewProps) {
  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  // Pre-arrange types count data
  const typesData = Object.entries(stats.byType).map(([name, value]) => ({
    name,
    value,
    color: TYPE_COLORS[name] || '#38bdf8'
  }));

  // Arrange severity data
  const severityData = Object.entries(stats.bySeverity).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name] || '#64748b'
  }));

  // Compute percentage calculations
  const resolutionRate = stats.totalIncidents > 0 
    ? Math.round((stats.resolvedCount / stats.totalIncidents) * 100) 
    : 0;

  // Render tooltip styles
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-xl text-xs font-sans text-slate-900">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-emerald-600 font-medium mt-0.5">Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-16 h-16 text-sky-500" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Reports</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1.5 font-mono">{stats.totalIncidents}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-sky-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            Active Registry Files
          </div>
        </div>

        {/* Resolved rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Resolution Rate</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1.5 font-mono">{resolutionRate}%</h3>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {stats.resolvedCount} Incidents Concluded
          </div>
        </div>

        {/* Unresolved / Dispatched */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-orange-500" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active Dispatch</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1.5 font-mono">{stats.unresolvedCount}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-orange-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-550 bg-orange-500 animate-bounce"></span>
            En Route or Active Response
          </div>
        </div>

        {/* Critical Threats */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Critical Incidents</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1.5 font-mono">{stats.criticalCount}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            Immediate Life-Threat Level
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Area Trend Map - 12 Monthly Trends */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📈</span> Monthly Incident Registry Trends
              </h4>
              <p className="text-[11px] text-slate-500 tracking-tight mt-0.5">Statistical trajectory comparing reports over consecutive operational months.</p>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-full font-mono border border-slate-200">Real-Time Sync</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Graph - Severity Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <h4 className="text-base font-bold text-slate-900">⚖️ Severity Distribution</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Incidents filtered by threat level urgency.</p>
          </div>

          <div className="h-32 flex justify-center items-center my-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Direct Percent metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{stats.totalIncidents}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {severityData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-250/50 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] text-slate-700 font-medium capitalize truncate">{s.name}: <strong className="text-slate-900 font-mono">{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Incident types - Bar distribution */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 mb-5">🗂️ Reports by Category</h4>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typesData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspots registry list - detailed view */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🔥</span> Active Emergency Hotspots
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Sectors marked with higher population concentration or clustered impact risk.</p>
          </div>

          <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
            {stats.hotspots.length > 0 ? (
              stats.hotspots.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition shadow-sm">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-emerald-700 font-semibold tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-250 uppercase">
                      Cluster Pin {i + 1}
                    </span>
                    <p className="text-xs text-slate-800 font-medium truncate mt-1 w-48 sm:w-64">{h.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-rose-500">{h.count} Affected</div>
                    <div className="text-[10px] text-slate-400 font-medium">GPS Tracked</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">No GPS cluster vectors reported.</div>
            )}
          </div>
          
          <div className="text-[10px] text-slate-400 mt-4 italic text-center">
            * GIS density is measured recursively via standard municipal street distance arrays.
          </div>
        </div>
      </div>

    </div>
  );
}
