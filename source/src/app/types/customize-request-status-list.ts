import { ResultHeader } from 'app/types/result-header';
import { Navigation } from 'app/types/navigation';
import { Api, Labels, Resource, Fields } from 'app/types/common';

export interface Item {
    [key: string]: string | string[];
}

export interface GetCustomizeRequestStatusListRequestParam {
    customize_usage_definition_id: string;
    customize_definition_id: string;
    car_identification: CarIdentificationRequestParam;
    request_status: RequestStatusRequestParam;
}

interface CarIdentificationRequestParam {
    division_codes: string[];
    models: string[];
    type_revs: string[];
    serials: string[];
}

interface RequestStatusRequestParam {
    request_kind: string[];
    status: string;
    request_registration_datetime_from: string;
    request_registration_datetime_to: string;
}

export interface InitializeApiResult {
    resource: { [key: string]: Resource | { [key: string]: Resource } };
    label: { [key: string]: string | Labels };
    functions: ApiResult;
    fields?: Fields;
    fieldResources?: Fields;
}

export interface ApiResult extends Api {
    result_header: ResultHeader;
    result_data: ResultData & Navigation;
    status: number;
}

interface ResultData {
    request_status?: RequestStatus[];
}

export interface RequestStatus {
    request_status_information?: RequestStatusInformation;
    car_identification?: {
        id?: string;
        model?: string;
        type_rev?: string;
        serial?: string;
        division_name?: string;
    };
    customize_usage_definitions?: CustomizeUsageDefinition[];
    customize_definitions?: CustomizeDefinition[];
}

interface RequestStatusInformation {
    request_kind?: string;
    request_kind_name?: string;
    request_datetime?: string;
    status?: string;
    status_name?: string;
}

interface CustomizeUsageDefinition {
    id?: string;
    name?: string;
}

interface CustomizeDefinition {
    id?: string;
    name?: string;
}
