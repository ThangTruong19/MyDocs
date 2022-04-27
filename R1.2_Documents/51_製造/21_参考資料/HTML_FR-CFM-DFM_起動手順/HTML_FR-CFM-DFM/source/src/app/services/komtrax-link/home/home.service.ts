import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { Api } from '../../../types/common';
import { CarsSearchParams } from '../../../types/komtrax-link/home';

import { ApiService } from '../../api/api.service';

import { Apis } from '../../../constants/apis';

@Injectable()
export class HomeService {
  constructor(private api: ApiService) {}

  /**
   * 車両一覧取得
   */
  fetchCars(params: CarsSearchParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchCars',
        this.api
          .post(Apis.postCarsSearch, params, {
            cache: false,
            request_header: {
              'X-Fields': 'cars.car_identification.id',
            },
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }
}
