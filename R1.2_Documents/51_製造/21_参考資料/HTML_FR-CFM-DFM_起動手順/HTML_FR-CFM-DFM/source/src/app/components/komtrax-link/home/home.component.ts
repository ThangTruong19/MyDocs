import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { CarsSearchParams } from '../../../types/komtrax-link/home';

import { ScreenCode } from '../../../constants/komtrax-link/screen-codes/common';

import { KbaAbstractBaseComponent } from '../../shared/kba-abstract-component/kba-abstract-base-compoenent';

import { HomeService } from '../../../services/komtrax-link/home/home.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../services/api/api.service';
import { LogKind } from '../../../services/api/log_kind';

import { set } from 'lodash';

@Component({
  moduleId: module.id,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends KbaAbstractBaseComponent implements OnInit {
  appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;
  settings = (window as any).settings;
  params: CarsSearchParams = {
    common: {
      car_identification: {
        maker_codes: ['0001'], // 0001固定(コマツ)
        models: [],
        type_revs: [],
        serials: [],
      },
    },
  };
  private containerMaxWidth = 1280;
  private noticeWidth = 300;
  private navWidth = 255;
  private margin = 20;

  get wrapperWidth() {
    return {
      'max-width': `${Math.floor(
        (Math.min(this.containerMaxWidth, window.innerWidth) -
          (this.margin + this.noticeWidth)) /
          this.navWidth
      ) * this.navWidth}px`,
    };
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    private activatedRoute: ActivatedRoute,
    private alertService: KbaAlertService,
    private homeService: HomeService,
    private api: ApiService
  ) {
    super(navigationService, title);
  }

  ngOnInit() {
    this.api.currentScreenCode = ScreenCode.flmKomtraxLink;
    const option = {
      access_log_messages: localStorage.getItem(`referrer_url.${this.appCode}`),
    };

    this.api
      .callApisForInitialize(ScreenCode.flmKomtraxLink, 'homeInit', {}, option)
      .then(res => {
        this.initialize(res);
        this.labels = res.label;
        this._setTitle();
        this.activatedRoute.queryParams.subscribe((p: Params) => {
          set(this.params, 'common.car_identification.models', [
            p.MODEL || p.model,
          ]);
          set(this.params, 'common.car_identification.type_revs', [
            p.TYPE || p.type,
          ]);
          set(this.params, 'common.car_identification.serials', [
            p.SERIAL || p.serial,
          ]);
        });
        localStorage.removeItem(`referrer_url.${this.appCode}`);
        this.homeService.fetchCars(this.params).then((response: any) => {
          const cars = response.result_data.cars;

          switch (cars.length) {
            case 0:
              this.alertService.show(this.labels.car_not_found, true, 'danger');
              break;
            case 1:
              window.open(
                this.settings.detailCarRedirectUrl.replace(
                  '{car_id}',
                  cars[0].car_identification.id
                ),
                '_self'
              );
              break;
            default:
              this.alertService.show(
                this.labels.car_found_multiple,
                true,
                'danger'
              );
          }
          this.onLoad();
        });
      });
  }

  refresh() {
    this.navigationService.refresh();
  }
}
