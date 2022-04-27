export interface GroupParams {
  group: {
    identification: {
      id?: string;
      label?: string;
      label_english?: string;
      organization_code?: string;
      kind_id?: string;
      update_datetime?: string;
    };
    attribute: {
      first_day_of_week_kind?: string;
      phone_no?: string;
      email?: string;
      address?: string;
      nation_code?: string;
      time_difference?: string;
    };
    map_application?: {
      id?: string;
      lang_code?: string;
    };
    default_lang_code?: string;
    lang_codes?: string[];
    configuration_group_id?: string;
    configuration_group_label?: string;
    publish_target: {
      global_kind?: string;
      region_ids?: string[];
    };
    child_plant_ids?: string[];
    represent_administrator_user_id?: string;
    rental_car_business_kind?: string;
    administrator_role: {
      authorities: {
        id: string;
        default_kind: string;
      }[];
    };
    general_role: {
      authorities: {
        id: string;
        default_kind: string;
      }[];
    };
    preset_roles?: {
      group_kind_id: string;
      group_kind_name?: string;
      authorities: {
        id: string;
        default_kind: string;
      }[];
    }[];
    map?: {
      properties?: {
        magnification?: string;
      };
      geometry?: {
        type: 'Point';
        coordinates?: number[];
      };
      type: 'Feature';
    };
  };
}
