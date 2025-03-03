const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userStore = require("../userStore");

// Mostra il form di registrazione
router.get("/register", (req, res) => {
  res.render("register");
});

// Gestione della registrazione
router.post("/register", async (req, res) => {
  try {
    const { username, password, fullName, role, year } = req.body;

    // Validazioni minime
    if (!username || !password || !fullName || !role || !year) {
      console.error("Registrazione: campi mancanti.");
      return res.send("Errore: campi mancanti. Riprova.");
    }

    // Se è un tutor, controlla che l'anno sia 4 o 5
    if (role === "Tutor" && parseInt(year) < 4) {
      console.error("Registrazione: un tutor deve essere in quarta o quinta.");
      return res.send("Errore: un tutor deve essere in quarta o quinta.");
    }

    await userStore.addUser({ username, password, fullName, role, year });
    console.log("Utente registrato con successo:", username);
    res.redirect("/login");
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    res.send(
      "Si è verificato un errore durante la registrazione: " + error.message,
    );
  }
});

// Mostra il form di login
router.get("/login", (req, res) => {
  res.render("login");
});

// Gestione del login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      console.error("Login: campi mancanti.");
      return res.send("Errore: campi mancanti. Riprova.");
    }

    const user = userStore.findUser(username);
    if (!user) {
      console.error("Login: utente non trovato.");
      return res.send("Errore: credenziali non valide.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Login: password errata.");
      return res.send("Errore: credenziali non valide.");
    }

    // Salva l'utente in sessione
    req.session.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      year: user.year,
    };

    console.log("Utente loggato con successo:", username);
    res.redirect("/groups");
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.send("Si è verificato un errore durante il login: " + error.message);
  }
});

// Logout (ora accessibile cliccando sull'icona utente)
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Errore durante il logout:", err);
    }
    res.redirect("/login");
  });
});

// La rotta dashboard ora reindirizza a /groups
router.get("/dashboard", (req, res) => {
  res.redirect("/groups");
});

module.exports = router;
