import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import StatusBadge from "@/components/StatusBadge";
import { Search, Filter, FileText, ChevronRight, FilePlus } from "lucide-react";

const STATUSES = ["all", "draft", "pending", "approved", "rejected"];
const CATEGORIES = ["all", "HR", "LG", "FN", "BR", "SH", "OP", "OT"];
const CAT_LABELS = { HR: "Human Resources", LG: "Legal", FN: "Finance", BR: "Board", SH: "Shareholder", OP: "Operations", OT: "Others" };

export default function MyDocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  useEffect(() => {
    api.get("/documents").then(res => { setDocuments(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = documents.filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !q || doc.title?.toLowerCase().includes(q) || doc.serial_number?.toLowerCase().includes(q) || doc.to_field?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchCat = catFilter === "all" || doc.category_code === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="p-8 animate-fade-in-up" data-testid="documents-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Chivo, sans-serif" }}>My Documents</h1>
          <p className="text-slate-500 text-sm mt-1">{documents.length} total documents</p>
        </div>
        <button
          onClick={() => navigate("/documents/new")}
          data-testid="new-document-btn"
          className="flex items-center gap-2 bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          <FilePlus size={15} /> New Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, serial number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="search-input"
            className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            data-testid="status-filter"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 bg-white"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            data-testid="category-filter"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 bg-white"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : `${CAT_LABELS[c] || c} (${c})`}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-16">
            <FileText size={36} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
            <p className="text-slate-500 font-medium">No documents found</p>
            <p className="text-slate-400 text-sm mt-1">{search || statusFilter !== "all" || catFilter !== "all" ? "Try adjusting your filters" : "Create your first document to get started"}</p>
            {!search && statusFilter === "all" && catFilter === "all" && (
              <button onClick={() => navigate("/documents/new")} className="mt-4 text-sm text-[#1B2A4A] font-semibold hover:underline">Create Document</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="documents-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial No.</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">To</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr
                    key={doc._id}
                    onClick={() => navigate(`/documents/${doc._id}`)}
                    data-testid={`doc-row-${doc._id}`}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-mono font-semibold text-[#1B2A4A]">{doc.serial_number}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{doc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{doc.category}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">{doc.document_type}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{doc.to_field}</td>
                    <td className="px-5 py-4"><StatusBadge status={doc.status} /></td>
                    <td className="px-5 py-4 text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><ChevronRight size={14} className="text-slate-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
