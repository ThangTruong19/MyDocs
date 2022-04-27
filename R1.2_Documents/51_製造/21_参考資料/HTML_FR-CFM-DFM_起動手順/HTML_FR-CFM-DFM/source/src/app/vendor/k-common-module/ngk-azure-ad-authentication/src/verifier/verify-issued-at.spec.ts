import * as sinon from 'sinon';
import { SinonFakeTimers } from 'sinon';

import { verifyIssuedAt } from './verify-issued-at';

describe('verifyIssuedAt', () => {
  let clock: SinonFakeTimers;

  beforeEach(() => {
    const now = new Date('1970-02-01 09:00:00');
    clock = sinon.useFakeTimers(now.getTime());
  });

  afterEach(() => {
    clock.restore();
  });

  [
    { iat: new Date('1970-02-01 08:53:00') },
    { iat: new Date('1970-02-01 08:50:01') },
    { iat: new Date('1970-02-01 08:50:00') },
  ].forEach(param => {
    it('発行日時からの経過時間が許容範囲内の場合にエラーを投げないこと', () => {
      const iat = (param.iat.getTime() / 1000).toString();
      const allowedElapsedMs = 10 * 60 * 1000; // 発行後10分まで許容
      expect(() => verifyIssuedAt(iat, allowedElapsedMs)).not.toThrow();
    });
  });

  it('発行日時からの経過時間が許容範囲外の場合にエラーを投げること', () => {
    const iat = (new Date('1970-02-01 08:49:59').getTime() / 1000).toString();
    const allowedElapsedMs = 10 * 60 * 1000; // 発行後10分まで許容
    expect(() => verifyIssuedAt(iat, allowedElapsedMs)).toThrowError(
      'This token is too old from iat.',
    );
  });

  it('発行日時が現在時刻より未来の場合にエラーを投げること', () => {
    const iat = (new Date('1970-02-01 09:00:01').getTime() / 1000).toString();
    const allowedElapsedMs = 10 * 60 * 1000; // 発行後10分まで許容
    expect(() => verifyIssuedAt(iat, allowedElapsedMs)).toThrowError(
      'This token is not valid yet.',
    );
  });
});
