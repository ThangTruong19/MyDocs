import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { RectData, PolyPoints } from '../../../../types/flm/group-area';
import { GroupAreaCarParams, AreaMenu } from '../../../../types/flm/group-area';
import { CarLatest } from '../../../../types/flm/car';

import { AreaType } from '../../../../constants/flm/group-area';
import { SystemParamater } from '../../../../constants/system-paramater';

import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { GroupAreaCarConfirmModalComponent } from './confirm-modal.component';
import { KbaAreaMapComponent } from '../../../shared/kba-area/kba-area-map.component';

import { GroupAreaService } from '../../../../services/flm/group-area/group-area.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

import { DistanceType } from '../../../shared/kba-area/area';
import { ModalValues } from '../../../../types/common';

@Component({
  selector: 'app-group-area-car-edit',
  templateUrl: './car-edit.component.html',
  styleUrls: ['./car-edit.component.scss'],
})
export class GroupAreaCarEditComponent extends KbaAbstractRegisterComponent {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('areaMapComponent', { static: false })
  areaMapComponent: KbaAreaMapComponent;

  params: any = {};
  areaMenu: AreaMenu[];
  currentMenu: AreaMenu;
  areaForm: FormGroup = new FormGroup({});
  menuOpen = false;
  selectType: string;
  pointNum: number;
  carIdentifierLabel: string;
  updateDateTime: string;
  carId: string;
  others: any;
  isUpdate: boolean;
  initMap;
  deleteMoalValues: ModalValues;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected modalService: KbaModalService,
    protected ref: ChangeDetectorRef,
    protected groupArea: GroupAreaService,
    private alertService: KbaAlertService,
    private activatedRoute: ActivatedRoute,
    private userSettingService: UserSettingService
  ) {
    super(nav, title, header);
  }

  /**
   * 変更ボタン押下時コールバック
   */
  onClickSubmit(): void {
    this._clearError();
    this.modalService.customOpen(
      GroupAreaCarConfirmModalComponent,
      {
        resource: this.resource,
        labels: this.labels,
        selectType: this.selectType,
        params: this.currentMenu,
        carIdentifierLabel: this.carIdentifierLabel,
        polyPoints: this.currentMenu.polyPoints,
        rectData: this.currentMenu.rectData,
        others: this.others,
        submit: () => {
          const p = this._createParams(this.currentMenu);
          this._register(this.carId, p, this.currentMenu)
            .then(async () => {
              await this.router.navigateByUrl('group_area/cars');
              this.alertService.show(this.labels.submit_finish_message);
            })
            .catch(errorData => {
              this._setError(errorData, this.alertService);
            });
        },
      },
      {
        size: 'xl',
        windowClass: 'map-modal',
      }
    );
  }

  /**
   * 削除ボタン押下時コールバック
   */
  async onClickDelete() {
    this._clearError();
    const res = await this.groupArea.fetchGroupAreaCar(
      this.carId,
      this.deleteMoalValues.requestHeaderParams,
      false
    );
    const updateDatetime = this.areaMenu.find(
      area => area.id === this.currentMenu.id
    ).updateDatetime;
    const target = res.areas.find(area => area.id === this.currentMenu.id);
    this.deleteMoalValues.listVal = target;

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnClass: 'btn-delete',
      okBtnLabel: this.labels.delete,
      ok: async () => {
        await this.groupArea.deleteGroupAreaCar(
          this.carId,
          this.currentMenu.id,
          updateDatetime
        );
        await this.router.navigate(['group_area/cars']);
        this.alertService.show(this.labels.delete_finish_message);
      },
    });
  }

  /**
   * フォームのバリデーション
   */
  isFormInvalid(): boolean {
    return !this.areaForm.valid;
  }

  /**
   * エリアNoボタン押下時コールバック
   * @param menuItem 選択エリア
   */
  onChangeArea(menuItem: AreaMenu): void {
    this._clearError();
    this._changeAreaMenu(menuItem);
  }

  /**
   * 多角形領域の数値入力欄の変更時コールバック
   * @param points ポイント
   */
  onChangePolyPoints(points: PolyPoints): void {
    // Submitボタンの有効・無効への対応のため、detectChangeをおこなう
    this.safeDetectChanges();
  }

  /**
   * 多角形領域のマップ上での変更時コールバック
   * @param points ポイント
   */
  onChangePoints(points: PolyPoints): void {
    this.currentMenu.polyPoints = _.clone(points);
    this.pointNum = this.currentMenu.polyPoints.length;
    this.safeDetectChanges();
    // Submitボタンの有効・無効への対応のため、2重にdetectChangeをおこなう
    this.safeDetectChanges();
  }

  /**
   * 中心点+幅領域のマップ上での変更時コールバック
   * @param latLng 緯度経度
   */
  onChangeRect(latLng: number[]): void {
    this.currentMenu.rectData = {
      centerPoint: latLng,
      distance: this.currentMenu.rectData.distance,
    };
    this.safeDetectChanges();
  }

  /**
   * エリア種別変更時コールバック
   * @param value エリア種別
   */
  onChangeSelectType(value: string): void {
    this._clearError();
    this.selectType = this.currentMenu.selectType = value;
    if (this.selectType === AreaType.polygon) {
      this.pointNum = this.currentMenu.polyPoints.length;
    }
    this.safeDetectChanges();
  }

  /**
   * エリア番号の選択判定
   * @param no エリア番号
   */
  isCurrent(no: string): boolean {
    return this.currentMenu.no === no;
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    let id: string;
    this.activatedRoute.params.subscribe(params => (id = params.id));

    const res = await this.groupArea.fetchCarEditInitData(id);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.initMap = this._createInitMap(res.carLatest.car);
    const defalutTypeLabel = this.resource.car_area.feature.geometry.type
      .values[0].name;
    const _window = window as any;
    this.areaMenu = this.groupArea.createFilledAreaMenu(
      _window.settings.maxMapArea,
      res.groupAreaCar.car.car_areas,
      defalutTypeLabel
    );
    this.others = {
      areas: res.groupAreaCar.car.car_areas,
      cars: [res.carLatest.car],
    };
    this.carIdentifierLabel = this._createCarIdentifierLabel(
      res.groupAreaCar.car.car_identification
    );
    this.updateDateTime =
      res.groupAreaCar.car.car_identification.update_datetime;
    this.carId = res.groupAreaCar.car.car_identification.id;
    this.deleteMoalValues = this._getModalValues(res.deleteFields);
    this._changeAreaMenu(_.first(this.areaMenu));
  }

  /**
   * 多角形用のリクエストパラメータの生成
   * @param params リクエストパラメータ
   * @param polyPoints 多角形情報
   * @param selectType エリア設定方式
   * @return 多角形用リクエストパラメータ
   */
  protected _createPolygonParams(
    params: GroupAreaCarParams,
    polyPoints: PolyPoints,
    selectType: string
  ): GroupAreaCarParams {
    const points = _.concat(polyPoints, [_.first(polyPoints)]);
    const p = {
      feature: { geometry: { coordinates: [points], type: selectType } },
    };
    return _.merge({}, params, { car_area: p });
  }

  /**
   * 中心点+幅用のリクエストパラメータの生成
   * @param params リクエストパラメータ
   * @param rectData 中心点+幅情報
   * @param selectType エリア設定方式
   * @return 中心点+幅用リクエストパラメータ
   */
  protected _createRectParams(
    params: GroupAreaCarParams,
    rectData: RectData,
    selectType: string
  ): GroupAreaCarParams {
    const p = {
      feature: {
        properties: {
          east_west_distance: String(rectData.distance[DistanceType.EW]),
          north_south_distance: String(rectData.distance[DistanceType.NS]),
        },
        geometry: {
          coordinates: rectData.centerPoint,
          type: selectType,
        },
      },
    };
    return _.merge({}, params, { car_area: p });
  }

  /**
   * モーダル表示用のキーを取得する
   * @override
   * @param key 指定項目のキー
   */
  protected _dataKey(key: string) {
    return key
      .split('.')
      .slice(2)
      .join('.');
  }

  /**
   * 選択エリアの変更時の処理
   * @param menuItem 選択エリア
   */
  private _changeAreaMenu(menuItem: AreaMenu): void {
    this.currentMenu = menuItem;
    this.selectType = menuItem.selectType;
    this.isUpdate = menuItem.isUpdate;

    if (this.selectType === AreaType.polygon) {
      this.pointNum = this.currentMenu.polyPoints.length;
    }
    this.safeDetectChanges();
    this.refreshFormTextInput();

    if (this.areaMapComponent) {
      if (!this.isUpdate) {
        this.areaMapComponent.drawInitMap();
      } else {
        this.areaMapComponent.changeNo();
      }
    }
  }

  /**
   * 機種-型式-機番の形式を返す
   * @param carIdentification 車両情報
   */
  private _createCarIdentifierLabel(carIdentification): string {
    return `[${carIdentification.model}-${carIdentification.type_rev}-${carIdentification.serial}]`;
  }

  /**
   * 新規/変更の状態によって登録APIまたは変更APIを選択する
   * @param carId 車両ID
   * @param params パラメータ
   * @param isUpdate 新規/変更
   */
  private _register(
    carId: string,
    params: GroupAreaCarParams,
    currentMenu: AreaMenu
  ): Promise<any> {
    if (currentMenu.isUpdate) {
      return this.groupArea.updateGroupAreaCar(
        carId,
        currentMenu.id,
        _.merge(params, {
          car_area: { update_datetime: currentMenu.updateDatetime },
        })
      );
    } else {
      return this.groupArea.createGroupAreaCar(carId, params);
    }
  }

  /**
   * 選択エリアの状態からAPIのパラメータを取得
   * @param menuItem 選択エリア
   */
  private _createParams(menuItem: AreaMenu): GroupAreaCarParams {
    const params = {
      car_area: {
        no: menuItem.no,
        label: menuItem.label,
        description: menuItem.description,
        feature: {
          type: 'Feature',
          geometry: {
            type: '',
          },
        },
      },
    };

    if (menuItem.selectType === AreaType.polygon) {
      return this._createPolygonParams(
        params,
        menuItem.polyPoints,
        menuItem.selectType
      );
    } else {
      return this._createRectParams(
        params,
        menuItem.rectData,
        menuItem.selectType
      );
    }
  }

  /**
   * マップの初期表示情報を作成
   * @param coordinate 初期座標
   */
  private _createInitMap(carLatest: CarLatest) {
    const mapParams = this.userSettingService.getMapParams();
    const _window = window as any;
    return {
      [SystemParamater.lng]: _.get(
        carLatest,
        'latest_status.point.coordinates[0]',
        +mapParams.lng
      ),
      [SystemParamater.lat]: _.get(
        carLatest,
        'latest_status.point.coordinates[1]',
        +mapParams.lat
      ),
      [SystemParamater.zoom]: +mapParams.zoom,
      [SystemParamater.maxPoint]: +_window.settings.maxMapPoint,
    };
  }
}
