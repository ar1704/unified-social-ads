import { useState, useEffect } from "react";

const allPlatforms = [
  "Meta","Google","YouTube","LinkedIn","X","Snapchat",
  "Pinterest","Reddit","Microsoft Advertising","Amazon Ads",
  "Quora","Spotify","WhatsApp","Threads","Telegram"
];

function CreateCampaign() {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [error, setError] = useState("");

  // ✅ Load from backend
  const loadCampaigns = () => {
    fetch("http://localhost:5000/api/campaigns")
      .then(res => res.json())
      .then(data => setCampaigns(data));
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCheckbox = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // ✅ Create campaign via API
  const handleSubmit = async () => {
    if (!title.trim()) return setError("Title required ❗");
    if (!budget || isNaN(Number(budget))) return setError("Invalid budget ❗");
    if (platforms.length === 0) return setError("Select platform ❗");

    await fetch("http://localhost:5000/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, budget, platforms })
    });

    setTitle("");
    setBudget("");
    setPlatforms([]);
    setError("");

    loadCampaigns(); // refresh
  };

  // ✅ Publish
  const handlePublish = async (id: number) => {
    await fetch(`http://localhost:5000/api/publish/${id}`, {
      method: "POST"
    });

    alert("Publishing started 🚀");

    setTimeout(loadCampaigns, 2000);
  };

  // ✅ Delete
  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:5000/api/campaigns/${id}`, {
      method: "DELETE"
    });

    loadCampaigns();
  };

  return (
    <div style={{
      marginTop: 30,
      textAlign: "center",
      fontFamily: "Arial",
      background: "#f5f7fa",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h2 style={{ color: "#2c3e50" }}>🎯 Create Campaign</h2>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 20,
        width: 360,
        margin: "auto",
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <input
          placeholder="Campaign Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <br /><br />

        <input
          placeholder="Budget (₹)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={inputStyle}
        />
        <br /><br />

        <b>Select Platforms:</b>

        <div style={{ textAlign: "left", marginTop: 10 }}>
          {allPlatforms.map((p) => (
            <label key={p} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={platforms.includes(p)}
                onChange={() => handleCheckbox(p)}
              /> {p}
            </label>
          ))}
        </div>

        <br />

        <button style={primaryBtn} onClick={handleSubmit}>
          ➕ Create Campaign
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* LIST */}
      <h3 style={{ marginTop: 30, color: "#34495e" }}>📊 Campaigns</h3>

      {campaigns.map((c) => (
        <div key={c.id} style={{
          background: "white",
          margin: "10px auto",
          padding: 15,
          width: 360,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <p><b>{c.title}</b></p>
          <p>💰 ₹{c.budget}</p>
          <p>📱 {c.platforms.join(", ")}</p>
          <p>
            Status: 
            <span style={{
              color:
                c.status === "Success ✅" ? "green" :
                c.status === "Publishing..." ? "orange" : "gray"
            }}>
              {" "}{c.status}
            </span>
          </p>

          <button style={publishBtn} onClick={() => handlePublish(c.id)}>
            🚀 Publish
          </button>

          <button style={deleteBtn} onClick={() => handleDelete(c.id)}>
            ❌ Delete
          </button>
        </div>
      ))}
    </div>
  );
}

/* 🎨 Styles */
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const primaryBtn = {
  width: "100%",
  padding: "10px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const publishBtn = {
  marginRight: 10,
  padding: "6px 10px",
  background: "#27ae60",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "6px 10px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default CreateCampaign;