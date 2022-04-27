import * as _ from 'lodash';
import {
  Component,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { GroupService } from '../../../../services/opa/group/group.service';
import { TableHeader, ModalValues, Fields } from '../../../../types/common';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { CommonState } from '../../../../constants/common-state';
import { PublishGroupKind } from '../../../../constants/publish-group-kind';

@Component({
  selector: 'app-group-integration',
  templateUrl: './group-integration.component.html',
  styleUrls: ['./group-integration.component.scss'],
})
export class GroupIntegrationComponent extends KbaAbstractIndexComponent {
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('confirmModalContent', { static: false })
  confirmModalContent: TemplateRef<null>;
  @ViewChild('blockSelection', { static: false })
  blockSelection: KbaSelectedComponent;

  destThList: TableHeader[];
  srcThList: TableHeader[];
  sortableDestThList;
  sortableSrcThList;
  destLists = {
    visibleList: [],
    originList: [],
  };
  srcLists = {
    visibleList: [],
    originList: [],
  };
  template: 'dest' | 'src' = 'dest';
  destGroupId: string;
  checkIdName = 'groups.identification.id';
  destGroup;
  confirmModalValues: ModalValues;
  confirmModalDestThList: TableHeader[];
  confirmModalSrcThList: TableHeader[];
  confirmModalDestList: any[];
  confirmModalSrcList: any[];
  confirmModalCheck: { [key: string]: boolean };
  destFields: Fields;
  srcFields: Fields;
  integrationCheckError = null;
  integrationToLabel: string;
  checkedItems: {
    [key: string]: boolean;
  } = {};
  configurationGroupIdParams = {
    configuration_group_ids: '',
  };

  get thList() {
    return this[`${this.template}ThList`];
  }

  set thList(val) { }

  get sortableThList() {
    return this.template === 'dest'
      ? this.sortableDestThList
      : this.sortableSrcThList;
  }

  set sortableThList(val) { }

  get lists() {
    return this[`${this.template}Lists`];
  }

  set lists(val) { }

  get selectedSrcGroups() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private alertService: KbaAlertService,
    private groupService: GroupService
  ) {
    super(nav, title, router, ref, header, modal);
  }

  async fetchList(sort_key?: string) {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';

    const res = await this.groupService.fetchIndexList(
      {
        ...this.searchParams,
        group_kind_id: PublishGroupKind.distributor,
      },
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.groups, this.thList);
    this._fillLists(res.result_header, list);

    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    super.onClickSearch();

    if (this.template === 'dest') {
      this.destGroup = null;
      this.destGroupId = null;
    }

    this.checkedItems = {};
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * ブロック選択時の処理
   * @param block ブロックID
   */
  onSelectBlock(block) {
    this.params.configuration_group_ids =
      this.params.configuration_group_ids || [];
    this.params.configuration_group_ids[0] = block;
  }

  /**
   * 統合先グループ選択時の処理
   * @param id 項目ID
   * @param item 項目
   */
  onSelectDestGroup(id, item) {
    this.destGroupId = id;
    this.destGroup = item;
  }

  /**
   * テンプレートを変更
   * @param template テンプレート名
   */
  async setTemplate(template: 'dest' | 'src') {
    this.template = template;
    this._reflectXFields(
      template === 'dest' ? this.destFields : this.srcFields
    );
    this.kbaPaginationComponent.initOptions();
    this._reflectPageParams();
    if (this.blockSelection) {
      await this.blockSelection.refresh();
    }
    setTimeout(() => this.fetchList(this.sortingParams.sort));
  }

  /**
   * 次へボタンが有効であるかをチェック
   */
  isNextButtonEnabled() {
    return this.destGroupId != null;
  }

  /**
   * 統合・続けて統合ボタンが有効であるかチェック
   */
  isSubmitButtonEnabled() {
    return this.selectedSrcGroups && this.selectedSrcGroups.length > 0;
  }

  /**
   * 次へボタン押下時の処理
   */
  onClickNext() {
    this.checkedItems = {};
    this.setTemplate('src');
  }

  /**
   * 戻るボタン押下時の処理
   */
  onClickBack() {
    this.checkedItems = {};
    this.setTemplate('dest');
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
   * 続けて統合ボタン押下時の処理
   */
  onClickContinue() {
    this._confirmModalOpen('/groups/integration');
  }

  /**
   * 統合ボタン押下時の処理
   */
  onClickSubmit() {
    this._confirmModalOpen('/');
  }

  /**
   * モーダルのチェック変更時の処理
   * @param val 値
   * @param id チェックボックスのID
   */
  onModalCheck(val, id) {
    this.confirmModalCheck[id] = val;
    const checks = _.values(this.confirmModalCheck);
    this.modalService.enableOk =
      checks.every(v => v) &&
      checks.length ===
      this.confirmModalDestList.length + this.confirmModalSrcList.length;
  }

  /**
   * チェックボックスの表示制御を行う
   * @param item 項目
   */
  checkBoxHidden(item) {
    return (
      item['groups.identification.id'] === this.destGroupId ||
      item['groups.integration_status'] === '1'
    );
  }

  /**
   * 統合ボタンの無効判定
   */
  isIntegrationDisabled(error = null) {
    if (error != null) {
      return error.code.endsWith('E');
    }

    if (this.integrationCheckError == null) {
      return false;
    }

    return this.integrationCheckError.some(e => e.code.endsWith('E'));
  }

  protected async _fetchDataForInitialize() {
    const res = await this.groupService.fetchIntegrateInitData();

    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.initialize(res);
    this.destThList = this._createThList(res.destFields);
    this.sortableDestThList = this.sortableThLists(this.destThList);
    const integrationToField = res.destFields.find(
      field => field.path === 'groups.identification.label'
    );
    this.integrationToLabel = integrationToField ? integrationToField.name : '';
    this.srcThList = this._createThList(res.srcFields);
    this.sortableSrcThList = this.sortableThLists(this.srcThList);
    this.confirmModalValues = this._getModalValues(res.confirmFields);
    this.confirmModalValues.requestHeaderParams['X-From'] = null;
    this.confirmModalValues.listDesc = this._applyStyleToConfirmHeader(
      this.confirmModalValues.listDesc
    );
    this._reflectXFields(res.destFields);
    this.destFields = res.destFields;
    this.srcFields = res.srcFields;
  }

  /**
   * データキー取得
   * @param key キー（指定項目のパス）
   * @override
   */
  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(1)
      .join('.');
  }

  /**
   * リセット処理
   */
  private _reset() {
    this.destGroupId = null;
    this.destGroup = null;
    this.checkedItems = {};
    this.params = {
      configuration_group_ids: [],
    };

    this.template = 'dest';
    this._reflectXFields(this.destFields);
    this.kbaPaginationComponent.initOptions();
    this._reflectPageParams();
    this.safeDetectChanges();
    if (this.blockSelection) {
      this.blockSelection.resetAndEmit();
    }
    setTimeout(() => this.onClickSearch());
  }

  /**
   * 確認モーダルを開く
   */
  private async _confirmModalOpen(path) {
    this._showLoadingSpinner();

    const params = this._formatParams(this.destGroup, this.selectedSrcGroups);
    const scales = (await this.groupService.fetchGroupScale(
      [this.destGroupId].concat(this.selectedSrcGroups),
      this.confirmModalValues.requestHeaderParams
    )).result_data;
    this.integrationCheckError = null;
    await this.groupService
      .integrateGroups(this.destGroupId, {
        group: {
          ...params.group,
          update_mode: CommonState.off,
        },
      })
      .catch(e => {
        this.integrationCheckError = e.error.error_data.map(error => ({
          ...error,
          message: this._replacePath(error.message, error.keys),
        }));
      });
    this.confirmModalDestList = scales.groups.filter(
      scale => scale.identification.id === this.destGroupId
    );
    this.confirmModalSrcList = scales.groups.filter(scale =>
      this.selectedSrcGroups.includes(scale.identification.id)
    );
    this.confirmModalDestThList = _.cloneDeep(
      this.confirmModalValues.listDesc
    ).filter(th => !this.isIntegrationDisabled() || th.name !== 'confirm');
    this.confirmModalSrcThList = _.cloneDeep(
      this.confirmModalValues.listDesc
    ).filter(th => !this.isIntegrationDisabled() || th.name !== 'confirm');
    this.confirmModalDestThList.find(
      th => th.name === 'groups.identification.label'
    ).label = this.labels.integration_to_group;
    this.confirmModalSrcThList.find(
      th => th.name === 'groups.identification.label'
    ).label = this.labels.integration_from_group;

    this._hideLoadingSpinner();

    this.confirmModalCheck = {};
    this.modalService.open(
      {
        title: this.labels.integrate_modal_title,
        labels: this.labels,
        content: this.confirmModalContent,
        okBtnLabel: this.labels.integrate_btn,
        enableOk: false,
        ok: async () => {
          this._showLoadingSpinner();

          await this.groupService
            .integrateGroups(this.destGroupId, {
              group: {
                ...params.group,
                update_mode: CommonState.on,
              },
            })
            .catch(error => {
              this._setError(error, this.alertService);
              this._reset();
            });
          this._reset();
          await this.router.navigateByUrl(path);

          this._hideLoadingSpinner();
          this.alertService.show(this.labels.complete_message);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 確認モーダルのヘッダにスタイルを適用する
   * @param fields 指定項目
   */
  private _applyStyleToConfirmHeader(thList: TableHeader[]) {
    thList.forEach(th => (th.fixed = /count/.test(th.name)));

    return thList.concat([
      {
        label: this.labels.confirm,
        name: 'confirm',
        displayable: true,
        fixed: true,
        sortKey: null,
        sortable: false,
      },
    ]);
  }

  /**
   * 一括統合APIに投げるパラメータを整形
   * @param dest 統合先グループ
   * @param srcIds 統合元グループIDの配列
   */
  private _formatParams(dest, srcIds) {
    return {
      group: {
        group_ids: srcIds,
        update_datetime: dest['groups.identification.update_datetime'],
      },
    };
  }
}
