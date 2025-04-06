import Bets from '../../models/bets.js';

class BetsController {
  constructor() {
    this.bets = new Bets();
  }

  async getBets(req, res) {
    try {
      const bets = await this.bets.getAllBetsWithUsernames();

      res.json({
        success: true,
        data: bets,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  async addBet(req, res) {
    const { bet_numbers } = req.body || {};
    const user_id = req.query.user_id || req.user?.id;

    if (!bet_numbers) {
      return res.json({
        success: false,
        message: 'bet_numbers are required.',
      });
    }

    try {
      const response = await this.bets.addBet(user_id, bet_numbers);
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

  async deleteBet(req, res) {
    try {
      await this.bets.deleteAllBets();
      res.json({
        success: true,
        message: 'All bets deleted successfully.',
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  async placeBet(req, res) {
    try {
      const bet = await this.bets.addBet(req.body.userId, req.body.betNumbers);
      return res.json({ success: true, bet });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllBetsWithUsernames() {
    return await this.bets.getAllBetsWithUsernames();
  }

  async getTotalBets() {
    return await this.bets.getTotalBets();
  }

  async deleteAllBets() {
    return await this.bets.deleteAllBets();
  }

  async compareBetsWithWinningNumbers(winningNumbers, winnersController) {
    try {
      const bets = await this.getAllBetsWithUsernames();
      let winnerFound = false;
      
      for (const bet of bets) {
        const betNumbers = bet.bet_numbers.split(',').map(Number);
        if (betNumbers.sort().toString() === winningNumbers.sort().toString()) {
          await winnersController.addGameWinner(bet.user_id, winningNumbers.join(','), global.jackpotPrize);
          winnerFound = true;
        }
      }
      
      return winnerFound;
    } catch (error) {
      console.error('Error comparing bets with winning numbers:', error);
      return false;
    }
  }
}

export default BetsController;
