import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@kovon.io")) {
      setError("Only @kovon.io email addresses are allowed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" data-testid="forgot-password-page">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-6">
            <img
              src="https://customer-assets.emergentagent.com/job_kovon-secure-docs/artifacts/v93clta3_Kovon%20Logo-01.png"
              alt="Kovon"
              className="h-10 mb-6"
            />
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Chivo, sans-serif" }}>
              Forgot Password
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter your @kovon.io email and we'll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="animate-fade-in-up">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 mb-6">
                <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Check your inbox</p>
                  <p className="text-emerald-600 text-xs mt-0.5">
                    If <strong>{email}</strong> is registered, a password reset link has been sent. Check your spam folder if you don't see it.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@kovon.io"
                    data-testid="forgot-email-input"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-red-700">
                  <AlertCircle size={14} className="flex-shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="forgot-submit-btn"
                className="w-full bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                ) : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-xs text-slate-500 hover:text-[#1B2A4A] flex items-center justify-center gap-1 transition-colors">
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
