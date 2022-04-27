export type OperatorCarIdInputIndexCarIdParams = OperatorDetailsParams;
export type OperatorCarIdKeyIndexCarIdParams = OperatorDetailsParams;
interface OperatorDetailsParams {
  common: {
    car_identification: {
      car_ids: string[];
    };
    customer?: {
      ids: string[];
    };
  };
}

export interface OperatorIndexParams {
  customer_id?: string;
  operator_label?: string[];
  car_id?: string[];
}

export interface OperatorUpdateParams {
  customer_id: string;
  operators: {
    id: string;
    current_label: {
      label: string;
    };
    update_datetime: string;
  }[];
}

export interface OperatorRegistParams {
  customer_id: string;
  operators: Operator[];
}

export interface Operator {
  code: string;
  current_label: {
    label: string;
  };
}

export interface OperatorDeleteParams {
  operator: string[];
}

export interface OperatorTemplateCreateParams {
  customer_id?: string;
  file_label?: string;
  file_content_type: string;
}

export interface OperatorIdKeyIndexParams {
  customer_id?: string;
  operator_label?: string;
}

export interface OperatorIdKeyUpdateParams {
  customer_id?: string;
  id_keys: OperatorIdKey[];
}

export interface CreateFileParams {
  customer_id?: string;
  operator_label?: string | string[];
  file_label?: string;
  file_content_type: string;
  processing_type: string;
  file_request_label?: string;
}

export interface OperatorIdKey {
  code: string;
  current_operator: {
    code: string;
  };
  update_datetime: string;
}

export interface OperatorCarIdInputIndexParams {
  common: {
    customer: {
      ids: string[];
    };
    car_identification: {
      models: string[];
      division_ids: string[];
      type_revs: string[];
      serials: string[];
    };
    customer_attribute: {
      customer_management_no: string[];
      customer_car_no: string[];
    };
    target_car_group_ids: string[];
  };
  car_operator_id_input: {
    operator_identification_kind: string;
    registration_status_kind: string;
    operator_code: string[];
    operator_label: string[];
  };
}

export interface OperatorCarIdInputUpdateParams {
  operator_codes: string[];
  car_ids: string[];
  id_hold_time: string;
}

export interface OperatorCarIdInputDeleteParams {
  car_id: string[];
  operator_code: string[];
}

export interface OperatorCarIdKeyIndexParams {
  common: {
    target_car_group_id: string;
    customer: {
      ids: string[];
    };
    car_identification: {
      division_codes: string[];
      models: string[];
      type_revs: string[];
      serials: string[];
    };
    customer_attribute: {
      customer_management_no: string[];
      customer_car_no: string[];
    };
  };
  car_operator_id_key: {
    operator_identification_kind: string;
    registration_status_kind: string;
  };
}

export interface OperatorCarIdKeyUpdateParams {
  car_ids: string[];
}

export interface DisableOperatorIdentificationParams {
  car_id: string[];
}
