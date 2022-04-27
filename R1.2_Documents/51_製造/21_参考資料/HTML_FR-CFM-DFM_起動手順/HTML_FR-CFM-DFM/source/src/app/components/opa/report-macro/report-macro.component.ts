import { Component, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { TableHeader, Fields } from '../../../types/common';

import { KbaAbstractIndexComponent } from '../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaFormTableSelectComponent } from '../../shared/kba-form-table-select/kba-form-table-select.component';

import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { ReportMacroService } from '../../../services/opa/report-macro/report-macro.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';

interface States {
  [macroReportCode: string]: {
    publishKind: boolean;
    fileId: string;
  };
}

@Component({
  selector: 'app-report-macro',
  templateUrl: './report-macro.component.html',
  styleUrls: ['./report-macro.component.scss'],
})
export class ReportMacroComponent extends KbaAbstractIndexComponent {
  @ViewChild(KbaFormTableSelectComponent, { static: false }) groupSelection: KbaFormTableSelectComponent;
  @ViewChild('resetModalContent', { static: false }) resetModalContent: TemplateRef<never>;
  @ViewChild('submitModalContent', { static: false }) submitModalContent: TemplateRef<never>;
  @ViewChild('versionModalContent', { static: false }) versionModalContent: TemplateRef<never>;

  publishKind = {
    private: '0',
    public: '1',
  };
  versionThList: TableHeader[];
  versionData;
  listFields: Fields;
  versionFields: Fields;
  confirmFields: Fields;
  currentReportMacroCode: string;
  currentStates: States;
  initialStates: States;
  data;
  tempData;
  resultModalThList: TableHeader[];
  resultModalValue;

  versionModalPromise: Promise<any>;
  confirmModalPromise: Promise<any>;

  get queryParams() {
    const result: { group_id?: string } = {};
    if (this.resource.group_id) {
      result.group_id = this.params.group_id;
    }
    return result;
  }

  get lists() {
    const list = this.data == null ? [] : this.data.macro_settings;
    return {
      visibleList: list,
      originList: list,
    };
  }

  set lists(data) {
    if (this.data == null) {
      return;
    }
    this.data.macro_settings = data.originList;
  }

  get isSubmitButtonDisabled() {
    if (this.data == null) {
      return true;
    }

    return _.isEqual(this.currentStates, this.initialStates);
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private reportMacroService: ReportMacroService,
    private alertService: KbaAlertService,
    private apiService: ApiService
  ) {
    super(nav, title, router, ref, header, modal);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this._reflectXFields(this.listFields);
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.reportMacroService.fetchList(
      this.queryParams,
      this.requestHeaderParams
    );
    this.currentStates = this._initializeStates(res.result_data);
    this.initialStates = _.cloneDeep(this.currentStates);

    this.data = this._formaDatetime(res.result_data);
    this.tempData = _.cloneDeep(this.data);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * バージョン選択モーダルを開く
   * @param data 表示対象データ
   */
  async openVersionModal(data) {
    this._showLoadingSpinner();

    if (this.versionFields == null) {
      await this.versionModalPromise;
    }

    this._reflectXFields(this.versionFields);
    this.currentReportMacroCode = data.macro_report_code;
    this.reportMacroService
      .fetchMacroFiles(
        this.currentReportMacroCode,
        this.queryParams,
        this.requestHeaderParams
      )
      .then(res => {
        this.versionData = res.result_data;
        this.versionData.macro_files.forEach(
          v =>
            (v.latest_update_datetime = this.dateTimeFormat(
              v.latest_update_datetime
            ))
        );

        this._hideLoadingSpinner();

        this.modalService.open(
          {
            title: this.labels.version_modal_title,
            labels: this.labels,
            content: this.versionModalContent,
            okBtnLabel: this.labels.reflect_btn,
            ok: () => {
              this._reflectVersion(
                this.versionData,
                this.currentStates[this.currentReportMacroCode].fileId
              );
            },
          },
          {
            size: 'lg',
          }
        );
      });
  }

  /**
   * 設定グループ変更時の処理
   */
  onGroupChange() {
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 公開中チェック変更時の処理
   * @param event イベント
   * @param code レポーロマクロコード
   */
  onCheck(event, code) {
    const target = this.data.macro_settings.find(
      m => m.macro_report_code === code
    );
    target.publish_kind = event.target.checked
      ? this.publishKind.public
      : this.publishKind.private;
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => {
        if (this.exists('group_id')) {
          this.groupSelection.resetAndEmit();
        } else {
          this.currentStates = _.cloneDeep(this.initialStates);
          this.data = _.cloneDeep(this.tempData);
        }
      },
    });
  }

  /**
   * 設定ボタン押下時の処理
   */
  async onClickSubmit() {
    this._showLoadingSpinner();

    if (this.confirmFields == null) {
      await this.confirmModalPromise;
    }

    this._reflectXFields(this.confirmFields);
    const currentList = this.lists.originList;
    const res = await this.reportMacroService.fetchList(
      this.queryParams,
      this.requestHeaderParams
    );
    const list = this._formaDatetime(res.result_data);
    list.macro_settings = list.macro_settings.map(macro => {
      const updated = currentList.find(
        _macro => macro.macro_report_code === _macro.macro_report_code
      );

      macro.publish_kind = updated.publish_kind;
      macro.file = updated.file;

      return macro;
    });
    this.resultModalValue = list;
    await this.timeout();

    this._hideLoadingSpinner();

    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: async () => {
          this._showLoadingSpinner();

          const params = this._buildParams(list);

          await this.reportMacroService.updateMacroSettings(params);
          await this.router.navigateByUrl('/');

          this._hideLoadingSpinner();
          this.alertService.show(this.labels.finish_message);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.reportMacroService.fetchInitData();

    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this.thList = this._createThList(res.fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this.listFields = res.fields;
    this.collapsed = this.resource.block_id == null;
    this.safeDetectChanges();
  }

  protected _afterInitFetchList() {
    this.versionModalPromise = this._buildVersionModalValues();
    this.confirmModalPromise = this._buildConfirmModalValues();
  }

  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(1)
      .join('.');
  }

  /**
   * 日時の表示形式をフォーマット
   * @param data データ
   */
  private _formaDatetime(data) {
    data.macro_settings.forEach(
      d =>
        (d.latest_update_datetime = this.dateTimeFormat(
          d.latest_update_datetime
        ))
    );

    return data;
  }

  /**
   * パラメータを作成
   * @param data データ
   * @param states 現在の状態
   */
  private _buildParams(data) {
    const result = _.cloneDeep(data);
    result.group_id = this.params.group_id || this.apiService.getGroupId();

    result.macro_settings = result.macro_settings.map(d => ({
      publish_kind: d.publish_kind,
      macro_report_code: d.macro_report_code,
      macro_file_id: d.file.id,
      update_datetime: d.update_datetime,
    }));

    return result;
  }

  /**
   * バージョンの変更をテーブルに反映
   * @param data データ
   * @param version バージョン
   */
  private _reflectVersion(data, fileId) {
    const target = this.data.macro_settings.find(
      m => m.macro_report_code === data.macro_report_code
    );
    const file = data.macro_files.find(d => d.id === fileId);
    target.file = file;
  }

  /**
   * API の戻り値からテーブルのチェック状態を初期化
   * @param data データ
   */
  private _initializeStates(data) {
    const states: States = {};
    data.macro_settings.forEach(d => {
      states[d.macro_report_code] = {
        publishKind: d.publish_kind === this.publishKind.public,
        fileId: d.file.id,
      };
    });
    return states;
  }

  /**
   * バージョン選択モーダル用各種項目取得
   */
  private _buildVersionModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.reportMacroService.fetchIndexVersionFields();
      this.versionThList = this._createThList(res);
      this.versionFields = res;
      this.labels.file_name = this.versionFields.find(
        field => field.path === 'macro_report_name'
      ).name;
      resolve();
    });
  }

  /**
   * バージョン選択モーダル用各種項目取得
   */
  private _buildConfirmModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.reportMacroService.fetchIndexConfirmFields();
      this.resultModalThList = this._createThList(res);
      this.confirmFields = res;
      resolve();
    });
  }
}
