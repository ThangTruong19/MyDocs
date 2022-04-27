import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';

@Component({
    selector: 'app-time-difference',
    templateUrl: './time-difference.component.html',
    styleUrls: ['./time-difference.component.scss'],
})
export class TimeDifferenceComponent {

    @ViewChild('timeDifferenceSelect', { static: false })
    public timeDifferenceSelect: SelectedComponent;

    @ViewChild('timeDifferenceMinuteSelect', { static: false })
    public timeDifferenceMinuteSelect: SelectedComponent;

    public timeSettingConstant: {
        all: string;
        select: string;
    } = {
        all: '0',
        select: '1',
    };

    @Input()
    public set value(v: string) {
        if (v === '') {
            this.timeDifferenceSetting = this.timeSettingConstant.all;
        } else {
            this.timeDifferenceSetting = this.timeSettingConstant.select;
            this._reflectTimeDifference(v);
        }
    }
    @Input() public resource: any;
    @Input() public labels: { [key: string]: string };
    @Output() public changeTimeDifference: EventEmitter<string> = new EventEmitter<
        string
    >();

    public timeDifference: {
        time_difference: string;
        time_difference_minute: string;
    } = {
        time_difference: '',
        time_difference_minute: ''
    };
    public timeDifferenceSetting = this.timeSettingConstant.all;
    private defaultTimeDiffrence = '+0000';

    constructor() { }

    /**
     * 時差設定ラジオボタン変更時コールバック
     */
    public onChangeTimeDifferenceSetting(): void {
        if (this.timeDifferenceSetting === this.timeSettingConstant.all) {
            this.changeTimeDifference.emit('');
        } else {
            this.changeTimeDifference.emit(this.defaultTimeDiffrence);
            this._reflectTimeDifference(this.defaultTimeDiffrence);
        }
    }

    /**
     * 時差プルダウン変更時の処理
     */
    public onTimeDiffrenceChange(): void {
        if (this.timeDifferenceSetting === this.timeSettingConstant.select) {
            const str: string =
                this.timeDifference.time_difference +
                this.timeDifference.time_difference_minute;
            if (/[+-]\d{4}/.test(str)) {
                this.changeTimeDifference.emit(str);
            }
        }
    }

    /**
     * 項目をリフレッシュする
     */
    public refresh(): void {
        if (this.timeDifferenceSelect) {
            this.timeDifferenceSelect.refresh();
        }
        if (this.timeDifferenceMinuteSelect) {
            this.timeDifferenceMinuteSelect.refresh();
        }
        this.timeDifferenceSetting = this.timeSettingConstant.all;
        this.changeTimeDifference.emit('');
    }

    /**
     * 時差のパラメータを解釈しプルダウンに反映する
     * @param diff 時差（文字列形式）
     */
    private _reflectTimeDifference(diff: string): void {
        diff = diff || this.defaultTimeDiffrence;

        this.timeDifference = {
            time_difference: diff.slice(0, 3),
            time_difference_minute: diff.slice(3),
        };
    }

}