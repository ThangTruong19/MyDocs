import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PG社提供共通コンポーネント
import { KCommonModule } from 'app/vendors/k-common-module';

import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { AppIndexComponent } from 'app/components/app-index/app-index.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { ArrayService } from 'app/services/shared/array.service';
import { AuthenticationService } from 'app/services/shared/authentication.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ComponentRefService } from 'app/services/shared/component-ref.service';
import { EntranceService } from 'app/services/shared/entrance.service';
import { GlobalErrorHandler } from 'app/handler/global-error-hanler';
import { KeyboardService } from 'app/services/shared/keyboard.service';
import { LoggingService } from 'app/services/shared/logging.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { NumericService } from 'app/services/shared/numeric.service';
import { ResourceService } from 'app/services/api/resource.service';
import { SettingsService } from 'app/services/shared/settings.service';
import { SidemenuModule } from 'app/modules/shared/sidemenu.module';
import { StorageService } from 'app/services/shared/storage.service';
import { StringService } from 'app/services/shared/string.service';
import { UrlService } from 'app/services/shared/url.service';
import { UserSettingService } from 'app/services/api/user-setting.service';

@NgModule({
    declarations: [
        AppIndexComponent,
    ],
    imports: [
        AppCommonModule,
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        KCommonModule,
        SidemenuModule,
    ],
    providers: [
        ArrayService,
        AlertService,
        ApiService,
        AuthenticationService,
        CommonHeaderService,
        ComponentRefService,
        EntranceService,
        KeyboardService,
        LoggingService,
        NavigationService,
        NumericService,
        ResourceService,
        SettingsService,
        StorageService,
        StringService,
        UrlService,
        UserSettingService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
    ],
    bootstrap: [AppIndexComponent]
})
export class AppModule { }
