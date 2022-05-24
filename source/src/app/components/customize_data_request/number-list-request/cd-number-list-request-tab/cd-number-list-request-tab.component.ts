import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { DateFormat, DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdNumberListRequestComfirmService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-confirm/cd-request-period-comfirm.service';
import { CdNumberListRequestTabService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-tab/cd-number-list-request-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { MonthPickerService } from 'app/services/shared/month-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, TableOptions } from 'app/types/common';
import * as _ from 'lodash';
import { Moment } from 'moment';

/**
 * 送信番号一覧要求タブ
 * @author chau-phu
 */
@Component({
    selector: 'app-cd-number-list-request-tab',
    templateUrl: './cd-number-list-request-tab.component.html',
    styleUrls: ['./cd-number-list-request-tab.component.scss']
})
export class CdNumberListRequestTabComponent extends AbstractIndexComponent implements OnInit {

    @ViewChild('cdNumberListRequestComfirmModalContent', { static: false }) cdNumberListRequestComfirmModalContent: TemplateRef<null>;

    // @Input() override labels: any;
    // @Input() override resource: any;
    @Input() override lists: any;
    @Input() override params: any;
    @Input() override thList: any;
    // @Input() override sortableThList: string[] = [];

    thListModal: any = [];
    definition_ids: string[] = [];
    model_type_rev_serials: string[] = [];

    initParams = {
        "definition_id_kind": "", // 定義ID種別
        "definition_ids": this.definition_ids, // 定義ID
        "model_type_rev_serials": this.model_type_rev_serials, // 機種-型式(小変形含む)-機番
        "request_route_kind": "0", // 要求経路区分
        "datetime_from": "", // 対象期間FROM
        "datetime_to": "" // 対象期間TO
    };

    request_period_kind: string = "1";
    listSelections: any = [];
    selectedListItems: any = [];
    fields: Fields;
    initResource: any;
    data: any = [];

    // sortingParams = {
    //   sort: '',
    //   sortLabel: '',
    // };

    monthlyParams: { year_month_from: Moment; year_month_to: Moment } = {
        year_month_from: this.datePickerService.toMoment(),
        year_month_to: this.datePickerService.toMoment(),
    };
    dailyParams: { date_from: Moment; date_to: Moment } = {
        date_from: this.datePickerService.toMoment(),
        date_to: this.datePickerService.toMoment(),
    };

    beginningWday: number;
    _dateFormat: string;
    timeZone: string;
    enableDateRange: string[];
    monthPickerFromDateRange: string[];
    monthPickerToDateRange: string[];
    datePickerFromDateRange: string[];
    datePickerToDateRange: string[];
    datePickerParams: any;

    @Output() changed: EventEmitter<any> = new EventEmitter();

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        override modalService: ModalService,
        cdRef: ChangeDetectorRef,
        private cdNumberListRequestTabService: CdNumberListRequestTabService,
        private cdNumberListRequestComfirmService: CdNumberListRequestComfirmService,
        protected userSettingService: UserSettingService,
        private datePickerService: DatePickerService,
        private monthPickerService: MonthPickerService,) {
        super(nav, title, router, cdRef, header);

    }

    protected async fetchList(sort_key?: string): Promise<any> {

    }
    protected async _fetchDataForInitialize(): Promise<any> {
        const res = await this.cdNumberListRequestTabService.fetchCarInitData();
        this.initialize(res);
        this.params = _.cloneDeep(this.initParams);
        this.labels = res.label;
        this.initResource = res.resource;
        this.resource = _.cloneDeep(this.initResource);
        this._setTitle();
        this._afterInitialize();
        this._updateFields(res.fields);
        console.log("res", res);
    }

    protected async _afterInitialize(): Promise<any> {
        const datePickerConfig = this.userSettingService.getDatePickerConfig();
        this.beginningWday = datePickerConfig.first_day_of_week_kind;
        const _window = window as any;
        this.enableDateRange = _window.settings.datePickerRange.car;
        // this.enableDateRange = this.datePickerService.parseDateRange(_window.settings.datePickerRange.other);

        let dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        this.listSelections = this.request_period_kind == '1' ? this.resource.send_number_list_request_usage_definition_ids.values : this.resource.send_number_list_request_definition_ids.values;

        this.datePickerParams = {
            timeZone: this.timeZone,
            dateFormat: dateFormat,
        };
        this.datePickerService.initialize(this.datePickerParams);
        this._datePickerInitialize();
    }

    /**
     * 指定項目を更新
     * @param fields 指定項目
     */
    protected _updateFields(fields: any): void {
        this.fields = fields;
        const opt: TableOptions = {
            columnStyles: [
                'width:20%', 'width:20%', 'width:20%', 'width:20%', 'width:20%',
            ]
        };
        this.thListModal = this._createThList(fields, opt);
        this.sortableThList = this.sortableThLists(this.thListModal);
        this._reflectXFields(fields);
        console.log(this.thListModal);
    }

    placeholder: string = '';

    /**
     * デートピッカーの初期化
     */
    private async _datePickerInitialize(): Promise<any> {
        const datePickerConfig = this.userSettingService.getDatePickerConfig();
        this.beginningWday = datePickerConfig.first_day_of_week_kind;
        const _window = window as any;
        this.enableDateRange = _window.settings.datePickerRange.other;
        this._dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        this.datePickerParams = {
            timeZone: this.timeZone,
            dateFormat: this._dateFormat,
        };

        this.datePickerService.initialize(this.datePickerParams);

        const today = this.datePickerService.toMoment();

        _.set(
            this.params,
            'send_number_list_request_datetime_from',
            today.subtract(1, 'days').clone().format(DateTimeFormat.slash)
        );
        _.set(
            this.params,
            'send_number_list_request_datetime_from_formatted',
            today
                .clone().format(this.datePickerService.inputDateFormat(this._dateFormat))
        );
        _.set(this.params, 'send_number_list_request_datetime_to', today
            .add(23, 'hours')
            .add(59, 'minutes')
            .add(59, 'seconds')
            .format(DateTimeFormat.slash));
        _.set(
            this.params,
            'send_number_list_request_datetime_to_formatted',
            today.format(this.datePickerService.inputDateFormat(this._dateFormat))
        );
    }

    /**
     * 送信番号一覧要求確認 ボタン押下
     */
    openDialogNumberListRequestComfirm(): void {
        this.setData();
        console.log("params", this.params);
        this.modalService.open(
            {
                title: this.labels.confirm_title,
                labels: this.labels,
                content: this.cdNumberListRequestComfirmModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                ok: () => {
                    console.log("OK");
                    let param: any = {};
                    let definition_ids: any = [];
                    for (let item of this.selectedListItems) {
                        definition_ids.push(item.value);
                    }
                    let model_type_rev_serials: any = [];
                    for (let item of this.lists.visibleList) {
                        let model_type_rev_serial = item.car_identification.model + "-" + item.car_identification.type_rev + "-" + item.car_identification.serial;
                        model_type_rev_serials.push(model_type_rev_serial);
                    }
                    param.definition_id_kind = this.request_period_kind;
                    param.definition_ids = definition_ids;
                    param.model_type_rev_serials = model_type_rev_serials;
                    param.request_route_kind = "0";
                    param.datetime_from = this.params['send_number_list_request_datetime_from'];
                    param.datetime_to = this.params['send_number_list_request_datetime_to'];

                    console.log("param", param);

                    this.cdNumberListRequestComfirmService
                        .ok(param)
                        .then(res => {
                            console.log("RES", res);
                        });
                },
            },
            {
                size: 'lg',
            }
        );
    }

    printInfoCar(data: any): string {
        let result = data.car_identification.model + "-" + data.car_identification.type_rev + "-" + data.car_identification.serial;
        return result;
    }

    onChangeItems(): void {
        this.changed.emit();
        console.log(this.listSelections);
    }

    /**
     * 選択済みタグの x ボタン押下時の処理
     * @param id 選択済みタグに紐づけられた ID
     */
    onClickRemoveTag(value: number) {
        this.selectedListItems = this.selectedListItems.filter(
            (item: any) => item.value !== value
        );
        this.changed.emit();
    }

    setData(): void {
        this.data = [];
        for (let item of this.lists.visibleList) {
            let car: any = {};
            car["number_list_request.car.kind"] = this.request_period_kind;
            car["number_list_request.car.customize_usage_definition"] = this.selectedListItems;
            car["number_list_request.car.start_date"] = this.params['send_number_list_request_datetime_from'];
            car["number_list_request.car.end_date"] = this.params['send_number_list_request_datetime_to'];

            let model_type_rev_serial = item.car_identification.model + "-" + item.car_identification.type_rev + "-" + item.car_identification.serial;
            car["number_list_request.cars.car_identification.model_type_rev_serial"] = model_type_rev_serial;
            this.data.push(car);
        }
    }

    /**
     * ラジオボタン切り替え時にラベル・プルダウンの切り替えを行う。
     */
    changeRequestType(): void {
        this.selectedListItems = [];
        this.listSelections = this.request_period_kind == '1' ? this.resource.send_number_list_request_usage_definition_ids.values : this.resource.send_number_list_request_definition_ids.values;
    }
}
