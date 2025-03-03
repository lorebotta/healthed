// models/Dossier.js
const mongoose = require("mongoose");

const dossierSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symptom: { type: String, required: true },
  // Puoi aggiungere più campi se necessario (descrizione, note, ecc.)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Dossier", dossierSchema);
