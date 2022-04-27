import * as _ from 'lodash';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { CustomSelectItem } from '../../../../constants/form';
import { FilterReservedWord } from '../../../../constants/condition';

import { ModalValues } from '../../../../types/common';
import {
  CarIdSearchParams,
  ApplyRegistParams,
} from '../../../../types/flm/service-contract';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ServiceContractService } from '../../../../services/flm/service-contract/service-contract.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-change-service-distributor',
  templateUrl: './change-service-distributor.component.html',
  styleUrls: ['./change-service-distributor.component.scss'],
})
export class ChangeServiceDistributorComponent extends KbaAbstractIndexComponent {
  @ViewChild('applyModalContent', { static: false })
  applyModalContent: TemplateRef<null>;
  @ViewChild('allEditSelect', { static: false })
  allEditSelect: KbaSelectedComponent;
  @ViewChildren('serviceDBSelect') serviceDBSelections: QueryList<
    KbaSelectedComponent
  >;

  @Input() selectedCarIds: string[];
  @Input() labels;
  @Input() resource;
  @Input() functions;
  @Input() applyFields;
  @Input() applyConfirmFields;
  @Input() sortKey;
  @Output() return = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  xFields: string[];
  editParams: ApplyRegistParams;
  originalEditParams: ApplyRegistParams;
  applicantParams = {
    service_contract_requests: {
      applicant_label: '',
      applicant_email: '',
    },
  };
  applicantHeader: {
    label: string;
    name: string;
    displayable: boolean;
  }[];
  applicantHeaderPaths = [
    'service_contract_requests.applicant_label',
    'service_contract_requests.applicant_email',
  ];
  applyModalValues: ModalValues;
  isEditReady = false;
  serviceDBForm = new FormGroup({});
  handleScroll: () => void;

  get isEditValid() {
    return (
      this.editParams &&
      this.originalEditParams &&
      this.editParams.service_contract_requests.every(
        (r, i) =>
          r.service_distributor_id !==
          this.originalEditParams.service_contract_requests[i]
            .service_distributor_id &&
          r.service_distributor_id !==
          this.originalEditParams.service_contract_requests[i]
            .support_distributor_id
      )
    );
  }

  constructor(
    router: Router,
    ref: ChangeDetectorRef,
    modalService: KbaModalService,
    header: CommonHeaderService,
    private serviceContractService: ServiceContractService,
    private alertService: KbaAlertService
  ) {
    super(null, null, router, ref, header, modalService);
    this.handleScroll = _.throttle(() => {
      this.kbaSelectBoxes.forEach(kbaSelect => kbaSelect.select.close());
    }, 200);
  }

  /**
   * 申請ボタン押下時コールバック
   */
  async onClickApply() {
    const requestHeaderParams = {
      ...this.applyModalValues.requestHeaderParams,
      'X-Sort': this.requestHeaderParams['X-Sort'],
    };
    const carList = await this.serviceContractService.fetchApplyIndexList(
      this._carIdsParams(this.selectedCarIds),
      requestHeaderParams
    );

    this._openApplyModal(carList, (resolve) => {
      this._showLoadingSpinner();
      const applyParams = _.cloneDeep(this.editParams);
      if (applyParams.service_contract_requests) {
        applyParams.service_contract_requests.forEach(
          (r) =>
            r.support_distributor_id = undefined
        );
      }
      return this.serviceContractService
        .applyConsignor(applyParams)
        .then(res => resolve(res));
    }).then(async res => {
      this._hideLoadingSpinner();
      this._openResultModal(res);
    });
  }

  /**
   * 戻るボタン押下時コールバック
   */
  onClickBack(): void {
    this.allEditSelect.reset();
    this.return.emit();
  }

  /**
   * 担当DB一括設定選択時の処理
   * @param id 選択項目のID
   */
  onSelectServiceIDAllEdit(id: string): void {
    if (!this.isEditReady || id === CustomSelectItem.empty.id) {
      return;
    }

    this.editParams.service_contract_requests.forEach(
      r => (r.service_distributor_id = id)
    );
    this.serviceDBSelections.forEach(select => {
      select.refresh();
    });
  }

