import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import StatusBadge from "@/components/StatusBadge";
import { FileText, Clock, CheckCircle, XCircle, FilePlus, ChevronRight, TrendingUp } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, bgColor, testId }) => (
  <div data-testid={testId} className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${bgColor}`}>
      <Icon size={22} className={color} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Chivo, sans-serif" }}>{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats").then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 animate-fade-in-up" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Chivo, sans-serif" }}>
            {greeting()}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's your document registry overview</p>
        </div>
        <button
          onClick={() => navigate("/documents/new")}
          data-testid="create-document-btn"
          className="flex items-center gap-2 bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors shadow-sm"
        >
          <FilePlus size={16} />
          New Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total" value={stats?.total ?? 0} color="text-[#1B2A4A]" bgColor="bg-[#1B2A4A]/8" testId="stat-total" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending ?? 0} color="text-amber-600" bgColor="bg-amber-50" testId="stat-pending" />
        <StatCard icon={CheckCircle} label="Approved" value={stats?.approved ?? 0} color="text-emerald-600" bgColor="bg-emerald-50" testId="stat-approved" />
        <StatCard icon={XCircle} label="Rejected" value={stats?.rejected ?? 0} color="text-red-500" bgColor="bg-red-50" testId="stat-rejected" />
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#1B2A4A]" strokeWidth={1.5} />
            <h2 className="font-semibold text-slate-900 text-sm">Recent Documents</h2>
          </div>
          <button onClick={() => navigate("/documents")} className="text-xs text-[#1B2A4A] font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight size={13} />
          </button>
        </div>
        {!stats?.recent?.length ? (
          <div className="text-center py-12">
            <FileText size={32} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
            <p className="text-slate-500 text-sm font-medium">No documents yet</p>
            <p className="text-slate-400 text-xs mt-1">Create your first document to get started</p>
            <button onClick={() => navigate("/documents/new")} className="mt-4 text-sm text-[#1B2A4A] font-semibold hover:underline">
              Create Document
            </button>
          </div>
        ) : (
          <table className="w-full" data-testid="recent-documents-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {stats.recent.map(doc => (
                <tr key={doc._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/documents/${doc._id}`)}>
                  <td className="px-6 py-4 text-xs font-mono font-semibold text-[#1B2A4A]">{doc.serial_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{doc.title}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{doc.category}</td>
                  <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right"><ChevronRight size={14} className="text-slate-400 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { label: "Create HR Document", desc: "Offer letters, joining, relieving", path: "/documents/new", category: "HR" },
          { label: "Create Legal Document", desc: "Contracts, agreements, NDAs", path: "/documents/new", category: "LG" },
          { label: "Create Finance Document", desc: "Invoices, expense approvals", path: "/documents/new", category: "FN" },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-[#1B2A4A]/30 hover:shadow-md transition-all group"
          >
            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#1B2A4A] transition-colors">{action.label}</p>
            <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
