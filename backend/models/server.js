import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String, select: false },
  name: String,
  username: String,
  location: String,
  role: { type: String, default: "Student" },
  accountType: { type: String, default: "Free" }
});
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
const User = mongoose.model("User", userSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => { console.error("MongoDB error:", err); process.exit(1); });

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

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name, username, location } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email exists" });
    const user = await User.create({ email, password, name, username, location });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { email: user.email, name: user.name, username: user.username, location: user.location } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { email: user.email, name: user.name, username: user.username, location: user.location } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET PROFILE
app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// UPDATE PROFILE
app.put("/api/profile", authMiddleware, async (req, res) => {
  const { name, username, location, role, accountType } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, username, location, role, accountType },
    { new: true }
  ).select("-password");
  res.json(user);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));