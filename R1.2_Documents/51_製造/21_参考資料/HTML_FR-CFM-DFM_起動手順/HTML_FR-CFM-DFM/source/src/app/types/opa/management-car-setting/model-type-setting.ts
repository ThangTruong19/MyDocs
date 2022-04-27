export interface ModelTypeSettingSearchParams {
  group_id?: string;
  maker_code?: string;
  division_code?: string;
  models?: string;
  active_kind?: string;
}

export interface Type {
  id: string;
  type_rev: string;
  active_kind: string;
  active_name: string;
  icon_font: {
    id: string;
    no: string;
  };
}

export interface Model {
  maker_id: string;
  maker_code: string;
  maker_name: string;
  division_id: string;
  division_code: string;
  division_name: string;
  model_id: string;
  model: string;
  types: Type[];
}

export interface ModelTypeSettingData {
  model_type_setting: {
    update_datetime: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    models: Model[];
  };
}

export interface ModelTypeForUpdate {
  maker_code: string;
  model: string;
  type_rev: string;
  active_kind: string;
}

export interface ModelTypeSettingUpdateParams {
  model_type_setting: {
    update_datetime: string;
    group_id: string;
    model_types: ModelTypeForUpdate[];
  };
}
