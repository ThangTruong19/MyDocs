export interface CarCustomizedDefinitionResponseData {
    customize_definition_id?: number;
    customize_definition_name?: string;
    assumption_data_value?: number;
    car_customize_data_performances?: CarCustomizeDataPerformances[];
}

export interface CarCustomizeDataPerformances {
    send_no?: string;
    status?: string;
    status_name?: string;
    customized_data_achievement_details?: CustomizedDataAchievementDetails[];
}

export interface CustomizedDataAchievementDetails {
    server_registration_time?: string;
    car_data_creation_time?: string;
}