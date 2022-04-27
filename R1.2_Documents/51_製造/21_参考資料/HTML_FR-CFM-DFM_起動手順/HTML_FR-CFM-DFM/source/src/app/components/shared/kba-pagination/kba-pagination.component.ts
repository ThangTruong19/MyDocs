import { debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { Component, EventEmitter, Input, Output, OnInit, DoCheck } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { UserSettingService } from '../../../services/api/user-setting.service';

@Component({
  selector: 'app-kba-pagination',
  templateUrl: './kba-pagination.component.html',
})
export class KbaPaginationComponent implements OnInit, DoCheck {
  @Input() count;
  @Input() params;
  @Input() labels;
  @Input() element;
  @Input() showNumberOfDisplay = true;
  @Output() changeState = new EventEmitter();
  options: number[];
  loadPageNo = false;
  nextPrevClicks = new Subject();
  debounceTime = 50;
  pageNoForm: FormControl;
  _pageLength: number;
  tempPage: number;
  pageCountValues: number[];

  constructor(private settings: UserSettingService) {
  }

  set pageLength(length) {
    if (this._pageLength !== length) {
      this._pageLength = length;
      this.pageNoForm.setValidators([
        Validators.max(this._pageLength),
        Validators.pattern(/^[1-9]\d*$/),
        Validators.required,
      ]);
    }
  }

  ngOnInit() {
    this.nextPrevClicks.pipe(debounceTime(this.debounceTime)).subscribe(no => {
      this.params.pageNo = no;
      this.params.dispPageNo = this.params.pageNo;
      this.pageNoForm.setValue(this.params.pageNo);
      this.changeState.emit();
    });

    this.params.dispPageNo = this.params.pageNo;
    this.pageNoForm = new FormControl(this.params.dispPageNo);

    if (this.element && this.element.pageCount) {
      this.pageCountValues = this.element['pageCount'].values.map(v => +v.value);
    }
  }

  ngDoCheck() {
    if (this.params && this.params.pageNo !== this.tempPage) {
      this.tempPage = this.params.pageNo;
      this.pageNoForm.setValue(this.params.pageNo);
    }
  }

  /**
   * 1ページあたり件数変更コールバック
   */
  onChangePageCount(): void {
    this._storePageCount(this.params.pageCount);
    this.initOptions();
    this.changeState.emit();
  }

  /**
   * ページ選択テキストフォーム変更コールバック
   * @param forceRefresh 強制的にリフレッシュを行う
   */
  onChangePageNo(forceRefresh = false): void {
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
  onClickPrevButton(): void {
    this.nextPrevClicks.next(+this.params.pageNo - 1);
  }

  /**
   * 次へボタンコールバック
   */
  onClickNextButton(): void {
    this.nextPrevClicks.next(+this.params.pageNo + 1);
  }

  /**
   * 画面表示用ページ情報取得
   */
  replacePageCount(): string {
    if (_.isEmpty(this.labels.page_count)) {
      return '';
    }
    const pagingNum = +this.params.pageCount;
    const start = (this.params.pageNo - 1) * pagingNum;
    const end =
      this.count / this.params.pageNo >= pagingNum
        ? pagingNum
        : this.count % pagingNum;
    const compiled = _.template(this.labels.page_count);
    return compiled({ total: this.count, first: start + 1, end: start + end });
  }

  /**
   * ページ選択オプション生成
   *
   * ページ選択用のセレクトボックスのオプションを作成する
   */
  buildOptions(): void {
    this.options = [];
    _.times(Math.ceil(this.count / this.params.pageCount), n => {
      this.options.push(n + 1);
    });
    this.pageLength = this.options.length;
  }

  initializePageCount() {
    const count = this._getInitialPageCount();

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
  initOptions() {
    this.buildOptions();
    if (this.params.pageNo > 1) {
      this.params.pageNo = 1;
      this.params.dispPageNo = 1;
      this.pageNoForm.setValue(1);
    }
  }

  private _getInitialPageCount() {
    const app = environment.settings.appPrefix;

    switch (app) {
      case 'flm':
        const json = localStorage.getItem('app-fleet-setting');
        try {
          const data = JSON.parse(json);

          if (data == null || data.count == null || !this._isValidPageCount(data.count)) {
            return this.settings.groupSettings.display_count;
          }

          return data.count;
        } catch (e) {
          return this.settings.groupSettings.display_count;
        }
      case 'opa':
        const count = localStorage.getItem('display_num');

        if (!this._isValidPageCount(count)) {
          return null;
        }

        return count;
      default:
        return null;
    }
  }

  /**
   * localStorageに表示件数を保存する
   */
  private _storePageCount(count: number) {
    const app = environment.settings.appPrefix;

    switch (app) {
      case 'flm':
        const json = localStorage.getItem('app-fleet-setting');
        try {
          const data = JSON.parse(json) || {};
          data.count = `${count}`;
          localStorage.setItem('app-fleet-setting', JSON.stringify(data));
        } catch (e) {
          localStorage.setItem('app-fleet-setting', JSON.stringify({
            count: `${count}`,
          }));
        }
        break;
      case 'opa':
        localStorage.setItem('display_num', `${count}`);
        break;
      default:
        break;
    }
  }

  /**
   * ローカルストレージから取得した表示件数が正しいものであるかを判定する
   * @param count 表示件数
   */
  private _isValidPageCount(count: string) {
    // リソースが取得できない場合無効とする
    return this.pageCountValues == null ||  this.pageCountValues.includes(+count);
  }
}
