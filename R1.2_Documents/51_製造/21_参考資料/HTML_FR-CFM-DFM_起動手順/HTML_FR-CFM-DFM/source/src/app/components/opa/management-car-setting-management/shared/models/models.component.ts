import { times } from 'lodash';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import {
  Model,
  Type,
} from '../../../../../types/opa/management-car-setting/model-type-setting';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss'],
})
export class ModelsComponent {
  @Input() models: Model[];
  @Input() resource;
  @Input() labels;
  @Input() clickable: boolean;
  @Input() getCellClasses?: (
    type: Type,
    model?: Model
  ) => {
    'cell-green': boolean;
    'cell-red': boolean;
  };
  @Input() emptyMessage = '';
  @Output() change: EventEmitter<Model[]> = new EventEmitter();

  dummyCells = times(5);

  /**
   * セルクリック時の処理
   * @param model 機種
   */
  handleCellClicked(type: Type) {
    type.active_kind = `${+!+type.active_kind}`;
    this.change.emit(this.models);
  }

  /**
   * 設定済みの型式が空であるかを判定する
   */
  isTypesEmpty() {
    return (
      this.models.reduce(
        (temp: number, model: Model) => temp + model.types.length,
        0
      ) === 0
    );
  }
}
