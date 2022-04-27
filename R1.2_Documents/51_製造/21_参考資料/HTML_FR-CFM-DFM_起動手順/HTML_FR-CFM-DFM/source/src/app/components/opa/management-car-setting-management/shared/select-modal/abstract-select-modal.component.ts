import {
  Input,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { Api } from '../../../../../types/common';
import {
  ModelSettingSearchParams,
  ModelSettingData,
  Model,
} from '../../../../../types/opa/management-car-setting/model-setting';
import {
  ModelTypeSettingSearchParams,
  ModelTypeSettingData,
  Type,
} from '../../../../../types/opa/management-car-setting/model-type-setting';

import { ManagementCarSettingService } from '../../../../../services/opa/management-car-setting/management-car-setting.service';
import { CommonState } from '../../../../../constants/common-state';
import { KbaAbstractBaseComponent } from '../../../../shared/kba-abstract-component/kba-abstract-base-compoenent';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';

type AbstractData = ModelSettingData | ModelTypeSettingData;

export abstract class AbstractSelectModalComponent
  extends KbaAbstractBaseComponent
  implements OnInit, OnDestroy {
  @Input() resource;
  @Input() labels;
  @Input() set params(params) {
    this.searchParams = { ...params };
  }
  @Input() updatedData;
  @Input() screenCode: string;

  searchParams: ModelSettingSearchParams | ModelTypeSettingSearchParams;
  data: AbstractData;

  abstract identifier: string;
  abstract get checkAll();
  abstract set checkAll(checkAll: boolean);

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    protected managementCarSettingService: ManagementCarSettingService,
    protected modalService: KbaModalService,
    private ref: ChangeDetectorRef
  ) {
    super(navigationService, title);
  }

  @Input() processData: (data: AbstractData) => AbstractData = data => data;
  @Input() enableOkFn: (data: AbstractData) => boolean = data => data != null;

  /**
   * 初期処理
   */
  ngOnInit() {
    this.onClickSearch();
  }

  /**
   * @override
   */
  ngOnDestroy() {}

  /**
   * 検索ボタン押下時の処理
   */
  async onClickSearch() {
    const params = this._processParams(this.searchParams);
    const res: Api = await this._fetchData(params);
    const fetched = this.processData(res.result_data);
    this.data = this._mergeData(fetched, this.updatedData);
    this.modalService.enableOk = this.enableOkFn(this.data);
    this.ref.detectChanges();
  }

  /**
   * セルのクラスを判定する
   * @param model 機種
   */
  getCellClasses = (cell: Model | Type) => {
    return {
      'cell-green': cell.active_kind === CommonState.on,
      'cell-red': false,
    };
  };

  /**
   * 検索結果に更新されたデータをマージする
   * @param searchResult 検索結果
   * @param updated 更新されたデータ
   */
  protected abstract _mergeData(
    searchResult: ModelSettingData | ModelTypeSettingData,
    updated: ModelSettingData | ModelTypeSettingData
  );

  /**
   * データ取得
   * @param params パラメータ
   */
  protected abstract _fetchData(params: any);

  /**
   * パラメータを整形する
   */
  private _processParams(
    params: ModelSettingSearchParams | ModelTypeSettingSearchParams
  ) {
    return {
      ...params,
      models: [params.models],
    };
  }
}
