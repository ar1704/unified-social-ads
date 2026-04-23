import { useState } from "react";
import CreateCampaign from "./CreateCampaign";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ NEW

  const handleLogin = async () => {
    try {
      // ✅ VALIDATION
      if (!email.trim() || !password.trim()) {
        setError("Enter email and password ❗");
        return;
      }

      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed ❌");
        setLoading(false);
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

      // ✅ UPDATE STATE
      setIsLoggedIn(true);
      setEmail("");
      setPassword("");
      setError("");
      setLoading(false);

    } catch {
      setError("Server error ❌");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ better than clear()
    setIsLoggedIn(false);
  };

  return (
    <div style={container}>
      <h1 style={heading}>🚀 Unified Ads SaaS Platform</h1>

      {!isLoggedIn ? (
        <div style={card}>
          <h2>Login</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <button onClick={handleLogin} style={btn}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <>
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>

          {/* ✅ reload component after login */}
          <CreateCampaign key={Date.now()} />
        </>
      )}
    </div>
  );
}

/* STYLES */
const container = {
  background: "#f5f7fa",
  minHeight: "100vh",
  padding: "20px",
  textAlign: "center" as const
};

const heading = {
  color: "#2c3e50"
};

const card = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  width: "300px",
  margin: "auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  marginTop: "15px",
  padding: "10px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const logoutBtn = {
  marginBottom: "10px",
  padding: "8px 15px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default App;