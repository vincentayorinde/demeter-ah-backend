/* eslint-disable require-jsdoc */
import readingTime from 'read-time';
import { db } from '../server';
import { createFakeUsers } from '../db/faker';


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
    firstName, lastName, username, email, password, image, role
  } = user;

  const newUser = await db.User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    role,
    image
  });

  return newUser;
};

export const createArticle = async article => db.Article.create({
  ...article,
  readTime: readingTime(article.body).text
});

export const createComment = async comment => db.Comment.create(comment);

export const voteComment = async voteDetails => db.CommentVote.create(voteDetails);

export const createRate = async rating => db.Ratings.create(rating);

export const createArticleVote = async vote => db.ArticleVote.create(vote);

export const createTestFakeUsers = async () => {
  const users = await createFakeUsers();
  users.forEach(async (user) => {
    await createUser(user);
  });
};
export const createTag = async tag => db.Tag.create(tag);

export const createArticleTag = async tag => db.ArticleTag.create(tag);

export const editComment = async editedComment => db.CommentHistory.create(editedComment);

export const createCommentHistory = async editedComment => db.CommentHistory.create(editedComment);
export const createReport = async report => db.Report.create(report);

export const createCategory = async category => db.Category.create(category);
