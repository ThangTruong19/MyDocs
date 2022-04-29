import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
//import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
//import { DataTablesModule } from 'angular-datatables';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { DatepickerModule } from 'ngx-bootstrap';

// PG社提供共通コンポーネント
import { KCommonModule } from 'app/vendors/k-common-module';

import { AppRoutingModule } from './app-routing.module';
import { AppIndexComponent } from 'app/components/app-index/app-index.component';
import { MenuComponent } from 'app/components/menu/menu.component';
import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { SidemenuModule } from 'app/modules/shared/sidemenu.module';
import { AuthenticationService } from 'app/services/shared/authentication.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ApiService } from 'app/services/api/api.service';
import { AlertService } from 'app/services/shared/alert.service';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { EntranceService } from 'app/services/shared/entrance.service';
import { ArrayService } from 'app/services/shared/array.service';
import { BooleanService } from 'app/services/shared/boolean.service';
import { KeyboardService } from 'app/services/shared/keyboard.service';
import { LoadingService } from 'app/services/shared/loading.service';
import { NumericService } from 'app/services/shared/numeric.service';
import { StringService } from 'app/services/shared/string.service';
import { CustomizeSettingUploadService } from 'app/services/customize-setting-upload/customize-setting-upload.service';
import { CarListService } from 'app/services/car-list/car-list.service';
import { UrlService } from 'app/services/shared/url.service';
import { GlobalErrorHandler } from 'app/handler/global-error-hanler';

@NgModule({
    declarations: [
        AppIndexComponent,
        MenuComponent,
    ],
    imports: [
        AppCommonModule,
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        KCommonModule,
        SidemenuModule
    ],
    providers: [
        AlertService,
        ApiService,
        ArrayService,
        AuthenticationService,
        CommonHeaderService,
        EntranceService,
        StringService,
        UrlService,
        UserSettingService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        CustomizeSettingUploadService,
        CarListService,
    ],
    bootstrap: [AppIndexComponent]
})
export class AppModule { }
