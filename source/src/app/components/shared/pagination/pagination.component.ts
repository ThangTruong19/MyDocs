import { Component, EventEmitter, Input, Output, OnInit, DoCheck } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { Labels } from 'app/types/common';
import { UserSettingService } from 'app/services/api/user-setting.service';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnInit, DoCheck {

    @Input() public count: number;
    @Input() public params: any;
    @Input() public labels: Labels;
    @Input() public element: any;
    @Input() public showNumberOfDisplay = true;

    @Output() public changeState: EventEmitter<void> = new EventEmitter<void>();

    public options: number[];
    public pageNoForm: FormControl;

    private loadPageNo = false;
    private nextPrevClicks: Subject<any> = new Subject<any>();
    private debounceTime = 50;
    private _pageLength: number;
    private tempPage: number;
    private pageCountValues: number[];

    public set pageLength(length: number) {
        if (this._pageLength !== length) {
            this._pageLength = length;
            this.pageNoForm.setValidators([
                Validators.max(this._pageLength),
                Validators.pattern(/^[1-9]\d*$/),
                Validators.required,
            ]);
        }
    }

    constructor(private settings: UserSettingService) {
    }

    ngOnInit(): void {
        this.nextPrevClicks.pipe(debounceTime(this.debounceTime)).subscribe(no => {
            this.params.pageNo = no;
            this.params.dispPageNo = this.params.pageNo;
            this.pageNoForm.setValue(this.params.pageNo);
            this.changeState.emit();
        });

        this.params.dispPageNo = this.params.pageNo;
        this.pageNoForm = new FormControl(this.params.dispPageNo);

        if (this.element && this.element.pageCount) {
            this.pageCountValues = this.element['pageCount'].values.map((v: any) => +v.value);
        }
    }

    ngDoCheck(): void {
        if (this.params && this.params.pageNo !== this.tempPage) {
            this.tempPage = this.params.pageNo;
            this.pageNoForm.setValue(this.params.pageNo);
        }
    }

    /**
     * 1ページあたり件数変更コールバック
     */
    public onChangePageCount(): void {
        this._storePageCount(this.params.pageCount);
        this.initOptions();
        this.changeState.emit();
    }

    /**
     * ページ選択テキストフォーム変更コールバック
     * @param forceRefresh 強制的にリフレッシュを行う
     */
    public onChangePageNo(forceRefresh = false): void {
        if (this.loadPageNo) {
            this.loadPageNo = false;
        } else if (this.pageNoForm.invalid) {
            this.params.dispPageNo = this.params.pageNo;
        } else if (this.params.pageNo !== this.params.dispPageNo || forceRefresh) {
            this.params.pageNo = this.params.dispPageNo;
            this.pageNoForm.setValue(this.params.pageNo);
            this.changeState.emit();
        }
    }

    /**
     * 前へボタンコールバック
     */
    public onClickPrevButton(): void {
        this.nextPrevClicks.next(+this.params.pageNo - 1);
    }

    /**
     * 次へボタンコールバック
     */
    public onClickNextButton(): void {
        this.nextPrevClicks.next(+this.params.pageNo + 1);
    }

    /**
     * 画面表示用ページ情報取得
     */
    public replacePageCount(): string {
        if (_.isEmpty(this.labels.page_count)) {
            return '';
        }
        const pagingNum: number = +this.params.pageCount;
        const start: number = (this.params.pageNo - 1) * pagingNum;
        const end: number =
            this.count / this.params.pageNo >= pagingNum
                ? pagingNum
                : this.count % pagingNum;
        const compiled: _.TemplateExecutor = _.template(this.labels.page_count);
        return compiled({ total: this.count, first: start + 1, end: start + end });
    }

    /**
     * ページ選択オプション生成
     *
     * ページ選択用のセレクトボックスのオプションを作成する
     */
    public buildOptions(): void {
        this.options = [];
        _.times(Math.ceil(this.count / this.params.pageCount), (n: number) => {
            this.options.push(n + 1);
        });
        this.pageLength = this.options.length;
    }

    public initializePageCount(): void {
        const count: string = this._getInitialPageCount();

        if (count != null) {
            this.params.pageCount = +count;
        }
        this._storePageCount(this.params.pageCount);
    }

    /**
     * ページ選択オプション初期化
     *
     * ページ選択用のセレクトボックスのオプションを初期化する
     */
    public initOptions(): void {
        this.buildOptions();
        if (this.params.pageNo > 1) {
            this.params.pageNo = 1;
            this.params.dispPageNo = 1;
            this.pageNoForm.setValue(1);
        }
    }

    private _getInitialPageCount(): string {
        const json: string = localStorage.getItem('app-fleet-setting');
        try {
            const data: any = JSON.parse(json);

            if (data == null || data.count == null || !this._isValidPageCount(data.count)) {
                return this.settings.groupSettings.display_count;
            }

            return data.count;
        } catch (e) {
            return this.settings.groupSettings.display_count;
        }
    }

    /**
     * localStorageに表示件数を保存する
     */
    private _storePageCount(count: number): void {
        const json: string = localStorage.getItem('app-fleet-setting');
        try {
            const data: any = JSON.parse(json) || {};
            data.count = `${count}`;
            localStorage.setItem('app-fleet-setting', JSON.stringify(data));
        } catch (e) {
            localStorage.setItem('app-fleet-setting', JSON.stringify({
                count: `${count}`,
            }));
        }
    }

    /**
     * ローカルストレージから取得した表示件数が正しいものであるかを判定する
     * @param count 表示件数
     */
    private _isValidPageCount(count: string): boolean {
        // リソースが取得できない場合無効とする
        return this.pageCountValues == null || this.pageCountValues.includes(+count);
    }

}
