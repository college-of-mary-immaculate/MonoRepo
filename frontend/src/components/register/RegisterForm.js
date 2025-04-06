import axios from 'axios';

export default function RegisterForm(root) {
    const form = document.createElement('div');
    form.className = 'container';
    form.id = 'container';
    form.innerHTML = `
        <div class="form-container sign-up-container">
            <form action="#">
            <img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1740983456/LO-removebg-preview_t4phmb.png" alt="Lotto Pinoy Logo" class="small-logo">
                <h2>Create Your Account</h2>
                <input type="text" placeholder="Username" required />
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <button class="sign-up">Sign Up</button>
                <p class="mobile-signin">Already had an account? <a href="/login" id="mobileSignIn">Sign In Now!</a></p>
            </form>
        </div>
        <div class="overlay-container">
            <div class="overlay">
                <div class="overlay-panel overlay-left">
                    <h2>If you already had an account, just Sign In.</h2>
                    <img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1740983456/LO-removebg-preview_t4phmb.png" alt="Lotto Pinoy Logo" class="logo">
                    <button class="overlay-sign-in" id="signIn">Sign In</button>
                </div>
            </div>
        </div>
    `;

    form.querySelector('.sign-up').addEventListener('click', async (event) => {
        event.preventDefault();
        const username = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            const response = await axios.post('http://localhost:3000/v1/account/register', {
                username,
                email,
                password
            }, {
                headers: {
                    'apikey': '{public_key}',
                    'content-type': 'application/json'
                }
            });
            console.log('Registration successful:', response.data);

            alert(`You have successfully created an account. Welcome, ${username}!`);

            const loginResponse = await axios.post('http://localhost:3000/v1/account/login', {
                username,
                password
            }, {
                headers: {
                    'apikey': '{public_key}',
                    'content-type': 'application/json'
                }
            });
            sessionStorage.setItem('token', loginResponse.data.data.token);
            window.location.href = '/lottongpinoy';
        } catch (error) {
            console.error('Error during registration or login:', error);
        }
    });

    form.querySelector('#signIn').addEventListener('click', () => {
        document.getElementById('container').classList.remove('right-panel-active');
        setTimeout(() => {
            window.location.href = '/login';
        }, 360);
    });

    root.appendChild(form);
}
