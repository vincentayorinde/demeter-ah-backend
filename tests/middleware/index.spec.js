import chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import db from '../../db/models';
import Middleware from '../../middlewares';
import { Response } from '../helpers';
import { blackListThisToken } from '../../utils';

const { expect } = chai;

describe('Middlewares', () => {
  beforeEach(async () => {
    await db.BlackListedTokens.sync({ truncate: true, cascade: false });
  });
  describe('Testing  blacklisted middleware', () => {
    it('should call next when blacklisted middleware checks fine', (done) => {
      const user = {
        name: 'test user',
      };

      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: '1h',
      });

      const req = {
        headers: {
          'x-access-token': token,
        },
      };

      const nextSpy = sinon.spy();
      Middleware.isblackListedToken(req, {}, nextSpy).then(() => {
        // eslint-disable-next-line no-unused-expressions
        expect(nextSpy.calledOnce).to.be.true;
      });
      done();
    });

    it('should return unauthorized if token has been black listed', async () => {
      const user = {
        name: 'test user',
      };

      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: '1h',
      });

      const req = {
        headers: {
          'x-access-token': token,
        },
      };

      await blackListThisToken(token);

      const res = new Response();

      const nextSpy = sinon.spy();
      const response = await Middleware.isblackListedToken(req, res, nextSpy);

      expect(response).to.be.a('object');
      expect(response).to.have.property('message');
      expect(response.message).to.include('unAuthorized');
    });
  });

  describe('authentication', () => {
    it('call next when jwt passes', async () => {
      const user = {
        name: 'test user',
      };

      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: 1,
      });

      const req = {
        headers: {
          'x-access-token': token,
        },
      };

      const res = new Response();

      const nextSpy = sinon.spy();
      const response = await Middleware.authenticate(req, res, nextSpy);
      expect(response).to.be.a('object');
      expect(response).to.have.property('message');
    });

    it('should return jwt malformed when token is invalid', async () => {
      const req = {
        headers: {
          'x-access-token': 'invalid-token',
        },
      };

      const res = new Response();

      const nextSpy = sinon.spy();
      const response = await Middleware.authenticate(req, res, nextSpy);
      expect(response).to.be.a('object');
      expect(response).to.have.property('message');
      expect(response.message).to.include('jwt malformed');
    });

    it('should return jwt must be provided when no token is provided', async () => {
      const req = {
        headers: {
          'x-access-token': '',
        },
      };

      const res = new Response();

      const nextSpy = sinon.spy();
      const response = await Middleware.authenticate(req, res, nextSpy);

      expect(response).to.be.a('object');
      expect(response).to.have.property('message');
      expect(response.message).to.include('jwt must be provided');
    });
  });

  describe('Role Middleware', () => {
    it('should call next if its admin', (done) => {
      const user = {
        role: 'admin',
      };

      const req = {
        user,
      };

      const nextSpy = sinon.spy();
      Middleware.isAdmin(req, {}, nextSpy).then(() => {
        // eslint-disable-next-line no-unused-expressions
        expect(nextSpy.calledOnce).to.be.true;
      });
      done();
    });

    it('should return unauthorized if user is not admin', async () => {
      const user = {
        role: 'author',
      };

      const req = {
        user,
      };

      const res = new Response();

      const nextSpy = sinon.spy();
      const resp = await Middleware.isAdmin(req, res, nextSpy);
      expect(resp.error).to.include('Unauthorized');
    });
  });
});
