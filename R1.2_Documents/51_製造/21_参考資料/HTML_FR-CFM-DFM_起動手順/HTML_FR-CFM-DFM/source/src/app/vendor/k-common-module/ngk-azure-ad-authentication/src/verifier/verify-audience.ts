/**
 * トークンの受信者を検証する。
 * このアプリケーション上では、 aud は Azure Portal 上で作成されたアプリケーションの ID となる。
 */
export const verifyAudience = (aud: string, expected: string): void | never => {
  if (aud !== expected) {
    throw new Error(`aud claim verification error (Expected: ${expected}, Received: ${aud})`);
  }
};
