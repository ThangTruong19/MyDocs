import { Component, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-child-text',
  templateUrl: './kba-child-text.component.html',
  styleUrls: ['./kba-child-text.component.scss'],
})
export class KbaChildTextComponent {
  @HostBinding('class') elementClass = 'kba-child-text';

  @Input() formGroup?: FormGroup;
  @Input() params: any[];
  @Input() labels: { [key: string]: string };
  @Input() name: string;
  @Input() modelPath: string;
  @Input() labelPath: string;
  @Input() root: HTMLElement;
  @Input() originalParams?: any[];
  @Input() path: string;
  @Input() errorData;
  @Input() checkIsEdited: boolean;
  @Input() startIndex = 1;
  @Input() set parent(el: HTMLElement) {
    if (el == null) {
      return;
    }

    let timeout;
    const padding = 15;
    const fn = () => {
      const rect = el.getBoundingClientRect();
      const parent = this.root && this.root.getBoundingClientRect();
      if (rect.top > 0 && parent && parent.top > 0) {
        clearTimeout(timeout);
        this.arrowOffset = `${rect.top - parent.top + padding}px`;
        return;
      }
      timeout = setTimeout(fn);
    };
    timeout = setTimeout(fn);
  }

  arrowOffset: string;

  /**
   * 項目が編集済みであるかをチェック
   * @param item 項目
   * @param original オリジナルの値
   * @param path 比較対象のパス
   */
  isEdited(item, original, path: string): boolean {
    return (
      this.checkIsEdited &&
      item &&
      original &&
      _.get(item, path) !== _.get(original, path)
    );
  }

  /**
   * エラー判定用のパスを返す
   * @param path パス
   * @param index インデックス
   */
  getValidationPath(path: string, index: number): string {
    return `${path}[${index + this.startIndex}].${this.modelPath}`;
  }
}
