import socketClient from '../../core/socket-client.js';
import '../../styles/winAnimation.css';

export default function WinningCombination(root) {
    const profileButton = document.createElement('button');
    profileButton.className = 'profile-button';
    profileButton.onclick = () => window.location.href = '/profile';
    profileButton.innerHTML = `<img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1741370228/user__2_-removebg-preview_mnocud.png" alt="Profile Icon">`;
    root.appendChild(profileButton);

    const logoButton = document.createElement('button');
    logoButton.className = 'logo-button';
    logoButton.innerHTML = `<img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1740983456/LO-removebg-preview_t4phmb.png" alt="Logo">`;
    root.appendChild(logoButton);

    const devPopup = document.createElement('div');
    devPopup.className = 'dev-popup';
    devPopup.innerHTML = `
        <div class="dev-popup-content">
            <div class="dev-popup-header">
                <h2>Developed By:</h2>
                <span class="close-popup">&times;</span>
            </div>
            <div class="dev-names">
                <div class="dev-name">Zeldrick Jesus Delos Santos</div>
                <div class="dev-name">Christian Joy Bedaña</div>
            </div>
        </div>
    `;
    root.appendChild(devPopup);

    logoButton.onclick = () => {
        devPopup.classList.add('show');
    };

    const closePopup = devPopup.querySelector('.close-popup');
    closePopup.onclick = () => {
        devPopup.classList.remove('show');
    };

    window.onclick = (event) => {
        if (event.target == devPopup) {
            devPopup.classList.remove('show');
        }
    };

    const jackpotContainer = document.createElement('div');
    jackpotContainer.className = 'jackpot-container';
    jackpotContainer.innerHTML = `
        <div class="jackpot-text">JACKPOT PRIZE:</div>
        <div class="jackpot-box" id="jackpotPrize">₱ 1500.00</div>
    `;
    root.appendChild(jackpotContainer);

    const winningContainer = document.createElement('div');
    winningContainer.className = 'winning-container';
    
    winningContainer.innerHTML = `
        <div class="winning-text">WINNING COMBINATIONS!</div>
        <div class="winning-numbers" id="winningNumbers"></div>
    `;
    root.appendChild(winningContainer);

    const countdownContainer = document.createElement('div');
    countdownContainer.className = 'countdown-container';
    countdownContainer.innerHTML = `
        <div class="countdown-text" id="countdown">Next Draw in: 60s</div>
    `;
    root.appendChild(countdownContainer);

    //---------------------------------Win Animation---------------------------------
    // const triggerWinButton = document.createElement('button');
    // triggerWinButton.className = 'trigger-win-btn';
    // triggerWinButton.textContent = 'TWA';
    // root.appendChild(triggerWinButton);
    //-------------------------------------------------------------------------------

    let previousNumbers = [];

    socketClient.on('countdown', (countdown) => {
        const countdownText = document.getElementById("countdown");
        countdownText.textContent = `Next Draw in: ${countdown}s`;

        if (countdown === 0) {
            previousNumbers = Array.from(document.querySelectorAll('.number')).map(ball => ball.textContent);
            
            const balls = document.querySelectorAll('.number');
            balls.forEach(ball => {
                ball.classList.add('flipping');
            });

            setTimeout(() => {
                balls.forEach(ball => {
                    ball.classList.remove('flipping');
                });
                socketClient.emit('animationComplete');
            }, 2000); 
        }
    });

    socketClient.on('winningNumbers', (numbers) => {
        const numbersContainer = document.getElementById("winningNumbers");
        
        if (numbersContainer.innerHTML === "" || previousNumbers.length === 0) {
            numbersContainer.innerHTML = "";
            numbers.forEach(num => {
                let numberBall = document.createElement("div");
                numberBall.classList.add("number");
                numberBall.textContent = num;
                numbersContainer.appendChild(numberBall);
            });
            previousNumbers = [...numbers];
        } 
        else {
            const numberBalls = numbersContainer.querySelectorAll('.number');
            if (numberBalls.length === numbers.length) {
                setTimeout(() => {
                    numberBalls.forEach((ball, index) => {
                        ball.textContent = numbers[index];
                    });
                }, 400); 
            }
        }
    });

    socketClient.on('jackpotPrize', (prize) => {
        const jackpotPrizeElement = document.getElementById("jackpotPrize");
        jackpotPrizeElement.textContent = `₱ ${prize.toFixed(2)}`;
    });

    socketClient.on('reloadPage', () => {
        window.location.href = '/lottongpinoy';
    });

    socketClient.on('noWinners', () => {
        alert('No winners this round.');
    });

    socketClient.on('haveWinners', (prize, winningNumbers) => {
        showWinAnimation(prize, winningNumbers);
    });

    //-------------------------------------------------------------------------------
    // triggerWinButton.addEventListener('click', () => {
    //     const prize = parseFloat(document.getElementById("jackpotPrize").textContent.replace('₱ ', ''));
    //     const winningNumbers = Array.from(document.querySelectorAll("#winningNumbers .number")).map(el => el.textContent);
    //     showWinAnimation(prize, winningNumbers);
    // });
    //-------------------------------------------------------------------------------

    function showWinAnimation(prize, winningNumbers) {
        const overlay = document.createElement('div');
        overlay.id = 'win-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '1000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        overlay.innerHTML = `
            <div class="winner-signboard">
                <div class="winner-title">CONGRATULATIONS!</div>
                <div>YOU WON</div>
                <div class="prize-amount">₱ ${prize.toFixed(2)}</div>
                <div>YOUR NUMBERS:</div>
                <div class="matching-numbers">
                    ${winningNumbers.map((num, index) => `<div class="number-ball" style="${getBallStyle(index + 1)}">${num}</div>`).join('')}
                </div>
                <button class="continue-btn">CONTINUE</button>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('.continue-btn').addEventListener('click', () => {
            overlay.remove();
        });

        createConfetti();
        createStars();
        createFireworks();
    }

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

    function createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
        const confettiCount = 200;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            const left = Math.random() * 100;
            const width = Math.random() * 12 + 5;
            const height = Math.random() * 12 + 5;
            const colorIndex = Math.floor(Math.random() * colors.length);
            const shape = Math.random() > 0.5 ? 'square' : 'rectangle';

            confetti.style.left = `${left}%`;
            confetti.style.width = `${width}px`;
            confetti.style.height = shape === 'square' ? `${width}px` : `${height}px`;
            confetti.style.backgroundColor = colors[colorIndex];
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.position = 'absolute';

            const duration = Math.random() * 3 + 2;
            const delay = Math.random();

            confetti.style.animation = `fall ${duration}s ease-in ${delay}s infinite`;
            confetti.style.top = '-20px';

            document.getElementById('win-overlay').appendChild(confetti);
        }
    }

    function createStars() {
        const starCount = 30;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            const size = Math.random() * 20 + 10;
            const left = Math.random() * 100;
            const top = Math.random() * 100;

            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            star.style.animationDuration = `${Math.random() * 3 + 2}s`;
            star.style.opacity = Math.random() * 0.7 + 0.3;
            star.style.position = 'absolute';

            document.getElementById('win-overlay').appendChild(star);
        }
    }

    function createFireworks() {
        const fireworkCount = 8;
        const colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ffa500'];

        for (let i = 0; i < fireworkCount; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';

                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const color = colors[Math.floor(Math.random() * colors.length)];

                firework.style.left = `${left}%`;
                firework.style.top = `${top}%`;
                firework.style.backgroundColor = color;
                firework.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
                firework.style.position = 'absolute';

                document.getElementById('win-overlay').appendChild(firework);

                firework.style.animation = 'explode 1s ease-out forwards';

                setTimeout(() => {
                    firework.remove();
                }, 1000);

            }, i * 500);
        }
    }
}