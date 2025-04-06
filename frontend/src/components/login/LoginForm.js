import axios from 'axios';

export default function LoginForm(root) {
    const form = document.createElement('div');
    form.className = 'container';
    form.id = 'container';
    form.innerHTML = `
        <div class="form-container sign-in-container">
            <form action="#">
                <img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1740983456/LO-removebg-preview_t4phmb.png" alt="Lotto Pinoy Logo" class="small-logo">
                <h2>Welcome to Lottong Pinoy</h2>
                <input type="text" placeholder="Username" required />
                <input type="password" placeholder="Password" required />
                <a href="#">Forgot password?</a>
                <button class="sign-in">Sign In</button>
                <p class="mobile-signup">Don't have an account? <a href="/register" id="mobileSignUp">Sign Up Now!</a></p>
            </form>
        </div>
        <div class="overlay-container">
            <div class="overlay">
                <div class="overlay-panel overlay-right">
                    <h2>Don't have an account? Please Sign Up!</h2>
                    <img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1740983456/LO-removebg-preview_t4phmb.png" alt="Lotto Pinoy Logo" class="logo">
                    <button class="overlay-sign-up" id="signUp">Sign Up</button>
                </div>
            </div>
        </div>
    `;

    form.querySelector('.sign-in').addEventListener('click', async (event) => {
        event.preventDefault();
        const username = form.querySelector('input[type="text"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            const response = await axios.post('http://localhost:3000/v1/account/login', {
                username,
                password
            }, {
                headers: {
                    'apikey': '{public_key}',
                    'content-type': 'application/json'
                }
            });
            sessionStorage.setItem('token', response.data.data.token);
            window.location.href = '/lottongpinoy';
        } catch (error) {
            console.error('Login failed:', error);
        }
    });

    form.querySelector('#signUp').addEventListener('click', () => {
        document.getElementById('container').classList.add('right-panel-active');
        setTimeout(() => {
            window.location.href = '/register';
        }, 360);
    });

    root.appendChild(form);
}
