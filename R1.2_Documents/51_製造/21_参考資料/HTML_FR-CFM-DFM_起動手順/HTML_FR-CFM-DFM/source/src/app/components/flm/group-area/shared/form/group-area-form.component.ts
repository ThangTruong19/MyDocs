import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  GroupAreaParams,
  MapDependedHeader,
  Others,
  PolyPoints,
  RectData,
  Coordinate,
} from '../../../../../types/flm/group-area';
import { OptionKind, AreaType } from '../../../../../constants/flm/group-area';
import { Fields } from '../../../../../types/common';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaAreaMapComponent } from '../../../../shared/kba-area/kba-area-map.component';
import { GroupAreaConfirmModalComponent } from './confirm-modal.component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';

import { GroupAreaService } from '../../../../../services/flm/group-area/group-area.service';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';

import { DistanceType } from '../../../../shared/kba-area/area';

export abstract class GroupAreaFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild('areaMapComponent', { static: false })
  areaMapComponent: KbaAreaMapComponent;
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('groupSelect', { static: false })
  groupSelect: KbaFormTableSelectComponent;
  @ViewChild('groupAreaNoSelect', { static: false })
  groupAreaNoSelect: KbaFormTableSelectComponent;

  target?: GroupAreaParams;
  menuOpen = false;
  params: GroupAreaParams;
  areaForm: FormGroup = new FormGroup({});
  areaOptions = ['active_status_kind', 'notification_kind'];
  others: Others;
  pointNum = 0;
  areaNumbers = [];
  isLimit: boolean;
  polyPoints: PolyPoints = [];
  rectData: RectData = { centerPoint: [null, null], distance: [null, null] };
  initMap = {};
  selectType: string;
  mapDependedHeader: MapDependedHeader;
  carIconHeader: any;
  groupLabel: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected modalService: KbaModalService,
    protected ref: ChangeDetectorRef,
    protected groupArea: GroupAreaService
  ) {
    super(nav, title, header);
  }

  /**
   * 入力内容リセットコールバック
   *
   * 入力内容リセット確認モーダルを表示する。
   * 確認後、入力内容をリセットする。
   */
  onClickReset(): void {
    this._clearError();
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録/変更ボタン押下コールバック
   */
  onClickSubmit(): void {
    this._clearError();
    const path = this.isUpdate ? 'group_area' : '';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue(): void {
    this._clearError();
    this._registerModalOpen('group_area/new');
  }

  /**
   *
   * @param value 選択値
   */
  onChangeSelectType(value: string): void {
    this._clearError();
    this.selectType = value;
  }

  /**
   * グループ変更時コールバック
   * @param groupId グループID
   */
  onChangeGroup(groupId: string): void {
    const carGroupPath = [
      'common.customer.ids',
      'common.support_distributor.ids',
    ].find(path => this.exists(path));

    this.groupArea
      .fetchDepended(
        {
          groupId: groupId,
          mapDependedHeader: this.mapDependedHeader,
          hasGroupIdResource: this.exists('group_area.group_id'),
          carIconRequstHeader: this.carIconHeader,
          requestCars: true,
          carGroupPath,
        },
      )
      .then(result => {
        this._processDependentResult(result);
      });
  }

  /**
   * オプション押下コールバック
   *
   * 押下したオプションが選択済なら未選択に、未選択なら選択済に切り替える。
   *
   * @param value 押下したオプション値
   */
  onClickOption(value: string): void {
    if (this.params[value] === OptionKind.off) {
      this.params[value] = OptionKind.on;
    } else {
      this.params[value] = OptionKind.off;
    }
  }

  /**
   * 多角形領域のマップ上での変更時コールバック
   * @param points ポイント
   */
  onChangePoints(points: PolyPoints): void {
    // ポイントの全削除
    this.polyPoints = [];
    this.safeDetectChanges();
    // 新しいポイントのセット
    this.polyPoints = points;
    this.pointNum = this.polyPoints.length;
    this.safeDetectChanges();
    // Submitボタンの有効・無効への対応のため、2重にdetectChangeをおこなう
    this.safeDetectChanges();
  }

  /**
   * 中心点+幅領域のマップ上での変更時コールバック
   * @param latLng 緯度経度
   */
  onChangeRect(latLng: Coordinate): void {
    this.rectData = {
      centerPoint: latLng,
      distance: this.rectData.distance,
    };
  }

  /**
   * オプション選択状態判定
   * @param value オプション値
   * @return true 選択済 / false 未選択
   */
  hasOption(value: string): boolean {
    return this.params[value] === OptionKind.on;
  }

  protected abstract _register(params, path);
  protected abstract _reset();

  /**
   * 取得した依存情報をコンポーネントのデータとしてセット
   * @param result 依存情報取得結果
   */
  protected _processDependentResult(result) {
    this.others = _.omit(result, 'areaNumbers');

    if (result.areaNumbers) {
      this.resource.group_area.no.values =
        result.areaNumbers.group_area.no.values;
    }

    if (_.isEmpty(this.resource.group_area.no.values)) {
      // エリアNoが空の場合は上限に達しているものとする
      this.isLimit = true;
      this.params.no = null;
      this.resource.group_area.no.values = [{ name: '-', value: '' }];
    } else {
      this.isLimit = false;
      if (
        this.resource.group_area.no.values.find(
          ({ value }) => this.params.no === value
        ) == null
      ) {
        this.params.no = _.first(this.resource.group_area.no.values).value;
      }
    }

    if (this.groupAreaNoSelect != null) {
      this.groupAreaNoSelect.refresh();
    }
  }

  /**
   * 多角形かどうか
   */
  protected _isPolygon(): boolean {
    return this.selectType === AreaType.polygon;
  }

  /**
   * 中心点+幅かどうか
   */
  protected _isPoint(): boolean {
    return this.selectType === AreaType.point;
  }

  /**
   * 多角形用のリクエストパラメータの生成
   * @param params リクエストパラメータ
   * @param polyPoints 多角形情報
   * @param selectType エリア設定方式
   * @return 多角形用リクエストパラメータ
   */
  protected _createPolygonParams(
    params: any,
    polyPoints: PolyPoints,
    selectType: string
  ): GroupAreaParams {
    const points = _.concat(polyPoints, [_.first(polyPoints)]);
    return _.merge({}, params, {
      feature: { geometry: { coordinates: [points], type: selectType } },
    });
  }

  /**
   * 中心点+幅用のリクエストパラメータの生成
   * @param params リクエストパラメータ
   * @param rectData 中心点+幅情報
   * @param selectType エリア設定方式
   * @return 中心点+幅用リクエストパラメータ
   */
  protected _createRectParams(
    params,
    rectData: RectData,
    selectType: string
  ): GroupAreaParams {
    const rect = {
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
    return _.merge({}, params, rect);
  }

  protected _createMapDependedHeader(
    otherFields: Fields,
    landmarkFields: Fields
  ): MapDependedHeader {
    return {
      other: { 'X-Fields': this._createXFields(otherFields).join(',') },
      landmark: { 'X-Fields': this._createXFields(landmarkFields).join(',') },
    };
  }

  /**
   * 登録確認画面オープン
   *
   * 登録/変更確認モーダルを表示する。
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string): void {
    this.modalService.customOpen(
      GroupAreaConfirmModalComponent,
      {
        resource: this.resource,
        labels: this.labels,
        selectType: this.selectType,
        initMap: {},
        others: this.others,
        desc: this._createDesc(),
        val: this._createVal(),
        polyPoints: this.polyPoints,
        rectData: this.rectData,
        no: this.target ? this.target.no : this.params.no,
        submit: () => {
          this._register(this.params, path);
        },
      },
      {
        size: 'xl',
        windowClass: 'map-modal',
      }
    );
  }

  /**
   * 確認モーダルのヘッダ情報を返す
   */
  private _createDesc() {
    const desc = {
      upper: [{ name: 'label', label: this.resource.group_area.label.name }],
      lower: [
        { name: 'option', label: this.labels.option },
        {
          name: 'description',
          label: this.resource.group_area.description.name,
        },
        { name: 'no', label: this.resource.group_area.no.name },
      ],
    };
    if (this.isUpdate) {
      if (this.labels.group_label) {
        desc.upper.unshift({
          name: 'group_id',
          label: this.labels.group_label,
        });
      }
    } else {
      if (this.resource.group_area.group_id) {
        desc.upper.unshift({
          name: 'group_id',
          label: this.resource.group_area.group_id.name,
        });
      }
    }
    return desc;
  }

  /**
   * 確認モーダルの値を返す
   */
  private _createVal() {
    const data = _.pick(this.params, ['label', 'description', 'no']);
    const optionMessages = [];
    if (this.params.active_status_kind === OptionKind.on) {
      optionMessages.push(
        _.get(this.resource, 'group_area.active_status_kind').name
      );
    }
    if (this.params.notification_kind === OptionKind.on) {
      optionMessages.push(
        _.get(this.resource, 'group_area.notification_kind').name
      );
    }
    data['option'] = optionMessages.join(' / ');
    if (this.isUpdate) {
      data['group_id'] = this.groupLabel;
    } else {
      data['group_id'] = this._getResourceValueName(
        'group_area.group_id',
        this.params.group_id
      );
    }
    return data;
  }
}
