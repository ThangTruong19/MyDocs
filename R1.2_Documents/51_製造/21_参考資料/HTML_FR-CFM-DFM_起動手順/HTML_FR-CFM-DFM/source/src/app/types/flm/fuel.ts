export interface FuelParams {
  accumulate_fuel_interval_item: {
    support_distributor_id?: string;
    label: string;
    inspection_start_accumulate_fuel: string;
    accumulate_fuel_interval?: string;
    accumulate_fuel_interval_kind: string;
    threshold?: string;
    threshold_kind: string;
    target_model_kind: string;
    car_conditions?: CarConditions[];
  };
}

export interface CarConditions {
  division_code?: string;
  maker_code: string;
  model: string;
  type_rev: string;
}
