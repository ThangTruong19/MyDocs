export interface RequestHeaderParams {
    'X-Fields'?: string;
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
