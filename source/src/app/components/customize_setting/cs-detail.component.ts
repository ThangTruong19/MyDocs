import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
// TODO:
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, TableHeader } from 'app/types/common';
import * as _ from 'lodash';
import { AbstractIndexComponent } from '../shared/abstract-component/abstract-index.component';
import { CsNewComponent } from './new/cs-new.component';
import { CsEditComponent } from './edit/cs-edit.component';

@Component({
  selector: 'app-cs-detail',
  templateUrl: './cs-detail.component.html',
  styleUrls: ['./cs-detail.component.scss']
})
export class CsDetailComponent extends AbstractIndexComponent implements OnInit {

  @ViewChild('csNewModalContent', { static: false }) csNewModalContent: TemplateRef<null>;
  @ViewChild('csEditModalContent', { static: false }) csEditModalContent: TemplateRef<null>;
  @ViewChild('csGetRequestModalContent', { static: false }) csGetRequestModalContent: TemplateRef<null>;
  @ViewChild(CsNewComponent) newChildComponent: CsNewComponent;
  @ViewChild(CsEditComponent) editChildComponent: CsEditComponent;

  fields: Fields;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  _searchParams: any;
  usageDefinitionName: string = "Definition Name 01";

  data = {
    resource: {},
    dataTable: {}
  };

  inputParams = {
    regist_customize_usage_definition_version: '',
    edit_start_date_ymd: '',
    edit_end_date_ymd: '',
    regist_active_name: '',
    regist_priority_name: '',
    regist_customize_usage_definition_name: '',
    regist_customize_usage_definition_id: ''
  };
  responseData: any;

  versionInput: string = 'Ver.1';
  startDateInput: string;
  endDateInput: string;
  enabledInput: string = '有効';
  priorityInput: string = '高';

  requestParams = {
    "cars": [
      {
        "car_id": "",
        "request_route_kind": "0"
      }
    ]
  };

  customizeThLists: TableHeader[];

