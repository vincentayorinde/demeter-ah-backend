import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../server';

const { expect } = chai;

chai.use(chaiHttp);
let register = {};
let login = {};
describe('USER AUTHENTICATION', () => {
  beforeEach(() => {
    register = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kev',
      password: '12345678',
      bio: 'myy',
      image: 'iss',
      email: 'frank@gmail.com'
    };
    login = {
      password: '12345678',
      email: 'frank@gmail.com'
    };
  });
  describe('Sign up', () => {
    it('should sign up user if info is valid', (done) => {
      chai
        .request(app)
        .post('/api/v1/users/signup')
        .send(register)
        .end((req, res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.all.keys('user', 'message');
          expect(res.body.user).to.be.an('object');
          expect(res.body.message).to.be.a('string');
          expect(res.body.user).to.include.all.keys(
            'email',
            'updatedAt',
            'createdAt',
            'firstName',
            'username',
            'lastName',
            'bio',
            'id',
            'image',
            'token'
          );
          done();
        });
    });
  });
  describe('Log in', () => {
    it('should not login user if info is invalid', (done) => {
      login.password = '1234567';
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send(login)
        .end((req, res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.all.keys('error');
          expect(res.body.error).to.be.a('string');
          expect(res.body.error).to.include('Invalid email or password');
          done();
        });
    });
    it('should login user if info is valid', (done) => {
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send(login)
        .end((req, res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.all.keys('user', 'message');
          expect(res.body.user).to.be.an('object');
          expect(res.body.message).to.be.a('string');
          expect(res.body.user).to.include.all.keys(
            'email',
            'updatedAt',
            'createdAt',
            'firstName',
            'username',
            'lastName',
            'bio',
            'id',
            'image',
            'token'
          );
          done();
        });
    });
  });
});
