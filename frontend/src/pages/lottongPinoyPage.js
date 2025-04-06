import Navigation from '../components/navigation';
import Layout from '../layouts/default';
import WinningCombination from '../components/lottongpinoy/WinningCombination';
import LottoNumbers from '../components/lottongpinoy/LottoNumbers';
import BettingControls from '../components/lottongpinoy/BettingControls';
import betService from '../core/betService';
import '../styles/lottongpinoy.css';

export default function LottongPinoyPage() {
    const { navigation, main } = Layout(this.root);

    Navigation(navigation);

    WinningCombination(main);
    LottoNumbers(main);
    BettingControls(main);

    // Simulan ang pag-monitor ng bagong bet
    betService.startMonitoring();

    // Clean up kapag umalis sa page
    return () => {
        betService.stopMonitoring();
    };
}
