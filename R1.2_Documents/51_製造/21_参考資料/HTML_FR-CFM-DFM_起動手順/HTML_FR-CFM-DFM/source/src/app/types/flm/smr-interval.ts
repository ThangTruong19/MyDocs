export interface SmrIntervalParams {
  smr_interval_item: {
    support_distributor_id?: string;
    label: string;
    inspection_start_smr: string;
    smr_interval?: string;
    smr_interval_kind: string;
    threshold?: string;
    threshold_kind: string;
    target_model_kind: string;
    car_conditions?: CarConditions[];
  };
}

export interface CarConditions {
  division_code?: string;
  division_name?: string;
  maker_code: string;
  maker_name?: string;
  model: string;
  type_rev: string;
}

export interface ModelTypesSmrIntervalParams {
  support_distributor_id?: string;
  maker_code: string;
  model?: string;
}

export interface SmrIntervalIndexParams {
  support_distributor_id?: string;
}

export interface SmrIntervalCarEditParams {
  car: {
    smr_interval_items: {
      update_datetime?: string;
      threshold_kind: string;
      threshold?: string;
      smr_interval_kind: string;
      smr_interval?: string;
      inspection_start_smr: string;
      management_kind: string;
      id: string;
    }[];
  };
}

export interface SmrModalListVal {
  support_distributor_id?: string;
  label: string;
  inspection_start_smr: string;
  smr_interval: string;
  smr_interval_kind: string;
  threshold: string;
  threshold_kind: string;
  target_model_kind: string;
  car_conditions?: CarConditions[];
}
