export interface UserParams {
  group: {
    id: string;
    represent_administrator_kind?: string;
    belonging_group_id: string;
    granted_role_id: string;
    granted_role_name?: string;
    granted_authority_ids: string[];
  };
  user: {
    attribute_create_place?: string;
    update_datetime?: string;
  };
}

export interface UserIndexParams {
  user_account?: string;
  user_label?: string;
  role_id?: string;
  belonging_group_id?: string;
}

export interface UserDeleteParams {
  belonging_group_id: string;
  update_datetime: string;
}

export interface AuthoritiesUpdateParams {
  user: {
    group: {
      belonging_group_id: string;
      granted_authority_ids: string[];
    };
    update_datetime: string;
  };
}
