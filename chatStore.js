const fs = require("fs");
const path = require("path");
const messagesFile = path.join(__dirname, "chatMessages.json");

let messages = {};

// Carica i messaggi esistenti dal file JSON
try {
  if (fs.existsSync(messagesFile)) {
    const data = fs.readFileSync(messagesFile, "utf8");
    messages = JSON.parse(data);
  }
} catch (err) {
  console.error("Errore nel caricare i messaggi:", err);
  // Creiamo un oggetto vuoto se c'è un errore
  messages = {};
}

// Salva i messaggi nel file JSON
function saveMessages() {
  try {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error("Errore nel salvare i messaggi:", err);
  }
}

function addMessage(groupId, msgData) {
  if (!messages[groupId]) {
    messages[groupId] = [];
  }
  const message = { ...msgData, timestamp: new Date() };
  messages[groupId].push(message);
  saveMessages();
  return message;
}

function getMessages(groupId) {
  return messages[groupId] || [];
}

module.exports = {
  addMessage,
  getMessages,
};
