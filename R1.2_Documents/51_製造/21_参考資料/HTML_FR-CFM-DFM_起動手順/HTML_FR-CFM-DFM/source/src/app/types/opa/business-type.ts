export interface BusinessTypeParams {
  business_type: {
    block_id?: string;
    block_label?: string;
    item_names: {
      label?: string;
      lang_code?: string;
    }[];
    update_datetime?: string;
  };
}

export interface BusinessTypeIndexParams {
  block_id?: string;
}

export interface BusinessTypeFileCreateParams extends BusinessTypeIndexParams {
  file_label?: string;
  file_content_type: string;
  processing_type?: string;
  file_request_label?: string;
}
