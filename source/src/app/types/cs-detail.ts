// カスタマイズ用途定義情報
export interface CustomizeUsageDefinition {
    customize_usage_definition?: CustomizeUsageDefinitionContent;
    edit_status?: string;
    edit_status_name?: string;
}

interface CustomizeUsageDefinitionContent {
    customize_usage_definition_id?: string;
    customize_usage_definition_name?: string;
    customize_usage_definition_version?: number;
    start_date?: string;
    end_date?: string;
    priority?: string;
    priority_name?: string;
    use_kind?: string;
    use_name?: string;
    customize_definitions?: CustomizeDefinition[];
}

interface CustomizeDefinition {
    customize_definition_id?: string;
    customize_definition_name?: string;
    customize_definition_version?: number;
    priority?: string;
    priority_name?: string;
    active_kind?: string;
    active_name?: string;
    latest_operation_code?: string;
    latest_operation_code_name?: string;
    status?: string;
    status_name?: string;
    assumption_data_value?: number;
    assumption_data_value_header?: number;
    start_date?: string;
    end_date?: string;
    first_receive_datetime?: string;
    latest_receive_datetime?: string;
    aggregation_condition_id?: string;
    aggregation_condition_name?: string;
    aggregation_opportunity_kind?: string;
    aggregation_opportunity_kind_name?: string;
    send_condition_id?: string;
    send_condition_name?: string;
    send_opportunity_kind?: string;
    send_opportunity_kind_name?: string;
    customize_access_level?: string;
    customize_access_level_name?: string;
    process_type?: string;
    process_type_name?: string;
}

// 行データ
export interface Item {
    [key: string]: string | CustomizeUsageDefinition;
    customize_usage_definitions?: CustomizeUsageDefinition;
}

// 車両カスタマイズ用途定義一括取得要求API
export interface RequestBodyParamsKOM00110120 {
    cars?: RequestBodyParamsKOM00110120Car[];
    request_route_kind?: string;
}

interface RequestBodyParamsKOM00110120Car {
    car_id?: string;
}

// 車両カスタマイズ用途定義更新要求API
export interface RequestBodyParamsKOM00110130 {
    request_route_kind?: string;
    instant_kind?: string;
    continuous_kind?: string;
    customize_usage_definition?: RequestBodyParamsKOM00110130CustomizeUsageDefinition[];
}

interface RequestBodyParamsKOM00110130CustomizeUsageDefinition {
    customize_usage_definition_id?: string;
    version?: string;
    request_kind?: string;
    priority?: string;
    date_to?: string;
    date_from?: string;
    active_kind?: string;
}

// 車両カスタマイズ設定要求再送API
export interface RequestBodyParamsKOM00110140 {
    customize_definition?: RequestBodyParamsKOM00110140CustomizeDefinition[];
}

interface RequestBodyParamsKOM00110140CustomizeDefinition {
    customize_definition_id?: string;
}

// 最新設定種別
export enum LatestOperationCode {
    Regist = '1', // 追加
    Update = '2', // 更新
    Delete = '3', // 削除
    ImmediateRegist = '11', // 即時追加
    ImmediateUpdate = '12', // 即時更新
}

// 実施内容
export enum RequestKind {
    Regist = '0', // 追加
    Delete = '1', // 削除
    Update = '2', // 更新
}

// 要求経路区分
export enum RequestRouteKind {
    Unspecified = '0', // 指定なし
}

// 即時反映
export enum InstantKind {
    Regular = '0', // 通常
    Immediate = '1', // 即時
}

// ステータス
export enum Status {
    SendError = '40', // 送信失敗
}

// 編集状態
export enum EditStatus {
    Default = '0', // デフォルト
    Regist = '1', // 追加
    Edit = '2', // 変更
    Delete = '3', // 削除
}

// モーダルサイズ
export enum Size {
    Sm = 'sm',
    Lg = 'lg',
    Xl = 'xl',
}

// アラート種別
export enum Alert {
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Danger = 'danger',
}