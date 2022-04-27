import { verifyAlgorithm } from './verify-algorithm';

describe('verifyAlgorithm', () => {
  it('algクレームに相違がない場合はエラーを投げないこと', () => {
    const alg = 'RS256';
    const expected = 'RS256';
    expect(() => verifyAlgorithm(alg, expected)).not.toThrow();
  });

  it('algクレームに相違がない場合はエラーを投げること', () => {
    const alg = 'HS256';
    const expected = 'RS256';
    expect(() => verifyAlgorithm(alg, expected)).toThrowError(
      'alg claim verification error (Expected: RS256, Received: HS256)',
    );
  });
});
