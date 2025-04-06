import { Router } from 'express';
import VWalletController from '../../controllers/v1/vwalletController.js';
import authentication from '../../middlewares/authentication.js';
import authorization from '../../middlewares/authorization.js';

const vwalletRouter = new Router();
const vwallet = new VWalletController();

vwalletRouter.use(authorization);
vwalletRouter.use(authentication);

vwalletRouter.post('/', vwallet.createWallet.bind(vwallet));
vwalletRouter.get('/', vwallet.getWallet.bind(vwallet));
vwalletRouter.patch('/', vwallet.updateWallet.bind(vwallet));

export default vwalletRouter;
