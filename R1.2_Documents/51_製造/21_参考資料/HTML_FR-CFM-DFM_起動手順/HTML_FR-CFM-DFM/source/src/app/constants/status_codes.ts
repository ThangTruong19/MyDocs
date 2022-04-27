/**
 * HTTP ステータスコード 設定
 */
export class StatusCodes {
  static ok = 200;
  static noContent = 204;
  static multiStatus = 207;
  static badRequest = 400;
  static unauthorized = 401;
  static internalServerError = 500;
  static notImplemented = 501;
  static badGateway = 502;
  static serviceUnavailable = 503;
  static gatewayTimeOut = 504;
  static httpVersionNotSupported = 505;
  static fatalError = 0;
}
