import sqlite3 from 'sqlite3';
import path from 'path';
import crypto from 'crypto';

// Path to our SQLite database file in the project root
const DB_PATH = path.resolve(process.cwd(), 'club.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
      } else {
        console.log('Connected to SQLite database at:', DB_PATH);
      }
    });
  }

  // Promise wrapper for db.all (fetch multiple rows)
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Promise wrapper for db.get (fetch single row)
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Promise wrapper for db.run (insert, update, delete)
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  // Close connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Singleton database instance
export const db = new Database();

/**
 * Hash a password using Node.js native pbkdf2
 * @param {string} password 
 * @returns {{hash: string, salt: string}}
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a password against a hash and salt
 * @param {string} password 
 * @param {string} hash 
 * @param {string} salt 
 * @returns {boolean}
 */
export function verifyPassword(password, hash, salt) {
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return testHash === hash;
}
