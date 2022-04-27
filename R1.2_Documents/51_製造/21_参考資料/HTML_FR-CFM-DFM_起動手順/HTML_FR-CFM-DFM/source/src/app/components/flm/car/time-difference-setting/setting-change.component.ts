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

import { ModalValues, Resource, Labels } from '../../../../types/common';
import {
  CarIdSearchParams,
  SupportDistributorChangeConsignorParams,
  TimeDifferenceSettingParams,
} from '../../../../types/flm/car';
import { TimeDifferenceSettingKind } from '../../../../constants/flm/car';

import { CustomSelectItem } from '../../../../constants/form';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { Mixin } from '../../../../decorators/mixin-decorator';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

import {
  TimeDifference,
  ITimeDifference,
  TimeDifferenceData,
} from '../../../../mixins/time-difference';

@Mixin([TimeDifference])
@Component({
  selector: 'app-setting-change',
  templateUrl: './setting-change.component.html',
  styleUrls: ['./setting-change.component.scss'],
})
export class SettingChangeComponent extends KbaAbstractIndexComponent
  implements ITimeDifference {
  @ViewChild('editModalContent', { static: false })
  editModalContent: TemplateRef<null>;
  @ViewChild('allEditSelect', { static: false })
  allEditSelect: KbaSelectedComponent;
  @ViewChild('allMinuteEditSelect', { static: false })
  allMinuteEditSelect: KbaSelectedComponent;
  @ViewChildren('supportDBSelect') supportDBSelections: QueryList<
    KbaSelectedComponent
  >;
  @ViewChildren('timeDifferenceSelects') timeDifferenceSelects: QueryList<
    KbaSelectedComponent
  >;

  @Input() selectedCarIds: string[];
  @Input() labels;
  @Input() resource;
  @Input() functions;
  @Input() editFields;
  @Input() editConfirmFields;
  @Input() sortKey;
  @Output() return = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  fifteenMinutesItem: string[];
  nextGenHoursItem: string[];
  timeDifference: { time_difference: string; time_difference_minute: string };
  omitTimeDifferenceMinuteResourceValues: (resourceItem: Resource) => Resource;
  omitTimeDifferenceHourResourceValues: (resourceItem: Resource) => Resource;
  createTimeDifference: (diff: string) => TimeDifferenceData;
  isValidMinute: (timeDifference: TimeDifferenceData) => boolean;
  isValidHour: (timeDifference: TimeDifferenceData) => boolean;
  joinTimeDifference: (timeDifference: TimeDifferenceData) => string;

  xFields: string[];
  editParams: TimeDifferenceSettingParams;
  originalEditParams: TimeDifferenceSettingParams;
  editModalValues: ModalValues;
  isEditReady = false;
  minuteResource;
  hourResource;
  timeDifferences: TimeDifferenceData[];
  handleScroll: () => void;

  get isEditValid() {
    return (
      this.editParams &&
      this.originalEditParams &&
      this.editParams.cars.every(
        (car, i) =>
          this.editParams.cars[i].time_difference !==
            this.originalEditParams.cars[i].time_difference &&
          this.isValidMinuteSelect(this.lists.originList[i], i) &&
          this.isValidHourSelect(this.lists.originList[i], i)
      )
    );
  }

  constructor(
    router: Router,
    ref: ChangeDetectorRef,
    modalService: KbaModalService,
    header: CommonHeaderService,
    private carService: CarService,
    private alertService: KbaAlertService
  ) {
    super(null, null, router, ref, header, modalService);
    this.handleScroll = _.throttle(() => {
      this.timeDifferenceSelects.forEach(kbaSelect => kbaSelect.select.close());
    }, 200);
  }

  /**
   * 変更ボタン押下時コールバック
   */
  async onClickSubmit(): Promise<void> {
    const requestHeaderParams = {
      ...this.editModalValues.requestHeaderParams,
      'X-Sort': this.requestHeaderParams['X-Sort'],
    };
    const carList = await this.carService.fetchCarIndexList(
      this._carIdsParams(this.selectedCarIds),
      requestHeaderParams
    );

    this._openEditModal(carList).then(res => this._openResultModal(res));
  }

  /**
   * 戻るボタン押下時コールバック
   */
  onClickBack(): void {
    this.allEditSelect.reset();
    this.allMinuteEditSelect.reset();
    this.return.emit();
  }

  /**
   * 時差一括設定（時）選択時の処理
   * @param value 変更値
   */
  onAllTimeDiffrenceChange(value: string): void {
    if (!this.isEditReady || value === CustomSelectItem.empty.id) {
      return;
    }

    this.lists.originList.forEach((data, index) => {
      this.timeDifferences[index] = {
        time_difference: value,
        time_difference_minute: this.timeDifferences[index]
          .time_difference_minute,
      };
      this.editParams.cars[index].time_difference = this.joinTimeDifference(
        this.timeDifferences[index]
      );
    });
  }

  /**
   * 時差一括設定（分）選択時の処理
   * @param value 変更値
   */
  onAllTimeDiffrenceMinuteChange(value: string): void {
    if (!this.isEditReady || value === CustomSelectItem.empty.id) {
      return;
    }

    this.lists.originList.forEach((data, index) => {
      this.timeDifferences[index] = {
        time_difference: this.timeDifferences[index].time_difference,
        time_difference_minute: value,
      };
      this.editParams.cars[index].time_difference = this.joinTimeDifference(
        this.timeDifferences[index]
      );
    });
  }

  /**
   * 変更後の時差（時および分）選択時の処理
   * @param index 変更した行のインデックス
   */
  onTimeDiffrenceChange(index: number): void {
    if (!this.isEditReady) {
      return;
    }

    this.editParams.cars[index].time_difference = this.joinTimeDifference(
      this.timeDifferences[index]
    );
  }

  /**
   * 有効な分の値であるかを判定
   * @param data 対象の車両情報
   * @param index 判定をする行のインデックス
   */
  isValidMinuteSelect(data: object, index: number): boolean {
    return (
      this.isFifteenMinutes(data) ||
      this.isValidMinute(this.timeDifferences[index])
    );
  }

  /**
   * 有効な時の値であるかを判定
   * @param data 対象の車両情報
   * @param index 判定をする行のインデックス
   */
  isValidHourSelect(data: object, index: number): boolean {
    return (
      this.isFifteenMinutes(data) ||
      this.isValidHour(this.timeDifferences[index])
    );
  }

  /**
   * 15分単位の時差設定区分であるかの判定
   * @param data 対象の車両情報
   */
  isFifteenMinutes(data: object): boolean {
    return (
      data['cars.car_management_attribute.time_difference_setting_kind'] ===
      TimeDifferenceSettingKind.fifteenMinutes
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
    this.timeDifferences = this._createTimeDifferences(res.result_data.cars);
    this.editParams = this._createTimeDifferenceSettingParams(
      res.result_data.cars
    );
    this.originalEditParams = _.cloneDeep(this.editParams);
    this.isEditReady = true;
    this.isFetching = false;
    this._afterFetchList();
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    this.xFields = this._createXFields(this.editFields);
    this._setXFields(this.xFields);
    this.minuteResource = this._createTimeDifferenceMinuteResource(
      this.resource.cars.time_difference_minute
    );
    this.hourResource = this._createTimeDifferenceHourResource(
      this.resource.cars.time_difference
    );
    this.thList = this._createThList(this.editFields);
    this.editModalValues = this._getModalValues(
      this.editConfirmFields,
      this.selectedCarIds.length
    );
  }

  /**
   * 変更モーダルを開く
   * @param carList 車両情報リスト
   */
  private _openEditModal(carList: any): Promise<any> {
    const cars = this._formatList(
      carList.result_data.cars,
      this.editModalValues.listDesc
    );
    this.editModalValues.listVal = this._createConfirmCars(cars);

    return new Promise(resolve => {
      this.modalService.open({
        title: this.labels.edit_modal_title,
        labels: this.labels,
        content: this.editModalContent,
        closeBtnLabel: this.labels.cancel,
        ok: () => {
          const params = {
            cars: this.editParams.cars.map(car => ({
              ...car,
              time_difference: car.time_difference === '-0000' ? '+0000' : car.time_difference,
            })),
          };
          this.carService
            .updataTimeDifferenceSetting(params)
            .then(res => resolve(res));
        },
      });
    });
  }

  /**
   * 確認モーダル表示用に変更後時差の情報を含んだ車両情報を作成
   * @param 車両情報
   */
  private _createConfirmCars(cars: object[]): any[] {
    const confirmCars = _.cloneDeep(cars);
    confirmCars.forEach((car, index) => {
      car[
        'cars.car_management_attribute.change_after_time_difference'
      ] = this.formatTimeDifference(
        this.editParams.cars[index].time_difference
      );
      car[
        'cars.car_management_attribute.time_difference'
      ] = this.formatTimeDifference(
        car['cars.car_management_attribute.time_difference']
      );
    });
    return confirmCars;
  }

  /**
   * 変更結果モーダルを開く
   * @param res レスポンス
   */
  private _openResultModal(res: any): void {
    this._resultModalOpen(
      this.labels.result_modal_title,
      this.editModalValues.listDesc,
      this.editModalValues.listVal,
      res['responses'],
      () => {
        this.allEditSelect.reset();
        this.allMinuteEditSelect.reset();
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
   * 15分毎と30分毎の時差（分）リソースを作成
   * @param timeDifferenceMinute 時差（分）のリソース
   */
  private _createTimeDifferenceMinuteResource(timeDifferenceMinute: Resource) {
    return {
      full: {
        time_difference_minute: timeDifferenceMinute,
      },
      omitted: {
        time_difference_minute: this.omitTimeDifferenceMinuteResourceValues(
          timeDifferenceMinute
        ),
      },
    };
  }

  /**
   * 現行・次世代の時差（時）のリソースを作成
   * @param timeDifferenceMinute 時差（時）のリソース
   */
  private _createTimeDifferenceHourResource(timeDifferenceHour: Resource) {
    return {
      full: {
        time_difference: timeDifferenceHour,
      },
      omitted: {
        time_difference: this.omitTimeDifferenceHourResourceValues(
          timeDifferenceHour
        ),
      },
    };
  }

  /**
   * 車両情報から時差情報を作成
   * @param cars 車両情報
   */
  private _createTimeDifferences(cars: any[]): TimeDifferenceData[] {
    return _.map(cars, car =>
      this.createTimeDifference(
        _.get(car, 'car_management_attribute.time_difference')
      )
    );
  }

  /**
   * 時差設定更新要求API用のパラメータを作成
   * @param cars 車両情報
   */
  private _createTimeDifferenceSettingParams(
    cars: any[]
  ): TimeDifferenceSettingParams {
    return {
      cars: cars.map(car => ({
        update_datetime: _.get(car, 'car_identification.update_datetime'),
        time_difference: _.get(car, 'car_management_attribute.time_difference'),
        car_id: _.get(car, 'car_identification.id'),
      })),
    };
  }
}
