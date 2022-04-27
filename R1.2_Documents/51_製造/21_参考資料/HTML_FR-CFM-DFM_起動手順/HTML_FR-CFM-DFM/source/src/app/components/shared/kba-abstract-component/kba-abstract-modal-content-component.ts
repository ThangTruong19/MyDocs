import { get } from 'lodash';
import { ViewChildren, QueryList } from '@angular/core';

import { KbaFormTableSelectComponent } from '../kba-form-table-select/kba-form-table-select.component';
import { KbaSelectedComponent } from '../kba-selected/kba-selected.component';

import { KbaModalService } from '../../../services/shared/kba-modal.service';

export abstract class KbaAbstractModalContentComponent {
  protected abstract prefixWord;

  constructor(protected modalService: KbaModalService) { }

  /**
   * レスポンス情報からパスで指定される表示データを取得
   * @param data レスポンス情報
   * @param path パス
   */
  displayData(responseData, path: string): string {
    return get(responseData, path.replace(this.prefixWord, ''));
  }
}
