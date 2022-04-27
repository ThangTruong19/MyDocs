/**
 * トークンの有効期限が切れていないことを検証する。
 */
export const verifyExpirationTime = (exp: string): void | never => {
  const now = new Date();
  const expDate = new Date(0);
  expDate.setUTCSeconds(parseInt(exp, 10));

  if (now > expDate) {
    throw new Error('Expired token.');
  }
};
