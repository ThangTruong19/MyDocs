export interface CustomerParams {
  customer: {
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
      business_type_id: string;
      report_display_label: string;
    };
    support_distributor_id?: string;
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

export interface CompanyParams {
  identification: {
    address: string;
    code: string;
    id: string;
    label: string;
    label_english: string;
    nation_code: string;
    nation_name: string;
    organization_code: string;
    phone_no: string;
    postalcode: string;
  };
}

export interface CustomerIndexParams {
  support_distributor_id?: string;
  customer_label?: string;
  phone_no?: string;
}
