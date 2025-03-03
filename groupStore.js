
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "groups.json");

// Funzione per caricare i gruppi dal file
function loadGroups() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath);
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Errore nel parsing di groups.json:", err);
    return [];
  }
}

// Funzione per salvare i gruppi su file
function saveGroups(groups) {
  fs.writeFileSync(filePath, JSON.stringify(groups, null, 2));
}

let groups = loadGroups();
let nextGroupId = Math.max(...groups.map(g => g.id || 0), 0) + 1;

function groupExists(name) {
  return groups.some((g) => g.name.toLowerCase() === name.toLowerCase());
}

function addGroup(group) {
  if (groupExists(group.name)) {
    return null;
  }
  const newGroup = {
    ...group,
    id: nextGroupId++,
    members: [],
    questions: [],
    content: [],
  };
  groups.push(newGroup);
  saveGroups(groups);
  return newGroup;
}

function getGroupsForUser(user) {
  groups = loadGroups(); // Ricarica i gruppi dal file
  if (user.role === "Tutor") {
    return groups.filter((group) => group.tutor === user.id);
  } else {
    return groups;
  }
}

function joinGroup(groupId, userId) {
  const group = groups.find((g) => g.id == groupId);
  if (group) {
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      saveGroups(groups);
    }
    return group;
  }
  return null;
}

function deleteGroup(groupId, userId) {
  const index = groups.findIndex((g) => g.id == groupId && g.tutor == userId);
  if (index !== -1) {
    groups.splice(index, 1);
    saveGroups(groups);
    return true;
  }
  return false;
}

function findGroupById(groupId) {
  groups = loadGroups(); // Ricarica i gruppi dal file
  return groups.find((g) => g.id == groupId);
}

function addQuestion(groupId, question) {
  const group = groups.find((g) => g.id == groupId);
  if (group) {
    const newQuestion = {
      id: group.questions.length + 1,
      author: question.author,
      text: question.text,
      isPublic: question.isPublic,
      createdAt: new Date(),
      answers: [],
    };
    group.questions.push(newQuestion);
    saveGroups(groups);
    return newQuestion;
  }
  return null;
}

function addAnswer(groupId, questionId, answer) {
  const group = groups.find((g) => g.id == groupId);
  if (group) {
    const question = group.questions.find((q) => q.id == questionId);
    if (question) {
      const newAnswer = {
        id: question.answers.length + 1,
        author: answer.author,
        text: answer.text,
        createdAt: new Date(),
      };
      question.answers.push(newAnswer);
      saveGroups(groups);
      return newAnswer;
    }
  }
  return null;
}

function addContent(groupId, content) {
  const group = groups.find((g) => g.id == groupId);
  if (group) {
    const newContent = {
      id: group.content.length + 1,
      title: content.title,
      body: content.body,
      createdAt: new Date(),
      author: content.author,
    };
    group.content.push(newContent);
    saveGroups(groups);
    return newContent;
  }
  return null;
}

function deleteContent(groupId, contentId, userId) {
  const group = groups.find((g) => g.id == groupId);
  if (group) {
    const index = group.content.findIndex(
      (c) => c.id == contentId && c.author.id === userId,
    );
    if (index !== -1) {
      group.content.splice(index, 1);
      saveGroups(groups);
      return true;
    }
  }
  return false;
}

function removeMember(groupId, userId) {
  const group = groups.find((g) => g.id == groupId);
  if (group) {
    group.members = group.members.filter((id) => id !== userId);
    saveGroups(groups);
    return group;
  }
  return null;
}

module.exports = {
  addGroup,
  getGroupsForUser,
  joinGroup,
  deleteGroup,
  findGroupById,
  addQuestion,
  addAnswer,
  addContent,
  deleteContent,
  removeMember,
};
