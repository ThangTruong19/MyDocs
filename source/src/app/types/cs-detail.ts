import { ResultHeader } from 'app/types/result-header';
import { Navigation } from 'app/types/navigation';
import { Api, Labels, Resource, Fields } from 'app/types/common';

// API呼出しのレスポンス（初期処理）
export interface InitializeApiResult {
    resource: {
        [key: string]: Resource | { [key: string]: Resource };
    };
    label: Labels & CustomizeSettingLabels;
    functions: ApiResult;
    fields1?: Fields;
    fields2?: Fields;
    fields3?: Fields;
    fields4?: Fields;
    fields5?: Fields;
    fields6?: Fields;
}

// API呼出しのレスポンス
export interface ApiResult extends Api {
    result_header: ResultHeader;
    result_data: ResultData & Navigation;
    status: number;
}

interface ResultData {
    customize_usage_definitions?: CustomizeUsageDefinition[];
}
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
export interface GetCustomizeUsageDefinitionRequestParam {
    cars?: CarRequestParam[];
    request_route_kind?: string;
}

interface CarRequestParam {
    car_id?: string;
}

// 車両カスタマイズ用途定義更新要求API
export interface UpdateCustomizeUsageDefinitionRequestParam {
    request_route_kind?: string;
    instant_kind?: string;
    continuous_kind?: string;
    customize_usage_definition?: CustomizeUsageDefinitionRequestParam[];
}

interface CustomizeUsageDefinitionRequestParam {
    customize_usage_definition_id?: string;
    version?: string;
    request_kind?: string;
    priority?: string;
    date_to?: string;
    date_from?: string;
    active_kind?: string;
}

// 車両カスタマイズ設定要求再送API
export interface RetryCustomizeUsageDefinitionRequestParam {
    customize_definition?: CustomizeDefinitionRequestParam[];
}

interface CustomizeDefinitionRequestParam {
    customize_definition_id?: string;
}

export interface CustomizeSettingLabels {
    [key: string]: string;
    page_title?: string;
    title?: string;
    model_type_rev_serial?: string;
    addition?: string;
    discard_all_edits?: string;
    setting_acquisition_request?: string;
    setting_update_request?: string;
    immediate_setting_update_request?: string;
    communication_charge_confirmation?: string;
    page_count?: string;
    number_of_display?: string;
    page?: string;
    empty_list_message?: string;
    addition_title?: string;
    edit_title?: string;
    confirmation_title?: string;
    customize_definition_detail?: string;
    customize_get_request_message?: string;
    customize_update_request_message?: string;
    customize_update_resend_message?: string;
    customize_update_immediate_reflection_request_message?: string;
    customize_discard_edit_confirm_message?: string;
    customize_transition_confirm_message?: string;
    customize_update_immediate_reflection_request_err?: string;
    customize_update_request_caution_message?: string;
    customize_traffic_caution_message?: string;
    immediate_setting_update_request_message?: string;
    regular_call_customize_data?: string;
    other_customize_data?: string;
    customize_definition_name_label?: string;
    edit_header_label?: string;
    edit_status_header_label?: string;
    discard_header_label?: string;
    retry_header_label?: string;
    default_body_label?: string;
    regist_body_label?: string;
    edit_body_label?: string;
    delete_body_label?: string;
    assumption_data_value_kb_body_label?: string;
    assumption_data_value_number_body_label?: string;
    assumption_data_value_monthly_body_label?: string;
    finish_message?: string;
    cancel?: string;
    close?: string;
    ok_btn?: string;
    immediate_setting_update_request_err?: string;
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

// 編集モード
export enum EditMode {
    Update = 'update', // 更新
    Delete = 'delete', // 削除
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
