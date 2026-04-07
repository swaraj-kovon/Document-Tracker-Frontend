import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { Eye, EyeOff, Globe, AlertCircle, CheckCircle, Mail } from "lucide-react";

const formatError = (detail) => {
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
};

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verifiedParam = searchParams.get("verified");
  const resetParam = searchParams.get("reset");

  const validateEmail = (e) => {
    if (e && !e.endsWith("@kovon.io")) return "Only @kovon.io email addresses are allowed.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }
    setLoading(true);
    setError("");
    setEmailNotVerified(false);
    try {
      if (tab === "login") {
        const { data } = await api.post("/auth/login", { email, password });
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        await api.post("/auth/register", { email, password, name });
        setRegisterSuccess(true);
        setEmail(email); // keep email for resend
        setPassword("");
        setName("");
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setError("");
      } else {
        setError(formatError(detail) || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email });
      setResendSuccess(true);
    } catch (err) {
      setError("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left – Form */}
      <div className="flex-1 flex flex-col justify-center px-10 py-12 bg-white max-w-xl">
        <div className="mb-8">
          <img
            src="https://customer-assets.emergentagent.com/job_kovon-secure-docs/artifacts/v93clta3_Kovon%20Logo-01.png"
            alt="Kovon"
            className="h-14 mb-6"
          />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Chivo, sans-serif" }}>
            Document Registry
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Secure internal document management for Kovon</p>
        </div>

        {/* URL-based success banners */}
        {verifiedParam === "true" && (
          <div className="mb-5 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">Email verified!</p><p className="text-xs mt-0.5">Your account is now active. Sign in below.</p></div>
          </div>
        )}
        {verifiedParam === "expired" && (
          <div className="mb-5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">Verification link expired</p><p className="text-xs mt-0.5">Please sign in then request a new verification email.</p></div>
          </div>
        )}
        {resetParam === "true" && (
          <div className="mb-5 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">Password reset successfully!</p><p className="text-xs mt-0.5">You can now sign in with your new password.</p></div>
          </div>
        )}

        {/* Register success */}
        {registerSuccess ? (
          <div className="animate-fade-in-up">
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 mb-5">
              <Mail size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Check your email!</p>
                <p className="text-emerald-600 text-xs mt-1 leading-relaxed">
                  A verification email has been sent to <strong>{email}</strong>. Click the link in the email to activate your account, then come back to sign in.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setRegisterSuccess(false); setTab("login"); setEmail(""); }}
              className="w-full bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
              {["login", "register"].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); setEmailNotVerified(false); }}
                  data-testid={`tab-${t}`}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                    tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                    data-testid="name-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailNotVerified(false); }}
                    required
                    placeholder="name@kovon.io"
                    data-testid="email-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors pr-10"
                  />
                  <Globe size={15} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {email && !email.endsWith("@kovon.io") && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Must be a @kovon.io email address
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    data-testid="password-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {tab === "login" && (
                  <div className="text-right mt-1">
                    <Link to="/forgot-password" className="text-xs text-[#1B2A4A] hover:underline font-medium" data-testid="forgot-password-link">
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              {/* Email not verified state */}
              {emailNotVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3" data-testid="email-not-verified-banner">
                  <div className="flex items-start gap-2">
                    <Mail size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">Email not verified</p>
                      <p className="text-xs text-amber-600 mt-0.5">Please check your inbox and click the verification link.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendSuccess}
                    data-testid="resend-verification-btn"
                    className="mt-2 text-xs font-semibold text-amber-700 hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {resendLoading ? "Sending..." : resendSuccess ? "Sent! Check your inbox" : "Resend verification email"}
                  </button>
                </div>
              )}

              {error && (
                <div data-testid="auth-error" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-red-700">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="auth-submit-button"
                className="w-full bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {tab === "login" ? "Signing in..." : "Creating account..."}</>
                ) : (
                  tab === "login" ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            <p className="text-xs text-slate-400 mt-6 text-center">
              Access restricted to @kovon.io email addresses only
            </p>
          </>
        )}
      </div>

      {/* Right – Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1760124056883-732e7a5e2e68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3Jwb3JhdGUlMjBhcmNoaXRlY3R1cmUlMjBnbGFzcyUyMGJsdWV8ZW58MHx8fHwxNzc1NDQxMDk3fDA&ixlib=rb-4.1.0&q=85"
          alt="Office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1B2A4A]/60" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-white text-2xl font-bold leading-snug" style={{ fontFamily: "Chivo, sans-serif" }}>
            Streamlined Document Approval Workflow
          </p>
          <p className="text-white/65 mt-2 text-sm leading-relaxed">
            Create, track, and manage official documents with complete audit trails and automated approval workflows.
          </p>
          <div className="flex gap-6 mt-6">
            {[["Secure", "Role-based access control"], ["Traceable", "Full audit history"], ["Efficient", "Email-based approvals"]].map(([title, desc]) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/55 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


