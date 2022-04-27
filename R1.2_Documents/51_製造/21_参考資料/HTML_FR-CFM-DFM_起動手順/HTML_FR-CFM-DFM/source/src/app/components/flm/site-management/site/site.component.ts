import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { RequestHeaderParams } from '../../../../types/request';
import { TableHeader, Fields } from '../../../../types/common';
import { SiteMap } from '../../../../types/flm/site-management';

import { KbaAbstractBaseComponent } from '../../../shared/kba-abstract-component/kba-abstract-base-compoenent';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SiteManagementService } from '../../../../services/flm/site-management/site-management.service';
import {
  KbaStorageService,
  KbaStorageObject,
} from '../../../../services/shared/kba-storage.service';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss'],
})
export class SiteComponent extends KbaAbstractBaseComponent {
  thList: TableHeader[];
  list: SiteMap[];
  filteredList: SiteMap[];
  layout = 'list';
  storage: KbaStorageObject;
  detailLink = '/site-management/detail/stat/site/';
  hasList: boolean;
  searchWord = '';

  constructor(
    title: Title,
    storageService: KbaStorageService,
    private siteManagementService: SiteManagementService,
    private header: CommonHeaderService,
    private activatedRoute: ActivatedRoute
  ) {
    super(null, title);
    this.storage = storageService.createStorage('jobsite.site-management');
    this.layout = this.storage.get('layout') || this.layout;
    this.storage.set('layout', this.layout);
    let tempUrl;
    this.activatedRoute.url.subscribe(url => (tempUrl = url.join('/')));
    this.storage.set('tempUrl', 'site-management/' + tempUrl);
    this._fetchDataForInitialize();
  }

  /**
   * 検索ワード変更時のコールバック
   * @param value 検索ワード
   */
  handleQueryChange(value: string) {
    if (value == null) {
      return;
    }

    value = value.trim();
    this.searchWord = value;
    this._updateFilteredList();
  }

  /**
   * レイアウト変更時のコールバック
   * @param layout レイアウト
   */
  handleLayoutChange(layout) {
    this.layout = layout;
    this.storage.set('layout', layout);
  }

  protected _createThList(fields: Fields) {
    const thList = super._createThList(fields);

    return thList.map(th => ({
      ...th,
      link: th.name === 'site_maps.label' ? this.detailLink : null,
    }));
  }

  protected _dataKey(name: string) {
    return name
      .split('.')
      .slice(1)
      .join('.');
  }

  private async _fetchDataForInitialize() {
    const res = await this.siteManagementService.fetchSiteInitData();
    this.labels = res.label;
    this.resource = res.resource;
    if (this.resource.mode) {
      this.resource.mode.values = this.resource.mode.values.sort(
        (v1, v2) => +v2.value - +v1.value
      );
    }
    this._setTitle();
    await this.header.setHeader(
      this.labels,
      res.resource,
      res.functions.result_data.functions
    );
    const requestHeaderParams: RequestHeaderParams = {};
    requestHeaderParams['X-Fields'] = this._createXFields(res.fields).join(',');
    this.thList = this._createThList(res.fields);
    this.list = (await this.siteManagementService.fetchSiteMaps(
      null,
      requestHeaderParams
    )).result_data.site_maps;
    this.hasList = this.list.length > 0;
    this._updateFilteredList();
    this.onLoad();
  }

  /**
   * 表示するリストを更新する
   */
  private _updateFilteredList(): void {
    this.filteredList =
      this.searchWord.length > 0
        ? this.list.filter(
            item =>
              item.label.includes(this.searchWord) ||
              item.label.includes(this.searchWord)
          )
        : [...this.list];
  }
}
