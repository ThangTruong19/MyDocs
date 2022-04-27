import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
export class CommonTimePickerComponent implements OnInit, OnDestroy, AfterViewInit {

    private static readonly MAX_TIME: { HOURS: number; MINUTES: number; SECONDS: number; MILLISECONDS: number; } = {
        HOURS: 24,
        MINUTES: 59,
        SECONDS: 59,
        MILLISECONDS: 999
    };

    public readonly TIME_ARROW: { BACK: string; FORWORD: string; } = {
        BACK: 'back',
        FORWORD: 'forword'
    };

    public readonly TIME_PART_TYPE: { HOURS: string; MINUTES: string; SECONDS: string; MILLISECONDS: string; } = {
        HOURS: 'HOURS',
        MINUTES: 'MINUTES',
        SECONDS: 'SECONDS',
        MILLISECONDS: 'MILLISECONDS'
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

    @Output() hasOpened: EventEmitter<void> = new EventEmitter<void>();
    @Output() clickSetting: EventEmitter<TimePickerParams> = new EventEmitter<TimePickerParams>();
    @Output() clickClose: EventEmitter<void> = new EventEmitter<void>();

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

    private subscriptions = [] as Subscription[];

    constructor(
        private flyoutService: FlyoutService
    ) {
    }

    ngOnInit(): void {
        if (this.showMilliseconds) {
            this.showSeconds = true;
        }
    }

    ngAfterViewInit(): void {
        this.subscriptions.push(
            this.flyoutService.getOpened$(this.id).subscribe((_: boolean) => this.onOpened()),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

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
        if (this.isValidAll()) {
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

    public onChangeTime(partType: string): void {

        if (partType === this.TIME_PART_TYPE.HOURS) {
            this.isHoursInputError = false;
            this.isDisabledHoursArrow = false;
            if (this.isValidHours()) {
                this.isValidAll();
            } else {
                this.isHoursInputError = true;
                this.isDisabledHoursArrow = true;
                this.isDisabledSettingButton = true;
            }
        } else if (partType === this.TIME_PART_TYPE.MINUTES) {
            this.isMinutesInputError = false;
            this.isDisabledMinutesArrow = false;
            if (this.isValidMinutes()) {
                this.isValidAll();
            } else {
                this.isMinutesInputError = true;
                this.isDisabledMinutesArrow = true;
                this.isDisabledSettingButton = true;
            }
        } else if (partType === this.TIME_PART_TYPE.SECONDS) {
            this.isSecondsInputError = false;
            this.isDisabledSecondsArrow = false;
            if (this.isValidSeconds()) {
                this.isValidAll();
            } else {
                this.isSecondsInputError = true;
                this.isDisabledSecondsArrow = true;
                this.isDisabledSettingButton = true;
            }
        } else if (partType === this.TIME_PART_TYPE.MILLISECONDS) {
            this.isMillisecondsInputError = false;
            this.isDisabledMillisecondsArrow = false;
            if (this.isValidMilliseconds()) {
                this.isValidAll();
            } else {
                this.isMillisecondsInputError = true;
                this.isDisabledMillisecondsArrow = true;
                this.isDisabledSettingButton = true;
            }
        }
    }

    public getNextTime(paramTime: string, directionType: string, maxTime: number, step: number): string {
        let timeNum = 0;
        if (paramTime) {
            timeNum = Number(paramTime);
        }
        if (directionType == this.TIME_ARROW.FORWORD) {
            timeNum += step;
            if (timeNum > maxTime) {
                const remainder: number = timeNum - maxTime;
                timeNum = 0;
                timeNum += remainder;
            }
        } else {
            timeNum -= step;
            if (timeNum < 0) {
                const remainder: number = timeNum * -1;
                timeNum = maxTime;
                timeNum -= remainder;
            }
        }
        return timeNum.toString().padStart(maxTime.toString().length, '0');
    }

    private isValidAll(): boolean {
        if (this.isValidHours() && this.isValidMinutes() && this.isValidSeconds() && this.isValidMilliseconds()) {
            this.isDisabledSettingButton = false;
            return true;
        } else {
            this.isDisabledSettingButton = true;
            return false;
        }
    }

    private isValidHours(): boolean {
        return this.isTimeFormat(this.params.hours, CommonTimePickerComponent.MAX_TIME.HOURS);
    }

    private isValidMinutes(): boolean {
        return this.isTimeFormat(this.params.minutes, CommonTimePickerComponent.MAX_TIME.MINUTES);
    }

    private isValidSeconds(): boolean {
        let isValid: boolean = true;
        if (this.showSeconds) {
            isValid = this.isTimeFormat(this.params.seconds, CommonTimePickerComponent.MAX_TIME.SECONDS);
        }
        return isValid;
    }

    private isValidMilliseconds(): boolean {
        let isValid: boolean = true;
        if (this.showMilliseconds) {
            isValid = this.isTimeFormat(this.params.milliseconds, CommonTimePickerComponent.MAX_TIME.MILLISECONDS);
        }
        return isValid;
    }

    private isTimeFormat(time: string, maxTime: number): boolean {
        if (time) {
            const timeNum = Number(time);
            if (!isNaN(timeNum) && timeNum >= 0 && timeNum <= maxTime
                && time.length == maxTime.toString().length) {
                return true;
            }
        }
        return false;
    }

}
