export interface Contact {
  contact: {
    id?: string;
    support_distributor_id: string;
    support_distributor_label?: string;
    kind: string;
    kind_name?: string;
    update_datetime?: string;
    represent_contact?: {
      label: string;
      phone_no: string;
    };
    general_contact?: {
      label: string;
      email: string;
      office_phone_no: string;
      cell_phone_no: string;
      photo_exists_kind?: string;
      photo?: {
        image: string;
        trim_data: {
          base_point_x: string;
          base_point_y: string;
          width: string;
          height: string;
        };
        image_attribute?: {
          width: number;
          height: number;
        };
      };
    };
  };
}

export interface ContactIndexParams {
  support_distributor_id?: string;
  contact_kind: string;
  contact_label?: string;
  phone_no?: string;
}

export interface ContactCustomerParams {
  support_distributor_id?: string;
  customer_ids?: string[];
  search_keyword?: string;
}

export interface TrimmingData {
  photo: string;
  base_point_x: number;
  base_point_y: number;
  width: number;
  height: number;
}

export interface ContactLinkParams {
  customer_id?: string;
  customer_label?: string;
  customer_label_english?: string;
  update_datetime: string;
  customer_contact_links: {
    contact_kind_code: string;
    contact_kind_name?: string;
    contact_id: string;
    contact_label?: string;
  }[];
}
