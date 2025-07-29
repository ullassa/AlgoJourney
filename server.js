import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Problem from "./models/Problem.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => { console.error("MongoDB error:", err); process.exit(1); });

// ------- JWT Auth Middleware -------
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ------- AUTH ROUTES -------
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name, username } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email exists" });
    const user = await User.create({ email, password, name, username });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { email: user.email, name: user.name, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { email: user.email, name: user.name, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------- PROFILE ROUTES -------
app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});
app.put("/api/profile", authMiddleware, async (req, res) => {
  const { name, username, location, role, accountType } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, username, location, role, accountType },
    { new: true }
  ).select("-password");
  res.json(user);
});

// ------- PROBLEMS ROUTES -------
app.get("/api/problems", authMiddleware, async (req, res) => {
  const problems = await Problem.find({ user: req.user.id });
  res.json(problems);
});
app.post("/api/problems", authMiddleware, async (req, res) => {
  const p = await Problem.create({ ...req.body, user: req.user.id });
  res.json(p);
});
app.put("/api/problems/:id", authMiddleware, async (req, res) => {
  const p = await Problem.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  res.json(p);
});
app.delete("/api/problems/:id", authMiddleware, async (req, res) => {
  await Problem.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));