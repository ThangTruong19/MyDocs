import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdRequestNumberListService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-list.service';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import * as _ from 'lodash';
import {
    CarCustomizedDefinitionResponseData,
    CarCustomizeDataPerformances,
    CustomizedDataAchievementDetails
} from 'app/types/customize-request-number-list'

/**
 * 画面名: 送信番号一覧
 * ソースファイル名: cd-request-number-list
 */
@Component({
    selector: 'app-cd-request-number-list',
    templateUrl: './cd-request-number-list.component.html',
    styleUrls: ['./cd-request-number-list.component.scss']
})
export class CdRequestNumberListComponent extends AbstractIndexComponent implements OnInit {

    @Input()
    public resources: any;
    @Input()
    public carId: string;

    beginningWday: number;
    _dateFormat: string;
    timeZone: string;
    enableDateRange: string[];
    datePickerParams: any;

    _searchParams = {
        car_id: "",
        customize_definition_id: "",
        datetime_from: "",
        datetime_to: "",
        status: ""
    };
    apiData: any[];

    customize_definition_id: number;
    customize_definition_name: string;
    assumption_data_value: number;
    selectedItems: { [key: string]: boolean } = {};
    checkAll = false;

    responseData: CarCustomizedDefinitionResponseData;
    dataPerformances: CarCustomizeDataPerformances[] = [];

