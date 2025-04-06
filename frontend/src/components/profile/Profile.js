import axios from 'axios';

export default async function Profile(root) {
    try {
        const response = await axios.get('http://localhost:3000/v1/account', {
            headers: {
                'accept': 'application/json',
                'apikey': '{public_key}',
                'token': sessionStorage.getItem('token'),
            }
        });
        const { username, email, id } = response.data.data;

        const walletResponse = await axios.get('http://localhost:3000/v1/vwallet', {
            headers: {
                'accept': 'application/json',
                'apikey': '{public_key}',
                'token': sessionStorage.getItem('token'),
            }
        });
        const { balance } = walletResponse.data.data;

        const winsResponse = await axios.get('http://localhost:3000/v1/winners/user', {
            headers: {
                'accept': 'application/json',
                'apikey': '{public_key}',
                'token': sessionStorage.getItem('token'),
            },
            params: {   
                user_id: id
            }
        });
        const winsData = winsResponse.data.data || [];
        const totalWins = winsData.reduce((sum, win) => sum + win.prize, 0);

        root.innerHTML = `
            <button class="back-button" onclick="window.location.href='/lottongpinoy'">
                &#8592;
            </button>    
            <h1 class="profile-title">PROFILE ACCOUNT</h1>

            <div class="profile-container">
                <div class="username-email">
                    <p class="username">${username}</p>
                    <p class="email"><span>${email}</span></p>
                </div>

                <div class="wallet-container">
                    <div class="wallet-box e-wallet">
                        <p>V-Wallet:</p>
                        <p class="amount">₱ ${balance.toFixed(2)}</p>
                    </div>

                    <div class="wallet-box total-wins">
                        <p>Total Wins:</p>
                        <p class="amount">₱ ${totalWins.toFixed(2)}</p>
                    </div>
                </div>

                <div class="wallet-buttons">
                    <button class="cash-in" onclick="openPopup('cash-in-popup')">CASH IN</button>
                    <button class="cash-out" onclick="openPopup('cash-out-popup')">CASH OUT</button>
                </div>

                <button class="logout-button" onclick="logout()">LOGOUT</button>
            </div>

            <!-- Cash In Popup -->
            <div id="cash-in-popup" class="popup-overlay">
                <div class="popup-content">
                    <div class="popup-header">
                        <h2>CASH IN</h2>
                        <span class="close-popup" onclick="closePopup('cash-in-popup')">&times;</span>
                    </div>
                    <div class="popup-body">
                        <div class="amount-input">
                            <label for="cash-in-amount">Amount (₱):</label>
                            <input type="number" id="cash-in-amount" min="50" placeholder="Enter amount">
                        </div>
                        <button class="confirm-button" onclick="processCashIn()">CONFIRM</button>
                    </div>
                </div>
            </div>

            <!-- Cash Out Popup -->
            <div id="cash-out-popup" class="popup-overlay">
                <div class="popup-content">
                    <div class="popup-header">
                        <h2>CASH OUT</h2>
                        <span class="close-popup" onclick="closePopup('cash-out-popup')">&times;</span>
                    </div>
                    <div class="popup-body">
                        <div class="amount-input">
                            <label for="cash-out-amount">Amount (₱):</label>
                            <input type="number" id="cash-out-amount" min="50" max="${balance}" placeholder="Enter amount">
                            <p class="available-balance">Available Balance: ₱${balance.toFixed(2)}</p>
                        </div>
                        <button class="confirm-button" onclick="processCashOut()">CONFIRM</button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

window.logout = function() {
    sessionStorage.removeItem('token');
    window.location.href = '/login';
}

window.openPopup = function(popupId) {
    document.getElementById(popupId).style.display = 'flex';
}

window.closePopup = function(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

window.processCashIn = async function() {
    const amount = document.getElementById('cash-in-amount').value;
    if (amount >= 50) {
        try {
            await axios.patch('http://localhost:3000/v1/vwallet', { balance: amount }, {
                headers: {
                    'accept': 'application/json',
                    'apikey': '{public_key}',
                    'token': sessionStorage.getItem('token'),
                }
            });
            alert(`Cash in of ₱${amount} is being processed!`);
            closePopup('cash-in-popup');
            location.reload();
        } catch (error) {
            console.error('Error processing cash in:', error);
        }
    } else {
        alert('Minimum cash in amount is ₱50');
    }
}

window.processCashOut = async function() {
    const amount = document.getElementById('cash-out-amount').value;
    const currentBalance = parseFloat(document.querySelector('.e-wallet .amount').textContent.replace('₱', '').trim());
    
    if (amount <= 0) {
        alert('Please enter a valid amount');
    } else if (amount > currentBalance) {
        alert('Insufficient balance');
    } else {
        try {
            await axios.patch('http://localhost:3000/v1/vwallet', { balance: -amount }, {
                headers: {
                    'accept': 'application/json',
                    'apikey': '{public_key}',
                    'token': sessionStorage.getItem('token'),
                }
            });
            alert(`Cash out of ₱${amount} is being processed!`);
            closePopup('cash-out-popup');
            location.reload();
        } catch (error) {
            console.error('Error processing cash out:', error);
        }
    }
}