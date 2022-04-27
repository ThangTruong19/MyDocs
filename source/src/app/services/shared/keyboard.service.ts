import { Injectable } from '@angular/core';

@Injectable()
export class KeyboardService {

    private static readonly ENTER_KEY = 'Enter'; // Enterキー
    private static readonly ESCAPE_KEY = 'Escape'; // Escapeキー
    private static readonly F5_KEY = 'F5'; // F5キー

    /**
     * 画面のキー押下イベント発生時の処理を行う。
     * @param event
     */
    public disableEnterKey(event: KeyboardEvent): boolean {
        let isEnabled = true;
        if (this.isEnterKey(event)) {
            // Enterキー押下時の制御
            isEnabled = false;
        }
        return isEnabled; // 次のイベント続行するかを返す
    }

    /**
     * 画面のEscapeキー押下イベント発生時の処理を行う。
     * @param event
     */
    public isEscKey(event: KeyboardEvent): boolean {
        if (event.key === KeyboardService.ESCAPE_KEY) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 画面のEnterキー押下イベント発生時の処理を行う。
     * @param event
     */
    public isEnterKey(event: KeyboardEvent): boolean {
        if (event.key === KeyboardService.ENTER_KEY) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 画面のF5キー押下イベント発生時の処理を行う。
     * @param event
     */
    public isF5Key(event: KeyboardEvent): boolean {
        if (event.key === KeyboardService.F5_KEY) {
            return true;
        } else {
            return false;
        }
    }

}
