import { clearAuthenticationCache } from './clear-authentication-chache';

describe('clearAuthenticationCache', () => {
  beforeEach(() => {
    window.localStorage.setItem('adal.dummy1', 'dummy1');
    window.localStorage.setItem('adal.dummy2', 'dummy2');
    window.localStorage.setItem('dummy', 'dummy');
  });

  it('LocalStorageからログアウトに必要なパラメータが削除される', () => {
    clearAuthenticationCache();
    expect(window.localStorage.getItem('adal.dummy1')).toBeNull();
    expect(window.localStorage.getItem('adal.dummy2')).toBeNull();
    expect(window.localStorage.getItem('dummy')).toBe('dummy');
  });
});
