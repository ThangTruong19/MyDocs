import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { TimePickerLabels, TimePickerParams } from 'app/types/calendar';
import { Labels } from 'app/types/common';

@Component({
    selector: 'app-time-picker',
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class AppTimePickerComponent implements OnInit {

    @Input() public id: string;
    @Input() public labels: Labels;
    @Input() public initialBaseTime: string;
    @Input() public showSeconds = false;
    @Input() public showMilliseconds = false;
    @Input() public hoursStep = 1;
    @Input() public minutesStep = 1;
    @Input() public secondsStep = 1;
    @Input() public millisecondsStep = 1;

    @Output() public selectTime: EventEmitter<TimePickerParams> = new EventEmitter<TimePickerParams>();
    @Output() public hasOpened = new EventEmitter<void>();
    public timePickerParams: TimePickerParams;
    public timePickerCssClass: string;

    public timePickerLabels: TimePickerLabels;

    constructor(
        private elementRef: ElementRef
    ) {
    }

    /**
     * 初期処理を行う。
     */
    ngOnInit() {
        if (this.showMilliseconds) {
            this.showSeconds = true;
        }

        const appModal: JQuery<any> = $(this.elementRef.nativeElement).closest('.app-modal');
        if (appModal.length) {
            this.timePickerCssClass = 'modal-app-picker';
        } else {
            this.timePickerCssClass = '';
        }

        this.timePickerLabels = {
            settingButton: this.labels._common.set,
            closeButton: this.labels._common.close
        };

        this.timePickerParams = this.initTimePickerParams();
    }

    /**
     * common-time-picker が開かれた際のコールバック
     */
    public onOpened(): void {
        const initTime: string = this.initialBaseTime;
        this.timePickerParams = this.initTimePickerParams();

        if (initTime) {
            const initTimes: string[] = initTime.split(/:|\./);
            if (initTimes.length > 0) {
                this.timePickerParams = {
                    hours: initTimes[0],
                    minutes: initTimes[1],
                    seconds: this.showSeconds ? initTimes[2]: '',
                    milliseconds: this.showMilliseconds ? initTimes[3]: '',
                    times: ''
                }
            }
        }
    }

    /**
     * 時刻の初期値を設定する。
     * @returns 時刻情報
     */
    private initTimePickerParams(): TimePickerParams {
        const timePickerParams: TimePickerParams = {
            hours: '00',
            minutes: '00',
            seconds: this.showSeconds ? '00': '',
            milliseconds: this.showMilliseconds ? '000': '',
            times: ''
        };
        return timePickerParams;
    }

    /**
     * 設定ボタン押下時の処理を行う。
     * @param timeParams
     */
    public onClickSetting(timeParams: TimePickerParams) {
        if (this.showMilliseconds) {
            timeParams.times = timeParams.hours + ':' + timeParams.minutes + ':' + timeParams.seconds + '.' + timeParams.milliseconds;
        } else if (this.showSeconds) {
            timeParams.times = timeParams.hours + ':' + timeParams.minutes + ':' + timeParams.seconds;
        } else {
            timeParams.times = timeParams.hours + ':' + timeParams.minutes;
        }

        this.selectTime.emit(timeParams);
    }

    /**
     * 閉じるボタン押下時の処理を行う。
     */
    public onClickClose() {
        // 閉じるボタン押下後、common-time-picker 内の閉じる処理が実行された後に
        // 本処理が呼び出されるが、本アプリでは特に処理を行わない。
    }

}
