const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "users.json");

async function readUsers() {
  const data = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(data);
}

async function saveUsers(users) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(users, null, 2) + "\n",
    "utf8"
  );
}

async function getUserByEmail(email) {
  const users = await readUsers();

  return users.find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );
}

async function addUser(userData) {
  const users = await readUsers();

  const newId = users.length
    ? Math.max(...users.map(user => Number(user.id))) + 1
    : 1;

  const newUser = {
    id: newId,
    username: userData.username.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password
  };

  users.push(newUser);

  await saveUsers(users);

  return newUser;
}

module.exports = {
  readUsers,
  getUserByEmail,
  addUser
};