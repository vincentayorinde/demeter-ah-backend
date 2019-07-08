import chai from 'chai';
import nock from 'nock';
import { app } from '../../server';

const { expect } = chai;

describe('SOCIAL LOGIN', () => {
  it('should hit the facebook URL for social login', async () => {
    nock('https://www.facebook.com/')
      .filteringPath(() => '/auth/facebook')
      .get('/auth/facebook')
      .reply(200, { message: 'hit the route' });

    const res = await chai.request(app).get('/auth/facebook');
    expect(res.body.message).to.include('hit the route');
    expect(res.status).to.eql(200);
  });

  it('should call the facebook call back', async () => {
    nock('https://www.facebook.com/')
      .filteringPath(() => '/auth/facebook/callback')
      .get('/auth/facebook/callback')
      .reply(200, { message: 'hit the route' });

    const res = await chai.request(app).get('/auth/facebook/callback');
    expect(res.body.message).to.include('hit the route');
    expect(res.status).to.eql(200);
  });

  it('should hit the google URL for social login', async () => {
    nock('https://accounts.google.com/')
      .filteringPath(() => '/auth/google')
      .get('/auth/google')
      .reply(200, { message: 'hit the route' });

    const res = await chai.request(app).get('/auth/google');
    expect(res.body).to.an('object');
    expect(res.body.message).to.include('hit the route');
    expect(res.status).to.eql(200);
  });

  it('should call the google call back', async () => {
    nock('https://accounts.google.com/')
      .filteringPath(() => '/auth/google/callback')
      .get('/auth/google/callback')
      .reply(200, { message: 'hit the route' });

    const res = await chai.request(app).get('/auth/google/callback');
    expect(res.body).to.be.an('object');
    expect(res.body.message).to.include('hit the route');
    expect(res.status).to.eql(200);
  });

  it('should hit the twitter URL for social login', async () => {
    nock('https://api.twitter.com/')
      .filteringPath(() => '/auth/twitter')
      .get('/auth/twitter')
      .reply(200, 'hit the route');

    const res = await chai.request(app).get('/auth/twitter');
    expect(res.body).to.an('object');
  });

  it('should call the twitter call back', async () => {
    nock('https://www.twitter.com/')
      .filteringPath(() => '/auth/twitter/callback')
      .get('/auth/twitter/callback')
      .reply(200, { message: 'hit the route' });

    const res = await chai.request(app).get('/auth/twitter/callback');
    expect(res.body).to.an('object');
  });
});
