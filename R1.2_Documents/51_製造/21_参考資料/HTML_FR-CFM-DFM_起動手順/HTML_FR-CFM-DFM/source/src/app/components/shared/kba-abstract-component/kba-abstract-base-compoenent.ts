import * as $ from 'jquery';
import * as _ from 'lodash';
import {
  OnDestroy,
  EventEmitter,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ErrorData } from '../../../types/error-data';

import { DisplayCode } from '../../../constants/display-code';
import { Labels, ModalValues, Resources, Resource } from '../../../types/common';

import { KbaFormTableSelectComponent } from '../kba-form-table-select/kba-form-table-select.component';
import { KbaSelectedComponent } from '../kba-selected/kba-selected.component';

import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { Navigation } from '../../../types/navigation';
import { KbaFormTableTextComponent } from '../kba-form-table-text/kba-form-table-text.component';
import { KbaFormTableTextareaComponent } from '../kba-form-table-textarea/kba-form-table-textarea.component';
import { ResourceKind } from '../../../constants/resource-type';

/**
 * 全てのコンポーネントに共通するフィールドを定義した仮想クラスです。
 */
export abstract class KbaAbstractBaseComponent implements OnDestroy {
  @ViewChildren(KbaFormTableSelectComponent) kbaFormTableSelectBoxes: QueryList<
    KbaFormTableSelectComponent
  >;
  @ViewChildren(KbaSelectedComponent) kbaSelectBoxes: QueryList<
    KbaSelectedComponent
  >;
  @ViewChildren(KbaFormTableTextComponent) formTableTextComponents: QueryList<KbaFormTableTextComponent>;
  @ViewChildren(KbaFormTableTextareaComponent) formTableTextareaComponents: QueryList<KbaFormTableTextareaComponent>;

  onLoadEvent: EventEmitter<any> = new EventEmitter();
  isLoading: boolean;
  labels: any;
  resource: any;
  destroyed = false;
  errorData: ErrorData;
  shouldDestroyNavigation = true;
  functions: Navigation[];

  controlCodeType = {
    scrollable: '0',
    fixed: '1',
  };
  optionalTableColumn: any[] = [];
  notSortingColumns: string[] = [];

  get formTextInputList() {
    return [...this.formTableTextComponents.toArray(), ...this.formTableTextareaComponents.toArray()];
  }

  constructor(
    protected navigationService: KbaNavigationService,
    private title: Title
  ) {
    this.isLoading = true;
  }

  ngOnDestroy() {
    this.destroyed = true;

    if (
      this.hasOwnProperty('modalService') &&
      typeof this['modalService'].close === 'function'
    ) {
      this['modalService'].closeAll();
    }

    if (
      this.hasOwnProperty('alertService') &&
      typeof this['alertService'].close === 'function'
    ) {
      this['alertService'].close();
    }
    if (this.navigationService && this.shouldDestroyNavigation) {
      this.navigationService.destroyNavigations();
    }
  }

  /**
   * API の戻り値から初期化を行います。
   * @param res API の戻り値
   */
  initialize(res) {
    this.navigationService.createNavigations(res['functions']);
    this.functions = _.get(res, 'functions.result_data.functions');
  }

  /**
   * 画面の初期化完了時に呼ばれる処理
   */
  onLoad() {
    this.isLoading = false;
    // アコーディオンのちらつき防止のためにタイミングを一瞬ずらす
    setTimeout(() => this.onLoadEvent.emit());
  }

  /**
   * リソースに指定されたパスが存在するかチェック
   * @param path リソースのパス
   * @param checkValues valuesが空でないかをチェックする
   */
  exists(path: string, checkValues = false) {
    const resource = _.get(this.resource, path);

    return resource != null && (!checkValues || resource.values.length > 0);
  }

  /**
   * パスを '.' または '[ ]' で連結して返す
   * @param paths パス
   */
  buildPath(...paths: string[]): string {
    return paths.reduce(
      (temp, path) =>
        isNaN(+path)
          ? [temp.concat([path]).join('.')]
          : [`${temp[0]}[${path}]`],
      []
    )[0];
  }

  /**
   * destroy 以後の detectChanges() を実行しない detectChanges
   */
  safeDetectChanges() {
    if (this['ref'] && this['ref'].detectChanges && !this.destroyed) {
      this['ref'].detectChanges();
    }
  }

