import * as sinon from 'sinon';

import { AuthenticationContextProvider } from './authentication-context-provider';
import {
  makeAuthenticationContextMock,
  makeAuthenticationContextProviderWithStub,
} from './authentication-context-provider.mock';

const restoreStubbedProvider = () => {
  (AuthenticationContextProvider.prototype.getAuthenticationContext as sinon.SinonStub).restore();
};

describe('AuthenticationContextProvider', () => {
  let service: AuthenticationContextProvider;
  let authenticationContext: any;

  describe('getAccessToken', () => {
    const dummyToken = 'dummyToken';

    beforeEach(() => {
      authenticationContext = makeAuthenticationContextMock();
      service = makeAuthenticationContextProviderWithStub(authenticationContext);
    });

    afterEach(() => {
      restoreStubbedProvider();
    });

    describe('正常系', () => {
      const parameterized = (err: null | undefined) => {
        it('トークンの取得に成功した場合、トークンが返される', done => {
          authenticationContext.acquireToken.callsArgWith(1, err, dummyToken, err);

          service.getAccessToken().then(actual => {
            expect(actual).toEqual(dummyToken);
            done();
          });
        });
      };

      // adal.js が error を null および undefined で返すのでそのテスト
      parameterized(null);
      parameterized(undefined);
    });

    describe('異常系', () => {
      it('トークンの取得に失敗した場合、エラーがキャッチできる', done => {
        authenticationContext.acquireToken.callsArgWith(1, 'Error!', null, 'dummy_error');

        service
          .getAccessToken()
          .then(() => {
            done.fail('Promise should not be resolved.');
          })
          .catch(() => {
            done();
          });
      });
    });
  });
});
