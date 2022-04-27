import * as sinon from 'sinon';
import { SinonFakeTimers } from 'sinon';

import { verifyExpirationTime } from './verify-expiration-time';

describe('verifyExpirationTime', () => {
  let clock: SinonFakeTimers;

  beforeEach(() => {
    const now = new Date('1970-02-01 09:00:00');
    clock = sinon.useFakeTimers(now.getTime());
  });

  afterEach(() => {
    clock.restore();
  });

  [
    { exp: new Date('1970-02-01 09:10:00') },
    { exp: new Date('1970-02-01 09:00:01') },
    { exp: new Date('1970-02-01 09:00:00') },
  ].forEach(param => {
    it('有効期限内の場合にエラーを投げないこと', () => {
      const exp = (param.exp.getTime() / 1000).toString();
      expect(() => verifyExpirationTime(exp)).not.toThrow();
    });
  });

  it('有効期限切れの場合にエラーを投げること', () => {
    const exp = (new Date('1970-02-01 08:59:59').getTime() / 1000).toString();
    expect(() => verifyExpirationTime(exp)).toThrowError('Expired token.');
  });
});
