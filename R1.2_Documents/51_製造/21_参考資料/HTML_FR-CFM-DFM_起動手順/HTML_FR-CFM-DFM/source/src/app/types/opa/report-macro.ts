export interface ReportMacroParams {
  group_id?: string;
  macro_settings?: {
    publish_kind: string;
    macro_report_code: string;
    macro_file_id?: string;
    update_datetime: string;
  }[];
}
