import chai from 'chai';
import sinon from 'sinon';
import passport from 'passport';
import { app } from '../../server';

// const { expect } = chai;

let mockSocialLogin;

describe('SOCIAL LOGIN', () => {
  afterEach(() => {
    mockSocialLogin.restore();
  });
  it('should sign in with facebook', async () => {
    const profile = {
      emails: [{ value: 'demeter@gmail.com' }],
      name: { givenName: 'team', familyName: 'demeter' },
      displayName: 'team demeter',
      photos: [{ value: 'http://photo.jpg' }]
    };
    mockSocialLogin = sinon
      .stub(passport, 'authenticate')
      .callsFake((strategy, options, callback) => {
        callback(null, profile, null);
        // return (req, res, next) => {};
      });

    const res = await chai.request(app).get('/auth/facebook');
    console.log('===>>', res.user);
  });
});
