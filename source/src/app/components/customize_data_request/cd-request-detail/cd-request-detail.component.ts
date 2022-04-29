import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdRequestDetailService } from 'app/services/customize_data_request/cd-request-detail/cd-request-detail.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields } from 'app/types/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-cd-request-detail',
  templateUrl: './cd-request-detail.component.html',
  styleUrls: ['./cd-request-detail.component.scss']
})

export class CdRequestDetailComponent extends AbstractIndexComponent implements OnInit {

  @Input() listCars: { visibleList: any; originList: any } = {
    visibleList: {},
    originList: {}
  };

  initResource: any;
  initParams = {
    common: {
      customer_attribute: {
        customer_management_no: '',
        customer_car_no: '',
      },
      car_identification: {
        models: '',
        type_revs: '',
        model_type_revs: '',
        serials: '',
      },
      support_distributor: {},
      service_distributor: {},
      distributor_attribute: {
        note_1: '',
        note_2: '',
        note_3: '',
        note_4: '',
        note_5: '',
      },
    },
    car_management: {
      time_difference: '',
    },
  };
  _searchParams: any = {
    "car_id": 1
  };
  listSelections: any = [];

  fields: Fields;

  beginningWday: number;
  timeZone: string;
  enableDateRange: string[];
  monthPickerFromDateRange: string[];
  monthPickerToDateRange: string[];
  datePickerFromDateRange: string[];
  datePickerToDateRange: string[];
  datePickerParams: any;

  async fetchList(sort_key?: string): Promise<any> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const p = _.cloneDeep(this._searchParams);
    const res = await this.cdRequestDetailService.fetchCarIndexList(
      p,
      this.requestHeaderParams
    );
    console.log("fetchList", res);
  }
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.cdRequestDetailService.fetchCarInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.initResource = res.resource;
    this.resource = _.cloneDeep(this.initResource);
    this._setTitle();
    this._afterInitialize();
    console.log("res", res);
    console.log(JSON.stringify(res));
    console.log("lists", this.lists);

    this._updateFields(res.fields);
  }
  protected async _afterInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.car;
    let dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.listSelections = this.resource.request_number_definition_ids.values;
    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: dateFormat,
    };
    this.datePickerService.initialize(this.datePickerParams);

    // TODO
    // this.listCars.originList = [{
    //   'cars.car_identification': 'PC200-8-1234',
    // }, {
    //   'cars.car_identification': 'PC200-8-1111',
    // }];

    this.listCars.originList = [
      {
        "cars.car_identification": {
          "id": "1",
          "model": "D85PX",
          "type_rev": "15E0",
          "serial": "A12345",
          "division_code": "0001"
        },
        "communication_channel": {
          "id": "1",
          "code": "0",
          "name": "ORBCOMM"
        },
        "terminal_mode": {
          "kind": "1",
          "name": "次世代"
        },
        "customer": {
          "id": "12345",
          "label": "顧客A",
          "label_english": "Customer A"
        },
        "support_distributor": {
          "id": "401",
          "label": "コマツ東京C",
          "label_english": "KOMATSU Tokyo C"
        },
        "customize_usage_definitions": [
          {
            "id": "1234567",
            "name": "カスタマイズ定義A",
            "version": "1.00",
            "setting_change_status": "1",
            "setting_change_status_name": "設定中",
            "customize_definitions": [
              {
                "id": "1234567",
                "name": "カスタマイズ定義A",
                "version": "1.00",
                "access_level": {
                  "id": "1",
                  "code": "0",
                  "name": "開発者"
                }
              }
            ]
          }
        ]
      }
    ];
    this.thList = [
      {
        label: '車両情報',
        name: 'cars.car_identification',
        displayable: true,
      }
    ];

    this.listCars.visibleList = this.getVisibleList(this.listCars.originList);

    this.lists = this.listCars;
  }

  activeTab: number = 0;

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    private cdRef: ChangeDetectorRef,
    private cdRequestDetailService: CdRequestDetailService,
    protected userSettingService: UserSettingService,
    protected datePickerService: DatePickerService,) {
    super(nav, title, router, cdRef, header);

  }

  changeTab(index: number) {
    this.activeTab = index;
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: any): void {
    // this.fields = fields;
    // this.thList = this._createThList(fields);
    // this.sortableThList = this.sortableThLists(this.thList);
    // this._reflectXFields(fields);
    // console.log("cd-request-detail: thList", this.thList);
  }

  getVisibleList(originList: any): any {
    let result: any = [];
    if (originList.length > 0) {
      for (var carItem of originList) {
        let item: any = carItem;
        item["cars.car_identification"].name = carItem["cars.car_identification"].model + '-' + carItem["cars.car_identification"].serial + '-' + carItem["cars.car_identification"].type_rev;
        result.push(item);
      }
    }
    return result;
  }

}
