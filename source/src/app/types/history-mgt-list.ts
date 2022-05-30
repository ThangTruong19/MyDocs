export interface HistoryMgtListIndexParams {
    operation_history?: {
        date_from?: string
        date_to?: string
        category_code?: string
        code?: string
        group_id?: string
        model?: string[]
        type_rev?: string[]
        serials?: string[]
        division_code?: string
        search_keyword?: string
        customize_definition_id?: string
        customize_usage_definition_id?: string
    }
}

export interface HistoryMgtListFileCreateParams {
    operation_history?: {
        date_from?: string
        date_to?: string
        category_code?: string
        code?: string
        group_id?: string
        model?: string
        type_rev?: string
        serials?: string[]
        division_code?: string
        customize_usage_definition_id?: string
        customize_definition_id?: string
        setting_change_status?: string
        search_keyword?: string
    },
    file_create_condition?: {
        file_label?: string
        file_content_type?: string
        processing_type?: string
        file_request_label?: string
    }
}

export interface OperationHistory {
    datetime?: string
    group_id?: string
    group_label?: string
    group_label_english?: string
    user_label?: string
    category_code?: string
    code?: string
    category_name?: string
    name?: string
    model?: string
    type_rev?: string
    serial?: string
    division_name?: string
    content?: string
    supplementary_informations?: SupplementaryInformation[]
    app_code?: string
    app_name?: string
    kind?: string
    kind_name?: string
    customize_definition_id?: string
    customize_definition_label?: string
    customize_usage_definition_id?: string
    customize_usage_definition_label?: string
}

interface SupplementaryInformation {
    code?: string
    name?: string
    value?: string
}
