import pool from './db.js';

export async function getUsers() {
  const { rows } = await pool.query('SELECT id, email, password_hash AS "passwordHash", groups FROM users');
  return rows;
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash AS "passwordHash", groups FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

export async function addUser(email, passwordHash, groups = []) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, groups) VALUES ($1, $2, $3) RETURNING id',
    [email, passwordHash, groups]
  );
  return rows[0].id;
}

export async function getGroups() {
  const { rows } = await pool.query('SELECT name FROM groups');
  return rows.map(r => r.name);
}

export async function addGroup(name) {
  await pool.query('INSERT INTO groups (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
}

export async function createSession(userId, token) {
  await pool.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [token, userId]);
}

export async function getSession(token) {
  const { rows } = await pool.query('SELECT user_id FROM sessions WHERE token = $1', [token]);
  return rows[0] ? rows[0].user_id : null;
}

export async function deleteSession(token) {
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
}

export async function createResetToken(email, token) {
  await pool.query('INSERT INTO reset_tokens (token, email) VALUES ($1, $2)', [token, email]);
}

export async function getEmailByResetToken(token) {
  const { rows } = await pool.query('SELECT email FROM reset_tokens WHERE token = $1', [token]);
  return rows[0] ? rows[0].email : null;
}

export async function deleteResetToken(token) {
  await pool.query('DELETE FROM reset_tokens WHERE token = $1', [token]);
}

export async function updateUserPassword(email, passwordHash) {
  await pool.query('UPDATE users SET password_hash = $2 WHERE email = $1', [email, passwordHash]);
}
