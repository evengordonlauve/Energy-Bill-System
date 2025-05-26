import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data.json');

function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    return { users: [], groups: [], sessions: {} };
  }
  const text = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(text);
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export function getUsers() {
  return readData().users;
}

export function findUserByEmail(email) {
  const data = readData();
  return data.users.find(u => u.email === email) || null;
}

export function addUser(email, passwordHash, groups = []) {
  const data = readData();
  const id = data.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  data.users.push({ id, email, passwordHash, groups });
  writeData(data);
  return id;
}

export function getGroups() {
  return readData().groups;
}

export function addGroup(name) {
  const data = readData();
  if (!data.groups.includes(name)) {
    data.groups.push(name);
    writeData(data);
  }
}

export function createSession(userId, token) {
  const data = readData();
  data.sessions[token] = userId;
  writeData(data);
}

export function getSession(token) {
  const data = readData();
  return data.sessions[token] || null;
}

export function deleteSession(token) {
  const data = readData();
  delete data.sessions[token];
  writeData(data);
}
