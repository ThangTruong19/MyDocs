import * as sinon from 'sinon';

import { AuthenticationContextProvider } from './authentication-context-provider';

declare var require: any;
const AuthenticationContext = require('adal-angular');

export const makeAuthenticationContextProviderWithStub = (mockContext: any) => {
  sinon
    .stub(AuthenticationContextProvider.prototype, 'getAuthenticationContext')
    .returns(mockContext);

  return new AuthenticationContextProvider('dummyClientId', 'dummyTenant', 'dummyUrl');
};

export const makeAuthenticationContextMock = () => {
  const mock = sinon.createStubInstance(AuthenticationContext);
  return mock;
};
