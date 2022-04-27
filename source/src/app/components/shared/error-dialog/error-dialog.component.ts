import { OnDestroy, OnInit, Component } from '@angular/core';

/**
 * エラーダイアログ　コンポーネント
 */
@Component({
    selector: 'app-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit, OnDestroy {

    /** ダイアログを表示するかどうか */
    public isShowDialog = false;

    /** エラーメッセージ */
    public errorMessage: string;

    /**
     * コンポーネントの初期化処理
     */
    public ngOnInit(): void {

    }

    /**
     * コンポーネント開放時の処理
     */
    public ngOnDestroy(): void {

    }

    /**
     * エラーメッセージを取得する
     */
    public getMessage(): string {
        return this.errorMessage;
    }

    /**
     * エラーメッセージをセットする
    //  * @param message メッセージ
     * * @param message メッセージ
     */
    public show(message: string) {
        this.errorMessage = message;
        this.isShowDialog = true;
    }

    /**
     * ダイアログを閉じる
     */
    public closeDialog(): void {
        this.errorMessage = '';
        this.isShowDialog = false;
    }
}
