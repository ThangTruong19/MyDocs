export interface SystemNotificationIndexParams {
  system_notification_id?: string;
  block_id?: string;
  publish_application_code?: string;
  date_from?: string;
  date_to?: string;
}

export interface SystemNotificationDeleteParams {
  update_datetime: string;
}

export interface SystemNotificationParams {
  publish_application_codes: string[];
  publish_group?: {
    kind_id?: string;
    block_ids?: string[];
  };
  notification: {
    content: string;
    start_datetime: string;
    end_datetime: string;
  };
  update_datetime?: string;
}
