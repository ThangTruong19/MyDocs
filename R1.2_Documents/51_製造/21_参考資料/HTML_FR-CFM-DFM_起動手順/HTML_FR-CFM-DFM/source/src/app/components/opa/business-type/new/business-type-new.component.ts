import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';

import { BusinessTypeParams } from '../../../../types/opa/business-type';

import { BusinessTypeFormComponent } from '../shared/form/business-type-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { BusinessTypeService } from '../../../../services/opa/business-type/business-type.service';
import { ScreenCode } from '../../../../constants/opa/screen-codes/business-type-management';

@Component({
  selector: 'app-business-type-new',
  templateUrl: '../shared/form/business-type-form.component.html',
  styleUrls: ['../shared/form/business-type-form.component.scss'],
})
export class BusinessTypeNewComponent extends BusinessTypeFormComponent {
  isUpdate = false;
  screenCode = ScreenCode.regist;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    businessTypeService: BusinessTypeService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    router: Router,
    alertService: KbaAlertService
  ) {
    super(
      navigation,
      title,
      header,
      businessTypeService,
      modalService,
      ref,
      router,
      alertService
    );
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.businessTypeService.fetchInitNew();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    if (this.exists('business_type.block_id')) {
      await this.handleBlockChange(
        this.resource.business_type.block_id.values[0].value
      );
    } else {
      this._refreshParams();
    }
    this._setTitle();
    this.primaryLang = res.resource.business_type.item_names.values[0].value;
    this.originalParams = cloneDeep(this.params);
    this.isReady = true;
    this._initializeParams();
    this._buildFormControls();
    this._initializeContents();
    this.businessTypeForm.get('setting').setValue(true);
  }

  /**
   * 入力内容をリセット
   */
  protected _reset(): void {
    super._reset();
    if (this.exists('business_type.block_id')) {
      this.blockIdSelection.resetAndEmit();
    }
    this.businessTypeNameGroup = this._createBusinessTypeNamesFormGroup(true);
    this.useSameName = true;
    this.businessTypeForm.get('setting').setValue(true);
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   */
  protected _register(params: BusinessTypeParams): Promise<any> {
    return this.businessTypeService.createBusinessType(params);
  }
}
