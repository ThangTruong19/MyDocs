/**
 * トークンの署名に使用されたアルゴリズムを検証する
 */
export const verifyAlgorithm = (alg: string, expected: string): void | never => {
  if (alg !== expected) {
    throw new Error(`alg claim verification error (Expected: ${expected}, Received: ${alg})`);
  }
};
