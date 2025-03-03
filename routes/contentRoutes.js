const express = require("express");
const router = express.Router();
const contentStore = require("../contentStore");

// Middleware per verificare l'autenticazione
function requireLogin(req, res, next) {
  if (!req.session.user) {
    console.error("Accesso negato: utente non loggato.");
    return res.redirect("/login");
  }
  next();
}

// Mostra la lista dei contenuti
router.get("/", requireLogin, (req, res) => {
  const search = req.query.search;
  let contents = contentStore.getContents();

  if (search) {
    contents = contents.filter(
      (content) =>
        content.title.toLowerCase().includes(search.toLowerCase()) ||
        content.body.toLowerCase().includes(search.toLowerCase()) ||
        content.category.toLowerCase().includes(search.toLowerCase()),
    );
  }

  res.render("content", { user: req.session.user, contents, search });
});

// Creazione di un nuovo contenuto (solo per Tutor)
router.post("/create", requireLogin, (req, res) => {
  const user = req.session.user;
  if (user.role !== "Tutor") {
    console.error("Accesso negato: solo i tutor possono creare contenuti.");
    return res.redirect("/content");
  }
  const { title, category, body } = req.body;
  if (!title || !category || !body) {
    console.error("Creazione contenuto: campi mancanti.");
    return res.send("Errore: tutti i campi sono obbligatori.");
  }
  const content = {
    title,
    category,
    body,
    author: user.id,
  };
  const createdContent = contentStore.addContent(content);
  
  if (!createdContent) {
    console.error("Errore: esiste già un contenuto con questo titolo.");
    return res.send("Errore: esiste già un contenuto con questo titolo. Scegliere un titolo diverso.");
  }
  
  console.log("Contenuto creato:", title);
  res.redirect("/content");
});

// Eliminazione di un contenuto (solo per il tutor che lo ha creato)
router.post("/:contentId/delete", requireLogin, (req, res) => {
  const user = req.session.user;
  if (user.role !== "Tutor") {
    console.error("Accesso negato: solo i tutor possono eliminare contenuti.");
    return res.redirect("/content");
  }
  const contentId = req.params.contentId;
  if (!contentStore.deleteContent(contentId, user.id)) {
    console.error(
      "Contenuto non trovato o non autorizzato per la cancellazione.",
    );
    return res.send("Errore: contenuto non trovato o non autorizzato.");
  }
  console.log(`Contenuto eliminato: ${contentId}`);
  res.redirect("/content");
});

module.exports = router;
