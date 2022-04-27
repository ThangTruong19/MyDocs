import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { SystemParamater } from '../../../../constants/system-paramater';

import { ModalValues } from '../../../../types/common';
import {
  LandmarkIconParams,
  LandmarkMapParams,
  LandmarIndexParams,
} from '../../../../types/flm/landmark';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { LandmarkService } from '../../../../services/flm/landmark/landmark.service';

@Component({
  selector: 'app-landmark-index',
  templateUrl: './landmark-index.component.html',
  styleUrls: ['./landmark-index.component.scss'],
})
export class LandmarkIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('mapModalContent', { static: false }) mapModalContent: TemplateRef<
    null
  >;

  params: LandmarIndexParams;
  deleteModalValues: ModalValues;
  optionalTableColumn = ['header_map'];
  mapFields: string;

  notSortingColumns = ['header_map'];

  // Map初期位置
  initMap: {
    InitMapLon: number;
    InitMapLat: number;
  };

  // Mapに描画するランドマーク一覧
  landmarkList: {
    landmarks: LandmarkMapParams[];
  };

  mapFieldsPromise: Promise<void>;
  deleteModalPromise: Promise<void>;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private alertService: KbaAlertService,
    private landmarkService: LandmarkService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * リスト取得処理
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const res = await this.landmarkService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.landmarks, this.thList);
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * MAPボタン押下コールバック
   * @param data 対象データ
   */
  async onClickMap(data): Promise<void> {
    if (this.mapFields == null) {
      this._showLoadingSpinner();
      await this.mapFieldsPromise;
      this._hideLoadingSpinner();
    }

    this.initMap = {
      InitMapLon: data['landmarks.point.coordinates'][0],
      InitMapLat: data['landmarks.point.coordinates'][1],
    };
    const params = data['landmarks.group.id']
      ? { group_id: data['landmarks.group.id'] }
      : {};
    const res = await this.landmarkService.fetchIndexList(params, {
      'X-Fields': this.mapFields,
    });
    this.landmarkList = res.result_data;
    this.modalService.open(
      {
        title: data['landmarks.label'],
        labels: this.labels,
        content: this.mapModalContent,
      },
      {
        size: 'xl',
        windowClass: 'map-modal',
      }
    );
  }

  /**
   * 変更ボタン押下コールバック
   * @param data 対象データ
   */
  onClickEdit(data): void {
    this.router.navigate(['landmarks/', data['landmarks.id'], 'edit']);
  }

  /**
   * 削除ボタン押下コールバック
   * @param data 対象データ
   */
  async onClickDelete(data): Promise<void> {
    if (this.deleteModalValues == null) {
      this._showLoadingSpinner();
      await this.deleteModalPromise;
      this._hideLoadingSpinner();
    }

    const res = await this.landmarkService.fetchIndexList(
      {
        ...this.searchParams,
        landmark_id: data['landmarks.id'],
      },
      this.deleteModalValues.requestHeaderParams
    );
    this.deleteModalValues.listVal = this._formatList(
      res.result_data.landmarks,
      this.deleteModalValues.listDesc
    )[0];
    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        await this.landmarkService.deleteLandmark(
          data['landmarks.id'],
          data['landmarks.update_datetime']
        );
        this.alertService.show(this.labels.complete_message);
        this.fetchList(this.sortingParams.sort);
      },
    });
  }

  /**
   * 画面初期化処理
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.landmarkService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields).map(th => {
      // アイコンは id でソートする
      if (th.name === 'landmarks.icon.image') {
        th.sortKey = 'landmarks.icon.id';
      }
      return th;
    });
    this.sortableThList = this.sortableThLists(this.thList);
    this.updatable = res.updatable;
    this.deletable = res.deletable;
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.mapFieldsPromise = this._buildMapFields();
  }

  /**
   * 削除モーダルのヘッダ情報を生成する
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.landmarkService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res, 1, {
        noOptionTableColumn: true,
      });
      resolve();
    });
  }

  /**
   * 削除モーダルのヘッダ情報を生成する
   */
  private _buildMapFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.landmarkService.fetchIndexMapFields();
      this.mapFields = this._createXFields(res).join(',');
      resolve();
    });
  }
}
