import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { SelectTypeComponent } from 'app/components/shared/select-type/select-type.component';
import { DateFormat, DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdRequestPeriodTabService } from 'app/services/customize_data_request/request-period/cd-request-period-tab/cd-request-period-tab.service';
import { CdRequestPeriodComfirmService } from 'app/services/customize_data_request/request-period/request-period-comfirm/cd-request-period-comfirm.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { MonthPickerService } from 'app/services/shared/month-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, TableOptions } from 'app/types/common';
import * as _ from 'lodash';
import { Moment } from 'moment';

/**
 * 送信要求（期間単位）タブ
 */
@Component({
    selector: 'app-cd-request-period-tab',
    templateUrl: './cd-request-period-tab.component.html',
    styleUrls: ['./cd-request-period-tab.component.scss']
})
export class CdRequestPeriodTabComponent extends AbstractIndexComponent implements OnInit {

    @ViewChild('cdRequestPeriodComfirmModalContent', { static: false }) cdRequestPeriodComfirmModalContent: TemplateRef<null>;
    @ViewChild('cdCurrentRequestComfirmModalContent', { static: false }) cdCurrentRequestComfirmModalContent: TemplateRef<null>;
    @ViewChild('cdExpectedTrafficConfirmModalContent', { static: false }) cdExpectedTrafficConfirmModalContent: TemplateRef<null>;
    @ViewChild('cdRequestNumberComfirmModalContent', { static: false }) cdRequestNumberComfirmModalContent: TemplateRef<null>;

    @ViewChild('requestMumberDefinitionIdKind', { static: false }) requestMumberDefinitionIdKind: SelectTypeComponent;
    @ViewChild('fromToDatePicker') fromToDatePicker: ElementRef;
    modalResource: any;

    @Input() override params: any;
    @Input() override thList: any;
    @Input() carIds: any;

    thListModal: any = [];
    definition_ids: string[] = [];
    model_type_rev_serials: string[] = [];

    initParams = {
        "definition_id_kind": "", // 定義ID種別
        "definition_ids": this.definition_ids, // 定義ID
        "model_type_rev_serials": this.model_type_rev_serials, // 機種-型式(小変形含む)-機番
        "request_route_kind": "0", // 要求経路区分
        "datetime_from": "", // 対象期間FROM
        "datetime_to": "", // 対象期間TO
        "data_amount_upper_limit": "" //車両毎データ量上限（単位：KB）
    };

    _searchParams: any = {
        "car_identification": {
            "car_ids": [],
        }
    };

