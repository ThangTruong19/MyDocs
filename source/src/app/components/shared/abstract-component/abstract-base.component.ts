import {
    OnDestroy,
    EventEmitter,
    ViewChildren,
    QueryList,
    Component,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { ErrorData } from 'app/types/error-data';
import { DisplayCode } from 'app/constants/display-code';
import { Field, Fields, Labels, ModalValues, Resource, Resources, ResourceValue, TableHeader, TableOptions } from 'app/types/common';
import { FormTableSelectComponent } from 'app/components/shared/form-table-select/form-table-select.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Navigation } from 'app/types/navigation';
import { FormTableTextComponent } from 'app/components/shared/form-table-text/form-table-text.component';
import { FormTableTextareaComponent } from 'app/components/shared/form-table-textarea/form-table-textarea.component';
import { ResourceKind } from 'app/constants/resource-type';

/**
 * 全てのコンポーネントに共通するフィールドを定義した仮想クラスです。
 */
@Component({ template: '' })
export abstract class AbstractBaseComponent implements OnDestroy {

    @ViewChildren(FormTableSelectComponent) public formTableSelectBoxes: QueryList<
        FormTableSelectComponent
    >;
    @ViewChildren(SelectedComponent) public selectBoxes: QueryList<
        SelectedComponent
    >;
    @ViewChildren(FormTableTextComponent) public formTableTextComponents: QueryList<FormTableTextComponent>;
    @ViewChildren(FormTableTextareaComponent) public formTableTextareaComponents: QueryList<FormTableTextareaComponent>;

    public onLoadEvent: EventEmitter<any> = new EventEmitter<any>();
    public isLoading: boolean;
    public labels: any;
    public resource: any;
    public errorData: ErrorData;
    public functions: Navigation[];
    protected destroyed = false;
    protected shouldDestroyNavigation = true;
    protected optionalTableColumn: any[] = [];
    protected notSortingColumns: string[] = [];
    private controlCodeType: { scrollable: string; fixed: string } = {
        scrollable: '0',
        fixed: '1',
    };

    constructor(
        protected navigationService: NavigationService,
        protected title: Title
    ) {
        this.isLoading = true;
    }

    public get formTextInputList(): (FormTableTextComponent | FormTableTextareaComponent)[] {
        return [...this.formTableTextComponents.toArray(), ...this.formTableTextareaComponents.toArray()];
    }

    ngOnDestroy(): void {
        this.destroyed = true;
        const thisComp: any = <any>this;
        if (
            thisComp.hasOwnProperty('modalService') &&
            thisComp['modalService'] &&
            thisComp['modalService'].closeAll &&
            typeof thisComp['modalService'].closeAll === 'function'
        ) {
            thisComp['modalService'].closeAll();
        }

        if (
            thisComp.hasOwnProperty('alertService') &&
            thisComp['alertService'] &&
            thisComp['alertService'].close &&
            typeof thisComp['alertService'].close === 'function'
        ) {
            thisComp['alertService'].close();
        }
        if (this.navigationService && this.shouldDestroyNavigation) {
            this.navigationService.destroyNavigations();
        }
    }

    /**
     * API の戻り値から初期化を行います。
     * @param res API の戻り値
     */
    protected initialize(res: any): void {
        this.navigationService.createNavigations(res['functions']);
        this.functions = _.get(res, 'functions.result_data.functions');
    }

    /**
     * 画面の初期化完了時に呼ばれる処理
     */
    public onLoad(): void {
        this.isLoading = false;
        // アコーディオンのちらつき防止のためにタイミングを一瞬ずらす
        setTimeout(() => this.onLoadEvent.emit());
    }

    /**
     * リソースに指定されたパスが存在するかチェック
     * @param path リソースのパス
     * @param checkValues valuesが空でないかをチェックする
     */
    public exists(path: string, checkValues = false): boolean {
        const resource: Resources & Resource = _.get(this.resource, path);

        return resource != null && (!checkValues || resource.values.length > 0);
    }

    /**
     * パスを '.' または '[ ]' で連結して返す
     * @param paths パス
     */
    public buildPath(...paths: string[]): string {
        return paths.reduce(
            (temp: any[], path: string) =>
                isNaN(+path)
                    ? [temp.concat([path]).join('.')]
                    : [`${temp[0]}[${path}]`],
            []
        )[0];
    }

    /**
     * destroy 以後の detectChanges() を実行しない detectChanges
     */
    public safeDetectChanges(): void {
        const thisComp: any = <any>this;
        if (thisComp['ref'] && thisComp['ref'].detectChanges && !this.destroyed) {
            thisComp['ref'].detectChanges();
        }
    }

    /**
     * ウェイト用のタイムアウト
     * `await this.timeout()` の形式で使用する
     * @param timeout 待ち時間
     */
    public timeout(timeout = 0): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), timeout));
    }

    /**
     * ネストしているオブジェクトをフラット化して key を'.'区切りにする
     * @param  obj 対象オブジェクト
     * @param  separator 区切り文字
     * @return '.'区切りのオブジェクト名
     */
    public flattenObj(obj: object, separator = '.'): object {
        const isValidObject = (value: any): boolean => {
            if (!value) {
                return false;
            }
            const isObject: boolean =
                Object.prototype.toString.call(value) === '[object Object]';
            const hasKeys: boolean = !!Object.keys(value).length;
            return !_.isArray(value) && !_.isBuffer(value) && isObject && hasKeys;
        };
        return Object.assign(
            {},
            ...(function _flatten(child: any, path: string[] = []): any {
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
    public formatTimeDifference(value: string[]): string {
        if (!value) {
            return '';
        }
        const sign: string = value[0];
        const hour: number = +value.slice(1, 3);
        const minute: string[] = value.slice(3);

        return `${sign}${hour}:${minute}`;
    }

    /**
     * すべてのセレクトボックスをリセットする
     */
    public resetAllSelectBoxes(): void {
        this.selectBoxes.forEach(select => {
            select.refresh(false);
            select.resetAndEmit();
        });

        this.formTableSelectBoxes.forEach(select => {
            select.refresh(false);
            select.resetAndEmit();
        });
    }

    /**
     * テキスト入力コンポーネントのリセットをフォームに反映する
     */
    public refreshFormTextInput(): void {
        this.safeDetectChanges();
        this.formTextInputList.forEach(text => text.applyValue());
    }

    /**
     * プルダウンの選択肢の初期値を取得する
     * @param resource リソース
     */
    public getInitialResourceValue(resource: Resource): ResourceValue {
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
        const target: RegExpMatchArray = message.match(/{{.+?}}/g) || [];
        target.forEach((t: string) => {
            const key: string = t.slice(2, -2);
            const resource: Resources & Resource = _.get(this.resource, key);

            if (resource != null) {
                result = result.replace(t, resource.name);
            }
        });

        return result;
    }

    /**
     * ローディング用のスピナーを表示
     */
    protected _showLoadingSpinner(): void {
        if ($('.app-spinner-upload').length === 0) {
            const template = `
        <div class="app-spinner app-spinner-upload">
          <i class="app-spinner__icon fa fa-refresh fa-spin"></i>
        </div>`;
            const loading = $(template);
            document.body.appendChild(loading[0]);
        }
    }

    /**
     * ローディング用のスピナーを消す
     */
    protected _hideLoadingSpinner(): void {
        $('.app-spinner-upload').remove();
    }

    /**
     * ページの title 要素を設定します。
     */
    protected _setTitle(): void {
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
        const res: Resources & Resource = _.get(this.resource, path);
        if (res) {
            const v: ResourceValue = _.find(res.values, item => item.value === value);
            return v ? v.name : '';
        } else {
            return '';
        }
    }

    /**
     * エラー内容をアラート表示し、エラー状態にセットする。
     * @param error エラーレスポンスの内容
     */
    protected _setError(error: any): void {
        const errorData: any = error.error ? error.error.error_data : null;

        if (errorData) {
            this.errorData = errorData;
        }
        throw error;
    }

    /**
     * エラー状態をクリア
     */
    protected _clearError(): void {
        this.errorData = null;
    }

    /**
     * 指定項目データからテーブルヘッダ情報を作成する
     * @param fieldItems 指定項目データ
     * @param opt オプション
     * @return テーブルヘッダ情報
     */
    protected _createThList(fieldItems: Fields, opt?: TableOptions): any {
        const scroll: any = opt && opt.scrollable;
        const columnStyles: string[] = opt && opt.columnStyles;
        const initialValue: any = scroll
            ? {
                scrollable: [],
                fixed: [],
            }
            : [];

        const thList: any = _.chain(fieldItems)
            .sortBy((item: Field) => +item.display_sequence_no)
            .concat(
                opt && opt.noOptionTableColumn ? [] : this._getOptionalTableColumn()
            )
            .reduce((result: any, item: Field) => {
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

        if (thList && columnStyles) {
            Object.keys(thList).forEach((index: any) => {
                let style: string = null;
                if (index in columnStyles) {
                    style = columnStyles[index];
                }
                thList[index].columnStyle = style
                index++;
            });
        }

        return thList;
    }

    /**
     * 指定項目情報をAPI コールに使用するパラメータに反映します。
     *
     * X-Fields用データを保持する場合などに使用します。
     *
     * @param fieldItems 指定項目データ
     * @return X-Fields用データ
     */
    protected _createXFields(fieldItems: Fields): string[] {
        return _.map(fieldItems, (field: Field) => field.path);
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

    protected _displayable(displayCode: string): boolean {
        if (displayCode) {
            return (
                displayCode === DisplayCode.display ||
                displayCode === DisplayCode.inactiveDisplay
            );
        } else {
            return true;
        }
    }

    protected _sortKey(item: any): string {
        return item.path;
    }

    protected _sortable(item: any): boolean {
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
    protected _getModalValues(fields: any, xCount: number = null, opt?: any): ModalValues {
        const requestHeaderParams: { [key: string]: any } = { 'X-Fields': this._createXFields(fields) };

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
    private _createTableHeader(item: any): TableHeader {
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

    private _getOptionalTableColumn(): any[] {
        return _.map(this.optionalTableColumn, col => {
            if (typeof col === 'string') {
                return { path: col, sortable: false, optional: true };
            } else {
                return col;
            }
        });
    }

}
