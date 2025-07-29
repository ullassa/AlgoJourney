import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  topic: String,
  platform: String,
  difficulty: String,
  link: String,
  solved: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
  solvedAt: Date
});

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;