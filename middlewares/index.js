import readingTime from 'read-time';
import { isBlackListed, decodeToken } from '../utils';
import db from '../db/models';
/**
 * App Middleware.
 * middleware methods.
 */
class Middleware {
  /**
     * checks blacked listed tokens.
     * @param {request} req .
     * @param {response} res The second number.
     * @param {next} next The second number.
     * @returns {void} calls next on success.
     * @returns {errror} return error on failure to validate.
     */
  static async isblackListedToken(req, res, next) {
    const token = req.headers['x-access-token'];

    const isblocked = await isBlackListed(token);

    if (isblocked) {
      return res.status(403).send({
        message: 'unAuthorized',
      });
    }

    next();
  }

  /**
     * checks blacked listed tokens.
     * @param {request} req .
     * @param {response} res The second number.
     * @param {next} next The second number.
     * @returns {void} calls next on success.
     * @returns {errror} return error on failure to validate.
     */
  static async authenticate(req, res, next) {
    const token = req.headers['x-access-token'];

    try {
      const decodedToken = decodeToken(token);

      const { email } = decodedToken;

      const user = await db.User.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(401).send({
          message: 'Unauthorized',
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(400).send({
        message: error.message,
      });
    }
  }

  /**
     * checks blacked listed tokens.
     * @param {request} req .
     * @param {response} res The second number.
     * @param {next} next The second number.
     * @returns {void} calls next on success.
     */
  static async generateReadTime(req, res, next) {
    const { body } = req.body;
    if (body) {
      const { text } = await readingTime(body);
      req.body = { ...req.body, readTime: text };
    }
    next();
  }
}

export default Middleware;
