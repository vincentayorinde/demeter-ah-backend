import chai from 'chai';
import sinon from 'sinon';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';
import { createUser, createArticle, createRate } from '../helpers';
import * as utils from '../../utils';

const { expect } = chai;

chai.use(chaiHttp);
let article = {};
let register;
let mockUploadImage;
let mockDeleteImage;

describe('ARTICLES TEST', () => {
  beforeEach(async () => {
    article = {
      title: 'React course by hamza',
      description: 'very good book',
      body: 'learning react is good for your career...'
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
  });

  after(async () => {
    await db.Article.destroy({ truncate: true, cascade: true });
    await db.User.destroy({ truncate: true, cascade: true });
    await db.Ratings.destroy({ truncate: true, cascade: true });
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
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .field('Content-Type', 'multipart/form-data')
        .field('title', 'React course by hamza')
        .field('description', 'very good book')
        .field('body', 'learning react is good for your career...')
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
  });
  describe('Update articles', () => {
    afterEach(() => {
      mockUploadImage.restore();
    });
    it('should update an article if info is valid', async () => {
      mockUploadImage = sinon.stub(utils, 'uploadImage')
        .callsFake(() => new Promise(resolve => resolve('//temp/up.jpg')));
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const secondUser = await createUser(register);
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const secondUser = await createUser(register);
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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

  describe('Get Single article', () => {
    it('Anyone should be able to view an article', async () => {
      const newUser = await createUser(register);
      const newArticle = await createArticle({ ...article, userId: newUser.id });
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
      expect(res.body.message).to.include('Article not found');
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
      articleData = await createArticle({ ...article, userId: userResponse.id });
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
});
