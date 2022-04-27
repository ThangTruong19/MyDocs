import { isArray, map } from 'lodash';
import { Injectable } from '@angular/core';
import { ErrorData } from 'app/types/error-data';
import * as $ from 'jquery';

type AlertType = 'success' | 'info' | 'warning' | 'danger';

@Injectable()
export class AlertService {
    private _isVisible = false;
    private _message: string;
    private _type: string;
    private _isAvailable = false;
    private manual: boolean;
    private timeout: any;

    public get isVisible(): boolean {
        return this._isVisible;
    }

    public get isAvailable(): boolean {
        return this._isAvailable;
    }

    public get message(): string {
        return this._message;
    }

    public get type(): string {
        return this._type;
    }

    /**
     * アラートを表示します。
     * @param message アラートに表示するメッセージ
     * @param manual アラートの手動開閉をするか
     * @param type アラートの種別
     */
    public show(
        message: string | string[],
        manual: boolean = false,
        type: AlertType = 'info'
    ): void {
        if (message == null) {
            return;
        }

        this._message = isArray(message)
            ? (message as string[]).join('<br>')
            : (message as string).replace(/\n/g, '<br>');
        this.manual = manual;
        this._type = type;

        this._showAlert();
    }

    public showErrorMessages(errorData: ErrorData): void {
        const errorMessages = map(errorData, err => `[${err.code}] ${err.message}`);
        this.show(errorMessages, true, 'danger');
    }

    /**
     * アラートを閉じます。
     */
    public close(): void {
        this._isVisible = false;
        clearTimeout(this.timeout);
    }

    /**
     * アラート消去のアニメーション後に起動するイベント用メソッドです。
     */
    public onEndAnimation(): void {
        if (!this.isVisible) {
            this._isAvailable = false;
        }
    }

    /**
     * アラートを強制的に表示させる
     */
    public forceSetVisible() {
        this._isVisible = true;
    }

    /**
     * アラートの表示に使用する内部用メソッドです。
     * @private
     */
    private _showAlert(): void {
        this._isAvailable = true;

        // ngIf と同タイミングでクラスを切り替えるとアニメーションが走らないため setTmeout でタイミングをずらす
        setTimeout(() => {
            requestAnimationFrame(() => {
                this._isVisible = true;
            });

            const closeBtn: JQuery<HTMLElement> = $('.btn-close');
            if (closeBtn.length) {
                closeBtn.addClass('close');
                closeBtn.html('×');
            }

            const _window = window as any;
            if (!this.manual) {
                this.timeout = setTimeout(() => {
                    this.close();
                }, _window.settings.notificationDisplayTime);
            }
        });
    }
}
