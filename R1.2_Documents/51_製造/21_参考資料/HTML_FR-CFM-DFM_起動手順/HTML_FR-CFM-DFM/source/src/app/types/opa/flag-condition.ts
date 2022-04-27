export interface FlagConditionParams {
  group_id?: string;
  flag_code: string;
  flag_kind_code: string;
  free_memo?: string;
  event_condition: {
    event_code?: string;
    detection_condition_code: string;
    occurrence_identification?: {
      consecutive_occurrence_days?: string;
      decision_period?: string;
      occurrence_days?: string;
      min_alerm_time?: string;
    };
    time_identification?: {
      remaining_time_threshold?: string;
    };
  };
  update_datetime?: string;
}

export interface FlagConditionIndexParams {
  flag_kind_code: string;
  group_id?: string;
  flag_condition_id?: string;
}

export interface FlagConditionDeleteParams {
  update_datetime: string;
}
