/**
 * Middleware to check if the request is coming from the main server (Server 1)
 * or an authorized server using the server token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default function serverCheck(req, res, next) {

  const SERVER_TOKEN = 'server-token-for-authentication';
  if (req.headers.token === SERVER_TOKEN) {
    return next();
  }

  const port = process.env.PORT || 3000;
  
  if (parseInt(port) !== 3000) {
    return res.status(400).json({
      success: false,
      message: 'Requests must go through Server 1'
    });
  }
  
  next();
} 