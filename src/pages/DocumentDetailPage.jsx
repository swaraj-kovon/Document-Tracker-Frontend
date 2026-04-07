import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Download, Upload, Send, FileText, Clock, Check, X, AlertTriangle, AlertCircle } from "lucide-react";

const ACTION_CONFIG = {
  created: { color: "bg-slate-400", icon: FileText, label: "Document Created" },
  submitted: { color: "bg-blue-500", icon: Send, label: "Submitted for Approval" },
  approved: { color: "bg-emerald-500", icon: Check, label: "Approved" },
  rejected: { color: "bg-red-500", icon: X, label: "Rejected" },
  file_uploaded: { color: "bg-purple-500", icon: Upload, label: "File Uploaded" },
  resubmitted: { color: "bg-blue-500", icon: Send, label: "Resubmitted" },
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef();

  const load = () => {
    api.get(`/documents/${id}`).then(res => { setDoc(res.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleFileUpload = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(ext)) { setError("Only PDF and DOCX files are allowed."); return; }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/documents/${id}/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("File uploaded successfully.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleResubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/documents/${id}/submit`);
      setSuccess("Document resubmitted for approval.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Resubmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (doc?.file_url) window.open(doc.file_url, "_blank");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!doc) return (
    <div className="p-8 text-center">
      <p className="text-slate-500">Document not found.</p>
      <button onClick={() => navigate("/documents")} className="mt-3 text-sm text-[#1B2A4A] font-semibold hover:underline">Back to Documents</button>
    </div>
  );

  const isLocked = doc.status === "approved";
  const canResubmit = doc.status === "rejected";

  return (
    <div className="p-8 animate-fade-in-up" data-testid="document-detail-page">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate("/documents")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Documents
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-mono font-semibold text-[#1B2A4A] mb-1" data-testid="doc-serial">{doc.serial_number}</p>
              <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Chivo, sans-serif" }} data-testid="doc-title">{doc.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{doc.category} · {doc.document_type}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={doc.status} />
              {isLocked && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                  <AlertTriangle size={11} /> Locked
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
            <Check size={14} /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left – Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-500">Document Details</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                {[
                  ["Category", doc.category],
                  ["Document Type", doc.document_type],
                  ["To", doc.to_field],
                  ["Generated By", doc.generated_by],
                  ["Date Created", new Date(doc.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
                  ["Year", doc.year],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</dt>
                    <dd className="text-sm text-slate-800 font-medium mt-0.5">{value}</dd>
                  </div>
                ))}
                {doc.description && (
                  <div className="col-span-2">
                    <dt className="text-xs text-slate-500 font-medium uppercase tracking-wider">Description</dt>
                    <dd className="text-sm text-slate-700 mt-0.5 leading-relaxed">{doc.description}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* File Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wider mb-4">Attached Document</h2>
              {doc.file_url ? (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-[#1B2A4A]" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.file_name || "Document file"}</p>
                      <p className="text-xs text-slate-400">Attached</p>
                    </div>
                  </div>
                  <button onClick={handleDownload} data-testid="download-btn" className="flex items-center gap-2 text-sm font-medium text-[#1B2A4A] hover:underline">
                    <Download size={15} /> Download
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No file attached yet.</p>
              )}

              {!isLocked && (
                <div className="mt-4">
                  <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" data-testid="reupload-input" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    data-testid="upload-file-btn"
                    className="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
                  >
                    {uploading ? <><span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />Uploading...</> : <><Upload size={14} />{doc.file_url ? "Replace File" : "Upload File"}</>}
                  </button>
                </div>
              )}

              {canResubmit && doc.file_url && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                    <p className="text-sm font-semibold text-amber-800">Document was rejected</p>
                    <p className="text-xs text-amber-600 mt-0.5">Upload a revised file and resubmit for approval.</p>
                  </div>
                  <button
                    onClick={handleResubmit}
                    disabled={submitting}
                    data-testid="resubmit-btn"
                    className="flex items-center gap-2 bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resubmitting...</> : <><Send size={14} />Resubmit for Approval</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right – Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wider mb-5">Activity Timeline</h2>
            <div className="space-y-0" data-testid="audit-timeline">
              {(doc.audit_logs || []).map((log, i) => {
                const cfg = ACTION_CONFIG[log.action] || { color: "bg-slate-300", icon: Clock, label: log.action };
                const Icon = cfg.icon;
                const isLast = i === (doc.audit_logs?.length ?? 0) - 1;
                return (
                  <div key={log._id} className="relative flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0 z-10`}>
                        <Icon size={13} className="text-white" strokeWidth={2} />
                      </div>
                      {!isLast && <div className="w-0.5 bg-slate-100 flex-1 my-1" />}
                    </div>
                    <div className={`pb-4 ${isLast ? "" : ""}`}>
                      <p className="text-xs font-semibold text-slate-800">{cfg.label}</p>
                      {log.details && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{log.details}</p>}
                      <p className="text-xs text-slate-400 mt-1">{log.action_by}</p>
                      <p className="text-xs text-slate-300">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
              {!doc.audit_logs?.length && (
                <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