  /**
   * 担当DB（英語）のラベルを変更する
   * @param data 対象データ
   * @param id 担当DB ID
   */
  refreshEnglishLabel(data, id: string): void {
    _.set(
      data,
      'cars.service_distributor.label_english',
      this._getResourceValueName(
        'service_contract_requests.service_distributor_id_english',
        id
      )
    );
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || this.sortKey;
    const res = await this.serviceContractService.fetchApplyIndexList(
      this._carIdsParams(this.selectedCarIds),
      this.requestHeaderParams
    );
    this._fillLists(
      res.result_header,
      this._formatList(res.result_data.cars, this.thList)
    );
    this.lists.visibleList = this.lists.originList;
    this.editParams = this._createEditParams(res.result_data.cars);
    this.originalEditParams = _.cloneDeep(this.editParams);
    this.safeDetectChanges();
    this.isEditReady = true;
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * サービスDBセレクトボックスが担当DBと
   * 一致しているかどうかを判定する
   * @param idx 添え字
   * @return true: 一致 / false: 不一致
   */
   isSupportDBSelectNotEdit(idx: number): boolean {
    return (
      ((!this.originalEditParams.service_contract_requests[idx]
        .support_distributor_id) &&
        this.editParams.service_contract_requests[idx]
          .service_distributor_id === FilterReservedWord.isNull) ||
      this.editParams.service_contract_requests[idx].service_distributor_id ===
        this.originalEditParams.service_contract_requests[idx]
          .support_distributor_id
    );
  }

  /**
   * サービスDBセレクトボックスが初期状態から
   * 変更されていないかどうかを返却する
   * @param idx 添え字
   * @return true: 未変更 / false: 変更済
   */
  isServiceDBSelectNotEdit(idx: number): boolean {
    return (
      (!this.originalEditParams.service_contract_requests[idx]
        .service_distributor_id &&
        this.editParams.service_contract_requests[idx]
          .service_distributor_id === FilterReservedWord.isNull) ||
      this.editParams.service_contract_requests[idx].service_distributor_id ===
        this.originalEditParams.service_contract_requests[idx]
          .service_distributor_id
    );
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    this.xFields = this._createXFields(this.applyFields);
    this._setXFields(this.xFields);
    this.thList = this._createThList(this.applyFields);
    this.applyModalValues = this._getModalValues(
      this.applyConfirmFields,
      this.selectedCarIds.length
    );
  }

  /**
   * 申請モーダルを開く
   * @param carList 車両情報リスト
   */
  private _openApplyModal(carList, onClickOk): Promise<any> {
    this.applyModalValues.listVal = this._formatList(
      carList.result_data.cars,
      this.applyModalValues.listDesc
    );

    // 編集内容で上書き
    this.applyModalValues.listVal.forEach((car, index) => {
      _.set(
        car,
        'cars.service_distributor.label',
        this._getResourceValueName(
          'service_contract_requests.service_distributor_id',
          _.get(
            this.editParams.service_contract_requests[index],
            'service_distributor_id'
          )
        )
      );
      _.set(
        car,
        'cars.service_contract_request.free_memo',
        _.get(this.editParams.service_contract_requests[index], 'free_memo')
      );
    });

    this.applicantHeader = this._createApplicantHeader();

    this._reflectEditParams();

    return new Promise(resolve => {
      this.modalService.open(
        {
          title: this.labels.apply_modal_title,
          labels: this.labels,
          content: this.applyModalContent,
          closeBtnLabel: this.labels.cancel,
          ok: () => onClickOk(resolve),
        },
        { size: 'lg' }
      );
    });
  }

  /**
   * 申請結果モーダルを開く
   * @param res レスポンス
   */
  private _openResultModal(res): void {
    this._resultModalOpen(
      this.labels.apply_result_label,
      this.applyModalValues.listDesc,
      this.applyModalValues.listVal,
      res['responses'],
      () => {
        this.allEditSelect.reset();
        this.submit.emit();
      },
      { size: 'lg' }
    );
  }

  /**
   * 車両一覧取得パラメータの作成
   * @param carIds 車両ID
   */
  private _carIdsParams(carIds: string[]): CarIdSearchParams {
    return { common: { car_identification: { car_ids: carIds } } };
  }

  /**
   * 担当代理店変更申請登録APIパラメータの作成
   * @param cars 車両情報
   */
  private _createEditParams(cars): ApplyRegistParams {
    return {
      service_contract_requests: _.map(cars, car => ({
        car: {
          car_identification: {
            id: _.get(car, 'car_identification.id'),
            update_datetime: _.get(car, 'car_identification.update_datetime'),
          },
        },
        service_distributor_id: _.get(car, 'service_distributor.id'),
        support_distributor_id: _.get(car, 'support_distributor.id'),
        applicant_label: '',
        applicant_email: '',
        free_memo: _.get(car, 'service_contract_request.free_memo'),
      })),
    };
  }

  /**
   * 申請モーダルの申請者情報ヘッダを作成する
   */
  private _createApplicantHeader() {
    let displayable;
    return this.applicantHeaderPaths.map(path => {
      displayable = this.exists(path);
      return {
        label: _.get(this.resource, path + '.name'),
        name: path,
        displayable,
      };
    });
  }

  /**
   * パラメタに画面からの入力情報を反映させる
   */
  private _reflectEditParams(): void {
    this.editParams.service_contract_requests.forEach(r => {
      r.applicant_email = this.applicantParams.service_contract_requests.applicant_email;
      r.applicant_label = this.applicantParams.service_contract_requests.applicant_label;
    });
  }
}
