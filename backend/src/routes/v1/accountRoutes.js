import { Router } from 'express';
import AccountController from '../../controllers/v1/accountController.js';
import authorization from '../../middlewares/authorization.js';
import authentication from '../../middlewares/authentication.js';

const accountRouter = new Router();
const account = new AccountController();

accountRouter.use(authorization);

accountRouter.post('/register', account.create.bind(account));
accountRouter.post('/login', account.login.bind(account));
accountRouter.post('/', account.create.bind(account));
accountRouter.get('/', authentication, account.getAccount.bind(account));
accountRouter.patch('/', authentication, account.updateAccount.bind(account));



export default accountRouter;
