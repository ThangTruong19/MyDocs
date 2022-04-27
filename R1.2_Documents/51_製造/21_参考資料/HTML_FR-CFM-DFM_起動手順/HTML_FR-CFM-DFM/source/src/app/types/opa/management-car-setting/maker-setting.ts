export interface MakerSettingSearchParams {
  group_id?: string;
  active_kind?: string;
}

export interface Maker {
  id: string;
  code: string;
  name: string;
  active_kind: string;
  active_name: string;
}

export interface MakerSettingData {
  maker_setting: {
    update_datetime: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    makers: Maker[];
  };
}

export interface MakerForUpdate {
  code: string;
  active_kind: string;
}

export interface MakerSettingUpdateParams {
  maker_setting: {
    update_datetime: string;
    group_id: string;
    makers: MakerForUpdate[];
  };
}
