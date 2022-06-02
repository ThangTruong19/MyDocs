export interface CustomizeRequestStatusListIndexParams {
    customize_usage_definition_id: string;
    customize_definition_id: string;
    car_identification: {
        division_codes: string[];
        models: string[];
        type_revs: string[];
        serials: string[];
    };
    request_status: {
        request_kind: string[];
        status: string;
        request_registration_datetime_from: string;
        request_registration_datetime_to: string;
    };
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
