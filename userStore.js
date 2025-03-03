// userStore.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const filePath = path.join(__dirname, "users.json");

// Funzione per caricare gli utenti dal file JSON
function loadUsers() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath);
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Errore nel parsing di users.json:", err);
    return [];
  }
}

// Funzione per salvare gli utenti sul file JSON
function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// Aggiunge un nuovo utente; se l'utente esiste già, lancia un errore
async function addUser({ username, password, fullName, role, year }) {
  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    throw new Error("L'utente esiste già");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(), // ID semplice basato sul timestamp
    username,
    password: hashedPassword,
    fullName,
    role,
    year,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Trova un utente in base al nome utente
function findUser(username) {
  const users = loadUsers();
  return users.find((u) => u.username === username);
}

module.exports = {
  addUser,
  findUser,
};
