import { Injectable } from '@angular/core';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';

@Injectable()
export class CdRequestNumberTabService {
    constructor(private api: ApiService, private resource: ResourceService) {}

    fetchCarInitData(opt?: any): Promise<any> {
        this.api.currentScreenCode = ScreenCodeConst.CDSM_REQUEST_NUMBER_TAB;
        return this.api.callApisForInitialize(
            ScreenCodeConst.CDSM_REQUEST_NUMBER_TAB,
            'fetchCarInitData',
            {
                fields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB
                    ),
                fieldResources: () =>
                    this.api.fetchFieldResources(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB
                    ),
                cdRequestNumberListFields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB, '2'
                    )
            }
        );
    }
}
