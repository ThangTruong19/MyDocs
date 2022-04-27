import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { KbaSelectTypeComponent } from '../kba-select-type/kba-select-type.component';
import { KbaSelectedComponent } from '../kba-selected/kba-selected.component';
import { KbaTimeDifferenceComponent } from './kba-time-difference.component';
import { FilterReservedWord } from '../../../constants/condition';

@Component({
  selector: 'app-kba-car-search',
  templateUrl: './kba-car-search.component.html',
  styleUrls: ['./kba-car-search.component.scss'],
})
export class KbaCarSearchComponent {
  @ViewChild('supportDistributorSelect', { static: false })
  supportDistributorSelect: KbaSelectTypeComponent;
  @ViewChild('subGroupSelect', { static: false })
  subGroupSelect: KbaSelectTypeComponent;
  @ViewChild('customerSelect', { static: false })
  customerSelect: KbaSelectTypeComponent;
  @ViewChild('bankSelect', { static: false }) bankSelect: KbaSelectedComponent;
  @ViewChild('insuranceSelect', { static: false })
  insuranceSelect: KbaSelectedComponent;
  @ViewChild('financeSelect', { static: false })
  financeSelect: KbaSelectedComponent;
  @ViewChild('serviceDistributorSelect', { static: false })
  serviceDistributorSelect: KbaSelectedComponent;
  @ViewChild('svOrganizationCodesSelect', { static: false })
  svOrganizationCodesSelect: KbaSelectedComponent;
  @ViewChild('sdOrganizationCodesSelect', { static: false })
  sdOrganizationCodesSelect: KbaSelectedComponent;
  @ViewChild('communicationSettingSelect', { static: false })
  communicationSettingSelect: KbaSelectedComponent;
  @ViewChild('class1Select', { static: false })
  class1Select: KbaSelectedComponent;
  @ViewChild('class2Select', { static: false })
  class2Select: KbaSelectedComponent;
  @ViewChild('class3Select', { static: false })
  class3Select: KbaSelectedComponent;
  @ViewChild('class4Select', { static: false })
  class4Select: KbaSelectedComponent;
  @ViewChild('class5Select', { static: false })
  class5Select: KbaSelectedComponent;
  @ViewChild('timeDifferenceComponent', { static: false })
  timeDifferenceComponent: KbaTimeDifferenceComponent;
  @ViewChild('smrIntervalSelect', { static: false })
  smrIntervalSelect: KbaSelectedComponent;
  @ViewChild('fuelSelect', { static: false }) fuelSelect: KbaSelectedComponent;
  @ViewChildren(KbaSelectedComponent) selectComponents: QueryList<
    KbaSelectedComponent
  >;
  @ViewChildren('customAttribute') customAttributeSelects: QueryList<
    KbaSelectedComponent
  >;
  @Input() activeTab:
    | 'targetCar'
    | 'identifier'
    | 'belongs'
    | 'attributes'
    | 'settings'
    | 'smr-settings'
    | 'fuel-settings';
  @Input() modelCarTypeCheck: boolean;
  @Input() labels;
  @Input() resource;
  @Input() params;
  @Output() changeTab: EventEmitter<any> = new EventEmitter();
  @Output() changeModelCarTypeCheck: EventEmitter<any> = new EventEmitter();
  @Output() changeSupportDistributor: EventEmitter<any> = new EventEmitter();
  @Output() changeServiceDb: EventEmitter<any> = new EventEmitter();
  @Output() changeServiceDbOrgCode: EventEmitter<any> = new EventEmitter();
  @Output() changeSupportDbOrgCode: EventEmitter<any> = new EventEmitter();

  serviceDbOrgCode = {
    organization_codes: null,
  };
  supportDbOrgCode = {
    organization_codes: null,
  };

  /**
   * リソースに指定されたパスが存在するかチェック
   * @param path リソースのパス
   * @param checkValues valuesが空でないかをチェックする
   */
  exists(path: string, checkValues = false) {
    const resource = _.get(this.resource, path);

    return resource != null && (!checkValues || resource.values.length > 0);
  }

  /**
   * タブ切り替え時コールバック
   * @param value タブ種類
   */
  onTabChange(value) {
    this.changeTab.emit(value);
  }

  /**
   * 「機種-型式で入力する」チェックボックス変更時コールバック
   */
  onChangeModelCarTypeCheck() {
    this.changeModelCarTypeCheck.emit();
  }

  /**
   * 担当DB変更時コールバック
   */
  onChangeSupportDistributor() {
    const params = this.supportDistributorSelect.getSelectedParam() ;
    this.changeSupportDistributor.emit(params.length === 0 ? [FilterReservedWord.selectAll] : params);
  }

