export interface HistoryMgtListIndexParams {
    customize_operation_history: {
        date_from?: string;
        date_to?: string;
        category_code?: string;
        code?: string;
        group_id?: string;
        model?: string;
        type_rev?: string;
        serials?: string[];
        maker_code?: string;
        division_code?: string;
        search_keyword?: string;
        customize_definition_id?: string;
        customize_usage_definition_id?: string;
    };
}

export interface HistoryMgtListFileCreateParams {
    operation_history: {
        date_from?: string;
        date_to?: string;
        category_code?: string;
        code?: string;
        group_id?: string;
        model?: string;
        type_rev?: string;
        serials?: string[];
        maker_code?: string;
        division_code?: string;
        search_keyword?: string;
        customize_definition_id?: string;
        customize_usage_definition_id?: string;
    };
    file_create_condition: {
        file_label?: string;
        file_content_type: string;
        processing_type: string;
        file_request_label?: string;
    };
}
