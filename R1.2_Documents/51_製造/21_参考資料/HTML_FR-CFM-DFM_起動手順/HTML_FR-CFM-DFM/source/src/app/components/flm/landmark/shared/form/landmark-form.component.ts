import { ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  LandmarkParams,
  LandmarkIconParams,
  Coordinates,
  LandmarkMapParams,
} from '../../../../../types/flm/landmark';

import { SystemParamater } from '../../../../../constants/system-paramater';
import { validationPattern } from '../../../../../constants/validation-patterns';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaAreaMapComponent } from '../../../../shared/kba-area/kba-area-map.component';
import { LandmarkConfirmModalComponent } from './confirm-modal.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { LandmarkService } from '../../../../../services/flm/landmark/landmark.service';

export abstract class LandmarkFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild('areaMapComponent', { static: false })
  areaMapComponent: KbaAreaMapComponent;
  @ViewChild('iconSelectPopover', { static: false }) iconSelectPopover;

  abstract isUpdate: boolean;
  params: LandmarkParams<Coordinates<string>>;
  initParams: LandmarkParams<Coordinates<string>>;
  pattern = validationPattern.coordinatesValue;
  landmarkForm = new FormGroup({
    label: new FormControl('', Validators.required),
    lng: new FormControl('', [
      Validators.required,
      Validators.pattern(this.pattern),
    ]),
    lat: new FormControl('', [
      Validators.required,
      Validators.pattern(this.pattern),
    ]),
  });
  mapFields: string;

  // アイコン選択欄の表示・非表示
  iconSelectPopoverVisible = false;

  // map 初期化用パラメータ
  initMapParams = {};

  // ランドマークアイコン
  iconResource: LandmarkIconParams[] = [];

  // 登録済みのランドマーク一覧
  landmarkList: {
    landmarks: LandmarkIconParams[];
  };

  // マップに表示するためのランドマークデータ
  landmarkMapData: LandmarkMapParams = {};
  initLandmarkMapData: LandmarkMapParams;

  groupLabel: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected modalService: KbaModalService,
    protected ref: ChangeDetectorRef,
    protected landmarkService: LandmarkService,
    protected alertService: KbaAlertService
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
    const path = this.isUpdate ? '/landmarks' : '';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue(): void {
    this._registerModalOpen('/landmarks/new');
  }

  /**
   * グループ変更時の処理
   * @param groupId グループID
   */
  async onChangeGroup(groupId: string): Promise<void> {
    const res = await this.landmarkService.fetchIndexList(
      { group_id: groupId },
      { 'X-Fields': this.mapFields }
    );
    this.landmarkList = this.isUpdate
      ? this._replaceDuplicateLandmarkData(res.result_data)
      : res.result_data;
  }

  /**
   * 選択するボタン押下時の処理
   */
  onClickSelect(event): void {
    event.stopPropagation();
    this.iconSelectPopoverVisible = true;
  }

  /**
   * アイコン選択時の処理
   * @param data 選択したアイコン
   */
  onClickIcon(data: LandmarkIconParams): void {
    this.params.landmark.icon_id = data.id;
    this.landmarkMapData.icon = data;
  }

  /**
   * マップ上での変更時コールバック
   * @param coordinates 座標
   */
  onChangeMapCoordinates(coordinates: Coordinates<number>): void {
    this.params.landmark.point.coordinates.lng = coordinates.lng.toString();
    this.params.landmark.point.coordinates.lat = coordinates.lat.toString();
    this.landmarkForm.controls.lng.setValue(coordinates.lng.toString());
    this.landmarkForm.controls.lat.setValue(coordinates.lat.toString());
    this.safeDetectChanges();
  }

  /**
   * 入力座標変更時コールバック
   */
  onChangeCoordinates(): void {
    if (this.areaMapComponent && this._validCoordinates()) {
      this.landmarkMapData.coordinates = {
        lng: +this.params.landmark.point.coordinates.lng,
        lat: +this.params.landmark.point.coordinates.lat,
      };
      this.areaMapComponent.updateTargetLandmark();
    }
    this.safeDetectChanges();
    // 緯度経度の変更検知のため2重にdetectChangeをおこなう
    this.safeDetectChanges();
  }

  /**
   * 初期化完了後に行う処理
   */
  protected async _afterInitialize(): Promise<void> {
    const res = await this.landmarkService.fetchIcons();
    this.iconResource = res.result_data.icons;
    document.body.addEventListener('click', e => {
      if (
        !this.iconSelectPopover ||
        !this.iconSelectPopover.nativeElement.contains(<Node>e.target)
      ) {
        this.iconSelectPopoverVisible = false;
      }
    });
  }

  /**
   * リセット処理
   */
  protected _reset(): void {
    this.alertService.close();
    this._clearError();
    this.params = _.cloneDeep(this.initParams);
    this.landmarkMapData = _.cloneDeep(this.initLandmarkMapData);
    this.safeDetectChanges();
    this.landmarkForm.markAsPristine();
    this.refreshFormTextInput();
    if (!this.isUpdate) {
      this.areaMapComponent.clearMap();
    }
  }

  /**
   * 入力された内容を API に渡し登録を行う
   */
  protected abstract _register();

  /**
   * 重複しているランドマークのデータを取り除く
   * @param data ランドマークデータ
   */
  protected _replaceDuplicateLandmarkData(data) { }

  /**
   * 登録/変更確認モーダルを表示する。
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string): void {
    this.modalService.customOpen(
      LandmarkConfirmModalComponent,
      {
        resource: this.resource,
        labels: this.labels,
        initMap: {
          [SystemParamater.lng]: this.landmarkMapData.coordinates[0],
          [SystemParamater.lat]: this.landmarkMapData.coordinates[1],
        },
        others: this.landmarkList,
        desc: this._createDesc(),
        val: this._createVal(),
        landmarkData: this.landmarkMapData,
        submit: async () => {
          try {
            await this._register();
            this._reset();
            await this.router.navigateByUrl(path);
            this.alertService.show(this.labels.finish_message);
          } catch (errorData) {
            this._setError(errorData, this.alertService);
          }
        },
      },
      { size: 'lg', windowClass: 'map-modal' }
    );
  }

  /**
   * 確認モーダルのヘッダ情報を返す
   */
  private _createDesc() {
    const desc = {
      upper: [
        { name: 'label', label: this.resource.landmark.label.name },
        { name: 'icon_id', label: this.resource.landmark.icon_id.name },
      ],
      lower: [
        {
          name: 'lat',
          label: this.resource.landmark.point.coordinates.lat.name,
        },
        {
          name: 'lng',
          label: this.resource.landmark.point.coordinates.lng.name,
        },
        { name: 'free_memo', label: this.resource.landmark.free_memo.name },
      ],
    };

    if (this.exists('landmark.group_id')) {
      if (this.isUpdate) {
        desc.upper.unshift({
          name: 'group_id',
          label: this.labels.group_label,
        });
      } else {
        desc.upper.unshift({
          name: 'group_id',
          label: this.resource.landmark.group_id.name,
        });
      }
    }

    if (this.exists('landmark.publish_kind')) {
      desc.lower.push({
        name: 'publish_kind',
        label: this.resource.landmark.publish_kind.name,
      });
    }

    return desc;
  }

  /**
   * 確認モーダルの値を返す
   */
  private _createVal() {
    const data = {
      ..._.pick(this.params.landmark, ['label', 'free_memo']),
      ...this.params.landmark.point.coordinates,
      icon_id: this.landmarkMapData.icon.image,
    };

    if (this.exists('landmark.group_id')) {
      if (this.isUpdate) {
        data.group_id = this.groupLabel;
      } else {
        data.group_id = this._getResourceValueName(
          'landmark.group_id',
          this.params.landmark.group_id
        );
      }
    }

    if (this.exists('landmark.publish_kind')) {
      data.publish_kind = this._getResourceValueName(
        'landmark.publish_kind',
        this.params.landmark.publish_kind
      );
    }
    return data;
  }

  /**
   * 入力された座標が正しい値かどうかを判定する
   */
  private _validCoordinates() {
    const pattern = new RegExp(this.pattern);
    return [
      this.params.landmark.point.coordinates.lng,
      this.params.landmark.point.coordinates.lat,
    ].every(i => pattern.test(i));
  }
}
