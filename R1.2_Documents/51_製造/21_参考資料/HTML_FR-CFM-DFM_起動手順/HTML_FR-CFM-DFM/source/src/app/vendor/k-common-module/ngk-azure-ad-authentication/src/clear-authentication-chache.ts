// ログアウト時にLocalStorageから削除するキー
const clearTarget = /adal\./;

/**
 * LocalStorage 内の認証情報を削除する。
 * adal.js のメソッドを利用せず、ログアウトに必要なパラメーターとして確認済みのものを直接削除
 */
export const clearAuthenticationCache = () => {
  const localStorage = window.localStorage; // alias

  const localStorageKeys = Array.from(Array(localStorage.length)).map((_, idx) =>
    window.localStorage.key(idx),
  );

  localStorageKeys.filter(v => clearTarget.test(v)).forEach(v => localStorage.removeItem(v));
};
