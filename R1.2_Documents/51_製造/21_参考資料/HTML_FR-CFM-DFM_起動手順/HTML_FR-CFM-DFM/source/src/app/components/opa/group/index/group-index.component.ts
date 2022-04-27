import {
  cloneDeep,
  forEach,
  isPlainObject,
  get,
  every,
  find,
  has,
} from 'lodash';
import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Api, Fields } from '../../../../types/common';
import { TableHeader, ModalValues } from '../../../../types/common';

import { CommonState } from '../../../../constants/common-state';
import { GlobalKind } from '../../../../constants/opa/global-kind';
import { FunctionCode } from '../../../../constants/opa/function-codes/group-management';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { GroupService } from '../../../../services/opa/group/group.service';
import { ApiService } from '../../../../services/api/api.service';
import { ProcessingType } from '../../../../constants/download';
import { CoordinateType } from '../../../shared/kba-area/area';
import { MapApplicationMappings } from '../../../../constants/opa/group-map-application-mappings';

@Component({
  selector: 'app-group-index',
  templateUrl: './group-index.component.html',
  styleUrls: ['./group-index.component.scss'],
})
export class GroupIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild('detailModalContent', { static: false })
  detailModalContent: TemplateRef<null>;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  fields: any;
  downloadFields: any;
  downloadFieldResources: any;
  states = CommonState;
  notSortingColumns = ['groups.attribute.publish_kind'];
  keyPersonPatterns = [/^group\.represent_administrator/];
  groupInfoHeader: TableHeader[];
  groupInfoParams;
  keyPersonHeader: TableHeader[];
  keyPersonParams;
  mapParams;
  showModalMap: boolean;
  // 詳細モーダル用の指定項目取得の検索条件に用いる
  detailFieldsList: {
    [kindId: string]: Fields;
  } = {};
  configurationGroupIdParams = {
    configuration_group_ids: '',
  };

  // 特殊な形式で設定されるため、詳細表示時ネストの浅い部分で取得する必要があるもの
  extraDetailModalKeys = [
    'group.map',
    'group.publish_target',
    'group.administrator_role',
    'group.general_role',
    'group.preset_roles',
  ];

  deleteModalPromise: Promise<void>;
  fieldResourcesPromise: Promise<void>;
  downloadPromise: Promise<void[]>;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private alertService: KbaAlertService,
    private groupService: GroupService,
    private api: ApiService
  ) {
    super(nav, title, router, ref, header, modal);
  }

  /**
   * リスト取得
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string) {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.groupService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.groups, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 詳細ボタン押下時の処理
   * @param data データ
   */
  async onClickDetail(data): Promise<any> {
    this._showLoadingSpinner();

    const kindId = get(data, 'groups.identification.kind_id');
    const fields = await this._fetchDetailFields(kindId);
    this.detailModalValues = this._getModalValues(fields);
    const res = await this.groupService.fetchGroupDetail(
      data['groups.identification.id'],
      this.detailModalValues.requestHeaderParams
    );

    const params = this._createModalParams(res.result_data);
    this.groupInfoParams = params.groupInfo;
    this.keyPersonParams = params.keyPerson;

    const headers = this._createModalHeaders(
      this.detailModalValues,
      this.groupInfoParams,
      this.keyPersonParams
    );
    this.groupInfoHeader = headers.groupInfo;
    this.keyPersonHeader = headers.keyPerson;

    // コマツ #2360 「公開中」の項目をマスクする
    // 再度必要となる場合この処理を削除する
    const publishKind = this.groupInfoHeader.find((header) => header.name === 'group.attribute.publish_kind');
    if (publishKind != null) {
      publishKind.displayable = false;
    }

    this.mapParams = this._formatMapParams(res.result_data);
    this.showModalMap = this.mapParams != null;

    this._hideLoadingSpinner();

    this.modalService.open(
      {
        title: this.labels.detail_modal_title,
        labels: this.labels,
        content: this.detailModalContent,
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 編集ボタン押下時の処理
   * @param data データ
   */
  onClickEdit(data): void {
    this.router.navigateByUrl(
      `groups/${data['groups.identification.id']}/edit`
    );
  }

  /**
   * 削除ボタン押下時の処理
   * @param data データ
   */
  async onClickDelete(data): Promise<any> {
    this._showLoadingSpinner();

    if (this.deleteModalValues == null) {
      await this.deleteModalPromise;
    }

    const res = await this.groupService.fetchGroupDetail(
      data['groups.identification.id'],
      this.deleteModalValues.requestHeaderParams
    );

    const params = this._createModalParams(res.result_data);
    this.groupInfoParams = params.groupInfo;
    this.keyPersonParams = params.keyPerson;

    const headers = this._createModalHeaders(
      this.deleteModalValues,
      this.groupInfoParams,
      this.keyPersonParams
    );
    this.groupInfoHeader = headers.groupInfo;
    this.keyPersonHeader = headers.keyPerson;

    this._hideLoadingSpinner();

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: () => this._delete(data),
    });
  }

  /**
   * 表示項目設定ボタン押下時の処理
   * @param event イベント
   */
  onClickFieldSelect(event): void {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   * @param event イベント
   */
  onClickDownloadAll(event): void {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * 表示項目設定 OK ボタン押下時の処理
   * @param event イベント
   */
  async onFieldSelectOk(event): Promise<any> {
    await this.api.updateField(FunctionCode.listFunction, event.fields);
    const res = await new Promise(resolve =>
      this.api
        .fetchFields(FunctionCode.listFunction)
        .subscribe(_res => resolve(_res))
    );
    this._updateFields(res);
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * ダウンロード OK ボタン押下時の処理
   * @param event イベント
   */
  async onDownloadOk(event): Promise<any> {
    await this.api.updateField(FunctionCode.listDownloadFunction, event.fields);
    this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    super.onClickSearch();
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
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize() {
    const res: any = await this.groupService.fetchIndexInitData();
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.initialize(res);
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this.fieldResources = res.fieldResources;
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.fieldResourcesPromise = this._buildFieldResources();
    this.downloadPromise = Promise.all([
      this._buildDownloadFields(),
      this._buildDownloadFieldResources(),
    ]);
  }

  protected _listDisplayData(data, th) {
    if (th.name === 'groups.configuration_groups.label') {
      return get(data, 'configuration_groups[0].label');
    } else {
      return get(data, th.formatKey);
    }
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  private _updateFields(fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept): Promise<any> {
    const header = cloneDeep(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;

    this._showLoadingSpinner();
    try {
      const res: any = await this.groupService.createGroupsFile(
        {
          ...this.searchParams,
          file_content_type: accept,
          processing_type: ProcessingType.sync,
        },
        header
      );

      await this.api.downloadFile(res.result_data.file_id, accept);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 詳細・削除モーダルのパラメータを作成する
   * @param data データ
   */
  private _createModalParams(data) {
    const result = {
      groupInfo: {},
      keyPerson: {},
    };

    const fn = (_obj, currentKey = '', temp = {}) => {
      let tempKey, key;
      forEach(_obj, (v, k) => {
        tempKey = [currentKey, k].join('.');
        key = tempKey.slice(1);

        if (key === 'group.configuration_groups') {
          return (temp['group.configuration_groups.label'] = v[0].label);
        }

        if (
          this.extraDetailModalKeys.find(d => d === key) ||
          !isPlainObject(v)
        ) {
          return (temp[key] = v);
        }

        return fn(v, tempKey, temp);
      });

      return temp;
    };

    const obj = fn(data);

    forEach(obj, (v, k) => {
      if (this.keyPersonPatterns.find(pattern => pattern.test(k))) {
        result.keyPerson[k] = this._formatModalValue(k, v);
      } else {
        result.groupInfo[k] = this._formatModalValue(k, v);
      }
    });

    result.groupInfo['group.langs.name'] = result.groupInfo['group.langs'];
    return result;
  }

  /**
   * 詳細・削除モーダルのヘッダを作成する
   * @param modalValues モーダルのヘッダ情報
   * @param groupInfoParams グループ情報のパラメータ
   * @param keyPersonParams KeyPersonのパラメータ
   */
  private _createModalHeaders(
    modalValues: ModalValues,
    groupInfoParams,
    keyPersonParams
  ) {
    const result = {
      groupInfo: [],
      keyPerson: [],
    };

    modalValues.listDesc.forEach(header => {
      if (groupInfoParams[header.name] !== undefined) {
        result.groupInfo.push(header);
      }

      if (keyPersonParams[header.name] !== undefined) {
        result.keyPerson.push(header);
      }
    });

    this.extraDetailModalKeys.forEach(key => {
      if (groupInfoParams[key] !== undefined) {
        result.groupInfo.push({
          name: key,
          displayable: false,
        });
      }
    });

    return result;
  }

  /**
   * モーダルに表示する値をフォーマットする
   * @param key キー
   * @param value 値
   */
  private _formatModalValue(key, value) {
    switch (key) {
      case 'group.langs':
        return value.map(v => v.name);
      case 'group.child_plants':
        return value.map(v => v.label).join(', ');
      case 'group.publish_target':
        const temp = [];
        temp.push(value.global_name);
        if (value.global_kind === GlobalKind.region) {
          temp.push(value.regions.map(r => r.label).join(', '));
        }
        return temp;
      case 'group.general_role':
      case 'group.administrator_role':
        return this._formatAuthorities(value.authorities);
      case 'group.preset_roles':
        return value.map(v => ({
          label: v.group_kind_name,
          roles: this._formatAuthorities(v.authorities),
        }));
      case 'group.attribute.time_difference':
        return this.formatTimeDifference(value);
      case 'group.map':
        return {
          isMap: true,
        };
      default:
        return value;
    }
  }

  /**
   * 権限の文言を成型して返す
   * @param authorities 権限
   */
  private _formatAuthorities(authorities) {
    return authorities.map(auth => [auth.name, auth.default_kind_name]);
  }

  /**
   * 削除 API を呼ぶ
   * @param item 対象項目
   */
  private async _delete(item): Promise<any> {
    this._showLoadingSpinner();

    await this.groupService.deleteGroup(
      item['groups.identification.id'],
      item['groups.identification.update_datetime']
    );

    this._hideLoadingSpinner();
    this.fetchList(this.sortingParams['sort']);
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * マップのパラメータを整形
   * @param data データ
   */
  private _formatMapParams(data) {
    if (
      get(data, 'group.map.geometry.coordinates') == null ||
      get(data, 'group.map.properties.magnification') == null
    ) {
      return null;
    }

    return {
      lat: data.group.map.geometry.coordinates[CoordinateType.LAT],
      lng: data.group.map.geometry.coordinates[CoordinateType.LNG],
      zoom: data.group.map.properties.magnification,
      mapApplication: MapApplicationMappings[data.group.map_application.id],
    };
  }

  /**
   * 詳細用の指定項目の取得処理
   * @param kindId グループ分類ID
   */
  private async _fetchDetailFields(kindId): Promise<Fields> {
    if (!has(this.detailFieldsList, kindId)) {
      const fields = await new Promise<Fields>(resolve =>
        this.api
          .fetchFields(
            FunctionCode.listDetailFunction,
            null,
            `group_kind,${kindId}`
          )
          .subscribe(_res => resolve(_res))
      );
      this.detailFieldsList[kindId] = fields;
    }
    return this.detailFieldsList[kindId];
  }

  /**
   * 削除モーダル用ヘッダ情報生成
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.groupService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * ダウンロード用指定項目取得
   */
  private _buildDownloadFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.groupService.fetchIndexDownloadFields();
      this.downloadFields = res;
      resolve();
    });
  }

  /**
   * 指定項目リソース取得
   */
  private _buildFieldResources() {
    return new Promise<void>(async (resolve) => {
      const res = await this.groupService.fetchIndexFieldResources();
      this.fieldResources = res;
      resolve();
    });
  }

  /**
   * ダウンロード用指定項目リソース取得
   */
  private _buildDownloadFieldResources() {
    return new Promise<void>(async (resolve) => {
      const res = await this.groupService.fetchIndexDownloadFieldResources();
      this.downloadFieldResources = res;
      resolve();
    });
  }
}
