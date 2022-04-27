export interface HistoryIndexParams {
  operation_history: {
    date_from?: string;
    date_to?: string;
    app_code?: string;
    category_code?: string;
    code?: string;
    group_kind_id?: string;
    group_id?: string;
    model?: string;
    type_rev?: string;
    serials?: string[];
    maker_code?: string;
    division_code?: string;
    search_keyword?: string;
  };
}

export interface HistoryFileCreateParams extends HistoryIndexParams {
  file_create_condition: {
    file_label?: string;
    file_content_type: string;
    processing_type: string;
    file_request_label?: string;
  };
}
