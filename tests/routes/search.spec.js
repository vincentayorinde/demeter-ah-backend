import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { app, db } from '../../server';
import {
  createUser, createArticle, createTag, createArticleTag
} from '../helpers';
import { transporter } from '../../utils/mailer';

const { expect } = chai;

chai.use(chaiHttp);
let user, article, newUser, newArticle, newTag = {};
let mockTransporter;

describe('SEARCH TEST', () => {
  before(async () => {
    await db.Article.destroy({ truncate: true, cascade: true });
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    user = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'damy',
      password: '12345678',
      email: 'pronew@gmail.com'
    };
    article = {
      title: 'React course by hamza',
      description: 'very good book',
      body: 'learning react is good for your career...'
    };
    newUser = await createUser(user);
    newArticle = await createArticle({ ...article, authorId: newUser.id });
    newTag = await createTag({ name: 'react' });
    await createArticleTag({ articleId: newArticle.id, tagId: newTag.id });
  });
  after(async () => {
    await db.Article.destroy({ truncate: true, cascade: true });
    mockTransporter.restore();
  });
  describe('SEARCH', () => {
    it('Should not get articles if no filter is entered', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/search');
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.an('array');
    });
    it('Should get article with tag filter entered', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/search?tag=react');
      expect(res.body).to.be.an('object');
      expect(res.body.search).to.be.an('array');
      expect(res.body.search[0]).to.be.an('object');
      expect(res.body.search[0].tags[0].name).to.include('react');
    });
    it('Should get article with author filter entered', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/search?author=vincent');
      expect(res.body).to.be.an('object');
      expect(res.body.search).to.be.an('array');
      expect(res.body.search[0]).to.be.an('object');
      expect(res.body.search[0].author.username).to.include('damy');
    });
    it('Should get article with title filter entered', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/search?title=React');
      expect(res.body).to.be.an('object');
      expect(res.body.search).to.be.an('array');
      expect(res.body.search[0]).to.be.an('object');
      expect(res.body.search[0].title).to.include('React course by hamza');
    });
  });
});
