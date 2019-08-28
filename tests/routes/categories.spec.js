import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { createCategory, createUser } from '../helpers';
import { app, db } from '../../server';
import { transporter } from '../../utils/mailer';


const { expect } = chai;

chai.use(chaiHttp);
let mockTransporter;
let admin;
let user;

describe('CATEGORIES TEST', () => {
  beforeEach(async () => {
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    await db.User.destroy({ truncate: true, cascade: true });
    await db.Category.destroy({ truncate: true, casade: true });
    admin = {
      firstName: 'admin',
      lastName: 'lastname',
      username: 'admin1',
      password: '12345678',
      email: 'admin@gmail.com',
      role: 'admin'
    };
    user = await createUser({
      firstName: 'user1',
      lastName: 'lastname',
      username: 'user1-name',
      password: '12345678',
      email: 'user1@gmail.com',
    });
    admin = await db.User.create(admin);
  });

  afterEach(async () => {
    mockTransporter.restore();
    await db.User.sync({ truncate: true, casade: true });
    await db.Category.destroy({ truncate: true, casade: true });
  });

  it('only admin can add categories', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .post('/api/v1/category')
      .send({
        name: 'tech',
        description: 'power for all'
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.equal('category added successfully');
    expect(res.body.message).to.be.a('string');
    expect(res.body).to.include.all
      .keys('message');
  });

  it('should not add category if name field is empty', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .post('/api/v1/category')
      .send({
        name: '',
        description: ''
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.be.an('array');
    expect(res.body.message[0].message).to.equal('Input your name');
  });

  it('category should be unique', async () => {
    const userResponse = admin.response();
    const { token } = userResponse;
    await createCategory({ name: 'tech', description: 'hello' });
    const res = await chai
      .request(app)
      .post('/api/v1/category')
      .send({
        name: 'tech', description: 'hello'
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(400);
    expect(res.body.error).to.equal('Category Already exist');
    expect(res.body.error).to.be.a('string');
    expect(res.body).to.include.all
      .keys('error');
  });

  it('should get all categories', async () => {
    const userResponse = user.response();
    const { token } = userResponse;
    await db.Category.bulkCreate([
      { id: 1, name: 'tech', description: 'power for all' }, { id: 2, name: 'music', description: 'power for all' },
      { id: 3, name: 'market', description: 'power for all' }, { id: 4, name: 'art', description: 'power for all' }
    ]);
    const res = await chai
      .request(app)
      .get('/api/v1/category')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.categories).to.be.an('array');
    expect(res.body.categories).to.have.length(4);
  });
});
