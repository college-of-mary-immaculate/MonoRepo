import Navigation from '../components/navigation';
import Layout from '../layouts/default';
import Profile from '../components/profile/Profile';
import '../styles/profile.css';

export default function ProfilePage() {
    const { navigation, main } = Layout(this.root);

    Navigation(navigation);
    Profile(main);

    return () => {};
}
