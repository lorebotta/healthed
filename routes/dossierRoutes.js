// routes/dossierRoutes.js
const express = require("express");
const router = express.Router();
const dossierStore = require("../dossierStore");

// Middleware per verificare l'autenticazione
function requireLogin(req, res, next) {
  if (!req.session.user) {
    console.error("Accesso negato: utente non loggato.");
    return res.redirect("/login");
  }
  next();
}

// Nuova lista sintomi aggiornata
const symptomData = [
  {
    symptom: "Stanchezza",
    conditions: [
      {
        name: "Influenza",
        descrizione:
          "Infezione virale che provoca febbre, dolori muscolari e un generale senso di affaticamento.",
        fattori:
          "Contatto con soggetti infetti, clima freddo, sistema immunitario indebolito.",
        preventive:
          "Vaccinazione annuale, igiene accurata delle mani, evitare contatti stretti in periodi epidemici.",
      },
      {
        name: "COVID‑19",
        descrizione:
          "Infezione da SARS‑CoV‑2 con sintomi che variano da lievi a gravi, tra cui stanchezza persistente.",
        fattori:
          "Esposizione in ambienti chiusi, mancanza di vaccinazione, età avanzata e comorbidità.",
        preventive:
          "Vaccinazione, uso di mascherine, distanziamento sociale e igiene accurata.",
      },
      {
        name: "Anemia",
        descrizione:
          "Ridotto numero di globuli rossi o bassa emoglobina, che porta a una ridotta capacità di trasporto dell’ossigeno e a stanchezza cronica.",
        fattori:
          "Carenze nutrizionali (ferro, vitamina B12), perdite ematiche o malattie croniche.",
        preventive:
          "Dieta equilibrata, integrazione (se necessario) e controllo medico.",
      },
      {
        name: "Disturbi del sonno (es. apnea notturna)",
        descrizione:
          "Interruzioni del normale ciclo del sonno che portano a un affaticamento persistente durante il giorno.",
        fattori: "Obesità, fumo, età avanzata.",
        preventive:
          "Valutazione medica del sonno, miglioramento dell’igiene del sonno e adozione di uno stile di vita sano.",
      },
    ],
  },
  {
    symptom: "Raffreddore",
    conditions: [
      {
        name: "Raffreddore Comune",
        descrizione:
          "Infezione virale del tratto respiratorio superiore che si manifesta con naso che cola, congestione e malessere generale.",
        fattori: "Esposizione a virus in ambienti affollati e freddi.",
        preventive:
          "Lavaggio frequente delle mani, evitare contatti ravvicinati con soggetti infetti, mantenere ambienti ben ventilati.",
      },
      {
        name: "Sinusite Acuta",
        descrizione:
          "Infiammazione temporanea dei seni paranasali, spesso conseguenza di un raffreddore, che porta a dolore facciale e ulteriore congestione.",
        fattori:
          "Allergie, infezioni ricorrenti, deviazioni anatomiche del setto nasale.",
        preventive:
          "Gestione tempestiva delle allergie, igiene nasale (es. soluzioni saline) e consulto medico in caso di sintomi persistenti.",
      },
    ],
  },
  {
    symptom: "Mal di gola",
    conditions: [
      {
        name: "Faringite Virale",
        descrizione:
          "Infiammazione della faringe causata da virus, con dolore e irritazione locale.",
        fattori: "Esposizione a virus in ambienti affollati e scarsa igiene.",
        preventive:
          "Lavaggio delle mani, evitare la condivisione di oggetti personali.",
      },
      {
        name: "Faringite Streptococcica",
        descrizione:
          "Infezione batterica da Streptococco, caratterizzata da mal di gola intenso, spesso accompagnato da febbre.",
        fattori: "Contatto diretto con soggetti infetti, scarsa igiene.",
        preventive:
          "Diagnosi tempestiva, trattamento antibiotico e buone pratiche igieniche.",
      },
    ],
  },
  {
    symptom: "Febbre",
    conditions: [
      {
        name: "Influenza",
        descrizione:
          "Infezione virale che provoca febbre, dolori muscolari e un generale senso di affaticamento.",
        fattori:
          "Contatto con soggetti infetti, clima freddo, sistema immunitario indebolito.",
        preventive:
          "Vaccinazione annuale, igiene accurata delle mani, evitare contatti stretti in periodi epidemici.",
      },
      {
        name: "Mononucleosi Infezione",
        descrizione:
          "Infezione virale da virus Epstein‑Barr che causa febbre, mal di gola e affaticamento prolungato.",
        fattori:
          "Trasmissione tramite saliva (es. baci, condivisione di utensili).",
        preventive:
          "Evitare la condivisione di oggetti personali e mantenere una buona igiene.",
      },
    ],
  },
  {
    symptom: "Tosse",
    conditions: [
      {
        name: "Bronchite Acuta",
        descrizione:
          "Infiammazione delle vie aeree, spesso conseguente a infezioni o irritazioni, che provoca tosse persistente.",
        fattori: "Fumo (attivo o passivo), esposizione a inquinanti.",
        preventive:
          "Smettere di fumare, evitare ambienti inquinati e usare dispositivi protettivi.",
      },
      {
        name: "Asma",
        descrizione:
          "Condizione cronica delle vie aeree caratterizzata da broncospasmo, con tosse, respiro sibilante e difficoltà respiratorie.",
        fattori: "Predisposizione allergica, esposizione a inquinanti e fumo.",
        preventive:
          "Gestione degli allergeni, evitare irritanti e seguire il trattamento prescritto.",
      },
    ],
  },
  {
    symptom: "Mal di testa",
    conditions: [
      {
        name: "Emicrania",
        descrizione:
          "Attacchi ricorrenti di mal di testa pulsante, spesso con nausea e sensibilità a luce e rumore.",
        fattori: "Stress, squilibri ormonali, trigger alimentari e ambientali.",
        preventive:
          "Gestione dello stress, regolarità del sonno e identificazione ed evitamento dei trigger.",
      },
      {
        name: "Cefalea Tensiva",
        descrizione:
          "Mal di testa costante, percepito come una pressione o tensione attorno alla testa, frequentemente legato a tensione muscolare e cattiva postura.",
        fattori: "Stress, cattiva postura, tensione oculare.",
        preventive:
          "Tecniche di rilassamento, pause regolari durante attività prolungate e miglioramento dell’ergonomia.",
      },
    ],
  },
  {
    symptom: "Difficoltà respiratorie",
    conditions: [
      {
        name: "COVID‑19",
        descrizione:
          "Infezione respiratoria da SARS‑CoV‑2 che, nei casi più gravi, può compromettere la funzione polmonare causando dispnea e difficoltà respiratorie.",
        fattori: "Esposizione a soggetti infetti, età avanzata, comorbidità.",
        preventive:
          "Vaccinazione, uso di mascherine, distanziamento sociale e igiene accurata.",
      },
      {
        name: "BPCO (Broncopneumopatia Cronica Ostruttiva)",
        descrizione:
          "Malattia cronica caratterizzata da una riduzione permanente del flusso d’aria, associata comunemente al fumo e all’esposizione a inquinanti.",
        fattori: "Fumo, esposizione a polveri e inquinanti ambientali.",
        preventive:
          "Smettere di fumare, ridurre l’esposizione agli agenti irritanti e utilizzare dispositivi protettivi.",
      },
    ],
  },
  {
    symptom: "Gastroenterite Acuta (Diarrea)",
    conditions: [
      {
        name: "Gastroenterite Virale",
        descrizione:
          "Infezione acuta del tratto gastrointestinale che causa diarrea, nausea, vomito e crampi addominali.",
        fattori: "Consumo di cibi o acqua contaminati, scarsa igiene.",
        preventive:
          "Lavaggio accurato delle mani, igiene alimentare e consumo di acqua potabile.",
      },
      {
        name: "Intossicazione Alimentare",
        descrizione:
          "Reazione a cibi contaminati da batteri o tossine, che si manifesta con diarrea, nausea e vomito.",
        fattori: "Conservazione o preparazione inadeguata degli alimenti.",
        preventive:
          "Corretta conservazione e cottura degli alimenti, controllo delle fonti alimentari.",
      },
    ],
  },
  {
    symptom: "Dolore addominale",
    conditions: [
      {
        name: "Gastroenterite",
        descrizione:
          "Infezione acuta del tratto gastrointestinale che causa diarrea, nausea, vomito e crampi addominali.",
        fattori: "Consumo di cibi o acqua contaminati, scarsa igiene.",
        preventive:
          "Lavaggio accurato delle mani, igiene alimentare e consumo di acqua potabile.",
      },
      {
        name: "Appendicite",
        descrizione:
          "Infiammazione dell’appendice che provoca un dolore acuto, solitamente localizzato nell’addome inferiore destro.",
        fattori:
          "Cause non completamente chiarite, possibile ostruzione dell’appendice.",
        preventive:
          "Non esistono misure preventive specifiche; consulto medico in caso di dolore persistente.",
      },
      {
        name: "Sindrome dell’Intestino Irritabile (IBS)",
        descrizione:
          "Disturbo funzionale che causa dolore addominale cronico, alterazioni della frequenza intestinale e gonfiore.",
        fattori: "Stress, dieta non equilibrata, sensibilità intestinale.",
        preventive:
          "Gestione dello stress, dieta equilibrata e monitoraggio medico.",
      },
    ],
  },
  {
    symptom: "Perdita del gusto/olfatto",
    conditions: [
      {
        name: "COVID‑19",
        descrizione:
          "Infezione da SARS‑CoV‑2, uno dei sintomi distintivi è la perdita parziale o totale di gusto e olfatto.",
        fattori: "Esposizione in ambienti a rischio, mancata vaccinazione.",
        preventive:
          "Vaccinazione, uso di mascherine, distanziamento e igiene accurata.",
      },
      {
        name: "Sinusite Cronica",
        descrizione:
          "Infiammazione persistente dei seni nasali che può compromettere la percezione degli odori e dei sapori.",
        fattori: "Infezioni ricorrenti, allergie, esposizione a inquinanti.",
        preventive:
          "Gestione adeguata delle allergie, igiene nasale e trattamento tempestivo delle infezioni.",
      },
      {
        name: "Altre Cause Neurologiche o Strutturali (meno comuni)",
        descrizione:
          "Condizioni quali polipi nasali o danni ai nervi olfattivi che possono ridurre o alterare i sensi.",
        fattori:
          "Fattori individuali (es. predisposizione, eventi traumatici).",
        preventive: "Diagnosi precoce e intervento medico specializzato.",
      },
    ],
  },
];