    private arrayColumnPaths: string[] = [
        'request_number.car_customized_definition.car_customize_data_performances.customized_data_achievement_details.car_data_creation_time',
        'request_number.car_customized_definition.car_customize_data_performances.customized_data_achievement_details.server_registration_time',
    ];

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        private modal: ModalService,
        private cdRef: ChangeDetectorRef,
        private cdRequestNumberTabService: CdRequestNumberTabService,
        private cdRequestNumberListService: CdRequestNumberListService,
        protected userSettingService: UserSettingService,
        private datePickerService: DatePickerService) {
        super(nav, title, router, cdRef, header, modal);
        this.shouldDestroyNavigation = false;
    }

    /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
    protected async fetchList(sortKey?: string): Promise<any> {
        this._refreshDataTable();
    }

    /**
   * 初期化 API を呼ぶ
   */
    protected async _fetchDataForInitialize(): Promise<any> {
        this.labels = this.resources.label;
        this.resource = this.resources.resource;
        this.initialize(this.resources);
        this.thList = this._createThList(this.resources.cdRequestNumberListFields);
        this._afterInitialize();
    }

    /**
     * 検索ボタン押下
     * @description 入力した検索条件で検索結果一覧テーブルを表示する
     */
    public override onClickSearch(): void {
        this.deselectAll();
        this._refreshDataTable();
    }

    /**
     * 対象列が配列形式かどうかを判断する。
     * @param pathName 対象列のパス名
     * @returns true：配列、false：配列ではない。
     */
    public isArrayColumnData(pathName: string): boolean {
        return this.arrayColumnPaths.indexOf(pathName) !== -1
    }

    /**
     * デートピッカーを初期化する
     */
    protected async _afterInitialize(): Promise<any> {
        const datePickerConfig = this.userSettingService.getDatePickerConfig();
        this.beginningWday = datePickerConfig.first_day_of_week_kind;
        const _window = window as any;
        this.enableDateRange = _window.settings.datePickerRange.car;

        let dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        this.datePickerParams = {
            timeZone: this.timeZone,
            dateFormat: dateFormat,
        };
        this.datePickerService.initialize(this.datePickerParams);
        this._datePickerInitialize();
    }

    /**
     * Check/Uncheck the checkbox in the table
     * @param data Data of the checked line in the table
     */
    public changeCheckBox(data: any) {
        let element = this.apiData[data.rowIndex];
        if (data.checked) {
            // In case of checking: Adding a checked line to the response data
            this.selectedItems[element['request_number.car_customized_definition.car_customize_data_performances.send_no']] = true;

            let dataAchievementDetails: CustomizedDataAchievementDetails[] = [];
            element.car_customized_definition.car_customize_data_performances.customized_data_achievement_details.forEach((item: any) => {
                dataAchievementDetails.push({
                    server_registration_time: item.server_registration_time,
                    car_data_creation_time: item.car_data_creation_time
                });
            });
            this.dataPerformances.push({
                send_no: element.car_customized_definition.car_customize_data_performances.send_no,
                status: element.car_customized_definition.car_customize_data_performances.status,
                status_name: element.car_customized_definition.car_customize_data_performances.status_name,
                customized_data_achievement_details: dataAchievementDetails
            })
        } else {
            // In case of unchecking: Removing a checked line from the response data
            this.selectedItems[element['request_number.car_customized_definition.car_customize_data_performances.send_no']] = false;
            let removeIdx = -1;
            this.dataPerformances.forEach((item, index) => {
                if (item.send_no === element.car_customized_definition.car_customize_data_performances.send_no) removeIdx = index;
            });
            this.dataPerformances.splice(removeIdx, 1);
        }

        // Enabled/Disabled the OK button based on the condition
        // There is a checked line -> Enable
        // No checked line -> Disable
        if (this.dataPerformances.length > 0) {
            this.modalService.enableOk = true;
        } else {
            this.modalService.enableOk = false;
        }

        this.responseData = {
            customize_definition_id: this.customize_definition_id,
            customize_definition_name: this.customize_definition_name,
            assumption_data_value: this.assumption_data_value,
            car_customize_data_performances: this.dataPerformances
        }
    }

    /**
     * Check/Uncheck the "All" checkbox in the table
     * @param data Value of the "All" checkbox (True/False)
     */
    changeAllCheckBox(data: any) {
        this.dataPerformances = [];
        if (data) {
            // Enabled the OK button in case of checking
            this.modalService.enableOk = true;

            // Setting the response data to be returned
            const keys = Object.keys(this.checkedItems);
            this.apiData.forEach(element => {
                if (keys.includes(element.car_customized_definition.car_customize_data_performances.send_no)) {
                    let dataAchievementDetails: CustomizedDataAchievementDetails[] = [];
                    element.car_customized_definition.car_customize_data_performances.customized_data_achievement_details.forEach((item: any) => {
                        dataAchievementDetails.push({
                            server_registration_time: item.server_registration_time,
                            car_data_creation_time: item.car_data_creation_time
                        });
                    });
                    this.dataPerformances.push({
                        send_no: element.car_customized_definition.car_customize_data_performances.send_no,
                        status: element.car_customized_definition.car_customize_data_performances.status,
                        status_name: element.car_customized_definition.car_customize_data_performances.status_name,
                        customized_data_achievement_details: dataAchievementDetails
                    })
                }
            });

            this.responseData = {
                customize_definition_id: this.customize_definition_id,
                customize_definition_name: this.customize_definition_name,
                assumption_data_value: this.assumption_data_value,
                car_customize_data_performances: this.dataPerformances
            }
        } else {
            // Disabled the OK button in case of checking
            this.modalService.enableOk = false;
        }
    }

    /**
   * チェックボックスのキーとなる値を取得する
   * @param data 対象データ
   * @return チェックボックスのキーとなる値
   */
    checkIdFunction(data: any): string {
        return data['request_number.car_customized_definition.car_customize_data_performances.send_no']
    }

    /**
     * 選択全解除
     * 全ページの選択状態の解除を行う
     */
    deselectAll(): void {
        // チェックボックス設定
        this.selectedItems = {};
        this.checkedItems = {};
        this.dataPerformances = [];
        this.checkAll = false;
        const check: HTMLInputElement = <HTMLInputElement>(
            document.getElementById('check-icon-all')
        );
        check.checked = false;
        this.modalService.enableOk = false;
    }

    /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
    checkBoxHiddenFunction(data: any): boolean {
        return data['request_number.car_customized_definition.car_customize_data_performances.status_name'] !== '未受信';
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

        _.set(this.params, 'request_number_datetime_from', today.subtract(1, 'days').format(DateTimeFormat.slash));
        _.set(this.params, 'request_number_datetime_to', today
            .add(23, 'hours')
            .add(59, 'minutes')
            .add(59, 'seconds')
            .format(DateTimeFormat.slash));
    }

    /**
     * 入力した検索条件で検索結果一覧テーブルを表示する
     */
    private async _refreshDataTable(): Promise<void> {
        this.isFetching = true;

        this._searchParams.car_id = this.carId;
        this._searchParams.customize_definition_id = this.params.request_number_definition_ids,
            this._searchParams.datetime_from = this.params.request_number_datetime_from;
        this._searchParams.datetime_to = this.params.request_number_datetime_to;
        this._searchParams.status = this.params.request_number_status;

        // Call & fetch data from API
        this.requestHeaderParams['X-Sort'] = this.sortingParams['sort'] || '';
        let apiResult = await this.cdRequestNumberListService.fetchCarTransmissionNumbers(
            this._searchParams,
            this.requestHeaderParams
        );

        this.customize_definition_id = apiResult.result_data.car_customized_definition.customize_definition_id;
        this.customize_definition_name = apiResult.result_data.car_customized_definition.customize_definition_name;
        this.assumption_data_value = apiResult.result_data.car_customized_definition.assumption_data_value;

        // Format the acquired data to be displayed in the table
        this.apiData = (apiResult.result_data.car_customized_definition.car_customize_data_performances).reduce((acc: any, cur: any) => {
            acc.push({
                car_customized_definition: {
                    car_customize_data_performances: {
                        send_no: cur.send_no,
                        status: cur.status,
                        status_name: cur.status_name,
                        customized_data_achievement_details: cur.customized_data_achievement_details
                    }
                }
            });
            return acc;
        }, []);

        const formatted = this._formatList(this.apiData, this.thList);
        formatted.forEach((element: any, index: any) => {
            _.set(element, 'request_number.car_customized_definition.car_customize_data_performances.customized_data_achievement_details',
                this.apiData[index].car_customized_definition.car_customize_data_performances.customized_data_achievement_details);
        });
        this._fillLists(apiResult.result_header, formatted);

        this.checkedItems = this.selectedItems;

        this.isFetching = false;
    }

}