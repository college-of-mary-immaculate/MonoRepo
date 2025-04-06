import Home from './pages/home';
import RegisterForm from './components/register/RegisterForm';
import LoginForm from './components/login/LoginForm';
import PageNotFound from './pages/pageNotFound';
import SPA from './core/spa';
import LottongPinoyPage from './pages/lottongPinoyPage';
import ProfilePage from './pages/profilePage';

import './styles/common.css';
import './styles/welcome.css';
import './styles/logsignup.css';

/**
 * Create an instance of SPA
 */
document.addEventListener('DOMContentLoaded', () => {
    const spa = new SPA();
    let currentCleanup = null;

    spa.add('/', () => {
        const root = document.getElementById('app');
        root.innerHTML = '';

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        
        if (sessionStorage.getItem('token')) {
            currentCleanup = LottongPinoyPage.call({ root });
        } else {
            Home.call({ root });
        }
    });

    spa.add('/lottongpinoy', () => {
        const root = document.getElementById('app');
        root.innerHTML = '';

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        
        if (sessionStorage.getItem('token')) {
            currentCleanup = LottongPinoyPage.call({ root });
        } else {
            window.location.href = '/login';
        }
    });

    spa.add('/register', () => {
        const root = document.getElementById('app');
        root.innerHTML = '';

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        
        if (sessionStorage.getItem('token')) {
            window.location.href = '/lottongpinoy';
        } else {
            RegisterForm(root);
            document.getElementById('container').classList.add('right-panel-active');
        }
    });

    spa.add('/login', () => {
        const root = document.getElementById('app');
        root.innerHTML = '';

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        
        if (sessionStorage.getItem('token')) {
            window.location.href = '/lottongpinoy';
        } else {
            LoginForm(root);
        }
    });

    spa.add('/profile', () => {
        const root = document.getElementById('app');
        root.innerHTML = '';

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        
        if (sessionStorage.getItem('token')) {
            currentCleanup = ProfilePage.call({ root });
        } else {
            window.location.href = '/login';
        }
    });

    spa.add('*', () => {
        const root = document.getElementById('app');
        root.innerHTML = '';

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        
        PageNotFound(root);
    });

    window.addEventListener('beforeunload', () => {
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
    });

    spa.start();
});
