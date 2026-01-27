import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { submitCareerApplication } from "../api";
import { ArrowLeft, CheckCircle, UploadCloud, Monitor, Server, Layers, Smartphone, PenTool, Layout, Loader2 } from "lucide-react";

export default function Careers() {
  const { t } = useTranslation();
  const nav = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    role: "Frontend Developer",
    about: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { label: "Frontend Developer", value: "Frontend Developer", icon: <Monitor size={18} /> },
    { label: "Backend Developer", value: "Backend Developer", icon: <Server size={18} /> },
    { label: "Full-Stack Developer", value: "Full-Stack Developer", icon: <Layers size={18} /> },
    { label: "Mobile App Developer", value: "Mobile App Developer", icon: <Smartphone size={18} /> },
    { label: "UI / UX Designer", value: "UI / UX Designer", icon: <PenTool size={18} /> },
    { label: "Product Designer", value: "Product Designer", icon: <Layout size={18} /> },
    { label: "Product Manager", value: "Product Manager", icon: <Layers size={18} /> },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!cvFile) {
        throw new Error("Please upload your CV");
      }

      const fd = new FormData();
      fd.append("firstName", formData.firstName);
      fd.append("lastName", formData.lastName);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("country", formData.country);
      fd.append("state", formData.state);
      fd.append("role", formData.role);
      fd.append("about", formData.about);
      fd.append("cv", cvFile);

      await submitCareerApplication(fd);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4">Application Sent!</h2>
          <p className="text-muted-foreground mb-8 text-lg font-medium">
            Thanks for applying to Moondala. We’ll review your application and get back to you soon.
          </p>
          <button
            onClick={() => nav("/")}
            className="w-full py-3 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-opacity"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-black text-lg">Careers at Moondala</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Join the Team
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            We’re building Moondala. If you’re into tech, design, or product — we’d love to hear from you.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-muted-foreground ml-1">First Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Alex"
                className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-muted-foreground ml-1">Last Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Smith"
                className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-muted-foreground ml-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="e.g. alex@example.com"
              className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-muted-foreground ml-1">Phone Number</label>
            <input
              required
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-muted-foreground ml-1">Country</label>
              <input
                required
                type="text"
                placeholder="e.g. United States"
                className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            
            {(formData.country.toLowerCase().includes("usa") || 
              formData.country.toLowerCase().includes("united states") || 
              formData.country.toLowerCase() === "us") && (
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground ml-1">State</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. California"
                  className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-muted-foreground ml-1">Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className={`p-4 rounded-xl border flex items-center gap-3 font-bold transition-all text-left ${
                    formData.role === r.value
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white border-transparent shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 scale-[1.02]"
                      : "bg-accent/30 border-border hover:border-blue-500/50 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-muted-foreground ml-1">About Yourself</label>
            <textarea
              required
              rows={5}
              placeholder="Tell us about your experience and why you want to join Moondala..."
              className="w-full p-4 rounded-xl bg-accent/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold resize-none"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-muted-foreground ml-1">Upload CV (PDF / DOC)</label>
            <div className="relative group">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
                cvFile 
                  ? "bg-green-500/10 border-green-500/50" 
                  : "bg-accent/20 border-border group-hover:border-primary/50"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  cvFile ? "bg-green-500 text-white" : "bg-accent text-muted-foreground"
                }`}>
                  {cvFile ? <CheckCircle size={24} /> : <UploadCloud size={24} />}
                </div>
                <div className="text-center">
                  <div className="font-black text-lg">
                    {cvFile ? cvFile.name : "Click to Upload CV"}
                  </div>
                  {!cvFile && (
                    <div className="text-sm text-muted-foreground font-bold mt-1">
                      PDF, DOC, DOCX up to 10MB
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black text-lg rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>

        <div className="mt-16 pt-10 border-t border-border text-center">
            <p className="text-muted-foreground font-bold">Questions?</p>
            <a href="mailto:careers@moondala.one" className="text-primary font-black text-lg hover:underline">
                careers@moondala.one
            </a>
        </div>
      </div>
    </div>
  );
}
