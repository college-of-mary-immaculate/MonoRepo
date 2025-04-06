import { Router } from 'express';
import homeRouter from './homeRoutes.js';
import accountRouter from './accountRoutes.js';
import winnersRouter from './winnersRoutes.js';
import vwalletRoutes from './vwalletRoutes.js';
import betsRouter from './betsRoutes.js'; 

const v1 = new Router();

v1.use('/account', accountRouter);
v1.use('/winners', winnersRouter);
v1.use('/', homeRouter);
v1.use('/vwallet', vwalletRoutes);
v1.use('/bets', betsRouter); 

export default v1;
