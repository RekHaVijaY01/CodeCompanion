import React, { useState } from "react";
import axios from "axios";

export default function ResetPasswordModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ email: "", new_password: "" });
  const [error, setError] = useState("");

  const handleReset = async () => {
    try {
      await axios.post("http://localhost:5000/api/reset-password", form);
      alert("Password reset successful. Login again.");
      onSuccess(); // Redirect to login
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed");
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <h2>Reset Password</h2>
        <input
          placeholder="Your Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="New Password"
          value={form.new_password}
          onChange={e => setForm({ ...form, new_password: e.target.value })}
          style={styles.input}
        />
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={handleReset} style={styles.button}>Reset</button>
          <button onClick={onClose} style={styles.button}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalBackdrop: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 999
  },
  modalContent: {
    backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "300px"
  },
  input: {
    width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc"
  },
  button: {
    padding: "8px 12px", borderRadius: "4px", border: "none", backgroundColor: "#007bff", color: "white"
  }
};
