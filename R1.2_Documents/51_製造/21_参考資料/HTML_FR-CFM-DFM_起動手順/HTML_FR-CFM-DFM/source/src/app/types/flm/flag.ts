import { Division } from './model-rev-modal';

export interface FlagParams {
  flag_condition: {
    flag_code: '5';
    support_distributor_id?: string;
    free_memo?: string;
    update_datetime?: string;
    event_condition?: {
      event_code?: string;
      detection_condition_code?: DetectionConditionCode;
      occurrence_identification?: {
        occurrence_days?: string;
        consecutive_occurrence_days?: string;
        decision_period?: string;
        accumulate_occurrence_count?: string;
        ignore_0minute_code: string | boolean;
      };
    };
    car_conditions: Division[];
  };
}

export interface ProfileListParams {
  support_distributor_id?: string;
  maker_id: string;
  model?: string;
}

export type DetectionConditionCode = '1' | '2' | '3';
