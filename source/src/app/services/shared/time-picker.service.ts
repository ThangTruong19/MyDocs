import { Injectable } from '@angular/core';
import { TimePickerParams } from 'app/types/calendar';

/**
 * 時刻選択用のサービス
 */
@Injectable()
export class TimePickerService {

    /**
     * 時刻の初期値を取得する。
     * @returns 時刻情報
     */
    public getInitTimeValue(isShowSeconds: boolean, isShowMilliseconds: boolean): string {
        let timeValue: string;
        if (isShowMilliseconds) {
            timeValue = '00:00:00.000';
        } else if (isShowSeconds) {
            timeValue = '00:00:00';
        } else {
            timeValue = '00:00';
        }
        return timeValue;
    }

    /**
     * 時刻選択画面の初期値を取得する。
     * @returns 時刻選択画面の初期値
     */
    public getInitTimePickerParams(isShowSeconds: boolean, isShowMilliseconds: boolean): TimePickerParams {
        const timePickerParams: TimePickerParams = {
            hours: '00',
            minutes: '00',
            seconds: isShowSeconds ? '00': '',
            milliseconds: isShowMilliseconds ? '000': '',
            selectedTime: ''
        };
        return timePickerParams;
    }

    /**
     * 選択した時刻を設定する。
     */
    public setSelectedTime(timePickerParams: TimePickerParams,
        isShowSeconds: boolean, isShowMilliseconds: boolean): void {
        let selectedTime: string;
        if (isShowMilliseconds) {
            selectedTime = timePickerParams.hours + ':' + timePickerParams.minutes
                + ':' + timePickerParams.seconds + '.' + timePickerParams.milliseconds;
        } else if (isShowSeconds) {
            selectedTime = timePickerParams.hours + ':' + timePickerParams.minutes
                + ':' + timePickerParams.seconds;
        } else {
            selectedTime = timePickerParams.hours + ':' + timePickerParams.minutes;
        }
        timePickerParams.selectedTime = selectedTime;
    }

}
