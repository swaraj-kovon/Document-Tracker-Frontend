import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import StatusBadge from "@/components/StatusBadge";
import {
  Shield,
  Users,
  FileText,
  Activity,
  Check,
  X,
  Search,
  Filter,
  AlertCircle,
  ChevronRight,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = ["all", "draft", "pending", "approved", "rejected"];
const CAT_CODES = ["all", "HR", "LG", "FN", "BR", "SH", "OP", "OT"];

const ACTION_LABELS = {
  created: "Created",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  file_uploaded: "File Uploaded",
  resubmitted: "Resubmitted",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState({
    open: false,
    docId: null,
    remarks: "",
  });
  const [actionLoading, setActionLoading] = useState("");

  const loadDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (catFilter !== "all") params.category_code = catFilter;
      if (userFilter) params.user_email = userFilter;
      const { data } = await api.get("/admin/documents", { params });
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingDocs(false);
  }, [statusFilter, catFilter, userFilter]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    api
      .get("/admin/users")
      .then((r) => {
        setUsers(r.data);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
    api
      .get("/admin/audit-log")
      .then((r) => {
        setAuditLog(r.data);
        setLoadingAudit(false);
      })
      .catch(() => setLoadingAudit(false));
  }, []);

  const handleToggleBlock = async (userId, isBlocked) => {
    const action = isBlocked ? "unblock" : "block";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} this user?`,
      )
    )
      return;
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const handleApprove = async (docId) => {
    if (!window.confirm("Approve this document?")) return;
    setActionLoading(docId + "_approve");
    try {
      await api.post(`/admin/documents/${docId}/approve`);
      await loadDocs();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve");
    }
    setActionLoading("");
  };

  const handleReject = async () => {
    const { docId, remarks } = rejectModal;
    setActionLoading(docId + "_reject");
    try {
      await api.post(`/admin/documents/${docId}/reject`, { remarks });
      setRejectModal({ open: false, docId: null, remarks: "" });
      await loadDocs();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject");
    }
    setActionLoading("");
  };

  const filteredDocs = documents.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(q) ||
      doc.serial_number?.toLowerCase().includes(q) ||
      doc.generated_by?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 animate-fade-in-up" data-testid="admin-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#1B2A4A]/8 rounded-lg">
          <Shield size={20} className="text-[#1B2A4A]" strokeWidth={1.5} />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "Chivo, sans-serif" }}
          >
            Admin Panel
          </h1>
          <p className="text-slate-500 text-sm">
            Manage documents, users, and view audit logs
          </p>
        </div>
      </div>

      <Tabs defaultValue="documents" data-testid="admin-tabs">
        <TabsList className="mb-5 bg-white border border-slate-200 p-1 rounded-lg">
          <TabsTrigger
            value="documents"
            className="flex items-center gap-2 text-xs font-semibold"
            data-testid="tab-documents"
          >
            <FileText size={14} /> All Documents
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 text-xs font-semibold"
            data-testid="tab-users"
          >
            <Users size={14} /> Users ({users.length})
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="flex items-center gap-2 text-xs font-semibold"
            data-testid="tab-audit"
          >
            <Activity size={14} /> Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="admin-search"
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                data-testid="admin-status-filter"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "all"
                      ? "All Statuses"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                data-testid="admin-cat-filter"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              >
                {CAT_CODES.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Filter by user email..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                data-testid="admin-user-filter"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {loadingDocs ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-7 h-7 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !filteredDocs.length ? (
              <div className="text-center py-12">
                <FileText
                  size={32}
                  className="mx-auto text-slate-300 mb-2"
                  strokeWidth={1}
                />
                <p className="text-slate-500 text-sm">No documents found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="admin-documents-table">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {[
                        "Serial No.",
                        "Title",
                        "Category",
                        "Submitted By",
                        "Status",
                        "Date",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr
                        key={doc._id}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td
                          className="px-4 py-3 text-xs font-mono font-semibold text-[#1B2A4A] cursor-pointer hover:underline"
                          onClick={() => navigate(`/documents/${doc._id}`)}
                        >
                          {doc.serial_number}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 max-w-40">
                          <p className="truncate">{doc.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            {doc.category_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-36">
                          <p className="truncate">{doc.generated_by}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {doc.file_url && (
                              <button
                                onClick={() =>
                                  window.open(doc.file_url, "_blank")
                                }
                                title="Download"
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                data-testid={`download-${doc._id}`}
                              >
                                <Download size={14} />
                              </button>
                            )}
                            {doc.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(doc._id)}
                                  disabled={
                                    actionLoading === doc._id + "_approve"
                                  }
                                  data-testid={`approve-${doc._id}`}
                                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Check size={12} /> Approve
                                </button>
                                <button
                                  onClick={() =>
                                    setRejectModal({
                                      open: true,
                                      docId: doc._id,
                                      remarks: "",
                                    })
                                  }
                                  data-testid={`reject-${doc._id}`}
                                  className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <X size={12} /> Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => navigate(`/documents/${doc._id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {loadingUsers ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-7 h-7 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full" data-testid="users-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Status",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                        {u.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.is_blocked
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.is_blocked ? "bg-red-500" : "bg-emerald-500"}`}
                          />
                          {u.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.email !== "founders@kovon.io" && (
                          <button
                            onClick={() =>
                              handleToggleBlock(u._id, u.is_blocked)
                            }
                            data-testid={`${u.is_blocked ? "unblock" : "block"}-user-${u._id}`}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                              u.is_blocked
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {u.is_blocked ? "Unblock" : "Block"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {loadingAudit ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-7 h-7 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !auditLog.length ? (
              <div className="text-center py-12">
                <Activity
                  size={32}
                  className="mx-auto text-slate-300 mb-2"
                  strokeWidth={1}
                />
                <p className="text-slate-500 text-sm">No audit logs yet</p>
              </div>
            ) : (
              <table className="w-full" data-testid="audit-log-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      "Action",
                      "Document",
                      "Performed By",
                      "Details",
                      "Timestamp",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            log.action === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.action === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : log.action === "submitted"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs font-mono text-[#1B2A4A] cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/documents/${log.document_id}`)
                        }
                      >
                        {log.document_id}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {log.action_by}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 max-w-48">
                        <p className="truncate">{log.details || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog
        open={rejectModal.open}
        onOpenChange={(open) => setRejectModal((p) => ({ ...p, open }))}
      >
        <DialogContent data-testid="reject-modal">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              The document submitter will be notified of this rejection via
              email.
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Rejection Reason (optional)
              </label>
              <Textarea
                value={rejectModal.remarks}
                onChange={(e) =>
                  setRejectModal((p) => ({ ...p, remarks: e.target.value }))
                }
                placeholder="Provide a reason for rejection..."
                rows={3}
                data-testid="rejection-remarks"
                className="text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setRejectModal({ open: false, docId: null, remarks: "" })
                }
                className="flex-1 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!!actionLoading}
                data-testid="confirm-reject-btn"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
