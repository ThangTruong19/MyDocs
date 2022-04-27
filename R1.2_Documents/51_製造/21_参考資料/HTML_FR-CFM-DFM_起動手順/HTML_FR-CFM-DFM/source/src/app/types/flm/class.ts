export interface ClassParams {
  support_distributor_id?: string;
  support_distributor_label?: string;
  kind_id: string;
  kind_name?: string;
  id?: string;
  current_label?: string;
  label?: string;
  update_datetime?: string;
}

export interface ClassIndexParams {
  support_distributor_id?: string;
  class_kind_id?: string;
  class_id?: string;
}
