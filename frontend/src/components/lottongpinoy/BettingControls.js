import axios from 'axios';
import betService from '../../core/betService';

export default async function BettingControls(root) {
    const bettingContainer = document.createElement('div');
    bettingContainer.className = 'bet-container';

    bettingContainer.innerHTML = `
        <div class="number-selection">
        </div>
        <div class="buttons">
            <button class="reset-btn">RESET</button>
            <button class="bet-btn">ENTER BET</button>
        </div>
        <div class="winners-and-bets">
            <div class="last-winner">
                <p>🏆 Last Draw Winner 🏆</p>
                <div class="winner-name"></div>
            </div>
            <div class="all-bets">
                <p>🎲 All Bets 🎲</p>
                <div class="bet-details"></div>
            </div>
        </div>
    `;

    try {
        const winnerResponse = await axios.get('http://localhost:3000/v1/winners/last', {
            headers: {
                'apikey': '{public_key}',
                'token': sessionStorage.getItem('token'),
                'content-type': 'application/json'
            }
        });

        const winner = winnerResponse.data.data;
        const winnerNameContainer = bettingContainer.querySelector('.winner-name');
        winnerNameContainer.innerHTML = `<p>👑 ${winner.username} 👑</p>`;
    } catch (error) {
        console.error('Error fetching last draw winner:', error);
        const winnerNameContainer = bettingContainer.querySelector('.winner-name');
        winnerNameContainer.innerHTML = `<p>No winner yet</p>`;
    }

    root.appendChild(bettingContainer);

    const numberSelection = bettingContainer.querySelector('.number-selection');

    let selectedNumbers = [];
    const MAX_SELECTIONS = 6;

    const selectionDisplay = document.createElement('div');
    selectionDisplay.className = 'selected-numbers';
    selectionDisplay.innerHTML = `
        <h3>Selected numbers:</h3>
        <div class="number-display"></div>
    `;
    numberSelection.appendChild(selectionDisplay);

    const numberButtons = document.createElement('div');
    numberButtons.className = 'number-buttons';
    numberSelection.appendChild(numberButtons);

    function getBallStyle(index) {
        switch (index) {
            case 1:
                return 'background: linear-gradient(to bottom, #ff4d4d, #b30000);'; 
            case 2:
                return 'background: linear-gradient(to bottom, #4d79ff, #0033cc);'; 
            case 3:
                return 'background: linear-gradient(to bottom, #4dff4d, #009900);'; 
            case 4:
                return 'background: linear-gradient(to bottom, #b84dff, #6600cc);'; 
            case 5:
                return 'background: linear-gradient(to bottom, #ffff4d, #e6b800);'; 
            case 6:
                return 'background: linear-gradient(to bottom, #ff944d, #cc5200);'; 
            default:
                return '';
        }
    }

    function updateSelectionDisplay() {
        const displayDiv = selectionDisplay.querySelector('.number-display');
        displayDiv.innerHTML = '';
        
        if (selectedNumbers.length === 0) {
            displayDiv.innerHTML = '<p>No number has been selected yet.</p>';
            return;
        }

        const sortedNumbers = [...selectedNumbers].sort((a, b) => a - b);

        sortedNumbers.forEach((number, index) => {
            const ball = document.createElement('div');
            ball.className = 'number-ball';
            ball.setAttribute('style', getBallStyle(index + 1));
            ball.textContent = number;

            ball.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3), inset 0 -5px 15px rgba(0,0,0,0.4)';
            
            ball.onclick = () => {
                selectedNumbers = selectedNumbers.filter(num => num !== number);
                updateSelectionDisplay();
                updateButtonStates();
            };
            displayDiv.appendChild(ball);
        });
    }

    function updateButtonStates() {

        document.querySelectorAll('.number-btn').forEach(btn => {
            const number = parseInt(btn.textContent, 10);
            if (selectedNumbers.includes(number)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');

                if (selectedNumbers.length >= MAX_SELECTIONS) {
                    btn.classList.add('disabled');
                } else {
                    btn.classList.remove('disabled');
                }
            }
        });

        const betBtn = bettingContainer.querySelector('.bet-btn');
        if (selectedNumbers.length === MAX_SELECTIONS) {
            betBtn.removeAttribute('disabled');
        } else {
            betBtn.setAttribute('disabled', 'true');
        }
    }

    for (let num = 1; num <= 49; num++) {
        const numButton = document.createElement('button');
        numButton.className = 'number-btn';
        numButton.textContent = num;
        
        numButton.addEventListener('click', () => {
            if (selectedNumbers.includes(num)) {
                selectedNumbers = selectedNumbers.filter(n => n !== num);
            } 
            else if (selectedNumbers.length < MAX_SELECTIONS) {
                selectedNumbers.push(num);
            }
            
            updateSelectionDisplay();
            updateButtonStates();
        });
        
        numberButtons.appendChild(numButton);
    }

    updateSelectionDisplay();
    updateButtonStates();

    const resetBtn = bettingContainer.querySelector('.reset-btn');
    const betBtn = bettingContainer.querySelector('.bet-btn');

    betBtn.setAttribute('disabled', 'true');

    resetBtn.addEventListener('click', () => {
        selectedNumbers = [];
        updateSelectionDisplay();
        updateButtonStates();
    });

    betBtn.addEventListener('click', async () => {
        if (selectedNumbers.length !== MAX_SELECTIONS) {
            alert(`Please select exactly ${MAX_SELECTIONS} numbers.`);
            return;
        }

        const user_id = sessionStorage.getItem('user_id');

        try {
            const response = await axios.post('http://localhost:3000/v1/bets', {
                bet_numbers: selectedNumbers.join(',')
            }, {
                headers: {
                    'apikey': '{public_key}',
                    'token': sessionStorage.getItem('token'),
                    'content-type': 'application/json'
                },
                params: {
                    user_id
                }
            });

            console.log('Bet submitted successfully:', response.data);
            alert('Bet submitted successfully!');

            await axios.patch('http://localhost:3000/v1/vwallet', { balance: -20 }, {
                headers: {
                    'apikey': '{public_key}',
                    'token': sessionStorage.getItem('token'),
                    'content-type': 'application/json'
                },
                params: {
                    user_id
                }
            });

            alert('₱20 has been deducted from your balance.');
            
            await betService.getBetCount().then(count => {
                betService.lastBetCount = count;
            });

            selectedNumbers = [];
            updateSelectionDisplay();
            updateButtonStates();
            
            window.location.href = '/lottongpinoy';
        } catch (error) {
            console.error('Error submitting bet or updating balance:', error);
            alert('Error submitting bet or updating balance. Please try again.');
        }
    });

    try {
        const winnerResponse = await axios.get('http://localhost:3000/v1/winners/last', {
            headers: {
                'apikey': '{public_key}',
                'token': sessionStorage.getItem('token'),
                'content-type': 'application/json'
            }
        });

        const winner = winnerResponse.data.data;
        const winnerNameContainer = bettingContainer.querySelector('.winner-name');
        winnerNameContainer.innerHTML = `<p>${winner.username}</p>`;
    } catch (error) {
        console.error('Error fetching last draw winner:', error);
    }

    try {
        const betsResponse = await axios.get('http://localhost:3000/v1/bets', {
            headers: {
                'apikey': '{public_key}',
                'token': sessionStorage.getItem('token'),
                'content-type': 'application/json'
            }
        });

        const bets = betsResponse.data.data;
        const betDetailsContainer = bettingContainer.querySelector('.bet-details');
        bets.forEach(bet => {
            const betElement = document.createElement('p');
            betElement.textContent = `${bet.username}: ${bet.bet_numbers}`;
            betDetailsContainer.appendChild(betElement);
        });
    } catch (error) {
        console.error('Error fetching all bets:', error);
    }

    const style = document.createElement('style');
    style.textContent = `
        .bet-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
            background-color: rgba(106, 13, 173, 0.1);
            border-radius: 15px;
        }
        
        .number-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 15px auto;
            justify-content: center;
            background-color: transparent; /* Fully transparent background */
            border: 2px solid gold; /* Gold border */
            border-radius: 10px; /* Smooth rounded corners */
            padding: 20px; /* Spacing inside the box */
            box-shadow: 0 0 10px gold, 0 0 20px rgba(255, 215, 0, 0.8); /* Glowing effect */            max-width: 650px;
        }
        
        .number-btn {
            width: 90px;
            height: 50px;
            border-radius: 50px;
            background: linear-gradient(to bottom, #ffed00, #ffc800);
            border: 3px solid white;
            color: #000;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 6px 10px rgba(0,0,0,0.2),
                inset 0 -4px 5px rgba(0,0,0,0.1),
                inset 0 2px 5px rgba(255,255,255,0.5);
            text-shadow: 0 1px 1px rgba(255,255,255,0.7);
            font-size: 18px;
            position: relative;
            overflow: hidden;
            margin: 2px;
        }
        
        .number-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 60%;
            background: linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0));
            border-radius: 50px 50px 0 0;
            pointer-events: none;
        }
        
        .number-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 
                0 10px 15px rgba(0,0,0,0.25),
                inset 0 -4px 5px rgba(0,0,0,0.1),
                inset 0 2px 5px rgba(255,255,255,0.5);
            background: linear-gradient(to bottom, #ffee20, #ffd420);
        }
        
        .number-btn:active {
            transform: translateY(2px);
            box-shadow: 
                0 2px 5px rgba(0,0,0,0.2),
                inset 0 -2px 3px rgba(0,0,0,0.1),
                inset 0 2px 3px rgba(255,255,255,0.5);
            background: linear-gradient(to bottom, #ffd000, #ffbf00);
        }
        
        .number-btn.selected {
            background: linear-gradient(to bottom, #4CAF50, #2E7D32);
            color: white;
            box-shadow: 
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 -3px 4px rgba(0,0,0,0.2),
                inset 0 2px 4px rgba(255,255,255,0.2);
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        
        .number-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: 
                0 2px 5px rgba(0,0,0,0.1),
                inset 0 -2px 3px rgba(0,0,0,0.05),
                inset 0 2px 3px rgba(255,255,255,0.2);
        }
        
        .selected-numbers {
            margin: 15px 0;
            padding: 15px;
            background-color: transparent; /* Fully transparent background */
            border: 2px solid gold; /* Gold border */
            border-radius: 10px; /* Smooth rounded corners */
            padding: 20px; /* Spacing inside the box */
            box-shadow: 0 0 10px gold, 0 0 20px rgba(255, 215, 0, 0.8); /* Glowing effect */
            color: white;
        }
        
        .selected-numbers h3 {
            margin-top: 0;
            text-align: center;
            color: white;
            font-size: 1.2rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .number-display {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            min-height: 60px;
            align-items: center;
            justify-content: center;
        }
        
        .number-display p {
            width: 100%;
            text-align: center;
            font-weight: bolder;s
            color: rgba(255,255,255,0.8);
        }
        
        .number-ball {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 3px solid white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }
        
        .number-ball::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 50%;
            background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
            border-radius: 50% 50% 0 0;
            pointer-events: none;
        }
        
        .number-ball:hover {
            transform: scale(1.1);
            filter: brightness(1.1);
        }
        
        .buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
        }
        
        .reset-btn, .bet-btn {
            padding: 12px 25px;
            font-size: 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
            text-transform: uppercase;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .reset-btn {
            background: linear-gradient(to bottom, #f44336, #d32f2f);
            color: white;
            box-shadow: 
                0 4px 8px rgba(0,0,0,0.2),
                inset 0 -3px 5px rgba(0,0,0,0.1),
                inset 0 2px 5px rgba(255,255,255,0.1);
        }
        
        .bet-btn {
            background: linear-gradient(to bottom, #4CAF50, #2E7D32);
            color: white;
            box-shadow: 
                0 4px 8px rgba(0,0,0,0.2),
                inset 0 -3px 5px rgba(0,0,0,0.1),
                inset 0 2px 5px rgba(255,255,255,0.1);
        }
        
        .reset-btn:hover, .bet-btn:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 6px 12px rgba(0,0,0,0.25),
                inset 0 -3px 5px rgba(0,0,0,0.1),
                inset 0 2px 5px rgba(255,255,255,0.1);
        }
        
        .reset-btn:active, .bet-btn:active {
            transform: translateY(1px);
            box-shadow: 
                0 2px 5px rgba(0,0,0,0.2),
                inset 0 -2px 3px rgba(0,0,0,0.1),
                inset 0 2px 3px rgba(255,255,255,0.1);
        }
        
        .bet-btn[disabled] {
            background: linear-gradient(to bottom, #cccccc, #aaaaaa);
            cursor: not-allowed;
            transform: none;
            box-shadow: 
                0 2px 4px rgba(0,0,0,0.1),
                inset 0 -2px 3px rgba(0,0,0,0.05),
                inset 0 2px 3px rgba(255,255,255,0.1);
        }
        
        .winners-and-bets {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
        }
        
        .last-winner, .all-bets {
            flex: 1;
            min-width: 250px;
            padding: 15px;
            border-radius: 10px;
            background-color: #f9f9f9;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        
        .last-winner p, .all-bets p {
            margin-top: 0;
            text-align: center;
            font-weight: bold;
            color: #333;
        }
        
        .winner-name, .bet-details {
            margin-top: 10px;
        }
        
        /* Responsive styles for different screen sizes */
        @media (max-width: 768px) {
            .number-buttons {
                gap: 10px;
                padding: 15px;
            }
            
            .number-btn {
                width: 70px;
                height: 40px;
                font-size: 16px;
            }
            
            .number-ball {
                width: 40px;
                height: 40px;
            }
            
            .buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .reset-btn, .bet-btn {
                width: 80%;
                margin: 5px 0;
            }
        }
        
        @media (max-width: 480px) {
            .number-buttons {
                gap: 8px;
                padding: 10px;
            }
            
            .number-btn {
                width: 56px;
                height: 36px;
                font-size: 15px;
                margin: 1px;
            }
            
            .number-ball {
                width: 35px;
                height: 35px;
                font-size: 1rem;
            }
            
            .selected-numbers {
                padding: 10px;
            }
            
            .selected-numbers h3 {
                font-size: 1rem;
            }
            
            .winners-and-bets {
                flex-direction: column;
                gap: 15px;
            }
            
            .last-winner, .all-bets {
                min-width: unset;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}
