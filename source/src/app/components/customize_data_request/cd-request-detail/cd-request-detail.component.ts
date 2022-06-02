import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdRequestDetailService } from 'app/services/customize_data_request/cd-request-detail/cd-request-detail.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields } from 'app/types/common';
import * as _ from 'lodash';

/**
 * カスタマイズデータ送信要求
 * @author chau-phu
 */
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
    initParams = {};
    _searchParams: any = {
        "car_identification": {
            "car_ids": [],
        }
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
        // this.isFetching = true;
        // const p = _.cloneDeep(this._searchParams);
        // const res = await this.cdRequestDetailService.fetchCarIndexList(
        //     p,
        // );
        // this.lists.originList = res.result_data.cars;
        // this.lists.visibleList = this.lists.originList;
        // this.isFetching = false;
        // console.log("fetchList", res);
    }
    protected async _fetchDataForInitialize(): Promise<void> {

        this.activatedRoute.queryParams.subscribe(params => {
            this._searchParams.car_identification.car_ids = params.carId;
        });

        const res = await this.cdRequestDetailService.fetchCarInitData();
        this.initialize(res);
        this.params = _.cloneDeep(this.initParams);
        this.labels = res.label;
        this.initResource = res.resource;
        this.resource = _.cloneDeep(this.initResource);
        this._setTitle();
        this._afterInitialize();
        console.log("res", res);

        this._updateFields(res.cdRequestDetailFields);
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
        protected activatedRoute: ActivatedRoute,
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
        this.fields = fields;
        this.thList = this._createThList(fields);
        // this.sortableThList = this.sortableThLists(this.thList);
        // this._reflectXFields(fields);
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
