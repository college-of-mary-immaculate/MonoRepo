import VWallet from '../../models/vwallet.js';

class VWalletController {
  constructor() {
    this.vwallet = new VWallet();
  }

  async getWallet(req, res) {
    const userId = req.query.user_id || req.user?.id || null; 

    try {
        const wallet = await this.vwallet.getByUserId(userId);
        if (!wallet) { 
            return res.json({
                success: false,
                message: 'No wallet found for this user.',
            });
        }
        res.json({
            success: true,
            data: {
                balance: wallet.balance, 
            },
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        });
    }
  }

async updateWallet(req, res) {
    const userId = req.query.user_id || req.user?.id || null; 

    const { balance } = req.body;
    try {
        
        const currentWallet = await this.vwallet.getByUserId(userId);
        if (!currentWallet) {
            return res.json({
                success: false,
                message: 'No wallet found for this user.',
            });
        }
        const previousBalance = currentWallet.balance;
        await this.vwallet.updateBalance(userId, balance);
        const updatedWallet = await this.vwallet.getByUserId(userId);
        const newBalance = updatedWallet.balance;

        res.json({
            success: true,
            message: 'Wallet balance updated successfully.',
            data: {
                previousBalance,
                newBalance,
            },
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        });
    }
}


  async createWallet(req, res) {
    const userId = req.query.userId || req.query.user_id || req.user?.id || null;
    const { balance } = req.body || {}; 
    if (!balance) { 
        return res.json({
            success: false,
            message: 'balance is required.',
        });
    }
    console.log('User ID:', userId); 

    try {
        const response = await this.vwallet.create(userId, balance);
        res.json({
            success: true,
            message: 'Wallet created successfully.',
            data: {
                recordIndex: response?.insertId
            },
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        });
    }
  }
}

export default VWalletController;
