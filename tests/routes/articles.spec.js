import chai from 'chai';
import sinon from 'sinon';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';
import {
  createUser, createArticle, createRate, createArticleVote, createComment, createCommentHistory,
  createCategory
} from '../helpers';
import * as utils from '../../utils';
import { transporter } from '../../utils/mailer';
import { polly } from '../../middlewares/AWS';

const { expect } = chai;
let mockTransporter;

chai.use(chaiHttp);
let article = {};
let register;
let mockUploadImage;
let mockDeleteImage;
let ratingUser;
let category;
let textToSpeech;

describe('ARTICLES TEST', () => {
  before(async () => {
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    textToSpeech = sinon.stub(polly, 'synthesizeSpeech').resolves({});
  });
  beforeEach(async () => {
    category = await createCategory({ name: 'comms' });
    article = {
      title: 'React course by hamza',
      description: 'very good book',
      body: 'learning react is good for your career...',
      categoryId: category.id
    };
    register = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kev',
      password: '12345678',
      email: 'frank@gmail.com',
    };
    await db.Article.destroy({ truncate: true, cascade: true });
    await db.User.destroy({ truncate: true, cascade: true });
    await db.ArticleTag.destroy({ truncate: true, cascade: true });
    await db.Tag.destroy({ truncate: true, cascade: true });
    await db.Comment.destroy({ truncate: true, cascade: true });
    await db.Category.destroy({ truncate: true, cascade: true });
  });

  after(async () => {
    mockTransporter.restore();
    textToSpeech.restore();
    await db.Article.destroy({ truncate: true, cascade: true });
    await db.User.destroy({ truncate: true, cascade: true });
    await db.Ratings.destroy({ truncate: true, cascade: true });
    await db.ArticleTag.destroy({ truncate: true, cascade: true });
    await db.Tag.destroy({ truncate: true, cascade: true });
    await db.Comment.destroy({ truncate: true, cascade: true });
    await db.Category.destroy({ truncate: true, cascade: true });
  });

  describe('Create articles', () => {
    afterEach(() => {
      mockUploadImage.restore();
    });
    it('should create an article if info is valid', async () => {
      mockUploadImage = sinon.stub(utils, 'uploadImage')
        .callsFake(() => new Promise(resolve => resolve('//temp/up.jpg')));
      const user = await createUser(register);
      const userResponse = user.response();
      const { token } = userResponse;
      category = await createCategory({ name: 'tech' });
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .field('Content-Type', 'multipart/form-data')
        .field('title', 'React course by hamza')
        .field('description', 'very good book')
        .field('body', 'learning react is good for your career...')
        .field('tags', 'Javascript')
        .field('categoryId', category.id)
        .attach('image', `${__dirname}/test.jpg`)
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('article', 'message');
      expect(res.body.article).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Article Created Successfully');
      expect(res.body.article.title).to.include(article.title);
      expect(res.body.article.description).to.include(article.description);
      expect(res.body.article.body).to.include(article.body);
      expect(res.body.article.tagList).to.be.an('array');
      expect(res.body.article.tagList).to.have.length(1);
      expect(res.body.article.tagList[0]).to.equal('javascript');
    });
    it('should not create an article if category Id does not exit', async () => {
      const user = await createUser(register);
      const userResponse = user.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .field('Content-Type', 'multipart/form-data')
        .field('title', 'React course by hamza')
        .field('description', 'very good book')
        .field('body', 'learning react is good for your career...')
        .field('tags', 'Javascript')
        .field('categoryId', 345678)
        .attach('image', `${__dirname}/test.jpg`)
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal('category does not Exist');
    });
    it('should not create an article if info is not complete', async () => {
      const user = await createUser(register);
      const userResponse = user.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .set('x-access-token', token)
        .send({ ...article, title: null });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(400);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message[0].message).to.equal('Input your title');
      expect(res.body.message[0].field).to.equal('title');
    });
    it('should not create an article if the token does not exist', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .send(article);
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
    });

    it('should not create an article if the user does not exist', async () => {
      const token = await utils.getToken(4999, 'wrong@gmail.com');
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .set('x-access-token', token)
        .send(article);
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
    });

    it('should get the accurate read time of an article', async () => {
      mockUploadImage = sinon.stub(utils, 'uploadImage')
        .callsFake(() => new Promise(resolve => resolve('//temp/up.jpg')));
      const user = await createUser(register);
      const userResponse = user.response();
      const { token } = userResponse;
      category = await createCategory({ name: 'tech' });
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .field('Content-Type', 'multipart/form-data')
        .field('title', 'React course by hamza')
        .field('description', 'very good book')
        .field('body', 'learning react is good for your career...')
        .field('categoryId', category.id)
        .attach('image', `${__dirname}/test.jpg`)
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(201);
      expect(res.body.article.title).to.include(article.title);
      expect(res.body.article.description).to.include(article.description);
      expect(res.body.article.readTime).to.be.equal('Less than a minute');
    });
  });
  describe('Update articles', () => {
    afterEach(() => {
      mockUploadImage.restore();
    });
    it('should update an article if info is valid', async () => {
      mockUploadImage = sinon.stub(utils, 'uploadImage')
        .callsFake(() => new Promise(resolve => resolve('//temp/up.jpg')));
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const userResponse = newUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .put(`/api/v1/articles/${newArticle.slug}`)
        .field('Content-Type', 'multipart/form-data')
        .attach('image', `${__dirname}/test.jpg`)
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('article', 'message');
      expect(res.body.article).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Article Updated Successfully');
      expect(res.body.article.title).to.include(article.title);
      expect(res.body.article.description).to.include(article.description);
      expect(res.body.article.body).to.include(article.body);
      expect(res.body.article.image).to.include('//temp/up.jpg');
    });
    it('should not update an article if no info is provided', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const userResponse = newUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .put(`/api/v1/articles/${newArticle.slug}`)
        .field('Content-Type', 'multipart/form-data')
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('article', 'message');
      expect(res.body.article).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.article.title).to.include(article.title);
      expect(res.body.article.description).to.include(article.description);
      expect(res.body.article.body).to.include(article.body);
    });
    it('should not update an article does not exist', async () => {
      const newUser = await createUser(register);
      const userResponse = newUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .put('/api/v1/articles/i')
        .set('x-access-token', token)
        .send({ title: 'andela' });
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Article not found');
    });
    it('Only author of an article should be able to edit an article', async () => {
      const newUser = await createUser(register);
      register.email = 'john@andela.com';
      register.username = 'john';
      const secondUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const userResponse = secondUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .put(`/api/v1/articles/${newArticle.slug}`)
        .set('x-access-token', token)
        .send({ title: 'andela' });
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('You are not Authorized to edit this Article');
    });
    it('should not update an article if the token does not exist', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const res = await chai
        .request(app)
        .put(`/api/v1/articles/${newArticle.slug}`)
        .send(article);
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
    });
    it('should not update an article if the user does not exist', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const token = await utils.getToken(4999, 'wrong@gmail.com');
      const res = await chai
        .request(app)
        .put(`/api/v1/articles/${newArticle.slug}`)
        .set('x-access-token', token)
        .send(article);
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
    });
  });

  describe('Delete articles', () => {
    afterEach(() => {
      mockDeleteImage.restore();
    });
    it('Author should be able to delete an article if slug is provided', async () => {
      mockDeleteImage = sinon.stub(utils, 'deleteImage')
        .callsFake(() => new Promise(resolve => resolve('//temp/up.jpg')));
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const userResponse = newUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .delete(`/api/v1/articles/${newArticle.slug}`)
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('article', 'message');
      expect(res.body.article).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Article Deleted Successfully');
    });
    it('should not delete an article that does not exist', async () => {
      const newUser = await createUser(register);
      const userResponse = newUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .delete('/api/v1/articles/i')
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Article not found');
    });
    it('Only author of an article should be able to delete an article', async () => {
      const newUser = await createUser(register);
      register.email = 'john@andela.com';
      register.username = 'john';
      const secondUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const userResponse = secondUser.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .delete(`/api/v1/articles/${newArticle.slug}`)
        .set('x-access-token', token);
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('You are not Authorized to delete this Article');
    });
    it('should not delete an article if the token does not exist', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const res = await chai
        .request(app)
        .delete(`/api/v1/articles/${newArticle.slug}`);
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
    });
    it('should not delete an article if the user does not exist', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const token = await utils.getToken(4999, 'wrong@gmail.com');
      const res = await chai
        .request(app)
        .put(`/api/v1/articles/${newArticle.slug}`)
        .set('x-access-token', token)
        .send(article);
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
    });
  });

  describe('Get All articles', () => {
    it('Anyone should be able to view all article', async () => {
      const newUser = await createUser(register);
      await createArticle({ ...article, authorId: newUser.id });
      const res = await chai
        .request(app)
        .get('/api/v1/articles');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('articles', 'articlesCount');
      expect(res.body.articles).to.be.an('array');
      expect(res.body.articles.length).to.equal(1);
      expect(res.body.articlesCount).to.equal(1);
    });
    it('should not get any articles if none exist', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/articles');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('articles', 'articlesCount');
      expect(res.body.articles).to.be.an('array');
      expect(res.body.articles.length).to.equal(0);
      expect(res.body.articlesCount).to.equal(0);
    });
  });

  describe('Get Single article', () => {
    it('Anyone should be able to view an article', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${newArticle.slug}`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('article');
      expect(res.body.article).to.be.an('object');
    });
    it('should not get an article that does not exist', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/articles/i');
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Article does not exist');
    });
  });

  describe('Rate articles', () => {
    let userToken;
    let articleData;
    let userResponse;
    beforeEach(async () => {
      const user = await createUser(register);
      userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      articleData = await createArticle({ ...article, authorId: userResponse.id });
    });
    it('should rate article if user is authenticated', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/rate/${articleData.slug}`)
        .set('x-access-token', userToken)
        .send({ rate: '4' });
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('rating', 'message');
      expect(res.body.rating).to.be.an('object');
      expect(res.body.message).to.be.a('string');
    });
    it('should not rate article if user is not authenticated', async () => {
      const token = await utils.getToken(45345, 'wrong@gmail.com');
      const res = await chai
        .request(app)
        .post('/api/v1/articles/rate/wrong-slug')
        .set('x-access-token', token)
        .send({ rate: '4' });
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.be.equal('Unauthorized');
    });
    it('should not rate article if rate is not from 1 to 5', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/rate/${articleData.slug}`)
        .set('x-access-token', userToken)
        .send({ rate: '8' });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.an('array');
      expect(res.body.message[0].message).to.be.equal('Only ratings from 1 to 5 are allowed');
    });
    it('should not rate article if rate is not provided', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/rate/${articleData.slug}`)
        .set('x-access-token', userToken)
        .send({ rate: '' });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.an('array');
      expect(res.body.message[0].message).to.be.equal('Input your rate');
    });
    it('should update a rating', async () => {
      await createRate({
        userId: userResponse.id,
        articleId: articleData.id,
        stars: '4'
      });
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/rate/${articleData.slug}`)
        .set('x-access-token', userToken)
        .send({ rate: '4' });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.be.equal('Rating updated successfully');
    });
    it('it should return 404 if article does not exist', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/articles/rate/wrong-slug')
        .set('x-access-token', userToken)
        .send({ rate: '4' });
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.be.equal('Article does not exist');
    });
  });

  describe('Vote and downvote Article', () => {
    let userToken;
    let upvote;
    let articleSlug;

    beforeEach(async () => {
      await db.ArticleVote.destroy({ truncate: true, cascade: true });
      const user = await createUser({ ...register, email: 'man@havens.com' });
      const userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      const newArticle = await createArticle({ ...article, authorId: userResponse.id });
      articleSlug = newArticle.slug;

      upvote = {
        userId: userResponse.id,
        articleId: newArticle.id,
        status: true
      };
    });

    it('Should upvote an article', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${articleSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: true
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('You upvote this article');
    });

    it('Should change upvote to downvote', async () => {
      await createArticleVote(upvote);
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${articleSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: false
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('You downvote this article');
    });

    it('Should unvote an article already upvoted', async () => {
      await createArticleVote(upvote);
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${articleSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: true
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('You have unvote this article');
    });

    it('Should downvote an article', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${articleSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: false
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('You downvote this article');
    });

    it('Should return error message when article does not exist', async () => {
      const wrongSlug = `${articleSlug}-1234`;
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${wrongSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: false
        });
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('This article does not exist');
    });

    it('Should return error message when status is not true or false', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${articleSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: 'ade'
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Wrong status field provided');
    });

    it('Should return error message when status is set to null', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/vote/${articleSlug}`)
        .set('x-access-token', userToken)
        .send({
          status: null
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.error[0].message).to.equal('Input your status');
    });
  });

  describe('Get Article Ratings', () => {
    let articleData;
    beforeEach(async () => {
      const user = await createUser(register);
      ratingUser = user;
      articleData = await createArticle({ ...article, authorId: user.id });
    });
    it('should get a specific article ratings', async () => {
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/rate/${articleData.slug}`)
        .send();
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message', 'totalRates', 'rates');
      expect(res.body.message).to.equal('All ratings for Article');
      expect(res.body.totalRates).to.be.a('number');
      expect(res.body.rates).to.be.an('array');
    });

    it('should get a specific article ratings ', async () => {
      await createRate({
        articleId: articleData.id,
        userId: ratingUser.id,
        stars: 3
      });
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/rate/${articleData.slug}?offset=0&limit=5`)
        .send();
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message', 'totalRates', 'rates', 'count');
      expect(res.body.message).to.equal('All ratings for Article');
      expect(res.body.totalRates).to.be.a('number');
      expect(res.body.count).to.be.a('number');
      expect(res.body.rates).to.be.an('array');
    });

    it('should not get a specific article ratings if article does not exists', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/articles/rate/wrong-slug')
        .send();
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('Article does not exist');
    });
  });
  describe('Comment on Articles', () => {
    let userResponse;
    let articleData;
    let userToken;
    beforeEach(async () => {
      const user = await createUser(register);
      userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      articleData = await createArticle({ ...article, authorId: userResponse.id });
    });
    it('should add a comment if user is authenticated', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/${articleData.slug}/comments`)
        .set('x-access-token', userToken)
        .send({ content: 'This is my first comment' });
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.be.equal('Comment added successfully');
      expect(res.body.comment).to.be.an('object');
      expect(res.body.comment.content).to.be.a('string');
    });

    it('should not add a comment if user is not authenticated', async () => {
      const token = await utils.getToken(45345, 'wrong@gmail.com');
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/${articleData.slug}/comments`)
        .set('x-access-token', token)
        .send({ content: 'This is my first comment' });
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.be.equal('Unauthorized');
    });

    it('should not add a comment if article does not exist', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/articles/wrong-article/comments')
        .set('x-access-token', userToken)
        .send({ content: 'This is my first comment' });
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.be.equal('Article does not exist');
    });

    it('should not add a comment if comment is empty', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/${articleData.slug}/comments`)
        .set('x-access-token', userToken)
        .send({ content: '' });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.be.equal('Input your content');
    });
  });

  describe('Bookmark Articles', () => {
    let userResponse;
    let articleData;
    let userToken;
    let user;
    beforeEach(async () => {
      await db.Article.destroy({ truncate: true, cascade: true });
      await db.User.destroy({ truncate: true, cascade: true });
      await db.Bookmark.destroy({ truncate: true, cascade: true });
      user = await createUser(register);
      userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      articleData = await createArticle({ ...article, authorId: userResponse.id });
    });

    it('a user should be able to bookmark an article', async () => {
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/bookmark/${articleData.slug}`)
        .set('x-access-token', userToken);
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.be.equal('Bookmark created successfully');
      expect(res.body.bookmark.articleId).to.be.equal(articleData.id);
      expect(res.body.bookmark.userId).to.be.equal(user.id);
    });

    it('a user should be able to remove an article that was bookmarked', async () => {
      await db.Bookmark.create({
        articleId: articleData.id,
        userId: user.id
      });
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/bookmark/${articleData.slug}`)
        .set('x-access-token', userToken);
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.be.equal('Bookmark successfully removed');
    });

    it('a user should not bookmark article that does not exist', async () => {
      await db.Bookmark.create({
        articleId: articleData.id,
        userId: user.id
      });
      const res = await chai
        .request(app)
        .get('/api/v1/articles/bookmark/random slug name')
        .set('x-access-token', userToken);
      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.be.equal('Article does not exist');
    });
  });

  describe('Like Comments', () => {
    let userResponse;
    let commentData;
    let userToken;
    beforeEach(async () => {
      const user = await createUser(register);
      userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      const articleData = await createArticle({ ...article, authorId: userResponse.id });
      commentData = await db.Comment.create({
        articleId: articleData.id,
        userId: userResponse.id,
        content: 'this is a new comment'
      });
    });
    it('should vote a comment if user is authenticated', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/comment/vote/${commentData.id}`)
        .set('x-access-token', userToken)
        .send({ status: 'true' });
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.be.equal('You upvote this comment');
    });

    it('should vote a comment if user is authenticated', async () => {
      const res = await chai
        .request(app)
        .post(`/api/v1/articles/comment/vote/${commentData.id}`)
        .set('x-access-token', userToken)
        .send({ status: true });
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.be.equal('You upvote this comment');
    });

    it('a user should be able to change reaction to comment', async () => {
      await db.CommentVote.create({
        commentId: commentData.id,
        userId: userResponse.id,
        status: true,
      });

      const res = await chai
        .request(app)
        .post(`/api/v1/articles/comment/vote/${commentData.id}`)
        .set('x-access-token', userToken)
        .send({ status: false });
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.be.equal('You downvote this comment');
    });

    it('should be able to unvote a comment', async () => {
      await db.CommentVote.create({
        commentId: commentData.id,
        userId: userResponse.id,
        status: true,
      });

      const res = await chai
        .request(app)
        .post(`/api/v1/articles/comment/vote/${commentData.id}`)
        .set('x-access-token', userToken)
        .send({ status: true });
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.be.equal('You have unvoted this comment');
    });

    it('should not vote a comment if comment does not exist', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/articles/comment/vote/908')
        .set('x-access-token', userToken)
        .send({ status: 'true' });
      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.be.equal('This comment does not exist');
    });

    it('should not vote a comment if info provided is invalid', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/articles/comment/vote/908')
        .set('x-access-token', userToken)
        .send({ status: 'wrongString' });
      expect(res.statusCode).to.equal(400);
      expect(res.body.error).to.be.equal('Wrong status field provided');
    });

    it('should not vote a comment if info provided is null', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/articles/comment/vote/908')
        .set('x-access-token', userToken)
        .send({ status: null });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message[0].message).to.be.equal('Input your status');
    });
  });

  describe('User  Edit Comment on Articles', () => {
    let userResponse;
    let articleData;
    let userToken;
    let commentData;
    let commentId;
    beforeEach(async () => {
      const user = await createUser(register);
      userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      articleData = await createArticle({ ...article, authorId: userResponse.id });
      commentData = await createComment({ articleId: articleData.id, content: 'user comment' });
      commentId = parseInt(commentData.id, 10);
    });

    it('should add a new user comment if user is authenticated', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/${articleData.slug}/comments/${commentId}`)
        .set('x-access-token', userToken)
        .send({ content: 'updated comment' });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.comment.content).to.be.a('string');
    });

    it('should not add a new user comment if user is not authenticated', async () => {
      const token = await utils.getToken(45345, 'wrong@gmail.com');
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/${articleData.slug}/comments/${commentId}`)
        .set('x-access-token', token)
        .send({ content: 'updated comment' });
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('Unauthorized');
    });

    it('should not add a new user comment if article does not exist', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/wrong-article/comments/${commentId}`)
        .set('x-access-token', userToken)
        .send({ content: 'updated comment' });
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Article does not exist');
    });

    it('should not add a new user comment if real comment does not exist', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/${articleData.slug}/comments/404`)
        .set('x-access-token', userToken)
        .send({ content: 'updated comment' });
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Comment does not exist');
    });

    it('should not add a new user comment if comment is empty', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/${articleData.slug}/comments/${commentId}`)
        .set('x-access-token', userToken)
        .send({ content: '' });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('Input your content');
    });

    it('should not add a new user comment if comment id is string', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/${articleData.slug}/comments/unacceptedable`)
        .set('x-access-token', userToken)
        .send({ content: 'updated comment' });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('commentId must be an integer');
    });
  });

  describe('Get comment history', () => {
    let userToken;
    let articleSlug;
    let commentId;
    beforeEach(async () => {
      await db.CommentHistory.destroy({ truncate: true, cascade: true });
      const user = await createUser({ ...register, email: 'man@havens.com' });
      const userResponse = user.response();
      const { token } = userResponse;
      userToken = token;
      const newArticle = await createArticle({ ...article, authorId: userResponse.id });
      articleSlug = newArticle.slug;
      const commentDetails = {
        userId: userResponse.id,
        articleId: newArticle.id,
        content: 'This article is good'
      };
      const comment = await createComment(commentDetails);
      commentId = parseInt(comment.id, 10);
      await createCommentHistory({ commentId, content: 'This article is now good' });
    });

    it('should get comment history', async () => {
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${articleSlug}/comments/${commentId}/history`)
        .set('x-access-token', userToken);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.comment.content).to.equal('This article is good');
      expect(res.body.commentHistory).to.be.an('array');
      expect(res.body.commentHistory[0].content).to.equal('This article is now good');
    });

    it('should get second page of comment history', async () => {
      await createCommentHistory({ commentId, content: 'This article is now good for better' });
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${articleSlug}/comments/${commentId}/history?offset=1&limit=1`)
        .set('x-access-token', userToken);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.comment.content).to.equal('This article is good');
      expect(res.body.commentHistory).to.be.an('array');
      expect(res.body.commentHistory[0].content).to.equal('This article is now good for better');
    });

    it('should not get comment history for article that does not exist', async () => {
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${articleSlug}-1234/comments/${commentId}/history`)
        .set('x-access-token', userToken);
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Article does not exist');
    });

    it('should not get comment history for article comment that does not exist', async () => {
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${articleSlug}/comments/${1234}/history`)
        .set('x-access-token', userToken);
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Comment does not exist');
    });

    it('should not get comment history for article comment that does not exist', async () => {
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${articleSlug}/comments/his/history`)
        .set('x-access-token', userToken);
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('commentId must be an integer');
    });
  });

  describe('Update Article Stats', () => {
    let newUser;
    let newArticle;
    beforeEach(async () => {
      await db.Article.destroy({ truncate: true, cascade: true });
      await db.User.destroy({ truncate: true, cascade: true });
      newUser = await createUser(register);
      newArticle = await createArticle({ ...article, authorId: newUser.id });
    });

    it('Increment Article reads after reading time elapses', async () => {
      const { slug } = newArticle;
      const res = await chai
        .request(app)
        .patch(`/api/v1/articles/stats/${slug}`).send();
      expect(res.status).to.be.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.include('Article reads successfully Incremented');
    });

    it('Should not increment article reads if article does not exist', async () => {
      const res = await chai
        .request(app)
        .patch('/api/v1/articles/stats/dam-67').send();
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.include('Article deos not exist');
    });
  });

  describe('Get Single article comments', () => {
    it('should get an article comments', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, authorId: newUser.id });
      await createComment({ userId: newUser.id, articleId: newArticle.id, content: 'user comment' });
      const res = await chai
        .request(app)
        .get(`/api/v1/articles/${newArticle.slug}/comments`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('Comments retrieved successfully');
      expect(res.body.comments).to.be.an('array');
      expect(res.body.comments[0]).to.be.an('object');
      expect(res.body.comments[0].upVote).to.be.an('array');
      expect(res.body.comments[0].downVote).to.be.an('array');
    });

    it('should not get an article comments if article does not exist', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/articles/wrong-article/comments');
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Article does not exist');
    });
  });
});
