import * as moment from 'moment';

export type Moment = moment.Moment;

export interface DatePickerParams {
  timeZone: string;
  dateFormat: string;
  beginningWday?: number;
  enableDateRange?: string[];
}

export interface MonthPickerParams {
  timeZone: string;
  dateFormat: string;
  enableDateRange?: string[];
}
