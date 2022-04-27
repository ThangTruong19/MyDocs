import { times } from 'lodash';
import { Component, Input } from '@angular/core';

import {
  MakerDivision,
  Model,
} from '../../../../../types/opa/management-car-setting/model-setting';
import { ManagementCarSettingService } from '../../../../../services/opa/management-car-setting/management-car-setting.service';

@Component({
  selector: 'app-maker-divisions',
  templateUrl: './maker-divisions.component.html',
  styleUrls: ['./maker-divisions.component.scss'],
})
export class MakerDivisionsComponent {
  @Input() makerDivisions;
  @Input() clickable: boolean;
  @Input() getCellClasses: (
    model: Model,
    makerDivision?: MakerDivision
  ) => {
    'cell-green': boolean;
    'cell-red': boolean;
  };
  @Input() emptyMessage = '';

  dummyCells = times(6);

  constructor(public managementCarService: ManagementCarSettingService) {}

  /**
   * セルクリック時の処理
   * @param model 機種
   */
  handleCellClicked(model: Model) {
    model.active_kind = `${+!+model.active_kind}`;
  }

  /**
   * 設定済みの機種が空であるかを判定する
   */
  isModelsEmpty() {
    return (
      this.makerDivisions.reduce(
        (temp: number, division: MakerDivision) =>
          temp + division.models.length,
        0
      ) === 0
    );
  }
}
