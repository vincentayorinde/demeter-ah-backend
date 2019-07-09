/* eslint-disable require-jsdoc */
import { db } from '../server';


/**
 * App Middleware.
 * middleware methods.
 */
export class Response {
  /**
     * checks blacked listed tokens.
     * @param {e} e .
     * @returns {void} calls next on success.
     * @returns {errror} return error on failure to validate.
     */
  status() {
    return this;
  }

  /**
     * checks blacked listed tokens.
     * @param {e} e .
     * @returns {e} calls next on success.
     * @returns {errror} return error on failure to validate.
     */

  send(e) {
    return e;
  }
}

export const createUser = async (user) => {
  const {
    firstName, lastName, username, email, password
  } = user;

  const newUser = await db.User.create({
    firstName,
    lastName,
    username,
    email,
    password,
  });

  return newUser;
};

export const createArticle = async article => db.Article.create(article);
