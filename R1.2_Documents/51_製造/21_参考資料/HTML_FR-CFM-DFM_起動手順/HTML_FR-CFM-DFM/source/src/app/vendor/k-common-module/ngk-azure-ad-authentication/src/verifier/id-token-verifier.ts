import { decodeJwt } from './decode-jwt';
import { verifyAlgorithm } from './verify-algorithm';
import { verifyAudience } from './verify-audience';
import { verifyIssuer } from './verify-issuer';
import { verifyIssuedAt } from './verify-issued-at';
import { verifyExpirationTime } from './verify-expiration-time';

const expectedAlg = 'RS256';
const openIdConfigurationOrigin = 'https://login.microsoftonline.com';
const allowedElapsedMsFromIssuedAt = 10 * 60 * 1000; // 発行から10分間を許容

const noop = () => {};

export class IdTokenVerifier {
  constructor(private audience: string, private tenant: string) {}

  verify(token: string): Promise<void | never> {
    const jwt = decodeJwt(token);

    return Promise.all([
      verifyIssuer(jwt.payload.iss, openIdConfigurationOrigin, this.tenant),
      verifyAlgorithm(jwt.header.alg, expectedAlg),
      verifyAudience(jwt.payload.aud, this.audience),
      verifyIssuedAt(jwt.payload.iat, allowedElapsedMsFromIssuedAt),
      verifyExpirationTime(jwt.payload.exp),
    ]).then(noop);
  }
}
