import { Router } from 'express';
import WinnersController from '../../controllers/v1/winnersController.js';
import authorization from '../../middlewares/authorization.js';
import authentication from '../../middlewares/authentication.js';

const winnersRouter = new Router();
const winners = new WinnersController();

winnersRouter.use(authorization);
winnersRouter.use(authentication);

winnersRouter.get('/user', winners.getWinnerByUserId.bind(winners));
winnersRouter.get('/', winners.getWinners.bind(winners));
winnersRouter.get('/last', winners.getLastWinner.bind(winners));
winnersRouter.post('/', winners.addWinner.bind(winners));

export default winnersRouter;
