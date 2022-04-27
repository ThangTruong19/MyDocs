export interface DivisionSettingSearchParams {
  group_id?: string;
  active_kind?: string;
}

export interface Division {
  id: string;
  code: string;
  name: string;
  active_kind: string;
  active_name: string;
}

export interface DivisionSettingData {
  division_setting: {
    update_datetime: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    divisions: Division[];
  };
}

export interface DivisionForUpdate {
  code: string;
  active_kind: string;
}

export interface DivisionSettingUpdateParams {
  division_setting: {
    update_datetime: string;
    group_id: string;
    divisions: DivisionForUpdate[];
  };
}
