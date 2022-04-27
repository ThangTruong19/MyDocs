import { decodeJwt } from './decode-jwt';

describe('decodeJwt', () => {
  it('JWTトークンをデコードできること', () => {
    /* tslint:disable */
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    /* tslint:enable */
    const decoded = decodeJwt(token);
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload.sub).toBe('1234567890');
  });

  it('UTFを含むJWTトークンをデコードできること', () => {
    /* tslint:disable */
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuODhuOCueODiCIsImlhdCI6MTUxNjIzOTAyMn0.ZnGi1_4xRXq1Qk7sCewLv8YKAW4HOlNYFQcNGIQqgRs';
    /* tslint:enable */
    const decoded = decodeJwt(token);
    expect(decoded.payload.name).toBe('テスト');
  });

  it('書式を満たさないトークンにはエラーを返すこと', () => {
    const token = 'hoge';
    expect(() => decodeJwt(token)).toThrowError('Cannot decode JWT.');
  });
});
