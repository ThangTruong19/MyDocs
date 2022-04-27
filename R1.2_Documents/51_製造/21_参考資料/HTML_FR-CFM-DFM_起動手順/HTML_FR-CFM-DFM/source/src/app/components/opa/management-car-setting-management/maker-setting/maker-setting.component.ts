import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import {
  MakerSettingSearchParams,
  MakerSettingUpdateParams,
  MakerSettingData,
  MakerForUpdate,
  Maker,
} from '../../../../types/opa/management-car-setting/maker-setting';

import { CommonState } from '../../../../constants/common-state';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { CheckListComponent } from '../shared/check-list/check-list.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ManagementCarSettingService } from '../../../../services/opa/management-car-setting/management-car-setting.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-maker-setting',
  templateUrl: './maker-setting.component.html',
  styleUrls: ['./maker-setting.component.scss'],
})
export class MakerSettingComponent extends KbaAbstractRegisterComponent {
  CommonState = CommonState;

  @ViewChild('groupIDSelection', { static: false })
  groupIDSelection: KbaSelectedComponent;
  @ViewChild(CheckListComponent, { static: false })
  checkList: CheckListComponent;

  params: MakerSettingUpdateParams;
  searchParams: MakerSettingSearchParams = {};
  data: MakerSettingData;
  originalData: MakerSettingData;
  confirmData: Maker[];

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    private managementCarSettingService: ManagementCarSettingService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private router: Router
  ) {
    super(navigation, title, header);
  }

  /**
   * グループ変更時の処理
   */
  onGroupIdChange() {
    this._refresh();
  }

  /**
   * 設定・続けて設定ボタンが有効であるかを返す
   */
  isSubmitButtonDisabled() {
    return (
      this.data &&
      _.isEqual(
        this.originalData.maker_setting.makers,
        this.data.maker_setting.makers
      )
    );
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録ボタン押下時の処理
   */
  async onClickSubmit() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        await this.managementCarSettingService.updateMakerSettings(this.params);
        await this.router.navigateByUrl('/');
        this.alertService.show(this.labels.finish_message);
        break;
      case 'close':
        break;
    }
  }

  /**
   * 続けて登録ボタン押下時の処理
   */
  async onClickContinue() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        await this.managementCarSettingService.updateMakerSettings(this.params);
        this.alertService.show(this.labels.finish_message);
        this._reset();
        break;
      case 'close':
        break;
    }
  }

  protected async _fetchDataForInitialize() {
    const res = await this.managementCarSettingService.fetchMakerSettingInitData();

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (!this.exists('maker_setting.group_id')) {
      this._refresh();
    }
  }

  /**
   * 確認モーダルを開く
   */
  private _registerModalOpen(): Promise<'ok' | 'close'> {
    this.confirmData = this._createConfirmData(this.data);
    this.params = this._createParams(this.originalData, this.data);

    return new Promise(resolve => {
      this.modalService.open({
        title: this.labels.confirm_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: () => resolve('ok'),
        close: () => resolve('close'),
      });
    });
  }

  /**
   * 更新用のパラメータを作成する
   * @param original データ
   * @param updatedMakers 確認モーダル用のメーカの配列
   */
  private _createParams(original: MakerSettingData, updated: MakerSettingData) {
    return {
      maker_setting: {
        update_datetime: original.maker_setting.update_datetime,
        group_id: original.maker_setting.group_id,
        makers: updated.maker_setting.makers.reduce((temp: Maker[], maker) => {
          const originalMaker = original.maker_setting.makers.find(
            _maker => maker.id === _maker.id
          );

          if (
            originalMaker &&
            originalMaker.active_kind !== maker.active_kind
          ) {
            temp.push(_.pick(maker, ['code', 'active_kind']));
          }

          return temp;
        }, []),
      },
    };
  }

  /**
   * 確認モーダル用のデータを作成する
   * @param updated 変更後のデータ
   */
  private _createConfirmData(data: MakerSettingData) {
    return data.maker_setting.makers.filter(
      maker => maker.active_kind === CommonState.on
    );
  }

  /**
   * データをリフレッシュする
   */
  private async _refresh() {
    this.data = (await this.managementCarSettingService.fetchMakerSettings(
      this.searchParams
    )).result_data;
    this.originalData = _.cloneDeep(this.data);

    if (this.checkList != null) {
      this.checkList.resetScrollPosition();
    }
  }

  /**
   * 入力内容をリセットする
   */
  private _reset() {
    if (this.groupIDSelection) {
      this.groupIDSelection.reset();
    }

    this._refresh();
  }
}
