import { StatusCodes } from './status_codes';

export class Error {
    static localStorageError = {
        code: 'E001',
        message:
            'Failed to save to local storage. Please contact our support center.',
    };

    static apiError = {
        code: 'E002',
        message: 'The communication error with the system occurred.',
    };

    static jsonParseError = {
        code: 'E003',
        message: 'Failed to analyze implementation result.',
    };

    static uriError = {
        code: 'E004',
        message: 'URI format invalid.',
    };

    static catalogApiError = {
        code: 'E005',
        message:
            'Application execution failed. Please close the page and access again.If it does not improve please contact our support center.',
    };

    static logApiError = {
        code: 'E006',
        message: '',
    };

    static syntaxError = {
        code: 'C001',
        message: 'Processing can not be continued.',
    };

    static referenceError = {
        code: 'C001',
        message: 'Processing can not be continued.',
    };

    static typeError = {
        code: 'C001',
        message: 'Processing can not be continued.',
    };

    static apiErrorMessages = {
        [StatusCodes.internalServerError]: '(500 Internal Server Error)',
        [StatusCodes.notImplemented]: '(501 Not Implemented)',
        [StatusCodes.badGateway]: '(502 Bad Gateway)',
        [StatusCodes.serviceUnavailable]: '(503 Service Unavailable)',
        [StatusCodes.gatewayTimeOut]: '(504 Gateway Time-out)',
        [StatusCodes.httpVersionNotSupported]: '(505 HTTP Version not supported)',
    };
}
