import { slaveDb, masterDb } from '../core/database.js';

class Bets {
  constructor() {
    this.master = masterDb;
    this.slave = slaveDb;
  }

  async getBetsByUserId(user_id) {
    try {
      const [results] = await this.slave.execute(
        'SELECT * FROM bets WHERE user_id = ?',
        [user_id]
      );

      return results;
    } catch (err) {
      console.error('<error> bets.getBetsByUserId', err);
      throw err;
    }
  }

  async getAllBetsWithUsernames() {
    const query = `
      SELECT users.username, bets.bet_numbers 
      FROM bets 
      JOIN users ON bets.user_id = users.id
    `;
    const [results] = await this.slave.execute(query);
    return results;
  }

  async getTotalBets() {
    try {
      const [results] = await this.slave.execute(
        'SELECT COUNT(*) as totalBets FROM bets'
      );
      return results[0].totalBets;
    } catch (err) {
      console.error('<error> bets.getTotalBets', err);
      throw err;
    }
  }

  async addBet(user_id, bet_numbers) {
    try {
      const [results] = await this.master.execute(
        'INSERT INTO bets(user_id, bet_numbers) VALUES (?, ?)',
        [user_id, bet_numbers]
      );

      return results;
    } catch (err) {
      console.error('<error> bets.addBet', err);
      throw err;
    }
  }

  async deleteBet(id) {
    try {
      const [results] = await this.master.execute(
        'DELETE FROM bets WHERE id = ?',
        [id]
      );

      return results;
    } catch (err) {
      console.error('<error> bets.deleteBet', err);
      throw err;
    }
  }

  async deleteBetsByUserId(user_id) {
    try {
      const [results] = await this.master.execute(
        'DELETE FROM bets WHERE user_id = ?',
        [user_id]
      );

      return results;
    } catch (err) {
      console.error('<error> bets.deleteBetsByUserId', err);
      throw err;
    }
  }

  async deleteAllBets() {
    try {
      const [results] = await this.master.execute(
        'DELETE FROM bets'
      );

      return results;
    } catch (err) {
      console.error('<error> bets.deleteAllBets', err);
      throw err;
    }
  }
}

export default Bets;
