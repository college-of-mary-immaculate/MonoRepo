import { slaveDb, masterDb } from '../core/database.js';

class VWallet {
  constructor() {
    this.master = masterDb;
    this.slave = slaveDb;
  }

  async create(userId, balance) {

    try {
      const [results] = await this.master.execute(
        'INSERT INTO vwallet(user_id, balance) VALUES (?, ?)',
        [userId, balance]

      );

      return results;
    } catch (err) {
      console.error('<error> vwallet.create', err);
      throw err;
    }
  }

  async getByUserId(userId) {
    try {
      const [results] = await this.slave.execute(
        'SELECT * FROM vwallet WHERE user_id = ?',
        [userId]
      );

      return results?.[0];
    } catch (err) {
      console.error('<error> vwallet.getByUserId', err);
      throw err;
    }
  }

  async updateBalance(userId, amount) {
    try {
      const [results] = await this.master.execute(
        'UPDATE vwallet SET balance = balance + ? WHERE user_id = ?',
        [amount, userId]
      );

      return results;
    } catch (err) {
      console.error('<error> vwallet.updateBalance', err);
      throw err;
    }
  }
}

export default VWallet;
