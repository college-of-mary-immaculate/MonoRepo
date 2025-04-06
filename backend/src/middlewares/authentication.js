import jwt from 'jsonwebtoken';

export default function authentication(req, res, next) {
  const token = req.headers.token;

  const SERVER_TOKEN = 'server-token-for-authentication';
  if (token === SERVER_TOKEN) {
    req.user = { id: 1, username: 'server', isServer: true };
    res.locals.username = 'server';
    return next();
  }

  if (!token) {
    res.json({
      'success': false,
      'message': 'Unauthenticated user',
    });
    return;
  }

  jwt.verify(token, process.env.API_SECRET_KEY, (err, decoded) => {
    if (err) {
      res.json({
        'success': false,
        'message': 'Invalid token',
      });
      return;
    }

    req.user = { id: decoded?.id, username: decoded?.username };
    res.locals.username = decoded?.username;
    next();
  });
}
