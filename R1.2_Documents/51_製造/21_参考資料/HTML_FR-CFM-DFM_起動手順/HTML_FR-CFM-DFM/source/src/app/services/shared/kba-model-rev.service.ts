import { Injectable } from '@angular/core';
import { flattenDeep, values } from 'lodash';
import { ModelSelectType } from '../../constants/flm/flag';

@Injectable()
export class KbaModelRevService {
  modelSelectType = ModelSelectType;

  constructor() {}

  /**
   * 有効な選択状態であるかをチェック
   * @param params パラメータ
   * @param selectedDivisions 選択済みの車種
   */
  isValid(params, selectedDivisions) {
    return (
      params.modelSelectType === this.modelSelectType.all ||
      this._selectedAny(selectedDivisions)
    );
  }

  /**
   * 指定された機種・型式が選択済みであるかチェック
   * @param division 機種・型式
   */
  isDivisionSelected(params, selectedDivisions, division) {
    if (selectedDivisions[params.division_code] == null) {
      selectedDivisions[params.division_code] = [];
    }
    const target = selectedDivisions[params.division_code].find(
      el => el.model === division.model
    );

    return (
      target != null &&
      target.divisions.find(el => el.type_rev === division.type_rev)
    );
  }

  /**
   * 機種が一つでも選択されているかを判定
   * @param carType 現在選択されている車種
   */
  private _selectedAny(selectedDivisions) {
    if (!selectedDivisions) {
      return false;
    }
    return !!flattenDeep(
      flattenDeep(values(selectedDivisions)).map(d => d.divisions)
    ).length;
  }
}
