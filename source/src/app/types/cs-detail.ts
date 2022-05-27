export interface CustomizeUsageDefinition {
    customize_usage_definition?: CustomizeUsageDefinitionContent
    edit_status?: string
    edit_status_name?: string
}

interface CustomizeUsageDefinitionContent {
    customize_usage_definition_id?: string
    customize_usage_definition_name?: string
    customize_usage_definition_version?: number
    start_date?: string
    end_date?: string
    priority?: string
    priority_name?: string
    use_kind?: string
    use_name?: string
    customize_definitions?: CustomizeDefinition[]
}

interface CustomizeDefinition {
    customize_definition_id?: string
    customize_definition_name?: string
    customize_definition_version?: number
    priority?: string
    priority_name?: string
    active_kind?: string
    active_name?: string
    latest_operation_code?: string
    latest_operation_code_name?: string
    status?: string
    status_name?: string
    assumption_data_value?: number
    assumption_data_value_header?: number
    start_date?: string
    end_date?: string
    first_receive_datetime?: string
    latest_receive_datetime?: string
    aggregation_condition_id?: string
    aggregation_condition_name?: string
    aggregation_opportunity_kind?: string
    aggregation_opportunity_kind_name?: string
    send_condition_id?: string
    send_condition_name?: string
    send_opportunity_kind?: string
    send_opportunity_kind_name?: string
    customize_access_level?: string
    customize_access_level_name?: string
    process_type?: string
    process_type_name?: string
}

// 車両カスタマイズ用途定義一括取得要求API
export interface RequestBodyParamsKOM00110120 {
    cars?: RequestBodyParamsKOM00110120Car[],
    request_route_kind?: string
}

interface RequestBodyParamsKOM00110120Car {
    car_id?: string
}

// 車両カスタマイズ用途定義更新要求API
export interface RequestBodyParamsKOM00110130 {
    car_id?: string
    request_route_kind?: string
    instant_kind?: string
    continuous_kind?: string
    customize_usage_definition?: RequestBodyParamsKOM00110130CustomizeUsageDefinition[]
}

interface RequestBodyParamsKOM00110130CustomizeUsageDefinition {
    customize_usage_definition_id?: string
    version?: string
    request_kind?: string
    priority?: string
    date_to?: string
    date_from?: string
    active_kind?: string
}

// 車両カスタマイズ設定要求再送API
// TODO:
export interface RequestBodyParamsKOM00110XXX {
    car_id?: string
    customize_definition?: RequestBodyParamsKOM00110XXXCustomizeDefinition[]
}

interface RequestBodyParamsKOM00110XXXCustomizeDefinition {
    customize_definition_id?: string
}
