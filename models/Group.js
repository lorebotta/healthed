
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  maxMembers: { type: Number, default: 0 }, // 0 means unlimited
});

module.exports = mongoose.model("Group", groupSchema);
