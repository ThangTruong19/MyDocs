import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    AfterContentInit,
    OnDestroy,
    ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { FlyoutService } from 'app/vendors/k-common-module/flyout/flyout.service';
import { TimePickerLabels, TimePickerParams } from 'app/types/calendar';

@Component({
    selector: 'common-time-picker',
    templateUrl: './common-time-picker.component.html',
    styleUrls: ['./common-time-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CommonTimePickerComponent implements OnInit, OnDestroy, AfterContentInit {

    private static readonly MAX_TIME: { HOURS: number; MINUTES: number; SECONDS: number; MILLISECONDS: number; } = {
        HOURS: 23,
        MINUTES: 59,
        SECONDS: 59,
        MILLISECONDS: 999
    };

    public readonly TIME_ARROW: { BACK: string; FORWORD: string; } = {
        BACK: 'back',
        FORWORD: 'forword'
    };

    public readonly TIME_PLACEHOLDER: { HOURS: string; MINUTES: string; SECONDS: string; MILLISECONDS: string; } = {
        HOURS: 'HH',
        MINUTES: 'mm',
        SECONDS: 'ss',
        MILLISECONDS: 'SSS'
    };

    @Input() public id: string;
    @Input() public labels: TimePickerLabels;
    @Input() public params: TimePickerParams;
    @Input() public showSeconds = false;
    @Input() public showMilliseconds = false;
    @Input() public hoursStep = 1;
    @Input() public minutesStep = 1;
    @Input() public secondsStep = 1;
    @Input() public millisecondsStep = 1;

    @Output() public hasOpened: EventEmitter<void> = new EventEmitter<void>();
    @Output() public clickSetting: EventEmitter<TimePickerParams> = new EventEmitter<TimePickerParams>();
    @Output() public clickClose: EventEmitter<void> = new EventEmitter<void>();

    public timePickerCssClass: string;
    public isDisabledSettingButton: boolean;
    public isDisabledHoursArrow: boolean;
    public isDisabledMinutesArrow: boolean;
    public isDisabledSecondsArrow: boolean;
    public isDisabledMillisecondsArrow: boolean;
    public isHoursInputError: boolean;
    public isMinutesInputError: boolean;
    public isSecondsInputError: boolean;
    public isMillisecondsInputError: boolean;

    private subscriptions: Subscription[] = [];

    constructor(
        private flyoutService: FlyoutService
    ) {
    }

    /**
     * 初期処理を行う。
     */
    ngOnInit(): void {
        if (this.showMilliseconds) {
            this.showSeconds = true;
        }
    }

    /**
     * 初期処理を行う。(※FlyoutService 読み込み後)
     */
    ngAfterContentInit(): void {
        this.subscriptions.push(
            this.flyoutService.getOpened$(this.id).subscribe((_: boolean) => this.onOpened()),
        );
    }

    /**
     * オブジェクトの破棄処理を行う。
     */
    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    /**
     * 画面表示時の処理を行う。
     */
    private onOpened(): void {
        this.isDisabledSettingButton = false;
        this.isDisabledHoursArrow = false;
        this.isDisabledMinutesArrow = false;
        this.isDisabledSecondsArrow = false;
        this.isDisabledMillisecondsArrow = false;
        this.isHoursInputError = false;
        this.isMinutesInputError = false;
        this.isSecondsInputError = false;
        this.isMillisecondsInputError = false;

        this.hasOpened.next();
    }

    public onClickSetting(): void {
        if (this.validateAll()) {
            this.clickSetting.emit(this.params);
            this.closeFlyout();
        }
    }

    public onClickClose(): void {
        this.clickClose.emit();
        this.closeFlyout();
    }

    public closeFlyout(): void {
        this.flyoutService.close(this.id);
    }

    public onClickHours(directionType: string): void {
        this.params.hours = this.getNextTime(this.params.hours, directionType,
            CommonTimePickerComponent.MAX_TIME.HOURS, this.hoursStep);
    }

    public onClickMinutes(directionType: string): void {
        this.params.minutes = this.getNextTime(this.params.minutes, directionType,
            CommonTimePickerComponent.MAX_TIME.MINUTES, this.minutesStep);
    }

    public onClickSeconds(directionType: string): void {
        this.params.seconds = this.getNextTime(this.params.seconds, directionType,
            CommonTimePickerComponent.MAX_TIME.SECONDS, this.secondsStep);
    }

    public onClickMilliseconds(directionType: string): void {
        this.params.milliseconds = this.getNextTime(this.params.milliseconds, directionType,
            CommonTimePickerComponent.MAX_TIME.MILLISECONDS, this.millisecondsStep);
    }

    public onChangeTime(): void {
        this.validateAll();
    }

    public getNextTime(paramTime: string, directionType: string, maxTime: number, step: number): string {
        let timeNum = 0;
        if (paramTime) {
            timeNum = Number(paramTime);
        }
        if (directionType == this.TIME_ARROW.FORWORD) {
            timeNum += step;
            if (timeNum > maxTime) {
                const remainder: number = timeNum - maxTime - step;
                timeNum = 0;
                timeNum += remainder;
                if (timeNum < 0) {
                    timeNum = 0;
                }
            }
        } else {
            timeNum -= step;
            if (timeNum < 0) {
                const remainder: number = timeNum + step;
                timeNum = maxTime;
                timeNum += remainder;
                if (timeNum > maxTime) {
                    timeNum = maxTime;
                }
            }
        }
        return timeNum.toString().padStart(maxTime.toString().length, '0');
    }

    private validateAll(): boolean {
        const isValidHours: boolean = this.validateHours()
        const isValidMinutes: boolean = this.validateMinutes();
        const isValidSeconds: boolean = this.validateSeconds();
        const isValidMilliseconds: boolean = this.validateMilliseconds();
        if (isValidHours && isValidMinutes && isValidSeconds && isValidMilliseconds) {
            this.isDisabledSettingButton = false;
            return true;
        } else {
            this.isDisabledSettingButton = true;
            return false;
        }
    }

    private validateHours(): boolean {
        this.isHoursInputError = false;
        this.isDisabledHoursArrow = false;

        let isValid: boolean = this.isTimeFormat(this.params.hours, CommonTimePickerComponent.MAX_TIME.HOURS);

        if (!isValid) {
            this.isHoursInputError = true;
            this.isDisabledHoursArrow = true;
        }

        return isValid;
    }

    private validateMinutes(): boolean {
        this.isMinutesInputError = false;
        this.isDisabledMinutesArrow = false;

        let isValid: boolean = this.isTimeFormat(this.params.minutes, CommonTimePickerComponent.MAX_TIME.MINUTES);

        if (!isValid) {
            this.isMinutesInputError = true;
            this.isDisabledMinutesArrow = true;
        }

        return isValid;
    }

    private validateSeconds(): boolean {
        this.isSecondsInputError = false;
        this.isDisabledSecondsArrow = false;

        let isValid: boolean = true;
        if (this.showSeconds) {
            isValid = this.isTimeFormat(this.params.seconds, CommonTimePickerComponent.MAX_TIME.SECONDS);
        }

        if (!isValid) {
            this.isSecondsInputError = true;
            this.isDisabledSecondsArrow = true;
        }

        return isValid;
    }

    private validateMilliseconds(): boolean {
        this.isMillisecondsInputError = false;
        this.isDisabledMillisecondsArrow = false;

        let isValid: boolean = true;
        if (this.showMilliseconds) {
            isValid = this.isTimeFormat(this.params.milliseconds, CommonTimePickerComponent.MAX_TIME.MILLISECONDS);
        }

        if (!isValid) {
            this.isMillisecondsInputError = true;
            this.isDisabledMillisecondsArrow = true;
        }

        return isValid;
    }

    private isTimeFormat(time: string, maxTime: number): boolean {
        if (time) {
            const timeNum: number = Number(time);
            if (!isNaN(timeNum) && timeNum >= 0 && timeNum <= maxTime
                && time.length == maxTime.toString().length) {
                return true;
            }
        }
        return false;
    }

}
