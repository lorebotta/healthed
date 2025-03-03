// models/Content.js
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // es: "nutrition", "vaccines", ecc.
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // tutor che lo ha creato
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Content", contentSchema);
