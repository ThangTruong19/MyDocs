interface DecodedJwtHeader {
  alg: string;
  [k: string]: string;
}

interface DecodedJwtPayload {
  aud: string;
  iss: string;
  iat: string;
  exp: string;
  [k: string]: any;
}

interface DecodeJwtOutput {
  header: DecodedJwtHeader;
  payload: DecodedJwtPayload;
  encoded: {
    header: string;
    payload: string;
    signature: string;
  };
}

const decodeBase64ToJson = (base64: string): Object => {
  const replaced = base64.replace(/\-/g, '+').replace(/_/g, '/');
  const jsonString = decodeURIComponent(
    atob(replaced)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  return JSON.parse(jsonString);
};

export const decodeJwt = (token: string): DecodeJwtOutput => {
  const sections = token.split('.');
  let header: DecodedJwtHeader;
  let payload: DecodedJwtPayload;

  if (sections.length !== 3) {
    throw new Error('Cannot decode JWT.');
  }

  try {
    header = decodeBase64ToJson(sections[0]) as DecodedJwtHeader;
    payload = decodeBase64ToJson(sections[1]) as DecodedJwtPayload;
  } catch (error) {
    throw new Error('Token is not valid JSON.');
  }

  return {
    header,
    payload,
    encoded: {
      header: sections[0],
      payload: sections[1],
      signature: sections[2],
    },
  };
};