  /**
   * ウェイト用のタイムアウト
   * `await this.timeout()` の形式で使用する
   * @param timeout 待ち時間
   */
  timeout(timeout = 0) {
    return new Promise(resolve => setTimeout(() => resolve(), timeout));
  }

  /**
   * ネストしているオブジェクトをフラット化して key を'.'区切りにする
   * @param  {object} obj           対象オブジェクト
   * @param  {string} separator='.' [description]
   * @return {object}               [description]
   */
  flattenObj(obj: object, separator = '.'): object {
    const isValidObject = (value): boolean => {
      if (!value) {
        return false;
      }
      const isΟbject =
        Object.prototype.toString.call(value) === '[object Object]';
      const hasKeys = !!Object.keys(value).length;
      return !_.isArray(value) && !_.isBuffer(value) && isΟbject && hasKeys;
    };
    return Object.assign(
      {},
      ...(function _flatten(child, path = []) {
        return [].concat(
          ...Object.keys(child).map(key =>
            isValidObject(child[key])
              ? _flatten(child[key], path.concat([key]))
              : { [path.concat([key]).join(separator)]: child[key] }
          )
        );
      })(obj)
    );
  }

  /**
   * 時差の文言を成形して返す
   * @param value 値
   */
  formatTimeDifference(value) {
    if (!value) {
      return '';
    }
    const sign = value[0];
    const hour = +value.slice(1, 3);
    const minute = value.slice(3);

    return `${sign}${hour}:${minute}`;
  }

  /**
   * すべてのセレクトボックスをリセットする
   */
  resetAllSelectBoxes() {
    this.kbaSelectBoxes.forEach(select => {
      select.refresh(false);
      select.resetAndEmit();
    });

    this.kbaFormTableSelectBoxes.forEach(select => {
      select.refresh(false);
      select.resetAndEmit();
    });
  }

  /**
   * テキスト入力コンポーネントのリセットをフォームに反映する
   */
  refreshFormTextInput() {
    this.safeDetectChanges();
    this.formTextInputList.forEach(text => text.applyValue());
  }

  /**
   * プルダウンの選択肢の初期値を取得する
   * @param resource リソース
   */
  getInitialResourceValue(resource: Resource) {
    return resource.values.find(val => val.kind === ResourceKind.highlight) ||
      resource.values[0];
  }

  /**
   * メッセージ内のリソースパスをリソース名に置き換える
   * @param message メッセージ
   * @param keys エラーレスポンスのキー情報（リソースパスに対応）
   */
  protected _replacePath(message: string, keys: string[]): string {
    let result = message;
    const target = message.match(/{{.+?}}/g) || [];
    target.forEach(t => {
      const key = t.slice(2, -2);
      const resource = _.get(this.resource, key);

      if (resource != null) {
        result = result.replace(t, resource.name);
      }
    });

    return result;
  }

  /**
   * ローディング用のスピナーを表示
   */
  protected _showLoadingSpinner() {
    if ($('.KBA-spinner-upload').length === 0) {
      const template = `
        <div class="KBA-spinner KBA-spinner-upload">
          <i class="KBA-spinner__icon fa fa-refresh fa-spin"></i>
        </div>`;
      const loading = $(template);
      document.body.appendChild(loading[0]);
    }
  }

  /**
   * ローディング用のスピナーを消す
   */
  protected _hideLoadingSpinner() {
    $('.KBA-spinner-upload').remove();
  }

  /**
   * ページの title 要素を設定します。
   */
  protected _setTitle() {
    this.title.setTitle(`${this.labels.page_title} | KOMTRAX`);
  }

  /**
   * リソース値の名称取得
   *
   * リソースパスで指定したリソースについて、値に対応する名前を取得する。
   *
   * @param path リソースのパス
   * @param value 値
   */
  protected _getResourceValueName(path: string, value: string): string {
    const res = _.get(this.resource, path);
    if (res) {
      const v = _.find(res.values, item => item.value === value);
      return v ? v.name : '';
    } else {
      return '';
    }
  }

  /**
   * エラー内容をアラート表示し、エラー状態にセットする。
   * @param errorData エラーレスポンスの内容
   * @param alertService アラートサービス
   */
  protected _setError(error: any, alertService: KbaAlertService) {
    const errorData = error.error ? error.error.error_data : null;

    if (errorData) {
      this.errorData = errorData;
    }
    throw error;
  }

