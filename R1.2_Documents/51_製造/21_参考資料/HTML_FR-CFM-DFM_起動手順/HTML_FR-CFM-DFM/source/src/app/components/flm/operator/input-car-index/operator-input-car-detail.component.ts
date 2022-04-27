import {
  Component,
  OnInit,
  Input,
  Output,
  ChangeDetectorRef,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { OperatorIndexParams } from '../../../../types/flm/operator';

import { OperatorIdentificationKind } from '../../../../constants/flm/operator';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { TableHeader } from '../../../../types/common';

@Component({
  selector: 'app-operator-input-car-detail',
  templateUrl: './operator-input-car-detail.component.html',
  styleUrls: ['./operator-input-car-detail.component.scss'],
})
export class OperatorInputCarDetailComponent extends KbaAbstractIndexComponent
  implements OnInit {
  AUTOLOAD_COUNT_NUM = 10;

  @Input() selectedCar;
  @Input() customerId: string;
  @Input() params;
  @Input() resource;
  @Input() labels;
  @Input() functions;
  @Input() operatorFields;
  @Input() listSettingFields;
  @Output() return = new EventEmitter<any>();

  operatorIndexParams: OperatorIndexParams = { car_id: [] };
  customerLabel: string;
  thList: TableHeader[];
  carHeaders: TableHeader[];
  carId: string;
  car;
  _super_ngOnInit = super.ngOnInit;

  constructor(
    router: Router,
    ref: ChangeDetectorRef,
    modalService: KbaModalService,
    header: CommonHeaderService,
    private operatorService: OperatorService,
    private alertService: KbaAlertService
  ) {
    super(null, null, router, ref, header, modalService);
  }

  async ngOnInit() {
    this.customerLabel = this._getResourceValueName(
      'common.customer.ids',
      this.customerId
    );
    // 詳細は単数のため配列の第一要素に挿入
    this.operatorIndexParams['customer_id'] = this.customerId;
    this.carId = this.selectedCar['cars.car_identification.id'];
    this.operatorIndexParams.car_id[0] = this.carId;
    this.carHeaders = this._createThList(this.listSettingFields);
    this.car = await this._getSelectedCar(
      [this.carId],
      this.listSettingFields,
      this.carHeaders
    );
    this._super_ngOnInit();
  }

  fetchList(sort_key?: string): Promise<any> {
    return new Promise(resolve => {
      this.isFetching = true;
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      this.operatorService
        .fetchIndexList(this.operatorIndexParams, this.requestHeaderParams)
        .then((res: any) => {
          this.count = res.result_header['X-TotalCount'];
          this.lists.originList = res.result_data.operators;
          this.pageParams.lastIndexList = this.pageParams.autoLoadCount = this.AUTOLOAD_COUNT_NUM;
          this.lists.visibleList = this.lists.originList.slice(
            0,
            this.pageParams.autoLoadCount
          );
          this.isFetching = false;
          this._afterFetchList();
          resolve();
        });
    });
  }

  /**
   * 詳細一覧のソート変更時の処理
   * @param sort_key ソートキー
   */
  onChangeDetailSort(sort_key: string): void {
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();
    this.fetchList(sort_key);
  }

  /**
   * もどるボタン押下時コールバック
   */
  onClickPrev(): void {
    this.return.emit();
  }

  /**
   * ID保持時間の表示データを取得
   * @param idHoldTime ID保持時間
   */
  displayIdHoldTime(idHoldTime: number): string {
    const res = _.get(this.resource, 'id_hold_time');
    if (res) {
      const v = _.find(res.values, item => +item.value === idHoldTime);
      return v ? v.name : idHoldTime;
    } else {
      return '';
    }
  }

  /**
   * IDキー設定がONかどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:ON/false:OFF
   */
  isOperatorIdSettingKindOn(idKeySettingKind): boolean {
    return idKeySettingKind === OperatorIdentificationKind.idInput;
  }

  protected _fetchDataForInitialize(): Promise<any> {
    return new Promise((resolve, reject) => {
      const xFieldPaths = this._createXFields(this.operatorFields);
      this._setXFields(xFieldPaths);
      this.thList = this._createThList(this.operatorFields);
      this.sortableThList = this.sortableThLists(this.thList);
      resolve();
    });
  }

  /**
   * データ取得用のキーへの変換
   * @param key キー
   */
  protected _dataKey(key: string): string {
    return _.slice(key.split('.'), 1).join('.');
  }

  /**
   * 車両を取得し、表示用に整形する
   * @param carIds 車両ID
   * @param xFields 指定項目情報
   * @param thList ヘッダ情報
   */
  private async _getSelectedCar(carIds, xFields, thList) {
    let params = { common: { car_identification: { car_ids: carIds } } };
    if (this.exists('common.customer.ids')) {
      params = _.merge(params, {
        common: { customer: { ids: [this.customerId] } },
      });
    }
    const res = await this.operatorService.fetchInputCarIndexList(params, {
      'X-Fields': this._createXFields(xFields).join(','),
    });
    const cars = this._formatList(res.result_data.cars, thList);
    return cars[0];
  }
}
