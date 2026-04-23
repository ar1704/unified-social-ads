const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

/* 🔐 SECRET KEY */
const SECRET_KEY = "mysecretkey";

/* ================= MongoDB ================= */
mongoose.connect("mongodb://127.0.0.1:27017/ads-platform")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error ❌", err));

/* ================= MODELS ================= */

// User Model
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

// Campaign Model
const CampaignSchema = new mongoose.Schema({
  title: String,
  budget: Number,
  platforms: [String],
  status: String,
  logs: [String]
});
const Campaign = mongoose.model("Campaign", CampaignSchema);

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Access denied ❌");

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch {
    res.status(400).send("Invalid token ❌");
  }
};

/* ================= AUTH APIs ================= */

// ✅ Register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed
    });

    await user.save();

    res.json({ message: "User registered ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found ❌");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Wrong password ❌");

    const token = jwt.sign({ id: user._id }, SECRET_KEY);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= CAMPAIGN APIs (PROTECTED) ================= */

// ✅ Create Campaign
app.post("/api/campaigns", authMiddleware, async (req, res) => {
  try {
    const campaign = new Campaign({
      ...req.body,
      status: "Draft",
      logs: []
    });

    await campaign.save();
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Campaigns
app.get("/api/campaigns", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Publish Campaign
app.post("/api/publish/:id", authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) return res.status(404).send("Not found ❌");

    campaign.status = "Publishing...";
    campaign.logs.push("Publishing started");
    await campaign.save();

    setTimeout(async () => {
      campaign.status = "Success ✅";
      campaign.logs.push("Published successfully");
      await campaign.save();
    }, 3000);

    res.json({ message: "Publishing started 🚀" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Campaign
app.delete("/api/campaigns/:id", authMiddleware, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= START SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});