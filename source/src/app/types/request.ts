export interface RequestHeaderParams {
    'X-Fields'?: string| string[];
    'X-From'?: number;
    'X-Count'?: number;
    'X-Sort'?: string | string[];
}

export interface ConfigHeaderParams {
    'X-TemperatureUnit': string;
    'X-DateFormat': string;
    'X-CarDivision': string;
    'X-Lang': string;
    'X-DistanceUnit': string;
}

export interface RequestParams {
    [key: string]: any;
}

export interface RequestOptions {
    [key: string]: any;
}

export interface RequestConfig {
    url: string;
    method: string;
    params?: RequestParams;
    search?: RequestParams;
}
