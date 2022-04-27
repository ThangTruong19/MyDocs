import * as _ from 'lodash';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';

import { ModalValues } from '../../../../types/common';
import { SupportDistributorChangeConsignorParams } from '../../../../types/flm/support-distributor-change';
import { CarIdSearchParams } from '../../../../types/flm/car';

import { CustomSelectItem } from '../../../../constants/form';
import { FilterReservedWord } from '../../../../constants/condition';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { SupportDistributorChangeService } from '../../../../services/flm/support-distributor-change/support-distributor-change.service';

@Component({
  selector: 'app-change-consignor',
  templateUrl: './change-consignor.component.html',
  styleUrls: ['./change-consignor.component.scss'],
})
export class ChangeConsignorComponent extends KbaAbstractIndexComponent {
  @ViewChild('consignorModalContent', { static: false })
  consignorModalContent: TemplateRef<null>;
  @ViewChild('allEditSelect', { static: false })
  allEditSelect: KbaSelectedComponent;
  @ViewChildren('supportDBSelect') supportDBSelections: QueryList<
    KbaSelectedComponent
  >;

  @Input() selectedCarIds: string[];
  @Input() labels;
  @Input() resource;
  @Input() functions;
  @Input() applyFields;
  @Input() applyConfirmFields;
  @Input() sortKey;
  @Output() return = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  xFields: string[];
  editParams: SupportDistributorChangeConsignorParams;
  originalEditParams: SupportDistributorChangeConsignorParams;
  applyModalValues: ModalValues;
  isEditReady = false;
  excludeFields = [
    'cars.support_distributor.label',
    'cars.support_distributor.label_english',
  ];
  handleScroll: () => void;

  get isEditValid() {
    return (
      this.editParams &&
      this.originalEditParams &&
      this.editParams.cars.every(
        (car, i) =>
          car.change_support_distributor_id !==
          this.originalEditParams.cars[i].change_support_distributor_id
      )
    );
  }

  constructor(
    router: Router,
    ref: ChangeDetectorRef,
    modalService: KbaModalService,
    header: CommonHeaderService,
    private carService: CarService,
    private supportDistributorChangeService: SupportDistributorChangeService,
    private alertService: KbaAlertService
  ) {
    super(null, null, router, ref, header, modalService);
    this.handleScroll = _.throttle(() => {
      this.supportDBSelections.forEach(kbaSelect => kbaSelect.select.close());
    }, 200);
  }

  /**
   * 申請ボタン押下時コールバック
   */
  async onClickSubmit() {
    const requestHeaderParams = {
      ...this.applyModalValues.requestHeaderParams,
      'X-Sort': this.requestHeaderParams['X-Sort'],
    };
    const carList = await this.carService.fetchCarIndexList(
      this._carIdsParams(this.selectedCarIds),
      requestHeaderParams
    );
    this._openConsignorModal(carList).then(res => this._openResultModal(res));
  }

  /**
   * 戻るボタン押下時コールバック
   */
  onClickBack(): void {
    this.allEditSelect.reset();
    this.return.emit();
  }

  /**
   * 担当DB一括設定選択時の処理
   * @param id 選択項目のID
   */
  onSelectSupportIDAllEdit(id: string): void {
    if (!this.isEditReady || id === CustomSelectItem.empty.id) {
      return;
    }

    this.editParams.cars.forEach(
      car => (car.change_support_distributor_id = id)
    );
    this.supportDBSelections.forEach(select => select.refresh());
  }

  /**
   * 担当DB（英語）のラベルを変更する
   * @param data 対象データ
   * @param id 担当DB ID
   */
  refreshEnglishLabel(data, id: string): void {
    data['cars.support_distributor.label_english'] = this._getResourceValueName(
      'cars.change_support_distributor_label_english',
      id
    );
  }

