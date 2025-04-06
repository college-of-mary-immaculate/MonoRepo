import { slaveDb, masterDb } from '../core/database.js';
import { encryptPassword } from '../utils/hash.js';
import VWallet from './vwallet.js';

class User {
  constructor() {
    this.master = masterDb;
    this.slave = slaveDb
    this.vwallet = new VWallet();
  }

  async findByUsernameOrEmail(username, email) {
    try {
      const [results] = await this.slave.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      return results?.[0];
    } catch (err) {
      console.error('<error> user.findByUsernameOrEmail', err);
      throw err;
    }
  }

  async create(username, password, email) {
    if (!username || !password || !email) {
      throw new Error('All fields (username, password, email) are required.');
    }

    try {
      const [results] = await this.master.execute(
        'INSERT INTO users(username, password, email) VALUES (?, ?, ?)',
        [username, encryptPassword(password), email]
      );
      const userId = results.insertId;
      await this.vwallet.create(userId, 100);
      return results;
    } catch (err) {
      console.error('<error> user.create', err);
      throw err;
    }
  }

  async verify(username, password) {
    if (!username || !password) {
      throw new Error('Both username and password are required.');
    }

    try {
      const [results] = await this.slave.execute(
        'SELECT id, username FROM users WHERE username = ? AND password = ?',
        [username, encryptPassword(password)]
      );

      if (results?.length === 0) {
        return { id: undefined };
      }

      return results?.[0];
    } catch (err) {
      console.error('<error> user.verify', err);
      throw err;
    }
  }

  async get(username) {
    try {
      const [results] = await this.slave.execute(
        'SELECT username, email FROM users WHERE username = ?',
        [username]
      );

      return results?.[0];
    } catch (err) {
      console.error('<error> user.getInformation', err);
      throw err;
    }
  }

  async update(username, updates) {
    const fields = Object.keys(updates).filter(field => updates[field] !== undefined).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates).filter(value => value !== undefined);

    console.log('Updating user:', username, 'with fields:', fields, 'and values:', values);

    if (fields.length === 0) {
      throw new Error('No valid fields to update.');
    }

    try {
      const [results] = await this.master.execute(
        `UPDATE users SET ${fields} WHERE username = ?`,
        [...values, username]
      );

      return results;
    } catch (err) {
      console.error('<error> user.update', err);
      throw err;
    }
  }
}

export default User;
