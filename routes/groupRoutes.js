const express = require("express");
const router = express.Router();
const groupStore = require("../groupStore");

// Middleware per verificare l'autenticazione
function requireLogin(req, res, next) {
  if (!req.session.user) {
    console.error("Accesso negato: utente non loggato.");
    return res.redirect("/login");
  }
  next();
}

// Mostra l'elenco dei gruppi relativi all'utente
router.get("/", requireLogin, (req, res) => {
  const user = req.session.user;
  const search = req.query.search;
  let groups = groupStore.getGroupsForUser(user);

  if (search) {
    groups = groups.filter((group) =>
      group.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  res.render("groups", { user, groups, search });
});

// Creazione di un nuovo gruppo (solo per Tutor)
// Se il nome esiste già (case-insensitive) viene restituito un errore
router.post("/create", requireLogin, (req, res) => {
  const user = req.session.user;
  if (user.role !== "Tutor") {
    console.error("Accesso negato: solo i tutor possono creare gruppi.");
    return res.redirect("/groups");
  }
  const { groupName, description } = req.body;
  if (!groupName) {
    console.error("Creazione gruppo: nome mancante.");
    return res.send("Errore: nome del gruppo mancante.");
  }
  const group = groupStore.addGroup({ name: groupName, description, tutor: user.id });
  if (!group) {
    console.error("Gruppo già esistente con questo nome.");
    return res.send("Errore: un gruppo con questo nome esiste già.");
  }
  console.log("Gruppo creato:", groupName);
  res.redirect("/groups");
});

// Permette a uno studente di unirsi a un gruppo
router.post("/:groupId/join", requireLogin, (req, res) => {
  const user = req.session.user;
  if (user.role !== "Student") {
    console.error(
      "Accesso negato: solo gli studenti possono unirsi ai gruppi.",
    );
    return res.redirect("/groups");
  }
  const groupId = req.params.groupId;
  const group = groupStore.joinGroup(groupId, user.id);
  if (!group) {
    console.error("Gruppo non trovato.");
    return res.send("Errore: gruppo non trovato.");
  }
  console.log(`Studente ${user.username} si è unito al gruppo ${group.name}`);
  res.redirect("/groups");
});

// Route per abbandonare il gruppo (solo per studenti)
router.post("/:groupId/leave", requireLogin, (req, res) => {
  const user = req.session.user;
  if (user.role !== "Student") {
    return res
      .status(403)
      .send("Accesso negato: solo gli studenti possono abbandonare i gruppi.");
  }
  const groupId = req.params.groupId;
  const result = groupStore.removeMember(groupId, user.id);
  if (result) {
    res.redirect("/groups");
  } else {
    res.status(400).send("Errore nell'abbandono del gruppo");
  }
});

// Eliminazione del gruppo (solo per il tutor che lo ha creato)
router.post("/:groupId/delete", requireLogin, (req, res) => {
  const user = req.session.user;
  if (user.role !== "Tutor") {
    console.error("Accesso negato: solo i tutor possono eliminare i gruppi.");
    return res.redirect("/groups");
  }
  const groupId = req.params.groupId;
  if (!groupStore.deleteGroup(groupId, user.id)) {
    console.error("Gruppo non trovato o non autorizzato per la cancellazione.");
    return res.send("Errore: gruppo non trovato o non autorizzato.");
  }
  console.log(`Gruppo eliminato: ${groupId}`);
  res.redirect("/groups");
});

// Visualizza la chat di un gruppo
router.get("/:groupId/chat", requireLogin, (req, res) => {
  const groupId = req.params.groupId;
  const group = groupStore.findGroupById(groupId);
  if (!group) {
    console.error("Gruppo non trovato per la chat.");
    return res.send("Errore: gruppo non trovato.");
  }
  // Se lo studente non è membro del gruppo, lo reindirizza
  if (
    req.session.user.role === "Student" &&
    !group.members.includes(req.session.user.id)
  ) {
    return res.redirect("/groups");
  }
  res.render("group-chat", { user: req.session.user, group });
});

// === Nuove Route per Q&A e Contenuti Educativi ===

// 1. Aggiungere una nuova domanda (Q&A)
// Solo gli studenti possono inviare domande
router.post("/:groupId/questions", requireLogin, (req, res) => {
  const groupId = req.params.groupId;
  if (req.session.user.role !== "Student") {
    return res
      .status(403)
      .send("Accesso negato: solo gli studenti possono fare domande.");
  }
  const { text, isPublic } = req.body;
  const question = groupStore.addQuestion(groupId, {
    author: req.session.user,
    text,
    isPublic,
  });
  if (question) {
    res.status(200).json(question);
  } else {
    res.status(400).send("Errore nell'aggiunta della domanda");
  }
});

// 2. Aggiungere una risposta a una domanda (Q&A)
// Solo i tutor possono rispondere
router.post(
  "/:groupId/questions/:questionId/answers",
  requireLogin,
  (req, res) => {
    if (req.session.user.role !== "Tutor") {
      return res
        .status(403)
        .send("Accesso negato: solo i tutor possono rispondere.");
    }
    const groupId = req.params.groupId;
    const questionId = req.params.questionId;
    const { text } = req.body;
    const answer = groupStore.addAnswer(groupId, questionId, {
      author: req.session.user,
      text,
    });
    if (answer) {
      res.status(200).json(answer);
    } else {
      res.status(400).send("Errore nell'aggiunta della risposta");
    }
  },
);

// 3. Pubblicare contenuti educativi per il gruppo
// Solo i tutor possono pubblicare contenuti
router.post("/:groupId/content", requireLogin, (req, res) => {
  if (req.session.user.role !== "Tutor") {
    return res
      .status(403)
      .send("Accesso negato: solo i tutor possono pubblicare contenuti.");
  }
  const groupId = req.params.groupId;
  const { title, body } = req.body;
  const content = groupStore.addContent(groupId, {
    title,
    body,
    author: req.session.user,
  });
  if (content) {
    res.status(200).json(content);
  } else {
    res.status(400).send("Errore nell'aggiunta del contenuto");
  }
});

// 4. Eliminare un contenuto pubblicato nel gruppo
// Solo i tutor possono eliminare i contenuti pubblicati da loro
router.post("/:groupId/content/:contentId/delete", requireLogin, (req, res) => {
  if (req.session.user.role !== "Tutor") {
    return res
      .status(403)
      .send("Accesso negato: solo i tutor possono eliminare contenuti.");
  }
  const groupId = req.params.groupId;
  const contentId = req.params.contentId;
  if (groupStore.deleteContent(groupId, contentId, req.session.user.id)) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).send("Errore nell'eliminazione del contenuto");
  }
});

module.exports = router;
