import { Component } from '@angular/core';
import { get } from 'lodash';
import { ModalService } from 'app/services/shared/modal.service';

@Component({ template: '' })
export abstract class AbstractModalContentComponent {

    protected abstract prefixWord: string;

    constructor(protected modalService: ModalService) { }

    /**
     * レスポンス情報からパスで指定される表示データを取得
     * @param responseData レスポンス情報
     * @param path パス
     */
    public displayData(responseData: any, path: string): string {
        return get(responseData, path.replace(this.prefixWord, ''));
    }
}
