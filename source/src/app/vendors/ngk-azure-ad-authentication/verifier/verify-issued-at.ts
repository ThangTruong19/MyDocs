/**
 * トークンの発行日時を検証する。
 * 発行から許容される時間をすぎていた場合には拒絶する。
 */
export const verifyIssuedAt = (iat: string, allowdElapsedMs: number): void | never => {
  const now = new Date();
  const iatDate = new Date(0);
  iatDate.setUTCSeconds(parseInt(iat, 10));
  const diffMs = now.getTime() - iatDate.getTime();

  if (diffMs < 0) {
    throw new Error('This token is not valid yet.');
  }

  if (diffMs > allowdElapsedMs) {
    throw new Error('This token is too old from iat.');
  }
};
