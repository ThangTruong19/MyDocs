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

export interface TimePickerParams {
    hours: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
    selectedTime: string;
}

export interface TimePickerLabels {
    settingButton: string;
    closeButton: string;
}
