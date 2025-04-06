// export default function CountdownTimer(root) {
//     const countdownContainer = document.createElement('div');
//     countdownContainer.className = 'countdown-container';

//     countdownContainer.innerHTML = `
//         <div class="countdown-text" id="countdown">Next Draw in : 60s</div>
//     `;

//     root.appendChild(countdownContainer);

//     let countdown = 60; // 1-minute countdown

//     function updateCountdown() {
//         const countdownText = document.getElementById("countdown");
//         countdownText.textContent = `Next Draw: ${countdown}s`;

//         if (countdown === 0) {
//             countdownContainer.style.background = "radial-gradient(circle, #ff4d4d, #b30000)"; // Red when 0
//             setTimeout(() => {
//                 countdownContainer.style.background = "radial-gradient(circle, #57ff57, #00b300)"; // Back to green
//             }, 500); // Quickly revert to green after 500ms

//             generateWinningNumbers(); // Change winning numbers
//             countdown = 60; // Reset countdown
//         } else {
//             countdown--;
//         }
//     }

//     // Function to generate new winning numbers
//     function generateWinningNumbers() {
//         const numbersContainer = document.getElementById("winningNumbers");
//         numbersContainer.innerHTML = ""; // Clear previous numbers
//         let winningNumbers = new Set();

//         while (winningNumbers.size < 6) {
//             winningNumbers.add(Math.floor(Math.random() * 49) + 1);
//         }

//         winningNumbers.forEach(num => {
//             let numberBall = document.createElement("div");
//             numberBall.classList.add("number");
//             numberBall.textContent = num;
//             numbersContainer.appendChild(numberBall);
//         });
//     }

//     // Start the countdown and update every second
//     setInterval(updateCountdown, 1000);
// }
