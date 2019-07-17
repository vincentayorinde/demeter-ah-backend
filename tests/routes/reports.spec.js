import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { app, db } from '../../server';
import { createArticle, createReport } from '../helpers';
import { transporter } from '../../utils/mailer';
import * as utils from '../../utils';

const { expect } = chai;

chai.use(chaiHttp);
let mockTransporter;
let user;
let user1;
let profile;
let article;
let admin;
let mockDeleteImage;

describe('ARTICLE FLAG', () => {
  beforeEach(async () => {
    mockDeleteImage = sinon.stub(utils, 'deleteImage');
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    profile = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'wkev43',
      password: '12345678',
      email: 'pro23@gmail.com'
    };

    admin = {
      firstName: 'admin',
      lastName: 'lastname',
      username: 'admin1',
      password: '12345678',
      email: 'admin@gmail.com',
      role: 'admin'
    };

    article = {
      title: 'React course by hamza',
      description: 'very good book',
      body: 'learning react is good for your career...'
    };
    user = await db.User.create(profile);
    admin = await db.User.create(admin);
    user1 = await db.User.create({ ...profile, email: 'me@you.com', username: 'summ' });
  });

  afterEach(async () => {
    mockTransporter.restore();
    mockDeleteImage.restore();
    await db.User.destroy({ truncate: true, cascade: true });
    await db.Report.destroy({ truncate: true, cascade: true });
  });

  it('should successfully report an article', async () => {
    const userResponse = user.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });

    const res = await chai
      .request(app)
      .post('/api/v1/report')
      .set('x-access-token', token)
      .send({
        articleId: newArticle.id,
        message: 'not good article'
      });
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('thank you for the report');
  });

  it('should not create report if article does not exist', async () => {
    const userResponse = user.response();
    const { token } = userResponse;

    const res = await chai
      .request(app)
      .post('/api/v1/report')
      .set('x-access-token', token)
      .send({
        articleId: '12233',
        message: 'not good article'
      });
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('Article does not exist');
  });

  it('should not report article if it does not contain a message', async () => {
    const userResponse = user.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });

    const res = await chai
      .request(app)
      .post('/api/v1/report')
      .set('x-access-token', token)
      .send({
        articleId: newArticle.id,
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body.message[0].message).to.equal('Input your message');
  });

  it('only admin should be able to view reported article', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'parental guidiance' });
    await createReport({ articleId: newArticle.id, userId: user1.id, message: 'hated' });

    const res = await chai
      .request(app)
      .get('/api/v1/report/articles')
      .set('x-access-token', token);
    expect(res.body).to.include.all.keys('articles');
    expect(res.body.articles).to.be.an('array');
    expect(res.body.articles).to.have.length(2);
  });

  it('non admin should not be able to view reports', async () => {
    const userResponse = user.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'parental guidiance' });
    await createReport({ articleId: newArticle.id, userId: user1.id, message: 'hated' });

    const res = await chai
      .request(app)
      .get('/api/v1/report/articles')
      .set('x-access-token', token);
    expect(res.body).to.include.all.keys('error');
    expect(res.body.error).to.equal('Unauthorized');
  });

  it('admin can flag an article', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'very bad article' });

    const res = await chai
      .request(app)
      .patch(`/api/v1/articles/flag/${newArticle.slug}`)
      .send({ flag: true })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.all.keys('article');
    expect(res.body.article).to.be.an('object');
    expect(res.body.article.flagged).to.equal(true);
  });

  it('flag must be boolean or string of true or false', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'very bad article' });

    const res = await chai
      .request(app)
      .patch(`/api/v1/articles/flag/${newArticle.slug}`)
      .send({ flag: null })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(400);
    expect(res.body).to.include.all.keys('error');
    expect(res.body.error).to.be.a('string');
    expect(res.body.error).to.equal('flag must be true or false');
  });

  it('should not flag article if article does not exist', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'very bad article' });

    const res = await chai
      .request(app)
      .patch('/api/v1/articles/flag/wrong-article')
      .send({ flag: true })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('Article does not exist');
  });


  it('should get all reports of a particular article', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'parental guidiance' });
    await createReport({ articleId: newArticle.id, userId: user1.id, message: 'hated' });
    await createReport({ articleId: newArticle.id, userId: user1.id, message: 'not gooddd' });

    const res = await chai
      .request(app)
      .get(`/api/v1/articles/reported/${newArticle.slug}`)
      .set('x-access-token', token);
    expect(res.body).to.include.all.keys('article');
    expect(res.body.article.reports).to.be.an('array');
    expect(res.body.article).to.include.all.keys('reports', 'title', 'description', 'slug');
    expect(res.body.article.reports).to.have.length(3);
    expect(res.body.article).to.be.an('object');
  });

  it('should not get article reports that does not exist', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;

    const res = await chai
      .request(app)
      .get('/api/v1/articles/reported/no-article')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('Article does not exist');
  });


  it('only admin should delete reported article', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });
    await createReport({ articleId: newArticle.id, userId: user.id, message: 'parental guidiance' });

    const res = await chai
      .request(app)
      .delete(`/api/v1/articles/reported/${newArticle.slug}`)
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('deleted successfully');
  });

  it('only reported articles can be deleted', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const newArticle = await createArticle({ ...article, authorId: user1.id });

    const res = await chai
      .request(app)
      .delete(`/api/v1/articles/reported/${newArticle.slug}`)
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('sorry you can\'t delete an article that was not reported');
  });

  it('only article that exist can be delete', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;

    const res = await chai
      .request(app)
      .delete('/api/v1/articles/reported/some-odd-article')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.include.all.keys('message');
    expect(res.body.message).to.equal('Article does not exist');
  });
});