    request_period_kind: string = "1";
    data_amount_upper_limit_active_kind: string = "1";
    listSelections: any = [];
    selectedListItems: any = [];
    fields: Fields;
    initResource: any;
    data: any = [];
    thListCustomizeDataRequest: any = [];
    thListCurrentRequestComfirm: any = [];

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
        private cdRequestPeriodTabService: CdRequestPeriodTabService,
        private cdRequestPeriodComfirmService: CdRequestPeriodComfirmService,
        protected userSettingService: UserSettingService,
        private datePickerService: DatePickerService,
        private monthPickerService: MonthPickerService,) {
        super(nav, title, router, cdRef, header);
    }

    protected async fetchList(sort_key?: string): Promise<any> {
        this.isFetching = true;
        this._searchParams.car_identification.car_ids = this.carIds;
        console.log("CAR_IDS: ", this._searchParams.car_identification.car_ids);
        this.requestHeaderParams['X-Sort'] = sort_key || '';
        const p = _.cloneDeep(this._searchParams);
        const res = await this.cdRequestPeriodTabService.fetchCarIndexList(
            p,
            this.requestHeaderParams
        );

        console.log("fetchList: res", res);

        let data: any = [];
        res.result_data.cars.forEach((element: any) => {
            console.log(element);
            let car: any = {};
            car["request_number.cars.car_identification.model_type_rev_serial"] = element.car_identification.model + "-" + element.car_identification.type_rev + "-" + element.car_identification.serial;
            data.push(car);
        });

        this._fillLists(res.result_header, data);
        this.lists.originList = data;
        this.lists.visibleList = data;
        this.isFetching = false;
        this._afterFetchList();


        console.log("app-cd-request-number-tab:initList", this.lists);

    }
    protected async _fetchDataForInitialize(): Promise<any> {
        const res = await this.cdRequestPeriodTabService.fetchCarInitData();
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

        let dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        this.listSelections = this.request_period_kind == '1' ? this.resource.request_number_usage_definition_ids.values : this.resource.request_number_definition_ids.values;

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
        this.thListModal = this._createThList(fields);
        this.sortableThList = this.sortableThLists(this.thListModal);
        this._reflectXFields(fields);
        console.log("cd-request-period-tab:thListModal", this.thListModal);

        if (this.thList) {
            for (let i = 0; i < this.thList.length; i++) {
                if (this.thList[i].name == "request_number.cars.customize_usage_definitions.name") {
                    this.thList[i].displayable = false;
                    break;
                }
            }
        }

        console.log("cd-request-period-tab:lists", this.lists);
        console.log("cd-request-period-tab:thList", this.thList);
    }

    placeholder: string = '';

    onChangeItems(): void {
        this.changed.emit();
        console.log(this.listSelections);
    }

    /**
     * 日付選択時コールバック
     * @param day 選択済日付
     */
    onSelectDate(day: Moment) {
        console.log(day);
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

    /**
     * データ送信要求 ボタン押下
     */
    sendData(): void {

        this.setData();
        console.log("data", this.data);

        this.thListCustomizeDataRequest = [];
        const opt: TableOptions = {
            columnStyles: [
                'width:17%', 'width:13%', 'width:13%'
                , 'width:11%', 'width:16%', 'width:16%'
                , 'width:16%'
            ]
        };
        let thList = this._createThList(this.fields, opt);
        console.log("this.thListCustomizeDataRequest", thList);

        for (let i = 0; i < thList.length - 3; i++) {
            this.thListCustomizeDataRequest.push(thList[i]);
        }

        this.modalService.open(
            {
                title: this.labels.confirm_title,
                labels: this.labels,
                content: this.cdRequestPeriodComfirmModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                ok: () => {
                    console.log("OK");
                    this.resetParam();
                    let definition_ids: any = [];
                    for (let item of this.selectedListItems) {
                        definition_ids.push(item.value);
                    }
                    let model_type_rev_serials: any = [];
                    for (let item of this.lists.visibleList) {
                        let model_type_rev_serial = item.car_identification.model + "-" + item.car_identification.type_rev + "-" + item.car_identification.serial;
                        model_type_rev_serials.push(model_type_rev_serial);
                    }
                    this.initParams.definition_id_kind = this.request_period_kind;
                    this.initParams.definition_ids = definition_ids;
                    this.initParams.model_type_rev_serials = model_type_rev_serials;
                    this.initParams.datetime_from = this.params['request_number_datetime_from'];
                    this.initParams.datetime_to = this.params['request_number_datetime_to'];
                    this.initParams.data_amount_upper_limit = this.params['car_data_amount_upper_limit'];

                    console.log("this.params", this.initParams);

                    this.cdRequestPeriodComfirmService
                        .ok(this.initParams)
                        .then(res => {
                            console.log("RES", res);
                        });
                },
            },
            {
                size: 'xl',
            }
        );
    }

    /**
     * 現在カスタマイズ送信要求確認 ボタン押下
     */
    sendAppConfirm(): void {
        this.setDataCurrent();
        const opt: TableOptions = {
            columnStyles: [
                'width:35%', 'width:30%', 'width:35%'
            ]
        };
        let fields: any = [];
        for (let i = 7; i < this.fields.length; i++) {
            fields.push(this.fields[i]);
        }
        let thList = this._createThList(fields, opt);
        console.log("this.thListCustomizeDataRequest", thList);

        this.thListCurrentRequestComfirm = [];
        for (let i = 0; i < thList.length; i++) {
            this.thListCurrentRequestComfirm.push(thList[i]);
        }

        this.modalService.open(
            {
                title: this.labels.confirm_title,
                labels: this.labels,
                content: this.cdCurrentRequestComfirmModalContent,
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

                    console.log("param", param);

                    this.cdRequestPeriodComfirmService
                        .ok(param)
                        .then(res => {
                            console.log("RES", res);
                        });
                },
            },
            {
                size: 'sm',
            }
        );
    }

    /**
     * 日付の文字列を取得
     * @param date 日付
     */
    getDateString(date: Moment) {
        console.log("getDateString", this.datePickerService.getInputText(
            date,
            this.datePickerService.inputDateFormat(this._dateFormat)
        ));
        return this.datePickerService.getInputText(
            date,
            this.datePickerService.inputDateFormat(this._dateFormat)
        );
    }

    /**
     * デートピッカー選択時のコールバック
     * @param path パス
     * @param date 選択された日
     */
    handleSelectDate(path: string, date: Moment) {
        console.log("date", date);
    }

    /**
     * 本日ボタンの活性・非活性を制御する
     * from の日付が to より未来を選択することを防止
     */
    toggleTodayButton(): boolean {
        return !this.datePickerService.isToday(this.dailyParams.date_to);
    }

    /**
     * 初期表示時の年月を取得する
     */
    private _getInitialYearMonth() {
        return {
            year_month_from: this.datePickerService
                .toMoment()
                .set({ date: 1 })
                .subtract(1, 'year'),
            year_month_to: this.datePickerService
                .toMoment()
                .set({ date: 1 })
                .subtract(1, 'month'),
        };
    }

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
            'request_number_datetime_from',
            today
                .subtract(1, 'days').clone().format(DateTimeFormat.slash)
        );
        _.set(
            this.params,
            'request_number_datetime_from_formatted',
            today
                .clone().format(this.datePickerService.inputDateFormat(this._dateFormat))
        );
        _.set(this.params, 'request_number_datetime_to', today
            .add(23, 'hours')
            .add(59, 'minutes')
            .add(59, 'seconds')
            .format(DateTimeFormat.slash));
        _.set(
            this.params,
            'request_number_datetime_to_formatted',
            today
                .format(this.datePickerService.inputDateFormat(this._dateFormat))
        );
    }

    expectedTrafficConfirm(): void {
        this.modalService.open(
            {
                title: this.labels.expected_traffic_confirm_title,
                labels: this.labels,
                content: this.cdExpectedTrafficConfirmModalContent,
                closeBtnLabel: this.labels.close
            },
            {
                size: 'lg',
            }
        );
    }

    testRowspan(): void {
        this.modalService.open(
            {
                title: this.labels.confirm_title,
                labels: this.labels,
                content: this.cdRequestNumberComfirmModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                ok: () => {
                    console.log("OK");
                },
            },
            {
                size: 'lg',
            }
        );
    }

    /**
     * 要求種別変更時コールバック
     */
    onChangeRequestNumber(): void {
        const params = this.requestMumberDefinitionIdKind.getSelectedParam();
        console.log("params", params);
    }

    /**
     * 機種"-"型式(小変形含む)"-"機番を表示
     * @param data
     * @returns string
     */
    printInfoCar(data: any): string {
        // let result = data.car_identification.model + "-" + data.car_identification.type_rev + "-" + data.car_identification.serial;
        let result = "";
        console.log("data", data);
        return result;
    }

    changeLimitActiveKind(data: any): void {
        this.data_amount_upper_limit_active_kind = data;
    }

    setData(): void {
        this.data = [];
        for (let item of this.lists.visibleList) {
            let car: any = {};
            car["request_period.car.kind"] = this.request_period_kind;
            car["request_period.car.customize_usage_definition"] = this.selectedListItems;
            car["request_period.car.start_date"] = this.params['request_number_datetime_from'];
            car["request_period.car.end_date"] = this.params['request_number_datetime_to'];
            car["request_period.car.data_amount_upper_limit_active_kind"] = this.data_amount_upper_limit_active_kind;
            car["request_period.car.data_amount_upper_limit"] = this.params['car_data_amount_upper_limit'];
            let model_type_rev_serial = item.car_identification.model + "-" + item.car_identification.type_rev + "-" + item.car_identification.serial;
            car["request_number.cars.car_identification.model_type_rev_serial"] = model_type_rev_serial;
            this.data.push(car);
        }
    }

    setDataCurrent(): void {
        this.data = [];
        for (let item of this.lists.visibleList) {
            let car: any = {};
            car["current_customize_request.car.kind"] = this.request_period_kind;
            car["current_customize_request.car.customize_usage_definition"] = this.selectedListItems;
            let model_type_rev_serial = item.car_identification.model + "-" + item.car_identification.type_rev + "-" + item.car_identification.serial;
            car["current_customize_request.car.id"] = model_type_rev_serial;
            this.data.push(car);
        }
    }

    /**
     * ラジオボタン切り替え時にラベル・プルダウンの切り替えを行う。
     */
    changeRequestType(): void {
        this.selectedListItems = [];
        this.listSelections = this.request_period_kind == '1' ? this.resource.request_number_usage_definition_ids.values : this.resource.request_number_definition_ids.values;
    }

    resetParam(): void {
        this.initParams.definition_id_kind = "";
        this.initParams.definition_ids = [];
        this.initParams.model_type_rev_serials = [];
        this.initParams.request_route_kind = "0";
        this.initParams.datetime_from = "";
        this.initParams.datetime_to = "";
        this.initParams.data_amount_upper_limit = "";
    }
}
