import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/utils/api";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center max-w-md w-full">
          <AlertCircle size={36} className="mx-auto text-red-400 mb-3" strokeWidth={1.5} />
          <h2 className="font-bold text-slate-800 text-lg mb-2">Invalid Reset Link</h2>
          <p className="text-slate-500 text-sm mb-4">This password reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="text-sm text-[#1B2A4A] font-semibold hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate("/login?reset=true"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" data-testid="reset-password-page">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-6">
            <img
              src="https://customer-assets.emergentagent.com/job_kovon-secure-docs/artifacts/v93clta3_Kovon%20Logo-01.png"
              alt="Kovon"
              className="h-10 mb-6"
            />
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Chivo, sans-serif" }}>
              Reset Password
            </h1>
            <p className="text-slate-500 text-sm mt-1">Enter your new password below.</p>
          </div>

          {success ? (
            <div className="animate-fade-in-up text-center">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">Password reset successfully! Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    data-testid="new-password-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                  data-testid="confirm-password-input"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-red-700">
                  <AlertCircle size={14} className="flex-shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="reset-submit-btn"
                className="w-full bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</>
                ) : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-xs text-slate-500 hover:text-[#1B2A4A] transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
