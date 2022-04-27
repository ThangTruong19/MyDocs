export interface ModelSettingSearchParams {
  group_id?: string;
  maker_code?: string;
  division_code?: string;
  models?: string;
  active_kind?: string;
}

export interface Model {
  model: string;
  active_kind: string;
  id?: string;
  maker_code?: string;
  active_name?: string;
}

export interface MakerDivision {
  maker_id: string;
  maker_code: string;
  maker_name: string;
  division_id: string;
  division_code: string;
  division_name: string;
  models: Model[];
}

export interface ModelSettingData {
  model_setting: {
    update_datetime: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    maker_divisions: MakerDivision[];
  };
}

export interface ModelForUpdate {
  maker_code: string;
  model: string;
  active_kind: string;
}

export interface ModelSettingUpdateParams {
  model_setting: {
    update_datetime: string;
    group_id: string;
    models: ModelForUpdate[];
  };
}
