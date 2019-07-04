import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';
import { createUser } from '../helpers';
import { getToken } from '../../utils';

const { expect } = chai;

chai.use(chaiHttp);
let article = {};
let register;

describe('ARTICLES TEST', () => {
  before(async () => {
    article = {
      title: 'React course by hamza',
      description: 'very good book',
      body: 'learning react is good for your career...',
      images: 'imageurl',
    };
    register = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kev',
      password: '12345678',
      email: 'frank@gmail.com',
    };
  });

  beforeEach(async () => {
    await db.Article.destroy({ truncate: true, cascade: true });
    await db.User.destroy({ truncate: true, cascade: true });
  });

  after(async () => {
    await db.Article.destroy({ truncate: true, cascade: true });
    await db.User.destroy({ truncate: true, cascade: true });
  });

  describe('Create articles', () => {
    it('should create an article if info is valid', async () => {
      const user = await createUser(register);
      const userResponse = user.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .post('/api/v1/articles')
        .set('x-access-token', token)
        .send(article);
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('article', 'message');
      expect(res.body.article).to.be.an('object');
      expect(res.body.message).to.be.a('string');
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
      const token = await getToken(4999, 'wrong@gmail.com');
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
});
