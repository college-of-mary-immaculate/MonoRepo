import { slaveDb, masterDb } from '../core/database.js';

class Winners {
  constructor() {
    this.master = masterDb;
    this.slave = slaveDb;
  }

  async getWinners() {
    const query = 'SELECT * FROM winners';
    const [results] = await this.slave.execute(query);
    return results;
  }

  async getWinnersWithUsernames() {
    const query = `
      SELECT winners.*, users.username 
      FROM winners 
      JOIN users ON winners.user_id = users.id
    `;
    const [results] = await this.slave.execute(query);
    return results;
  }

  async getLastWinnerUsername() {
    const query = `
      SELECT users.username 
      FROM winners 
      JOIN users ON winners.user_id = users.id
      ORDER BY winners.win_date DESC
      LIMIT 1
    `;
    const [results] = await this.slave.execute(query);
    return results[0];
  }

  async getWinnersByUserId(user_id) {
    const query = 'SELECT * FROM winners WHERE user_id = ?';
    const [results] = await this.slave.execute(query, [user_id]);
    return results;
  }

  async addWinner(user_id, winning_combination, prize) {
    const query = 'INSERT INTO winners (winning_combination, prize' + (user_id ? ', user_id' : '') + ') VALUES (?, ?' + (user_id ? ', ?' : '') + ')'; 
    const values = [winning_combination, prize];
    if (user_id) values.push(user_id);
    const [result] = await this.master.execute(query, values);
    return result;
  }
}

export default Winners;
