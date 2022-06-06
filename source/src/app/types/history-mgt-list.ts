import { ResultHeader } from 'app/types/result-header';
import { Navigation } from 'app/types/navigation';
import { Api, Labels, Resource, Fields } from 'app/types/common';

export interface Item {
    [key: string]: string | string[];
}

export interface GetHistoryMgtListRequestParam {
    operation_history: OperationHistoryRequestParam;
}

export interface PrintHistoryMgtListRequestParam {
    operation_history: OperationHistoryRequestParam;
    file_create_condition: FileCreateConditionRequestParam;
}

interface OperationHistoryRequestParam {
    date_from?: string;
    date_to?: string;
    category_code?: string;
    code?: string;
    group_id?: string;
    model?: string;
    type_rev?: string;
    serials?: string[];
    division_code?: string;
    customize_usage_definition_id?: string;
    customize_definition_id?: string;
    setting_change_status?: string;
    search_keyword?: string;
}

interface FileCreateConditionRequestParam {
    file_label?: string;
    file_content_type?: string;
    processing_type?: string;
    file_request_label?: string;
}

export interface InitializeApiResult {
    resource: {
        [key: string]: Resource | { [key: string]: Resource };
        operation_history?: { [key: string]: Resource };
    };
    label: { [key: string]: string | Labels };
    functions: ApiResult;
    fields?: Fields;
    fieldResources?: Fields;
    downloadFields?: Fields;
    downloadFieldResources?: Fields;
}

export interface ApiResult extends Api {
    result_header: ResultHeader;
    result_data: FileId & OperationHistories & Navigation;
    status: number;
}

interface FileId {
    file_id?: string;
}

interface OperationHistories {
    operation_histories?: OperationHistory[];
}

interface OperationHistory {
    datetime?: string;
    group_id?: string;
    group_label?: string;
    group_label_english?: string;
    user_label?: string;
    category_code?: string;
    code?: string;
    category_name?: string;
    name?: string;
    model?: string;
    type_rev?: string;
    serial?: string;
    division_name?: string;
    content?: string;
    supplementary_informations?: SupplementaryInformation[];
    app_code?: string;
    app_name?: string;
    kind?: string;
    kind_name?: string;
    customize_definition_id?: string;
    customize_definition_label?: string;
    customize_usage_definition_id?: string;
    customize_usage_definition_label?: string;
}

interface SupplementaryInformation {
    code?: string;
    name?: string;
    value?: string;
}
