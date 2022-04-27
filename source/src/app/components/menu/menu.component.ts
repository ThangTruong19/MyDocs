import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { ApiService } from 'app/services/api/api.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { InitializeApiResult } from 'app/types/common';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html'
})
export class MenuComponent extends AbstractBaseComponent implements OnInit {

    constructor(
        protected override navigationService: NavigationService,
        protected override title: Title,
        private header: CommonHeaderService,
        private api: ApiService
    ) {
        super(navigationService, title);
    }

    ngOnInit(): void {
        this.api.currentScreenCode = ScreenCodeConst.MENU_CODE;
        this.api
            .callApisForInitialize(ScreenCodeConst.MENU_CODE, 'menu')
            .then(async (res: InitializeApiResult) => {
                this.initialize(res);
                this.labels = res.label;
                this._setTitle();
                await this.header.setHeader(this.labels, res.resource, this.functions);
                this.onLoad();
            });
    }

    public refresh(): void {
        this.navigationService.refresh();
    }

}
