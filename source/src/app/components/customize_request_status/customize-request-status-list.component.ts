import * as _ from 'lodash';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CustomizeRequestStatusListIndexParams, RequestStatus } from 'app/types/customize-request-status-list';
import { DatePickerParams } from 'app/types/calendar';
import { Fields } from 'app/types/common';
import { DateTimeFormat } from 'app/constants/date-format';

import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { CustomizeRequestStatusListService } from 'app/services/customize_request_status/customize-request-status-list.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { UserSettingService } from 'app/services/api/user-setting.service';

@Component({
    selector: 'app-customize-request-status-list',
    templateUrl: './customize-request-status-list.component.html',
    styleUrls: ['./customize-request-status-list.component.scss'],
})
export class CustomizeRequestStatusListComponent extends AbstractIndexComponent {
    @ViewChild('belongingCustomizeUsageDefinitionId', { static: false })
    belongingCustomizeUsageDefinitionId: SelectedComponent;

    datePickerParams: DatePickerParams;
    fields: Fields;
    _dateFormat = '';
    timeZone = '';
    enableDateRange: string[] = [];
    beginningWday: number;
    override commaSeparated: string[] = ['division_codes', 'models', 'type_revs', 'serials', 'request_kind'];

    lineBreakColumns: string[] = ['request_status.customize_usage_definitions.name', 'request_status.customize_definitions.name'];

    constructor(
        navigationService: NavigationService,
        title: Title,
        router: Router,
        ref: ChangeDetectorRef,
        header: CommonHeaderService,
        protected customizeRequestStatusListService: CustomizeRequestStatusListService,
        protected datePickerService: DatePickerService,
        protected userSettingService: UserSettingService
    ) {
        super(navigationService, title, router, ref, header);
    }

    /**
     * カラムが改行を含むかの判定
     * @param name カラム名
     */
    isLineBreak(name: string): boolean {
        return this.lineBreakColumns.includes(name);
    }

    /**
     * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
     * @param sort_key ソートキー
     */
    async fetchList(sort_key?: string): Promise<void> {
        this.isFetching = true;
        this.requestHeaderParams['X-Sort'] = sort_key || '';
        const params: CustomizeRequestStatusListIndexParams = {
            customize_usage_definition_id: this.searchParams.customize_usage_definition_id,
            customize_definition_id: this.searchParams.customize_definition_id,
            car_identification: {
                division_codes: this.searchParams.division_codes,
                models: this.searchParams.models,
                type_revs: this.searchParams.type_revs,
                serials: this.searchParams.serials,
            },
            request_status: {
                request_kind: this.searchParams.request_kind,
                status: this.searchParams.status,
                request_registration_datetime_from: this.searchParams.request_registration_datetime_from,
                request_registration_datetime_to: this.searchParams.request_registration_datetime_to,
            },
        };
        const res = await this.customizeRequestStatusListService.fetchIndexList(params, this.requestHeaderParams);
        const data: RequestStatus[] = res.result_data.request_status;
        const list = this._formatList(data, this.thList);
        this._fillLists(res.result_header, list);
        this.isFetching = false;
        this._afterFetchList();
    }

    /**
     * 検索ボタン押下時の処理
     * 現在のパラメータを更新してリストを取得する
     */
    override onClickSearch(): void {
        super.onClickSearch();
        this.fetchList(this.sortingParams['sort']);
    }

    /**
     * カスタマイズ用途定義変更時の処理
     * @param value 選択値
     */
    async onCustomizeUsageDefinitionIdChange(value: any) {
        const res = await this.customizeRequestStatusListService.fetchBelongingCustomizeUsageDefinitionId(value);
        _.set(this.resource, 'customize_definition_id', _.get(res, 'customize_definition_id'));
        if (this.belongingCustomizeUsageDefinitionId) {
            this.belongingCustomizeUsageDefinitionId.reset();
            this.belongingCustomizeUsageDefinitionId.refresh();
        }
    }

    /**
     * 初期化 API を呼ぶ
     */
    protected async _fetchDataForInitialize(): Promise<void> {
        const res: any = await this.customizeRequestStatusListService.fetchIndexInitData();
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        this._updateFields(res.fields);
        this.fieldResources = res.fieldResources;
        this._datePickerInitialize();
    }

    /**
     * 指定項目を更新
     * @param fields 指定項目
     */
    protected _updateFields(fields: any): void {
        this.fields = fields;
        this.thList = this._createThList(fields);
        this.sortableThList = this.sortableThLists(this.thList);
        this._reflectXFields(fields);
    }

    protected override _getSearchParams(params: any): CustomizeRequestStatusListIndexParams {
        return _.reduce(
            params,
            (res: any, val, key) => {
                res[key] = this.commaSeparated.includes(key) ? val.split(',') : val;
                return res;
            },
            {}
        );
    }

    /**
     * データ作成の追加処理
     * @param data 行データ
     */
    override _formatListAdditional(data: RequestStatus): void {
        const customizeUsageDefinition = data.customize_usage_definitions.reduce((acc, cur) => {
            acc.id += '\n' + cur.id;
            acc.name += '\n' + cur.name;
            return acc;
        });
        const customizeDefinition = data.customize_definitions.reduce((acc, cur) => {
            acc.id += '\n' + cur.id;
            acc.name += '\n' + cur.name;
            return acc;
        });
        _.merge(data.customize_usage_definitions, customizeUsageDefinition);
        _.merge(data.customize_definitions, customizeDefinition);
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
        _.set(this.params, 'request_registration_datetime_from', today.clone().subtract(1, 'month').format(DateTimeFormat.slash));
        _.set(
            this.params,
            'request_registration_datetime_to',
            today.clone().add(23, 'hours').add(59, 'minutes').add(59, 'seconds').format(DateTimeFormat.slash)
        );
    }
}
