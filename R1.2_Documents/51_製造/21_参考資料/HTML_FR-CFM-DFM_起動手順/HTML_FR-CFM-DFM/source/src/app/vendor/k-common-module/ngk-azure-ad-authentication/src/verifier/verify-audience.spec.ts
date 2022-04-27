import { verifyAudience } from './verify-audience';

describe('verifyAudience', () => {
  it('audクレームに相違がない場合はエラーを投げないこと', () => {
    const aud = 'audience';
    const expected = 'audience';
    expect(() => verifyAudience(aud, expected)).not.toThrow();
  });

  it('audクレームに相違がない場合はエラーを投げること', () => {
    const aud = 'wrong';
    const expected = 'audience';
    expect(() => verifyAudience(aud, expected)).toThrowError(
      'aud claim verification error (Expected: audience, Received: wrong)',
    );
  });
});
