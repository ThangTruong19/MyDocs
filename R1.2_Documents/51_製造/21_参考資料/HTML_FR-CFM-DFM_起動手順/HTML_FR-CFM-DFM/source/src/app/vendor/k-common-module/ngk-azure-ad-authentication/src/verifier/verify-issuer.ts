import unfetch from 'unfetch';

/**
 * トークンの発行者を検証する。
 * OpenID Provider Configuration Response のレスポンスを利用して行う。
 */
export const verifyIssuer = async (
  iss: string,
  origin: string,
  tenant: string,
): Promise<void | never> => {
  const url = `${origin}/${tenant}/.well-known/openid-configuration`;
  const res = await unfetch(url);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = await res.json();

  if (iss !== data.issuer) {
    throw new Error(`iss claim verification error (Expected: ${data.issuer}, Received: ${iss})`);
  }
};