  /**
   * サービスDB変更時コールバック
   * @param value サービスDBの値
   */
  onChangeServiceDb(value) {
    this.changeServiceDb.emit(value);
  }

  /**
   * サービスDB組織コード変更時コールバック
   * @param value サービスDB組織コードの値
   */
  onChangeServiceDbOrgCode(value) {
    this.changeServiceDbOrgCode.emit(value);
  }

  /**
   * 担当DB組織コード変更時コールバック
   * @param value 担当DB組織コードの値
   */
  onChangeSupportDbOrgCode(value) {
    this.changeSupportDbOrgCode.emit(value);
  }

  /**
   * 時差設定変更時コールバック
   * @param value 時差設定値
   */
  onChangeTimeDifference(value: string) {
    this.params.car_management.time_difference = value;
  }

  /**
   * パラメータを選択ボックス（種別あり）の選択値にセットする
   * @param params
   */
  async setSelectedParams(params) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.supportDistributorSelect && params.supportDistributor) {
          this.supportDistributorSelect.setSelectedParam(
            params.supportDistributor
          );
        }
        if (this.subGroupSelect && params.subGroup) {
          this.subGroupSelect.setSelectedParam(params.subGroup);
        }
        if (this.customerSelect && params.customer) {
          this.customerSelect.setSelectedParam(params.customer);
        }

        resolve();
      });
    });
  }

  /**
   * 選択ボックス（種別あり）の初期化をおこなう
   */
  async initAllSelectedParams() {
    await (async () => {
      if (this.supportDistributorSelect) {
        this.supportDistributorSelect.initSelectedParam();
      }
      if (this.subGroupSelect) {
        this.subGroupSelect.initSelectedParam();
      }
      this.initBelongSelectedParams();
    })();
    this.selectComponents.forEach(sel => sel.refresh());
  }

  /**
   * 選択ボックス（種別あり）の担当DB依存項目の初期化をおこなう
   */
  initBelongSelectedParams() {
    if (this.customerSelect) {
      this.customerSelect.initSelectedParam();
    }
  }

  /**
   * サービスDBの選択項目の更新をおこなう
   */
  refreshServiceDistributor() {
    if (this.serviceDistributorSelect) {
      this.serviceDistributorSelect.refresh(false);
    }
  }

  /**
   * サービスDB組織コードの選択項目の更新をおこなう
   */
  refreshOrganizationCodes() {
    if (this.svOrganizationCodesSelect) {
      this.svOrganizationCodesSelect.refresh(false);
    }
  }

  /**
   * 担当DBの選択項目の更新をおこなう
   */
  refreshSupportDistributor() {
    if (this.supportDistributorSelect) {
      const item = !this.supportDistributorSelect.listSelections.find(
        i => i.id === this.params.common.support_distributor.organization_codes
      )
        ? FilterReservedWord.selectAll
        : this.params.common.support_distributor.organization_codes;

      this.supportDistributorSelect.setSelectedParam([item]);
      this.supportDistributorSelect.onChangeItems();
    }
  }

  /**
   * 選択ボックス（種別なし）の選択項目の更新をおこなう
   */
  refreshBelongSelector() {
    const selectors = [
      this.bankSelect,
      this.insuranceSelect,
      this.financeSelect,
      this.serviceDistributorSelect,
      this.svOrganizationCodesSelect,
      this.sdOrganizationCodesSelect,
      this.communicationSettingSelect,
      this.class1Select,
      this.class2Select,
      this.class3Select,
      this.class4Select,
      this.class5Select,
      this.smrIntervalSelect,
    ].concat(this.customAttributeSelects.toArray());

    _.each(selectors, sel => {
      if (sel) {
        sel.refresh(false);
      }
    });
  }

  /**
   * 担当DB組織コードに関連する選択項目の更新をおこなう
   */
  refreshOrgCodeBelongSelector() {
    this.refreshSupportDistributor();
  }

  /**
   * 選択ボックス（種別あり）の選択値の取得
   */
  getSelectedParams() {
    const result: {
      supportDistributor?: string[];
      subGroup?: string[];
      customer?: string[];
    } = {};

    if (
      this.supportDistributorSelect &&
      _.has(this.resource, 'common.support_distributor.ids')
    ) {
      result.supportDistributor = this.supportDistributorSelect.getSelectedParam();
    }
    if (
      this.subGroupSelect &&
      _.has(this.resource, 'common.user_permission_sub_group_ids')
    ) {
      result.subGroup = this.subGroupSelect.getSelectedParam();
    }
    if (this.customerSelect && _.has(this.resource, 'common.customer.ids')) {
      result.customer = this.customerSelect.getSelectedParam();
    }
    return result;
  }
}