  /**
   * 担当DBセレクトボックスが初期状態から
   * 変更されていないかどうかを返却する
   * @param idx 添え字
   * @return true: 未変更 / false: 変更済
   */
  isSupportDBSelectNotEdit(idx: number): boolean {
    return (
      (!this.originalEditParams.cars[idx].change_support_distributor_id &&
        this.editParams.cars[idx].change_support_distributor_id ===
        FilterReservedWord.isNull) ||
      this.editParams.cars[idx].change_support_distributor_id ===
      this.originalEditParams.cars[idx].change_support_distributor_id
    );
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || this.sortKey;
    const res = await this.carService.fetchCarIndexList(
      this._carIdsParams(this.selectedCarIds),
      this.requestHeaderParams
    );
    this._fillLists(
      res.result_header,
      this._formatList(res.result_data.cars, this.thList)
    );
    this.lists.visibleList = this.lists.originList;

    this.editParams = this._createChangeConsignorParams(res.result_data.cars);
    this.originalEditParams = _.cloneDeep(this.editParams);
    this.isEditReady = true;
    this.isFetching = false;
    this._afterFetchList();
    this.safeDetectChanges();
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    this.xFields = this._createXFields(this.applyFields);
    this._setXFields(this.xFields);
    this.thList = this._createThList(this.applyFields);
    this.applyModalValues = this._getModalValues(
      this.applyConfirmFields,
      this.selectedCarIds.length
    );
  }

  /**
   * 指定項目作成
   */
  protected _createXFields(fieldItems) {
    return super
      ._createXFields(fieldItems)
      .filter(field => !this.excludeFields.includes(field));
  }

  /**
   * 申請モーダルを開く
   * @param carList 車両情報リスト
   */
  private _openConsignorModal(carList): Promise<any> {
    this.applyModalValues.listVal = this._formatList(
      this._createConfirmListData(
        carList.result_data.cars,
        this.editParams,
        this.resource.cars.change_support_distributor_id
      ),
      this.applyModalValues.listDesc
    );

    return new Promise(resolve => {
      this.modalService.open({
        title: this.labels.consignor_modal_title,
        labels: this.labels,
        content: this.consignorModalContent,
        closeBtnLabel: this.labels.cancel,
        ok: async () => {
          this.supportDistributorChangeService
            .consignorSupportDistributorChange(this.editParams)
            .then(res => resolve(res));
        },
      });
    });
  }

  /**
   * 確認モーダル表示用のデータを作成
   * @param cars 車両情報
   * @param editParams 編集情報
   * @param resSupportDistributor 担当DBのリソース
   */
  private _createConfirmListData(cars, editParams, resSupportDistributor) {
    return _.reduce(
      cars,
      (result, car, index) => {
        const changeSupportDistributor = _.find(
          resSupportDistributor.values,
          resValue => {
            return (
              resValue.value ===
              editParams.cars[index].change_support_distributor_id
            );
          }
        );
        _.set(car, 'support_distributor.label', changeSupportDistributor.name);
        result.push(car);
        return result;
      },
      []
    );
  }

  /**
   * 申請結果モーダルを開く
   * @param res レスポンス
   */
  private _openResultModal(res): void {
    this._resultModalOpen(
      this.labels.result_modal_title,
      this.applyModalValues.listDesc,
      this.applyModalValues.listVal,
      res['responses'],
      () => {
        this.allEditSelect.reset();
        this.submit.emit();
      },
      { size: 'lg' }
    );
  }

  /**
   * 車両一覧取得パラメータの作成
   * @param carIds 車両ID
   */
  private _carIdsParams(carIds: string[]): CarIdSearchParams {
    return { common: { car_identification: { car_ids: carIds } } };
  }

  /**
   * 担当代理店変更申請登録APIパラメータの作成
   * @param cars 車両情報
   */
  private _createChangeConsignorParams(
    cars
  ): SupportDistributorChangeConsignorParams {
    return {
      cars: _.map(cars, car => ({
        car_id: car.car_identification.id,
        change_support_distributor_id: car.support_distributor.id,
        update_datetime: car.car_identification.update_datetime,
      })),
    };
  }
}
