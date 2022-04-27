import { Model } from './model-type-setting';

export interface CustomDivisionRegistParams {
  custom_division: {
    group_id?: string;
    names: CustomDivisionName[];
    car_conditions: CustomDivisionCarCondition[];
  };
}

export type CustomDivisionEditParams = CustomDivisionRegistParams & {
  custom_division: {
    update_datetime: string;
  };
};

export interface CustomDivisionName {
  label: string;
  lang_code: string;
}

export interface CustomDivisionCarCondition {
  type_rev: string;
  model: string;
  division_code: string;
  maker_code: string;
}

export interface CustomDivisionSearchParams {
  group_id?: string;
  custom_division_id?: string;
}

export interface CustomDivisionData {
  update_datetime: string;
  group_id: string;
  group_label: string;
  group_label_english: string;
  group_kind_id: string;
  group_kind_name: string;
  id: string;
  names: {
    label: string;
    lang_code: string;
    lang_name: string;
  }[];
  models: Model[];
}
