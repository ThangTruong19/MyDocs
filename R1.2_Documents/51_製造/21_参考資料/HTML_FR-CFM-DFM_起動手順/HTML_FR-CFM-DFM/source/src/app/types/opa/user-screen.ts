export interface ResourceParams {
  group_id?: string;
  group_item_publish_setting?: {
    display_count: string;
    paper_size_id: string;
  };
}

export interface PublishSettingFetchParams {
  group_id?: string;
  function_category_id?: string;
  external_app_kind?: string;
}

export interface SimpleTableHeader {
  name: string;
  label: string;
  displayable: boolean;
}

export interface CommonBaseUpdateParams {
  group_id: string;
  update_datetime: string;
}

export interface CategoryLists {
  [key: string]: {
    originList: PublishSettingList;
    visibleList: PublishSettingList;
  };
}

export type PublishSettingList = PublishSettingListItem[];

export interface PublishSettingListItem {
  id: string;
  name: string;
  app_kind: ListAppKind;
}

export interface ListAppKind {
  '0': {
    external_app_kind: string;
    permission_kind: string;
    publish_kind: string;
  };
  '1': {
    external_app_kind: string;
    permission_kind: string;
    publish_kind: string;
  };
}

export type PublishSettings = PublishSetting[];

export interface PublishSetting {
  id: string;
  name: string;
  order: string;
  external_app_publish_settings: ExternalAppPublishSettings;
}

export type ExternalAppPublishSettings = ExternalAppPublishSetting[];

export interface ExternalAppPublishSetting {
  permission_kind_name: string;
  permission_kind: string;
  publish_kind_name: string;
  publish_kind: string;
  external_app_kind_name: string;
  external_app_kind: string;
}

export type GroupPublishSetting =
  | GroupFunctionPublishSetting
  | GroupItemPublishSetting;
export type Categories = (FunctionCategory | ItemCategory)[];
export type PublishSettingUpdateParams =
  | FunctionPublishSettingUpdateParams
  | ItemPublishSettingUpdateParams;
export type BaseUpdateParams =
  | FunctionPublishSettingBaseUpdateParams
  | ItemPublishSettingUpdateBaseParams;

export interface GroupFunctionPublishSetting {
  group_id: string;
  group_label: string;
  group_label_english: string;
  update_datetime: string;
  function_categories: FunctionCategory[];
}

export interface FunctionCategory {
  id: string;
  name: string;
  order: string;
  function_publish_settings: PublishSettings;
}

export type FunctionPublishSettingBaseUpdateParams = CommonBaseUpdateParams;

export interface FunctionPublishSettingUpdateParams {
  group_function_publish_setting: {
    group_id: string;
    update_datetime: string;
    function_publish_settings: {
      id: string;
      external_app_publish_settings: {
        publish_kind: string;
        external_app_kind: string;
      }[];
    }[];
  };
}

export interface GroupItemPublishSetting {
  group_id: string;
  group_label: string;
  group_label_english: string;
  update_datetime: string;
  item_categories: ItemCategory[];
}

export interface ItemCategory {
  id: string;
  name: string;
  order: string;
  item_publish_settings: PublishSettings;
}

export interface ItemPublishSettingUpdateBaseParams {
  group_id: string;
  update_datetime: string;
  paper_size_id: string;
  display_count: string;
}

export interface ItemPublishSettingUpdateParams {
  group_item_publish_setting: {
    group_id: string;
    update_datetime: string;
    paper_size_id?: string;
    display_count?: string;
    item_publish_settings: {
      id: string;
      external_app_publish_settings: {
        publish_kind: string;
        external_app_kind: string;
      }[];
    }[];
  };
}
