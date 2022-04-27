import { Injectable, TemplateRef } from '@angular/core';
import {
    NgbModal,
    NgbModalRef,
    NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { Labels, TableHeader } from 'app/types/common';
import { ErrorData, ErrorDataItem } from 'app/types/error-data';
import { ModalComponent } from 'app/components/shared/modal/modal.component';

export interface ModalOption {
    title: string;
    labels: Labels;
    content: TemplateRef<any>;
    enableOk?: boolean;
    okBtnLabel?: string;
    okBtnClass?: string;
    closeBtnLabel?: string;
    showCloseBtn?: boolean;
    ok?: () => void;
    ng?: () => void;
    close?: () => void;
}

@Injectable()
export class ModalService {
    CLOSE_TIMEOUT = 300;

    modalRef: NgbModalRef;
    modalStack: NgbModalRef[] = [];
    private _currentScrollY: number;
    private _enableOk: boolean;

    constructor(private modalService: NgbModal) { }

    public set enableOk(value: boolean) {
        this._enableOk = value;
        /*
          ライブラリ側でエラーが発生するため try-catch を使用
          処理上は問題なし
        */
        try {
            this.modalRef.componentInstance.enableOk = value;
        } catch (e) {
            console.warn(e);
        }
    }

    public get enableOk() {
        return this._enableOk;
    }

    /**
     * モーダルオープン
     *
     * オプションで指定したタイトル、モーダルの内容でモーダルを開く。
     * OKボタン押下時の処理をokオプションで指定ができる。
     *
     * @param option tilte: タイトル、content: モーダルの内容、ok: OKボタン押下時の処理（省略化）
     * @param modalOption モーダルオプション
     */
    public open(option: ModalOption, modalOption: NgbModalOptions = {}) {
        this._beforeOpen(option, modalOption);
        this.modalRef = this.modalService.open(ModalComponent, {
            ...modalOption,
            size: modalOption.size || 'lg',
        });
        this.modalRef.componentInstance.title = option.title;
        this.modalRef.componentInstance.labels = option.labels;
        this.modalRef.componentInstance.content = option.content;
        this.modalRef.componentInstance.okBtnLabel = option.okBtnLabel;
        this.modalRef.componentInstance.okBtnClass = option.okBtnClass;
        this.modalRef.componentInstance.closeBtnLabel = option.closeBtnLabel;
        this.modalRef.componentInstance.hasOk = !_.isUndefined(option.ok);
        this.modalRef.componentInstance.showCloseBtn = !_.isUndefined(
            option.showCloseBtn
        )
            ? option.showCloseBtn
            : true;
        this.enableOk = !_.isUndefined(option.enableOk) ? option.enableOk : true;
        this.modalRef.result.then((result: string) => {
            switch (result) {
                case 'ok':
                    option.ok();
                    break;
                case 'ng':
                    if (_.has(option, 'ng')) {
                        option.ng();
                    } else if (_.has(option, 'close')) {
                        option.close();
                    }
                    break;
                case 'close':
                    if (_.has(option, 'close')) {
                        option.close();
                    }
                    break;
            }
            this._afterClose();
        });
        this._afterOpen(this.modalRef);
    }

    /**
     * カスタムモーダルオープン
     *
     * モーダルコンポーネントを指定してモーダルを開く
     *
     * @param modal モーダルコンポーネント
     * @param option モーダルコンポーネントにセットするフィールド名とその値
     * @param modalOption モーダルオプション
     */
    public customOpen(modal: any, option: any, modalOption: NgbModalOptions = {}): void {
        this._beforeOpen(option, modalOption);
        this.modalRef = this.modalService.open(modal, modalOption);
        if (this.modalRef.componentInstance != null) {
            _.each(option, (v, k) => {
                this.modalRef.componentInstance[k] = v;
            });
        }
        this.modalRef.result.then((result: string) => {
            switch (result) {
                case 'ok':
                    option.ok();
                    break;
                case 'ng':
                    if (_.has(option, 'ng')) {
                        option.ng();
                    } else if (_.has(option, 'close')) {
                        option.close();
                    }
                    break;
                case 'close':
                    if (_.has(option, 'close')) {
                        option.close();
                    }
                    break;
            }
            this._afterClose();
        });
        this._afterOpen(this.modalRef);
    }

    /**
     * モーダルを閉じる
     */
    public close() {
        this.getModalElements(this.modalStack.length - 1).forEach(el =>
            el.classList.remove('_show')
        );
        setTimeout(() => this._close(), this.CLOSE_TIMEOUT);
    }

    /**
     * 指定したヘッダ情報からモーダル用に必要カラムをピックアップした新しいヘッダ情報を返す
     * @param ths ヘッダ情報
     * @param columns 必要カラム
     */
    public pickModalDesc(ths: any, columns: any) {
        return _.map(columns, columnName =>
            _.find(ths, th => th.name === columnName)
        );
    }

    /**
     * 指定したデータからモーダルに必要なカラムをピックアップした新しいデータを返す
     * @param dataList データ
     * @param columns 必要カラム
     */
    public pickModalVal(dataList: any, columns: any) {
        return _.reduce(
            dataList,
            (array, data) => {
                array.push(_.pick(data, columns));
                return array;
            },
            []
        );
    }

    /**
     * モーダルをすべて閉じる
     */
    public closeAll() {
        this.modalStack.forEach(modal => modal.close());
    }

    /**
     * 結果モーダル用のリソース(ヘッダ情報・内容)を取得
     * @param labels ラベル情報
     * @param desc ヘッダ情報
     * @param requestData リクエストデータ詳細
     * @param responseData レスポンスデータ
     * @param resource リソース
     * @param opt オプション
     */
    public createResultModalResource(
        labels: Labels,
        desc: TableHeader[],
        requestData: any,
        responseData: any,
        resource: any,
        opt = {}
    ): any {
        const resDesc: TableHeader[] = _.flatten([
            { label: labels.result, displayable: true, name: 'result' },
            desc,
            { label: labels.result_detail, displayable: true, name: 'message' },
        ]);
        const resVal = this._createResultVal(requestData, responseData, resource);
        const resultCountMessage: string = this.createResultCountMessage(
            labels,
            responseData
        );

        return [resDesc, resVal, resultCountMessage];
    }

    /**
     * 成功・失敗件数の表示用データを返す
     * @param labels ラベル情報
     * @param responseData レスポンスデータ
     */
    public createResultCountMessage(labels: Labels, responseData: any): string {
        const total: number = responseData.length;
        const success: number = _.filter(responseData, res => {
            return _.has(res, 'result_data');
        }).length;
        const compiled = _.template(labels.result_count_message);
        return compiled({ total: total, success: success, fail: total - success });
    }

    /**
     * リクエストデータとレスポンスデータを組み合わせて結果モーダルに表示する内容を取得
     * @param requestData リクエストデータ詳細
     * @param responseData レスポンスデータ
     * @param resource リソース
     */
    private _createResultVal(requestData: any, responseData: any, resource: any): any[] {
        const resultVal: any[] = [];
        _.each(requestData, (req, index) => {
            const r = {};
            if (_.has(responseData[index], 'error_data')) {
                const result = { result: { type: 'result', success: false } };
                _.merge(r, result, req, {
                    message: this._buildErrorMessages(
                        responseData[index].error_data,
                        resource
                    ),
                    css_class: 'warning',
                });
            } else {
                const result = { result: { type: 'result', success: true } };
                _.merge(r, result, req, { message: '', css_class: '' });
            }
            resultVal.push(r);
        });
        return resultVal;
    }

    /**
     * 結果モーダルの内容に表示するエラーメッセージを生成
     * @param errorData エラーデータ
     * @param resource リソース
     */
    private _buildErrorMessages(errorData: ErrorData, resource: any): string[] {
        return _.map(errorData, (e: ErrorDataItem) =>
            this._replacePath(e.message, e.keys, resource)
        );
    }

    /**
     * メッセージ内のキーを対応するヘッダ情報のラベルで置き換える
     * @param message メッセージ
     * @param keys キー
     * @param resource リソース
     */
    private _replacePath(message: string, keys: string[], resource: any): string {
        const target: RegExpMatchArray = message.match(/{{.+?}}/g) || [];
        target.forEach((t: string) => {
            const key: string = t.slice(2, -2);
            const res = _.get(resource, key);

            if (res != null && res.name != null) {
                message = message.replace(t, res.name);
            }
        });
        return message;
    }

    /**
     * モーダルを開く時の前処理
     */
    private _beforeOpen(option: ModalOption, modalOption: NgbModalOptions) {
        const index = this.modalStack.length;
        modalOption.beforeDismiss = () => {
            this.close();
            return false;
        };
        if (_.isEmpty(modalOption.windowClass)) {
            modalOption.windowClass = `modal-${index}`;
        } else {
            modalOption.windowClass = modalOption.windowClass + ` modal-${index}`;
        }

        if (this.modalStack.length === 0) {
            // モーダル背景を固定
            this._currentScrollY = $(window).scrollTop();
            $('body').css({
                position: 'fixed',
                width: '100%',
                top: -1 * this._currentScrollY,
            });
        }
    }

    /**
     * モーダルを開く時の後処理
     */
    private _afterOpen(modalRef: NgbModalRef) {
        if (modalRef.componentInstance) {
            modalRef.componentInstance.index = this.modalStack.length;
        }

        for (let i = 0; i < this.modalStack.length; i++) {
            this.getModalElements(i).forEach(el => el.classList.add('hidden'));
        }

        setTimeout(() => {
            this.getModalElements(this.modalStack.length).forEach(el =>
                el.classList.add('_show')
            );
            this.modalStack.push(modalRef);
        }, 200);
    }

    /**
     * モーダルクローズ
     *
     * モーダルが開いている場合に閉じる
     */
    private _close(): void {
        if (this.modalStack.length === 0) {
            return;
        }

        this.modalStack[this.modalStack.length - 1].close('close');
    }

    /**
     * モーダルを閉じる時の後処理
     */
    private _afterClose() {
        this.modalStack.pop();
        if (this.modalStack.length === 0) {
            // モーダル背景の固定を解除
            $('body').attr({ style: '' });
            $('html, body').prop({ scrollTop: this._currentScrollY });
        }
        this.modalRef = this.modalStack[this.modalStack.length - 1];

        for (let i = 0; i < this.modalStack.length; i++) {
            this.getModalElements(i).forEach(el => el.classList.remove('hidden'));
        }
    }

    /**
     * 指定 index に対応するモーダル要素を取得
     * @param index インデックス
     */
    private getModalElements(index: number): Element[] {
        const modal: Element = document.querySelector(`.modal-${index}`);

        if (modal == null) {
            return [];
        }

        const backdrop = modal.previousElementSibling;
        return [modal, backdrop];
    }
}
