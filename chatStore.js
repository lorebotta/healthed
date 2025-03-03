const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "chatMessages.json");

function loadMessages() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(filePath);
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Errore nel parsing di chatMessages.json:", err);
    return {};
  }
}

function saveMessages(messages) {
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

function addMessage(groupId, msgData) {
  const messages = loadMessages();
  if (!messages[groupId]) {
    messages[groupId] = [];
  }
  const message = { ...msgData, timestamp: new Date() };
  messages[groupId].push(message);
  saveMessages(messages);
  return message;
}

function getMessages(groupId) {
  const messages = loadMessages();
  return messages[groupId] || [];
}

module.exports = {
  addMessage,
  getMessages,
};
