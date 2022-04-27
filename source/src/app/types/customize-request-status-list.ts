export interface CustomizeRequestStatusListIndexParams {
    customize_usage_definition_id: string
    customize_definition_id: string
    car_identification: {
        division_codes: string[]
        models: string[]
        type_revs: string[]
        serials: string[]
    },
    request_status: {
        api_code: string
        status: string
        request_registration_date_from: string
        request_registration_date_to: string
    },
}
