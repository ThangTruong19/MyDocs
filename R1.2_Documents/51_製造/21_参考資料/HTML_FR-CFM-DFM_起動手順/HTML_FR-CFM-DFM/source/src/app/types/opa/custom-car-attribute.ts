export interface CustomCarAttributeParams {
  custom_car_attribute: {
    block_id?: string;
    field_no?: string;
    names: {
      label: string;
      lang_code: string;
    }[];
    details: {
      order: string;
      names: {
        label: string;
        lang_code: string;
      }[];
    }[];
    update_datetime?: string;
    use_same_name?: boolean;
  };
}
