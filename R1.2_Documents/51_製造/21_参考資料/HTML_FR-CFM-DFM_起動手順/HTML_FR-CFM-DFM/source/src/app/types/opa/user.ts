export interface UserParams {
  group: {
    represent_administrator_kind?: string;
    id?: string;
    granted_role_id: string;
    granted_role_name?: string;
    granted_authority_ids: string[];
    belonging_group_id: string;
  };
  attribute_create_place?: string;
  update_datetime?: string;
}

export interface UserIndexParams {
  email?: string;
  user_label?: string;
  role_id?: string;
  group_id?: string;
}

export interface UserDeleteParams {
  belonging_group_id: string;
  update_datetime: string;
}

export interface AuthoritiesUpdateParams {
  user: {
    group: {
      id?: string;
      granted_authority_ids: string[];
      belonging_group_id: string;
    };
    update_datetime: string;
  };
}

export interface UserCountParams {
  group_id: string;
}
