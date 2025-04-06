import { Router } from 'express';
import BetsController from '../../controllers/v1/betsController.js';
import authorization from '../../middlewares/authorization.js';
import authentication from '../../middlewares/authentication.js';
import serverCheck from '../../middlewares/serverCheck.js';

const betsRouter = new Router();
const bets = new BetsController();

betsRouter.use(authorization);
betsRouter.use(authentication);

betsRouter.get('/', bets.getBets.bind(bets));
betsRouter.post('/', bets.addBet.bind(bets));
betsRouter.delete('/', bets.deleteBet.bind(bets));
betsRouter.post('/place-bet', serverCheck, bets.placeBet.bind(bets));

export default betsRouter;