  /**
   * エラー状態をクリア
   */
  protected _clearError() {
    this.errorData = null;
  }

  /**
   * 指定項目データからテーブルヘッダ情報を作成する
   * @param fieldItems 指定項目データ
   * @param opt オプション
   * @return テーブルヘッダ情報
   */
  protected _createThList(fieldItems: any[], opt?: any) {
    const scroll = opt && opt.scrollable;
    const initialValue = scroll
      ? {
        scrollable: [],
        fixed: [],
      }
      : [];

    return _.chain(fieldItems)
      .sortBy(item => +item.display_sequence_no)
      .concat(
        opt && opt.noOptionTableColumn ? [] : this._getOptionalTableColumn()
      )
      .reduce((result, item) => {
        if (scroll) {
          switch (item.control_code) {
            case this.controlCodeType.scrollable:
              result.scrollable.push(this._createTableHeader(item));
              break;
            case this.controlCodeType.fixed:
              result.fixed.push(this._createTableHeader(item));
              break;
          }
        } else {
          result.push(this._createTableHeader(item));
        }
        return result;
      }, initialValue)
      .value();
  }

  /**
   * 指定項目情報をAPI コールに使用するパラメータに反映します。
   *
   * X-Fields用データを保持する場合などに使用します。
   *
   * @param fieldItems 指定項目データ
   * @return X-Fields用データ
   */
  protected _createXFields(fieldItems): string[] {
    return _.map(fieldItems, field => field.path);
  }

  /**
   * データ取得用のキーを設定
   *
   * 継承したクラス側で必要に応じてオーバライドする。
   *
   * @param key キー
   * @return データ取得用キー
   */
  protected _dataKey(key: string): string {
    return null;
  }

  /**
   * 確認モーダル用のキーを設定
   *
   * 継承したクラス側で必要に応じてオーバライドする。
   *
   * @param key キー
   * @return 確認モーダル用キー
   */
  protected _confirmKey(key: string): string {
    return this._dataKey(key);
  }

  protected _displayable(display_code) {
    if (display_code) {
      return (
        display_code === DisplayCode.display ||
        display_code === DisplayCode.inactiveDisplay
      );
    } else {
      return true;
    }
  }

  protected _sortKey(item): string {
    return item.path;
  }

  protected _sortable(item): boolean {
    if (_.has(item, 'sortable')) {
      return item.sortable;
    }

    return !_.includes(this.notSortingColumns, item.path);
  }

  protected _shortName(key: string): string {
    return _.join(key.split(/[\.:]/), '_');
  }

  protected _formatKey(key: string): string {
    return _.chain(key)
      .split('.')
      .tail()
      .join('.')
      .value();
  }

  /**
   * エラー内容からアラート表示するメッセージを作成する
   * @param errorData エラーレスポンスの内容
   */
  protected _createErrorMessages(errorData: ErrorData): string[] {
    return _.map(errorData, data => this._replacePath(data.message, data.keys));
  }

  /**
   * 確認モーダル用の情報を取得
   * @param fields 確認モーダル用のデータ
   * @param xCount 取得対象件数
   */
  protected _getModalValues(fields, xCount = null, opt?: any): ModalValues {
    const requestHeaderParams = { 'X-Fields': this._createXFields(fields) };

    if (xCount) {
      requestHeaderParams['X-Count'] = xCount;
    }

    return {
      requestHeaderParams,
      listDesc: this._createThList(fields, opt),
      listVal: [],
    };
  }

  /**
   * テーブルヘッダ情報を生成
   * @param item 作成対象項目
   */
  private _createTableHeader(item) {
    return {
      id: item.display_sequence_no,
      label: item.name || this.labels[item.path],
      name: item.path,
      shortName: this._shortName(item.path),
      displayable: this._displayable(item.display_code),
      dataKey: this._dataKey(item.path),
      confirmKey: this._confirmKey(item.path),
      sortKey: this._sortKey(item),
      sortable: this._sortable(item),
      formatKey: this._formatKey(item.path),
      optional: item.optional ? item.optional : false,
    };
  }

  private _getOptionalTableColumn() {
    return _.map(this.optionalTableColumn, col => {
      if (typeof col === 'string') {
        return { path: col, sortable: false, optional: true };
      } else {
        return col;
      }
    });
  }
}
