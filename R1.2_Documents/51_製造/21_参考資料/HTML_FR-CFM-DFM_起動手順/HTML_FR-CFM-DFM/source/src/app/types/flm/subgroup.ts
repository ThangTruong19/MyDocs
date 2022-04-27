export interface SubgroupParams {
  sub_group: {
    identification: {
      label: string;
      label_english?: string;
      organization_code?: string;
    };
    attribute: {
      nation_code: string;
      time_difference: string;
      phone_no?: string;
      email?: string;
      address?: string;
    };
    represent_administrator_user_id?: string;
    administrator_role?: {
      id?: string;
      authorities: AuthorityParams[];
    };
    general_role?: {
      id?: string;
      authorities: AuthorityParams[];
    };
  };
}

export interface AuthorityParams {
  id: string;
  default_kind: '0' | '1';
}

export interface SubgroupIndexParams {
  sub_group_label?: string;
  phone_no?: string;
}
