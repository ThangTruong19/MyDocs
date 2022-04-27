import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { pick, reduce, merge, cloneDeep, get } from 'lodash';
import { Title } from '@angular/platform-browser';

import { ModalValues, TableHeader } from '../../../../types/common';
import {
  ContactCustomerParams,
  ContactLinkParams,
} from '../../../../types/flm/contact';

import { ScreenCode } from '../../../../constants/flm/screen-codes/contact-management';
import { KbaMimeType } from '../../../../constants/mime-types';
import { ProcessingType } from '../../../../constants/download';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectTypeComponent } from '../../../shared/kba-select-type/kba-select-type.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaFileUploadService } from '../../../../services/shared/kba-file-upload.service';
import { ApiService } from '../../../../services/api/api.service';
import { Apis } from '../../../../constants/apis';

@Component({
  selector: 'app-customer-index',
  templateUrl: './customer-index.component.html',
  styleUrls: ['./customer-index.component.scss'],
})
export class ContactCustomerIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('unlinkModalContent', { static: false })
  unlinkModalContent: TemplateRef<never>;
  @ViewChild('uploadResultModal', { static: false })
  uploadResultModal: TemplateRef<never>;
  @ViewChild(KbaSelectTypeComponent, { static: false })
  selecteTypeComponent: KbaSelectTypeComponent;

  params: ContactCustomerParams = {};
  unlinkModalValues: ModalValues;
  downloadValues: ModalValues;
  valItem: any;
  preformattedList: any;
  uploadPath = Apis.postContactsCustomersUpload;
  resultModalData: any;
  uploadJSON: { [x: string]: any };
  originalThList: TableHeader[];
  originalUnlinkThList: TableHeader[];
  isReady = false;
  notSortingColumns = ['contact_links.customer_contact_links.contact_label'];
  editScreenCode = ScreenCode.customerEdit;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private contactService: ContactService,
    private alertService: KbaAlertService,
    public fileUploadService: KbaFileUploadService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * 担当DBプルダウンの選択肢によって顧客リストを取得しなおす
   * @param  {any}    value 選択された担当DBid
   */
  async handleSupportDistributorChange(value: string) {
    const param = {
      support_distributor_id: value,
    };
    const resource = await this.contactService.fetchCustomerBelongingToDistributor(
      ScreenCode.customerList,
      param
    );
    this.resource.customer_ids = resource.customer_ids;
  }

  /**
   * ソート項目リストを返却します。
   * @override
   * @param thList テーブル項目リスト
   * @return ソート項目リスト
   */
  sortableThLists(thList: Object[]): string[] {
    return reduce(
      thList,
      (array, th) => {
        if (th.sortable) {
          array.push(th.sortKey);
        }
        return array;
      },
      []
    );
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string) {
    this.isFetching = true;

    if (this.exists('support_distributor_id', true)) {
      const contactKinds = await this._getContactLinkKinds(
        this.searchParams.support_distributor_id
      );
      this.thList = this.contactService.formatCustomerHeader(
        contactKinds,
        this.originalThList
      );
      this.sortableThList = this.sortableThLists(this.thList);
      this.unlinkModalValues.listDesc = this.contactService.formatCustomerHeader(
        contactKinds,
        this.originalUnlinkThList
      );
    }

    if (sort_key) {
      this.requestHeaderParams['X-Sort'] = this.sortableThList.includes(
        sort_key.replace(/^-/, '')
      )
        ? sort_key
        : '';
    }
    if (this.params.customer_ids == null) {
      this._setCustomerIdParam();
    }
    const res = await this.contactService.fetchCustomerIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    this.preformattedList = res.result_data.contact_links;
    const formatted = this._formatData(this.preformattedList);
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    super.onClickSearch();
    this._setCustomerIdParam();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 変更ボタン押下時の処理
   * @param target 変更対象のオブジェクト
   */
  onClickEdit(target) {
    this.router.navigate(['contacts/customers/', target.id, 'edit'], {
      queryParams: {
        support_distributor_id: this.params.support_distributor_id,
      },
    });
  }

  /**
   * 削除ボタン押下時の処理
   * @param target 削除対象のオブジェクト
   */
  async onClickDelete(target) {
    this.valItem = this._formatLink(
      (await this.contactService.fetchCustomerIndexList(
        {
          customer_ids: [target.id],
          support_distributor_id: this.searchParams.support_distributor_id,
        },
        this.unlinkModalValues.requestHeaderParams
      )).result_data.contact_links[0]
    );

    this.modalService.open({
      title: this.labels.delete_confirm_message,
      labels: this.labels,
      content: this.unlinkModalContent,
      okBtnLabel: this.labels.btn_unlink,
      okBtnClass: 'btn-unlink',
      ok: () => this._unlinkCustomer(target.id),
    });
  }

  /**
   * アップロード終了時の処理
   * @param res レスポンス
   */
  onUploadEnd(res) {
    this._hideLoadingSpinner();

    this._updateResultModalData(res);
    this.modalService.customOpen(
      this.uploadResultModal,
      {
        close: () => this.onClickModalOk(),
      },
      {
        windowClass: 'modal-xl',
        size: 'lg',
      }
    );
  }

  /**
   * アップロード失敗時の処理
   * @param error エラー
   */
  onUploadFail(error) {
    this._hideLoadingSpinner();
  }

  /**
   * モーダルの OK ボタンクリック時の処理
   */
  onClickModalOk() {
    this.modalService.close();
    this.fetchList(this.sortingParams.sort);
  }

  /**
   * モーダルのダウンロードボタンクリック時の処理
   */
  async onClickModalDownload() {
    this._showLoadingSpinner();

    try {
      await this.api.downloadFile(
        this.resultModalData.fileId,
        KbaMimeType.excel
      );
      this.modalService.close();
    } finally {
      this._hideLoadingSpinner();
      this.fetchList(this.sortingParams.sort);
    }
  }

  /**
   * テンプレート一括DLボタン押下時の処理
   */
  async onClickDownloadTemplate() {
    this._showLoadingSpinner();

    try {
      const res = await this.contactService.createFile(
        merge({}, this.params, {
          file_create_condition: {
            processing_type: ProcessingType.sync,
            file_content_type: KbaMimeType.excel,
          },
        }),
        merge(
          {},
          this.requestHeaderParams,
          this.downloadValues.requestHeaderParams,
          {}
        )
      );

      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize() {
    const res = await this.contactService.fetchCustomerIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.originalThList = this._createThList(res.fields);
    this.originalUnlinkThList = this._createThList(res.unlinkFields);
    this.unlinkModalValues = this._getModalValues(res.unlinkFields);
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this.downloadValues = this._getModalValues(res.downloadFields);

    if (!this.exists('support_distributor_id', true)) {
      const contactLinkKinds = await this._getContactLinkKinds();

      this.thList = this.contactService.formatCustomerHeader(
        contactLinkKinds,
        this._createThList(res.fields)
      );
      this.sortableThList = this.sortableThLists(this.thList);
      this.unlinkModalValues.listDesc = this.contactService.formatCustomerHeader(
        contactLinkKinds,
        this.originalUnlinkThList
      );
    }

    this.uploadJSON = {
      file_upload_condition: {
        processing_type: ProcessingType.sync,
      },
    };
    this.isReady = true;
  }

  protected _dataKey(key: string): string {
    if (key === 'contact_links.customer_label') {
      return 'customer_name';
    } else {
      return key;
    }
  }

  /**
   * 初期検索前に処理を行う。
   */
  protected async _beforeInitFetchList(): Promise<any> {
    if (this.exists('support_distributor_id')) {
      await this.handleSupportDistributorChange(
        get(this.resource, 'support_distributor_id.values[0].value')
      );
      this.safeDetectChanges();
      this.selecteTypeComponent.refreshSelectedParam([
        this.resource.customer_ids.values[0].value,
      ]);
      this.params.customer_ids = this.exists('customer_ids', true)
        ? [this.resource.customer_ids.values[0].value]
        : [];
    }
  }

  /**
   * 連絡先紐付け情報取得 API で取得した値を見出しに合わせて整形します。
   * @param links 連絡先紐付け情報
   */
  private _formatData(links): object[] {
    return links.map(link => this._formatLink(link));
  }

  /**
   * 紐付け取得 API から取得した値を1件整形
   * @param link 連絡先紐付け情報
   */
  private _formatLink(link) {
    if (link == null) {
      return {};
    }

    let result;

    result = {
      id: link.customer_id,
      customer_name: link.customer_label,
    };

    link.customer_contact_links.forEach(
      li => (result[li.contact_kind_code] = li.contact_label)
    );
    return result;
  }

  /**
   * 紐付けアップロードのエラーをテーブルで表示できる形式に整形
   * @param errors エラーの配列
   * @param request リクエストデータ
   */
  private _formatErrorData(errors, request) {
    const link = this._formatLink(request.contact_link);
    link.errors = this._createErrorMessages(errors);

    return link;
  }

  /**
   * 顧客の選択内容を params の customer_id の項目に反映します。
   */
  private _setCustomerIdParam() {
    this.params.customer_ids = this.selecteTypeComponent
      ? this.selecteTypeComponent.getSelectedParam()
      : [];
    this.searchParams = cloneDeep(this.params);
  }

  /**
   * 連絡先紐付けを解除します。
   * @param id 顧客 ID
   */
  private _unlinkCustomer(id: number) {
    let params: ContactLinkParams = this.preformattedList.find(
      c => c.customer_id === id
    );
    params = pick(params, ['update_datetime', 'customer_contact_links']);
    params.customer_contact_links.forEach((t, i) => {
      params.customer_contact_links[i] = pick(t, ['contact_kind_code']);
      params.customer_contact_links[i].contact_id = '';
    });
    this.contactService.updateContactLink(id, params).then(res => {
      this.fetchList(this.sortingParams.sort);
      this.alertService.show(this.labels.complete_message);
    });
  }

  /**
   * 紐付けアップロード結果モーダルのデータを更新
   * @param res API のレスポンス
   */
  private _updateResultModalData(res) {
    this.resultModalData = {};
    this.resultModalData.summary = res.summary;
    this.resultModalData.fileId = res.file_id;
    this.resultModalData.lists = this._formatUploadResultData(res.responses);
    this.resultModalData.pageParams = {};
  }

  private async _getContactLinkKinds(supportDB?: string) {
    const res = await this.contactService.fetchContactLinkKinds(supportDB);

    return res.result_data.customer_contact_link_kinds;
  }

  /**
   * 紐付けアップロード結果取得 API から帰ってきたレスポンスをテーブル用に整形
   * @param res レスポンス
   */
  private _formatUploadResultData(res) {
    const contactLinks = res.map(r =>
      r.result_data
        ? this._formatLink(r.result_data.contact_link)
        : this._formatErrorData(r.error_data, r.request)
    );

    return {
      originList: contactLinks,
      visibleList: contactLinks,
    };
  }
}
