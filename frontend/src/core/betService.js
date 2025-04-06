import axios from 'axios';

/**
 * BetService - Serbisyo para sa pag-detect ng bagong bet at awtomatikong pag-reload ng page
 */
class BetService {
    constructor() {
        this.lastBetCount = 0;
        this.isMonitoring = false;
        this.intervalId = null;
        this.checkInterval = 5000;
    }

    /**
     * Pag-monitor ng bagong bet
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.getBetCount().then(count => {
            this.lastBetCount = count;
            
            this.intervalId = setInterval(() => {
                this.checkForNewBets();
            }, this.checkInterval);
        });

        console.log('Bet monitoring service started');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        clearInterval(this.intervalId);
        this.isMonitoring = false;
        console.log('Bet monitoring service stopped');
    }

    async getBetCount() {
        try {
            // Gamit ang existing API endpoint para makuha ang lahat ng bets
            const response = await axios.get('http://localhost:3000/v1/bets', {
                headers: {
                    'apikey': '{public_key}',
                    'token': sessionStorage.getItem('token'),
                    'content-type': 'application/json'
                }
            });

            return response.data.data.length;
        } catch (error) {
            console.error('Error fetching bet count:', error);
            return this.lastBetCount;
        }
    }

    async checkForNewBets() {
        const currentCount = await this.getBetCount();
        
        if (currentCount > this.lastBetCount) {
            console.log(`Detected new bet(s): ${currentCount - this.lastBetCount} new bet(s)`);
            this.lastBetCount = currentCount;

            window.location.reload();
        }
    }
}

// Singleton instance
const betService = new BetService();
export default betService; 