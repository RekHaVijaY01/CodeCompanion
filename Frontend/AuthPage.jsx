import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import ResetPasswordModal from "./ResetPassword";





export default function AuthPage() {
  const [mode, setMode] = useState(null); // "signup" | "login" | null
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);



  const validate = () => {
    const newErrors = {};

    if (mode === "signup") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include 1 special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const url =
      mode === "signup"
        ? "http://localhost:5000/api/signup"
        : "http://localhost:5000/api/login";

    try {
      const res = await axios.post(url, form);
      alert(res.data.message || "Success");
      navigate("/main");
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    setForm({ email: "", username: "", password: "" });
    setErrors({});
    setShowPassword(false);
  };

  const renderPasswordInput = () => (
    <div style={{ position: "relative", marginBottom: "10px" }}>
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        style={{ paddingRight: "30px", width: "100%" }}
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
        }}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
      {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <video
  autoPlay
  loop
  muted
  playsInline
  style={{
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    top: 0,
    left: 0,
    zIndex: -1,
  }}
>
  <source src="/bg.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
<div
  style={{
    position: "absolute",
    top: 0,
    left: 0, // <-- make sure this is set
    right: 0,
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    padding: "1rem 2rem",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2,
    boxSizing: "border-box", // ensure padding doesn't shift content
  }}
>


      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => handleModeChange("signup")}
          style={{ marginRight: "1rem" }}
        >
          Sign Up
        </button>
        <button onClick={() => handleModeChange("login")}>Login</button>
      </div>

    {mode && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 3,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "2rem",
        width: "90%",
        maxWidth: "400px",
        position: "relative",
      }}
    >
      <button
        onClick={() => setMode(null)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        ✖
      </button>

      <h2 style={{ marginBottom: "1rem" }}>
        {mode === "signup" ? "Sign Up" : "Login"}
      </h2>

      {mode === "signup" && (
        <>
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </>
      )}

      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}

      {renderPasswordInput()}

      <button onClick={handleSubmit} style={{ width: "100%", marginTop: "10px" }}>
        {mode === "signup" ? "Create Account" : "Login"}
      </button>

      {mode === "login" && (
  <p style={{ marginTop: "1rem" }}>
    <button
      onClick={() => setShowResetModal(true)}
      style={{
        background: "none",
        border: "none",
        color: "blue",
        cursor: "pointer",
        textDecoration: "underline",
        padding: 0,
      }}
    >
      Forgot Password?
    </button>
  </p>
)}
{showResetModal && (
  <ResetPasswordModal
    onClose={() => setShowResetModal(false)}
    onSuccess={() => {
      setShowResetModal(false);
      setMode("login"); // go back to login after success
    }}
  />
)}

    </div>
  </div>
)}


    </div>
    </div>
  );
  
}