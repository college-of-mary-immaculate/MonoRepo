import Winners from '../../models/winners.js';

class WinnersController {
  constructor() {
    this.user = new Winners();
  }

  async getWinners(req, res) {
    try {
      const winners = await this.user.getWinnersWithUsernames();

      res.json({
        success: true,
        data: winners,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  async getLastWinner(req, res) {
    try {
      const winner = await this.user.getLastWinnerUsername();

      res.json({
        success: true,
        data: winner,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  async getWinnerByUserId(req, res) {
    const user_id = req.query.user_id || req.user?.id;
    if (!user_id) {
      return res.json({
        success: false,
        message: 'user_id is required.',
      });
    }

    try {
      const winners = await this.user.getWinnersByUserId(user_id);
      res.json({
        success: true,
        data: winners,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  async addWinner(req, res) {
    const { winning_combination, prize } = req.body || {};
    const user_id = req.query.user_id;

    if (!winning_combination || !prize) {
      return res.json({
        success: false,
        message: 'winning_combination and prize are required.',
      });
    }

    try {
      const response = await this.user.addWinner(user_id, winning_combination, prize);
      res.json({
        success: true,
        data: {
          recordIndex: response?.insertId
        },
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  // Method for direct use in game logic
  async addGameWinner(user_id, winning_combination, prize) {
    try {
      return await this.user.addWinner(user_id, winning_combination, prize);
    } catch (error) {
      console.error('Error adding game winner:', error);
      throw error;
    }
  }
}

export default WinnersController;
