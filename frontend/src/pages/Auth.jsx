import React, { useState } from "react";
import { Lock, Mail, User, Sparkles, Home } from "lucide-react";

export default function Auth({ onLoginSuccess, showToast }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (tab === "signup") {
      if (!name) newErrors.name = "Full name is required";
      else if (name.length < 3) newErrors.name = "Name must be at least 3 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = tab === "login" ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        if (tab === "login") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          showToast("Welcome back!", "success");
          onLoginSuccess(data.user, data.token);
        } else {
          showToast("Registration successful! Please login.", "success");
          setTab("login");
          setPassword("");
          setErrors({});
        }
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch (error) {
      setLoading(false);
      showToast("Server connection failed", "error");
    }
  };

  const features = [
    "Expert professionals, background-verified",
    "Same-day service availability",
    "Transparent pricing, no hidden fees",
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#fff" }}>
      
      {/* ===== LEFT PANEL ===== */}
      <div
        style={{
          flex: "0 0 48%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 48px",
          color: "white",
          position: "relative",
          overflow: "hidden",
          backgroundImage: 'url("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,41,59,0.7) 100%)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            padding: "10px 12px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(99,102,241,0.5)"
          }}>
            <Home size={22} color="white" />
          </div>
          <span style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.5px" }}>HomeEase</span>
        </div>

        {/* Bottom text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(99,102,241,0.3)",
            border: "1px solid rgba(99,102,241,0.5)",
            borderRadius: "100px",
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.5px",
            marginBottom: "20px"
          }}>
            <Sparkles size={14} /> TRUSTED BY 50,000+ CUSTOMERS
          </div>

          <h1 style={{
            fontSize: "2.6rem",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "16px",
            letterSpacing: "-0.5px"
          }}>
            Transform your<br />home today.
          </h1>

          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)", marginBottom: "28px", lineHeight: 1.6 }}>
            Book trusted home service professionals in minutes, not hours.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(99,102,241,0.4)",
                  border: "1px solid rgba(99,102,241,0.7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", flexShrink: 0
                }}>✓</div>
                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 48px",
          background: "#f8fafc",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Heading */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.5px" }}>
              {tab === "login" ? "Welcome back 👋" : "Create account"}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
              {tab === "login"
                ? "Enter your credentials to access your account."
                : "Sign up to start booking premium home services."}
            </p>
          </div>

          {/* Tab Toggle */}
          <div style={{
            display: "flex",
            background: "#e2e8f0",
            padding: "4px",
            borderRadius: "14px",
            marginBottom: "28px",
          }}>
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); }}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "#6366f1" : "#94a3b8",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {tab === "signup" && (
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "7px", color: "#334155", fontSize: "0.88rem" }}>FULL NAME</label>
                <div style={{ position: "relative" }}>
                  <User size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="e.g., John Doe"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: null }); }}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "13px 14px 13px 42px",
                      border: `1.5px solid ${errors.name ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: "12px", fontSize: "0.95rem",
                      outline: "none", background: "white",
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>
                {errors.name && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>{errors.name}</span>}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "7px", color: "#334155", fontSize: "0.88rem" }}>EMAIL ADDRESS</label>
              <div style={{ position: "relative" }}>
                <Mail size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: null }); }}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 14px 13px 42px",
                    border: `1.5px solid ${errors.email ? "#ef4444" : "#e2e8f0"}`,
                    borderRadius: "12px", fontSize: "0.95rem",
                    outline: "none", background: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
              {errors.email && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "7px", color: "#334155", fontSize: "0.88rem" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: null }); }}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 14px 13px 42px",
                    border: `1.5px solid ${errors.password ? "#ef4444" : "#e2e8f0"}`,
                    borderRadius: "12px", fontSize: "0.95rem",
                    outline: "none", background: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
              {errors.password && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                transition: "all 0.2s ease",
                marginTop: "4px",
              }}
            >
              {loading ? "Please wait..." : tab === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          {/* Admin Auto-fill Helper */}
          {tab === "login" && (
            <div style={{ marginTop: "16px", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px dashed #cbd5e1", fontSize: "0.8rem", color: "#475569" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>👑 Admin Credentials:</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><code>admin@homeease.com</code> / <code>Admin@123</code></span>
                <button
                  type="button"
                  onClick={() => { setEmail("admin@homeease.com"); setPassword("Admin@123"); setErrors({}); }}
                  style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px", background: "#6366f1", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                  Auto-fill
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.82rem", color: "#94a3b8" }}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => { setTab(tab === "login" ? "signup" : "login"); setErrors({}); }}
              style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}
            >
              {tab === "login" ? "Sign Up" : "Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
