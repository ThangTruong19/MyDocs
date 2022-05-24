export interface SettingParams {
    user_settings: SettingParamsItem[];
    group_settings?: SettingParamsItem[];
}

export interface SettingParamsItem {
    value: string;
    key: string;
}

export interface UserSettingValues {
    userSettings: UserSettings;
    groupSettings: GroupSettings;
}

export interface UserSettings {
    lang_code: string;
    date_format_code: string;
    distance_unit_code: string;
    temperature_unit_code?: string;
    division_display_kind?: string;
    map_magnification: string;
    map_longitude: string;
    map_latitude: string;
    default_page_url?: string;
}

export interface GroupSettings {
    map_mode: string;
    time_difference: string;
    first_day_of_week_kind: string;
    display_count: string;
}

export interface MapParams {
    lat: string;
    lng: string;
    zoom: string;
    mapApplication: string;
    maxPoint?: string;
}
