const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "dossier.json");

function loadDossier() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath);
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Errore nel parsing di dossier.json:", err);
    return [];
  }
}

function saveDossier(dossier) {
  fs.writeFileSync(filePath, JSON.stringify(dossier, null, 2));
}

function addRecord(record) {
  const dossier = loadDossier();
  record.id = Date.now();
  record.createdAt = new Date();
  dossier.push(record);
  saveDossier(dossier);
  return record;
}

function getRecordsByUser(userId) {
  const dossier = loadDossier();
  return dossier
    .filter((r) => r.user == userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function deleteRecord(recordId, userId) {
  let dossier = loadDossier();
  const initialLength = dossier.length;
  dossier = dossier.filter((r) => r.id != recordId || r.user != userId);
  if (dossier.length === initialLength) {
    return false;
  }
  saveDossier(dossier);
  return true;
}

module.exports = {
  addRecord,
  getRecordsByUser,
  deleteRecord,
};
