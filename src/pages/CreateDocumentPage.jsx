import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import StatusBadge from "@/components/StatusBadge";
import { Check, ChevronRight, Upload, FileText, AlertCircle, X } from "lucide-react";

const CATEGORIES = [
  { code: "HR", name: "Human Resources", types: ["Employment Offer Letter", "Internship Offer Letter", "Experience Letter", "Joining Letter", "Relieving Letter", "Promotion Letter", "Warning Letter"] },
  { code: "LG", name: "Legal", types: ["Contracts", "Agreements", "NDAs", "Compliance Letters"] },
  { code: "FN", name: "Finance", types: ["Invoice Approval", "Expense Approval", "Salary Letters"] },
  { code: "BR", name: "Board", types: ["Board Resolutions"] },
  { code: "SH", name: "Shareholder", types: ["Shareholder Meeting Notice", "Voting Resolution"] },
  { code: "OP", name: "Operations", types: ["Vendor Agreements", "Internal Memos"] },
  { code: "OT", name: "Others", types: ["Miscellaneous Documents"] },
];

const CAT_ICONS = { HR: "👥", LG: "⚖️", FN: "💼", BR: "🏢", SH: "📊", OP: "⚙️", OT: "📄" };
const STEPS = ["Category", "Details", "Serial No.", "Upload", "Review"];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-10">
    {STEPS.map((label, i) => {
      const num = i + 1;
      const done = num < currentStep;
      const active = num === currentStep;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              done ? "bg-[#1B2A4A] text-white" : active ? "bg-[#1B2A4A] text-white ring-4 ring-[#1B2A4A]/15" : "bg-slate-100 border border-slate-300 text-slate-400"
            }`} data-testid={`step-${num}`}>
              {done ? <Check size={16} strokeWidth={3} /> : num}
            </div>
            <span className={`absolute top-11 text-xs font-medium whitespace-nowrap ${active ? "text-[#1B2A4A] font-semibold" : "text-slate-400"}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 h-0.5 mx-1 transition-all ${done ? "bg-[#1B2A4A]" : "bg-slate-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState(null);
  const [form, setForm] = useState({ document_type: "", title: "", to_field: "", description: "" });
  const [documentId, setDocumentId] = useState(null);
  const [serialNumber, setSerialNumber] = useState(null);
  const [document, setDocument] = useState(null);
  const [file, setFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const year = new Date().getFullYear();

  // Step 1: Category selected
  const handleCategorySelect = (cat) => {
    setSelectedCat(cat);
    setForm(f => ({ ...f, document_type: cat.types[0] }));
    setError("");
    setStep(2);
  };

  // Step 2 → 3: Create or update document
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.to_field || !form.document_type) { setError("Please fill all required fields."); return; }
    setLoading(true);
    setError("");
    try {
      if (documentId) {
        // Update existing document (went back)
        const { data } = await api.put(`/documents/${documentId}`, {
          title: form.title, to_field: form.to_field, description: form.description
        });
        setDocument(data);
      } else {
        // Create new document
        const { data } = await api.post("/documents", {
          category: selectedCat.name,
          category_code: selectedCat.code,
          document_type: form.document_type,
          title: form.title,
          to_field: form.to_field,
          description: form.description,
        });
        setDocumentId(data._id);
        setSerialNumber(data.serial_number);
        setDocument(data);
      }
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save document.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Upload file
  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(ext)) { setError("Only PDF and DOCX files are allowed."); return; }
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", selectedFile);
    try {
      const { data } = await api.post(`/documents/${documentId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDocument(data);
      setFileUploaded(true);
      setFile(selectedFile);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Submit for approval
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(`/documents/${documentId}/submit`);
      navigate("/documents");
    } catch (err) {
      setError(err.response?.data?.detail || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    if (step === 2) { setStep(1); setDocumentId(null); setSerialNumber(null); }
    else if (step > 2) setStep(s => s - 1);
  };

  return (
    <div className="p-8 animate-fade-in-up" data-testid="create-document-page">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Chivo, sans-serif" }}>Create New Document</h1>
          <p className="text-slate-500 text-sm mt-1">Complete all steps to submit your document for approval</p>
        </div>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "Chivo, sans-serif" }}>Select Document Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.code}
                  onClick={() => handleCategorySelect(cat)}
                  data-testid={`category-${cat.code}`}
                  className="bg-white border-2 border-slate-200 rounded-xl p-5 text-left hover:border-[#1B2A4A] hover:shadow-md transition-all group"
                >
                  <span className="text-2xl mb-3 block">{CAT_ICONS[cat.code]}</span>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-[#1B2A4A]">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{cat.types.length} types</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded font-mono">{cat.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && selectedCat && (
          <form onSubmit={handleDetailsSubmit} className="animate-fade-in-up">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <span className="text-lg">{CAT_ICONS[selectedCat.code]}</span>
                <span className="font-semibold text-slate-800">{selectedCat.name}</span>
                <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded font-mono">{selectedCat.code}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Document Type *</label>
                  <select
                    value={form.document_type}
                    onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))}
                    data-testid="document-type-select"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] bg-white"
                  >
                    {selectedCat.types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required placeholder="Document title"
                    data-testid="title-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">To (Recipient) *</label>
                  <input
                    type="text"
                    value={form.to_field}
                    onChange={e => setForm(f => ({ ...f, to_field: e.target.value }))}
                    required placeholder="Recipient name or role"
                    data-testid="to-field-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Generated By</label>
                  <input type="text" value={user?.email || ""} readOnly data-testid="generated-by-input" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Date</label>
                  <input type="text" value={today} readOnly className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Year</label>
                  <input type="text" value={year} readOnly className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description / Notes</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Additional notes or context..."
                    data-testid="description-input"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={goBack} className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition-colors">Back</button>
              <button type="submit" disabled={loading} data-testid="details-continue-btn" className="flex-2 flex-grow-[2] bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <>Continue <ChevronRight size={15} /></>}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Serial Number */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-[#1B2A4A]/8 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-[#1B2A4A]" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Document Serial Number</p>
              <p className="text-3xl font-bold text-[#1B2A4A] font-mono tracking-wider mb-2" data-testid="serial-number">{serialNumber}</p>
              <p className="text-xs text-slate-400 mb-6">This serial number has been assigned to your document</p>
              <div className="bg-slate-50 rounded-lg p-4 text-left grid grid-cols-2 gap-3 text-sm mb-6">
                <div><span className="text-slate-500">Category:</span> <span className="font-medium text-slate-800 ml-2">{selectedCat?.name}</span></div>
                <div><span className="text-slate-500">Type:</span> <span className="font-medium text-slate-800 ml-2">{form.document_type}</span></div>
                <div><span className="text-slate-500">Title:</span> <span className="font-medium text-slate-800 ml-2">{form.title}</span></div>
                <div><span className="text-slate-500">Year:</span> <span className="font-medium text-slate-800 ml-2">{year}</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={goBack} className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition-colors">Back</button>
              <button onClick={() => setStep(4)} data-testid="serial-continue-btn" className="flex-grow-[2] bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2">
                Continue to Upload <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Upload */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-1 text-lg" style={{ fontFamily: "Chivo, sans-serif" }}>Upload Document</h2>
              <p className="text-sm text-slate-500 mb-6">For serial number: <span className="font-mono font-semibold text-[#1B2A4A]">{serialNumber}</span></p>

              <div
                onClick={() => fileRef.current?.click()}
                data-testid="file-upload-zone"
                className="border-2 border-dashed border-slate-300 hover:border-[#1B2A4A] rounded-xl p-10 text-center cursor-pointer transition-colors group"
              >
                <Upload size={32} className="mx-auto text-slate-300 group-hover:text-[#1B2A4A] mb-3 transition-colors" strokeWidth={1.5} />
                <p className="font-medium text-slate-600 text-sm">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF or DOCX up to 10MB</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  data-testid="file-input"
                  onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
                />
              </div>

              {loading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="w-4 h-4 border-2 border-[#1B2A4A]/30 border-t-[#1B2A4A] rounded-full animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={goBack} className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition-colors">Back</button>
              <button onClick={() => setStep(5)} data-testid="skip-upload-btn" className="flex-1 border border-slate-300 text-slate-500 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition-colors">
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-5 text-lg" style={{ fontFamily: "Chivo, sans-serif" }}>Review & Submit</h2>
              <table className="w-full text-sm mb-5">
                <tbody>
                  {[
                    ["Serial Number", <span className="font-mono font-semibold text-[#1B2A4A]">{serialNumber}</span>],
                    ["Category", selectedCat?.name],
                    ["Document Type", form.document_type],
                    ["Title", form.title],
                    ["To", form.to_field],
                    ["Generated By", user?.email],
                    ["Description", form.description || "—"],
                    ["File", file ? <span className="flex items-center gap-1.5 text-emerald-600"><Check size={14} />{file.name}</span> : "Not uploaded"],
                    ["Status", <StatusBadge status="pending" />],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-slate-50">
                      <td className="py-3 pr-4 text-slate-500 font-medium w-36 text-xs uppercase tracking-wider">{label}</td>
                      <td className="py-3 text-slate-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                Submitting will send this document for approval to founders@kovon.io. Once approved, the document will be locked and cannot be edited.
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={goBack} className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={loading} data-testid="submit-for-approval-btn" className="flex-grow-[2] bg-[#1B2A4A] hover:bg-[#0f1f38] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : "Submit for Approval"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