// Visualizza la pagina del dossier
router.get("/", requireLogin, (req, res) => {
  const user = req.session.user;
  const records = dossierStore.getRecordsByUser(user.id);
  res.render("dossier", { user, records, symptomData });
});

// Aggiunge un record nel dossier
router.post("/add", requireLogin, (req, res) => {
  const user = req.session.user;
  const { symptom } = req.body;
  if (!symptom) {
    console.error("Nessun sintomo selezionato.");
    return res.send("Errore: seleziona un sintomo.");
  }
  const record = {
    user: user.id,
    symptom,
  };
  dossierStore.addRecord(record);
  console.log("Nuovo record aggiunto:", symptom);
  res.redirect("/dossier");
});

// Eliminazione di un record sintomo
router.post("/:recordId/delete", requireLogin, (req, res) => {
  const user = req.session.user;
  const recordId = req.params.recordId;
  if (!dossierStore.deleteRecord(recordId, user.id)) {
    console.error("Errore nella cancellazione del record:", recordId);
    return res.send("Errore nella cancellazione del record.");
  }
  res.redirect("/dossier");
});

// Restituisce in JSON i dettagli di un sintomo (per uso AJAX)
router.get("/:symptomName", requireLogin, (req, res) => {
  const symptomName = req.params.symptomName;
  const found = symptomData.find((s) => s.symptom === symptomName);
  if (!found) {
    console.error("Sintomo non trovato:", symptomName);
    return res.status(404).json({ error: "Sintomo non trovato." });
  }
  res.json(found);
});

module.exports = router;
