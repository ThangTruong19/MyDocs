/**
 * HTTPステータスコードの定数定義。
 */
export class HttpStatusCodeConst {

    public static readonly BAD_REQUEST = 400;

    public static readonly UNAUTHORIZED = 401;

    public static readonly INTERNAL_SERVER_ERROR = 500;

    public static readonly NOT_IMPLEMENTED = 501;

    public static readonly BAD_GATEWAY = 502;

    public static readonly SERVICE_UNAVAILABLE = 503;

    public static readonly GATEWAY_TIMEOUT = 504;

    public static readonly HTTP_VERSION_NOT_SUPPORTED = 505;


    public static readonly HTTP_STATUS_CODE_MESSAGE: { [key: number]: string } = {
        [HttpStatusCodeConst.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
        [HttpStatusCodeConst.NOT_IMPLEMENTED]: 'Not Implemented',
        [HttpStatusCodeConst.BAD_GATEWAY]: 'Bad Gateway',
        [HttpStatusCodeConst.SERVICE_UNAVAILABLE]: 'Service Unavailable',
        [HttpStatusCodeConst.GATEWAY_TIMEOUT]: 'Gateway Timeout',
        [HttpStatusCodeConst.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version not supported'
    };

}
