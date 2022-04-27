import * as sinon from 'sinon';
import { verifyIssuer } from './verify-issuer';

describe('verifyIssuer', () => {
  let xhr: any;

  beforeEach(() => {
    xhr = {
      setRequestHeader: sinon.stub(),
      getAllResponseHeaders: sinon.stub().returns('X-Dummy: dummy'),
      open: sinon.stub(),
      send: sinon.stub(),
      status: 200,
      statusText: 'OK',
      responseText: '{"issuer": "http://example.com/dummy_tenant/"}',
      responseURL: 'http://example.com/dummy_tenant/.well-known/openid-configuration',
    };
    (window as any).XMLHttpRequest = sinon.stub().callsFake(() => xhr);
  });

  afterEach(() => {
    delete (window as any).XMLHttpRequest;
  });

  it('issクレームに相違がない場合はエラーを投げないこと', done => {
    const iss = 'http://example.com/dummy_tenant/';
    const origin = 'http://example.com';
    const tenant = 'dummy_tenant';

    verifyIssuer(iss, origin, tenant).then(() => {
      done();
    });

    xhr.onload();
  });

  it('issクレームに相違がある場合はエラーを投げること', done => {
    const iss = 'http://example.com/wrong_tenant/';
    const origin = 'http://example.com';
    const tenant = 'dummy_tenant';

    verifyIssuer(iss, origin, tenant).then(
      () => {},
      error => {
        expect(error.message).toBe(
          'iss claim verification error (Expected: http://example.com/dummy_tenant/, Received: http://example.com/wrong_tenant/)',
        );
        done();
      },
    );

    xhr.onload();
  });
});
