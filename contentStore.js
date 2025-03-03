const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "contents.json");

function loadContents() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath);
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Errore nel parsing di contents.json:", err);
    return [];
  }
}

function saveContents(contents) {
  fs.writeFileSync(filePath, JSON.stringify(contents, null, 2));
}

function addContent(content) {
  const contents = loadContents();
  
  // Controllo se esiste già un contenuto con lo stesso titolo
  const titleExists = contents.some(existingContent => 
    existingContent.title.toLowerCase() === content.title.toLowerCase()
  );
  
  if (titleExists) {
    return null; // Ritorna null se il titolo esiste già
  }
  
  content.id = Date.now();
  content.createdAt = new Date();
  contents.push(content);
  saveContents(contents);
  return content;
}

function getContents() {
  return loadContents().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

function deleteContent(contentId, userId) {
  let contents = loadContents();
  const initialLength = contents.length;
  contents = contents.filter((c) => c.id != contentId || c.author != userId);
  if (contents.length === initialLength) {
    return false;
  }
  saveContents(contents);
  return true;
}

module.exports = {
  addContent,
  getContents,
  deleteContent,
};
