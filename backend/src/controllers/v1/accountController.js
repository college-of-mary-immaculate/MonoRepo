import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

class AccountController {
  constructor() {
    this.user = new User();
  }

  async create(req, res) {
    const { username, password, email } = req.body || {};
    
    if (!username || !password || !email) {
        return res.json({
            success: false,
            message: 'All fields (username, password, email) are required.',

        });
    }

    try {
      const existingUser = await this.user.findByUsernameOrEmail(username, email);
      if (existingUser) {
        return res.json({
          success: false,
          message: 'Username or email already exists',
        });
      }

      const response = await this.user.create(username, password, email);


      res.json({
        success: true,
        data: {
          recordIndex: response?.insertId
        },
      });
      res.end();
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
      res.end();
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body || {};

      const result = await this.user.verify(username, password);

      if (!result?.id) {
        return res.json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      res.json({
        success: true,
        data: {
          token: jwt.sign({ id: result.id, username: username }, process.env.API_SECRET_KEY, {
            expiresIn: '1d',
          }),
        }
      });
      res.end();
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
      res.end();
    }
  }

  async getAccount(req, res) {
    try {
      const userInfo = await this.user.get(res.locals.username);

      res.json({
        success: true,
        data: {
          username: res.locals.username,
          email: userInfo.email
        }
      });
      res.end();
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }

  async updateAccount(req, res) {
    try {
      const { email, password } = req.body || {};
      const updates = {};
      if (email) updates.email = email;
      if (password) updates.password = password;


      const result = await this.user.update(res.locals.username, updates);

      res.json({
        success: true,
        message: 'Account updated successfully',
      });
      res.end();
    } catch (err) {
      res.json({
        success: false,
        message: err.toString(),
      });
    }
  }
}

export default AccountController;
