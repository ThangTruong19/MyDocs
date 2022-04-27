import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { times, cloneDeep } from 'lodash';

import { CustomCarAttributeFormComponent } from '../shared/form/custom-car-attribute-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CustomCarAttributeService } from '../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { ScreenCode } from '../../../../constants/opa/screen-codes/custom-car-attribute-management';

@Component({
  selector: 'app-custom-car-attribute-new',
  templateUrl: '../shared/form/custom-car-attribute-form.component.html',
  styleUrls: ['../shared/form/custom-car-attribute-form.component.scss'],
})
export class CustomCarAttributeNewComponent extends CustomCarAttributeFormComponent {
  isUpdate = false;
  initialDisplayItemsLength = 3;
  checkIsEdited = false;
  screenCode = ScreenCode.regist;
  _super_onBlockIdChange = super.onBlockIdChange;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    customCarAttributeService: CustomCarAttributeService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    router: Router,
    alertService: KbaAlertService
  ) {
    super(
      navigation,
      title,
      header,
      customCarAttributeService,
      modalService,
      ref,
      router,
      alertService
    );
  }

  async onBlockIdChange(block: string) {
    await this._super_onBlockIdChange(block);
    this._updateFiledNo();
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.customCarAttributeService.fetchNewInitData();

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;

    if (this.exists('custom_car_attribute.block_id')) {
      await this.onBlockIdChange(
        this.resource.custom_car_attribute.block_id.values[0].value
      );
    } else {
      this._updateFiledNo();
    }
    this.safeDetectChanges();
    this._setTitle();
    this.primaryLang = this.resource.custom_car_attribute.names.values[0].value;
    this._initializeParams();
    this.originalParams = cloneDeep(this.params);
    this._buildFormControls();
    this.onUseSameNameChange(true);
    this.isReady = true;
    setTimeout(() => {
      this._initializeContents();
    });
  }

  /**
   * 入力内容をリセット
   */
  protected _reset() {
    super._reset();
    this.blockIdSelection.reset();
    this.fieldNoSelection.reset();

    if (this.blockIdSelection.isVisible) {
      this.onBlockIdChange(this.blockIdSelection.viewVal[0].id);
    }
    this._buildFormControls({ reset: true });
    this.useSameName = true;
    this.onUseSameNameChange(true);
  }

  /**
   * 表示項目リストをリセット
   */
  protected _resetDisplayItems(): void {
    this.displayItemsArray.markAsPristine();
    this.params.custom_car_attribute.details = [];
    this.displayItemsIndex = 0;
    this.displayItemsArray.patchValue([]);

    times(this.initialDisplayItemsLength, () => this.addDisplayItem());
  }

  protected _register(params): Promise<any> {
    return this.customCarAttributeService.createCustomCarAttributeService(
      params
    );
  }

  /**
   * 属性Noが選択可能であるかを確認し、選択不可能の場合リストに - を表示する
   */
  private _updateFiledNo() {
    if (
      this.exists('custom_car_attribute.field_no') &&
      !this.exists('custom_car_attribute.field_no', true)
    ) {
      this.resource.custom_car_attribute.field_no.values = [
        { name: '-', value: '' },
      ];
      this.safeDetectChanges();
      this.fieldNoSelection.refresh();
      this.params.custom_car_attribute.field_no = null;
    }
  }
}