  id: string;
  model: string;
  typeRev: string;
  serial: string;

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    private activatedRoute: ActivatedRoute,
    private modal: ModalService,
    private cdRef: ChangeDetectorRef,
    private customSettingService: CustomizeSettingService,
    private csDetailService: CsDetailService,
    protected userSettingService: UserSettingService,
    protected datePickerService: DatePickerService,) {
    super(nav, title, router, cdRef, header, modal);
  }

  async fetchList(sort_key?: string): Promise<any> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const res = await this.customSettingService.fetchCustomizeDefinitionDetails(
      this._searchParams,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.customize_usage_definitions, this.thList);
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
  }

  protected async _fetchDataForInitialize(): Promise<any> {
    const res = await this.customSettingService.fetchCustomizeInitData();
    this.initialize(res);
    this.data["resource"] = res;
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._updateFields(res.fields);
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields: Fields) {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    const thLists = this._createThList(fields, { scrollable: true });
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
  }

  // /**
  //  * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
  //  * @param sort_key ソートキー
  //  */
  // async fetchList(sort_key?: string): Promise<void> {
  //   this.isFetching = true;
  //   this.requestHeaderParams['X-Sort'] = sort_key || '';
  //   const res = await this.csDetailService.fetchIndexList(
  //     this.id,
  //     this.requestHeaderParams
  //   );
  //   const list = this._formatList(
  //     res.result_data.customize_usage_definitions,
  //     this.thList
  //   );
  //   this._fillLists(res.result_header, list);
  //   this.isFetching = false;
  //   this._afterFetchList();
  // }

  // /**
  //  * 初期化 API を呼ぶ
  //  */
  // protected async _fetchDataForInitialize(): Promise<void> {
  //   // TODO:
  //   // this.activatedRoute.params.subscribe(params => (this.id = params.id));
  //   // this.activatedRoute.params.subscribe(params => (this.model = params.model));
  //   // this.activatedRoute.params.subscribe(params => (this.typeRev = params.typeRev));
  //   // this.activatedRoute.params.subscribe(params => (this.serial = params.serial));
  //   this.id = "id";
  //   this.model = "機種";
  //   this.typeRev = "型式";
  //   this.serial = "機番";
  //   const res: any = await this.csDetailService.fetchIndexInitData();
  //   this.initialize(res);
  //   this.data["resource"] = res;
  //   this.labels = res.label;
  //   this.resource = res.resource;
  //   this._setTitle();
  //   this._updateFields(res.fields);
  // }

  // /**
  //  * 指定項目を更新
  //  * @param fields 指定項目
  //  */
  // protected _updateFields(fields: any): void {
  //   this.fields = fields;
  //   this.thList = this._createThList(fields);
  //   this.sortableThList = this.sortableThLists(this.thList);
  //   this._reflectXFields(fields);
  // }

  openNewDialog() {
    this.modalService.open(
      {
        title: this.labels.addition_title,
        labels: this.labels,
        content: this.csNewModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // TODO
          let customizeDefinitionVersion: any = this.newChildComponent.customizeDefinitionVersion as any;
          let isEnabled: any = this.newChildComponent.isEnabled as any;
          let priority: any = this.newChildComponent.priority as any;
          let responseData = {
            definition_version: (customizeDefinitionVersion.items as any[])
              .filter(i => i.id == customizeDefinitionVersion.itemParams.regist_customize_usage_definition_version)[0].name,
            enabled: (isEnabled.items as any[]).filter(i => i.id == isEnabled.itemParams.regist_active_name)[0].name,
            priority: (priority.items as any[]).filter(i => i.id == priority.itemParams.regist_priority_name)[0].name
          }
          this.responseData = JSON.stringify(responseData);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  openEditDialog() {
    // Setting input params before calling Modal - TODO
    this.inputParams.regist_customize_usage_definition_version = (this.resource.regist_customize_usage_definition_version.values as any[]).filter(element => element.name == this.versionInput)[0].value;
    this.inputParams.edit_start_date_ymd = this.startDateInput;
    this.inputParams.edit_end_date_ymd = this.endDateInput;
    this.inputParams.regist_active_name = (this.resource.regist_active_name.values as any[]).filter(element => element.name == this.enabledInput)[0].value;
    this.inputParams.regist_priority_name = (this.resource.regist_priority_name.values as any[]).filter(element => element.name == this.priorityInput)[0].value;
    this.inputParams.regist_customize_usage_definition_name = this.usageDefinitionName;
    this.inputParams.regist_customize_usage_definition_id = "1";

    this.modalService.open(
      {
        title: this.labels.edit_title,
        labels: this.labels,
        content: this.csEditModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // TODO
          let customizeDefinitionVersion: any = this.editChildComponent.customizeDefinitionVersion as any;
          let requetType: any = this.editChildComponent.requestType as any;
          let isEnabled: any = this.editChildComponent.isEnabled as any;
          let priority: any = this.editChildComponent.priority as any;
          let responseData = {
            definition_version: (customizeDefinitionVersion.items as any[])
              .filter(i => i.id == customizeDefinitionVersion.itemParams.regist_customize_usage_definition_version)[0].name,
            requetType: (requetType.items as any[]).filter(i => i.id == requetType.itemParams.edit_customize_edit_kind)[0].name,
            enabled: (isEnabled.items as any[]).filter(i => i.id == isEnabled.itemParams.regist_active_name)[0].name,
            priority: (priority.items as any[]).filter(i => i.id == priority.itemParams.regist_priority_name)[0].name
          }
          this.responseData = JSON.stringify(responseData);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  openGetRequestDialog() {
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csGetRequestModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // TODO getting carId from the screen
          this.requestParams.cars[0].car_id = "2";
          this.customSettingService.postCustomUsageDefinitionRequest(this.requestParams)
            .then(res => {
              console.log("RES", res);
            })
        },
      },
      {
        size: 'lg',
      }
    );
  }
}
