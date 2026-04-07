import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { Eye, EyeOff, CheckCircle, AlertCircle, User, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setError("New passwords do not match."); return; }
    if (newPwd.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (currentPwd === newPwd) { setError("New password must be different from the current password."); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/change-password", { current_password: currentPwd, new_password: newPwd });
      setSuccess("Password changed successfully.");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in-up" data-testid="settings-page">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight" style={{ fontFamily: "Chivo, sans-serif" }}>
          Account Settings
        </h1>

        {/* Profile Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-[#1B2A4A]/8 rounded-lg">
              <User size={18} className="text-[#1B2A4A]" strokeWidth={1.5} />
            </div>
            <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">Profile Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Full Name", user?.name || "—"],
              ["Email", user?.email],
              ["Role", user?.role === "admin" ? "Administrator" : "User"],
              ["Domain", "@kovon.io"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-sm text-slate-800 font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-[#1B2A4A]/8 rounded-lg">
              <Lock size={18} className="text-[#1B2A4A]" strokeWidth={1.5} />
            </div>
            <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wider">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  required
                  placeholder="Enter current password"
                  data-testid="current-password-input"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
              <input
                type={showPwd ? "text" : "password"}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                required
                placeholder="Min. 6 characters"
                data-testid="new-password-settings-input"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
              <input
                type={showPwd ? "text" : "password"}
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                required
                placeholder="Confirm new password"
                data-testid="confirm-new-password-input"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-red-700">
                <AlertCircle size={14} className="flex-shrink-0" /> {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5 text-sm text-emerald-700">
                <CheckCircle size={14} className="flex-shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="change-password-btn"
              className="bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
              ) : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
