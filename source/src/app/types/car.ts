export interface CarParams {
    car: {
        car_identification: {
            maker_id: string;
            model_id: string;
            type: string;
            serial: string;
            update_datetime: string;
            initial_smr?: string;
        };
        user_permission_sub_group_ids?: string[];
        komtrax_unit: {
            terminal_component: {
                part?: string;
                serial?: string;
            };
        };
        distributor_attribute: {
            debit_kind?: string;
            free_memo?: string;
            new_used_kind: string;
            delivery_date?: string;
            used_delivery_date?: string;
            used_delivery_smr?: string;
            production_year_month?: string;
            asset_status_kind?: string;
            asset_owner_id?: string;
            spec_pattern_id?: string;
            note_1?: string;
            note_2?: string;
            note_3?: string;
            note_4?: string;
            note_5?: string;
            class_1_id?: string;
            class_2_id?: string;
            class_3_id?: string;
            class_4_id?: string;
            class_5_id?: string;
            custom_car_attribute_1_detail_id?: string;
            custom_car_attribute_2_detail_id?: string;
            custom_car_attribute_3_detail_id?: string;
            custom_car_attribute_4_detail_id?: string;
            custom_car_attribute_5_detail_id?: string;
            custom_car_attribute_6_detail_id?: string;
            custom_car_attribute_7_detail_id?: string;
            custom_car_attribute_8_detail_id?: string;
            custom_car_attribute_9_detail_id?: string;
            custom_car_attribute_10_detail_id?: string;
            stock_status_update_date?: string;
            intended_purpose_code?: string;
            data_publish_kind: string;
        };
        support_distributor_id?: string;
        customer_id: string;
        bank_id?: string;
        insurance_id?: string;
        finance_id?: string;
        car_management_attribute: {
            registration_car_kind?: string;
            time_difference: string;
        };
    };
}

export interface CarIdSearchParams {
    common: {
        car_identification: {
            car_ids: string[];
        };
    };
}

export interface RegistControlParams {
    car: {
        car_identification: {
            maker_id: string;
            model_id: string;
            type: string;
            serial: string;
        };
        support_distributor_id?: string;
        car_management_attribute?: {
            registration_car_kind?: string;
        };
    };
}

export interface OrbcommApplyParams {
    orbcomm_request: {
        nation_id: string;
    };
}

export interface TerminalStartSettingParams {
    cars: {
        car_identification: {
            update_datetime: string;
            id: string;
        };
    }[];
}

export interface UpdateCarParams {
    car: {
        car_identification: {
            maker_id?: string;
            model_id?: string;
            type_rev?: string;
            serial?: string;
            initial_smr?: string;
            update_datetime?: string;
        };
        user_permission_sub_group_ids?: string[];
        distributor_attribute: {
            debit_kind?: string;
            free_memo?: string;
            new_used_kind?: string;
            delivery_date?: string;
            used_delivery_date?: string;
            used_delivery_smr?: string;
            production_year_month?: string;
            asset_status_kind?: string;
            asset_owner_id?: string;
            spec_pattern_id?: string;
            note_1?: string;
            note_2?: string;
            note_3?: string;
            note_4?: string;
            note_5?: string;
            class_1_id?: string;
            class_2_id?: string;
            class_3_id?: string;
            class_4_id?: string;
            class_5_id?: string;
            custom_car_attribute_1_detail_id?: string;
            custom_car_attribute_2_detail_id?: string;
            custom_car_attribute_3_detail_id?: string;
            custom_car_attribute_4_detail_id?: string;
            custom_car_attribute_5_detail_id?: string;
            custom_car_attribute_6_detail_id?: string;
            custom_car_attribute_7_detail_id?: string;
            custom_car_attribute_8_detail_id?: string;
            custom_car_attribute_9_detail_id?: string;
            custom_car_attribute_10_detail_id?: string;
            stock_status_update_date?: string;
            intended_purpose_code?: string;
            data_publish_kind?: string;
        };
        customer_id?: string;
        bank_id?: string;
        insurance_id?: string;
        finance_id?: string;
        car_management_attribute: {
            time_difference: string;
        };
    };
}

export interface TerminalChangeParams {
    car: {
        komtrax_unit: {
            terminal_component: {
                serial?: string;
                part?: string;
            };
        };
        car_identification: {
            initial_smr: string;
            update_datetime: string;
        };
    };
}

export interface OperatorInitSearchParams {
    common?: {
        car_identification?: {
            division_codes?: string[] | string;
            maker_codes?: string[] | string;
            models?: string[] | string;
            serials?: string[] | string;
            type_revs?: string[] | string;
        };
        customer?: {
            ids?: string[] | string;
        };
        customer_attribute?: {
            customer_management_no?: string[] | string;
        };
        service_distributor?: {
            ids?: string[] | string;
        };
        support_distributor?: {
            ids?: string[] | string;
        };
        target_car_group_id?: string;
    };
    car_management?: {
        operator_identification_kind?: string[] | string;
    };
}

export interface CarTemplateCreateParams {
    support_distributor_id?: string[];
    file_label?: string;
    file_content_type: string;
}

export interface CarMgtListFileCreateParams {
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

export interface TerminalChangeDisplayData {
    common: {
        car_identification: {
            maker_name: string;
            models: string;
            type_revs: string;
            serials: string;
        };
    };
    car: {
        support_distributor: {
            label?: string;
        };
    };
    modem: {
        serial: string;
        part: string;
    };
}

export interface TimeDifferenceSettingParams {
    cars: {
        update_datetime: string;
        time_difference: string;
        car_id: string;
    }[];
}

export interface CarLatest {
    latest_status: {
        event_datetime: string;
        altitude: number;
        communication_datetime: string;
        place: string;
        point: {
            coordinates: number[];
            type: string;
        };
        accumulate_fuel_interval: number;
        smr_date: string;
        smr: number;
        altitude_measure_datetime: string;
        measure_datetime: string;
        place_get_datetime: string;
    };
    car_identification: {
        rev: string;
        maker_name: string;
        maker_code: string;
        model: string;
        model_type_id: string;
        icon_font_no: string;
        division_id: string;
        model_id: string;
        update_datetime: string;
        serial: string;
        production_date: string;
        pin: string;
        maker_id: string;
        type: string;
        id: string;
        initial_smr: string;
        division_name: string;
        type_rev: string;
        division_code: string;
    };
}

export interface SupportDistributorChangeConsignorParams {
    cars: {
        change_support_distributor_id: string;
        car_id: string;
    }[];
}
