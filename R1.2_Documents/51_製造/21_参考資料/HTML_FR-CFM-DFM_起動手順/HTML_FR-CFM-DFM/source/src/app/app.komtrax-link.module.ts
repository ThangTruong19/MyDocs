// Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { KbaSidemenuModule } from './modules/shared/kba-sidemenu.module';
import { KbaCommonModule } from './modules/shared/kba-common.module';
import { KCommonModule } from './vendor/k-common-module/module';

// Componets
import { AppComponent } from './components/komtrax-link/app/app.component';
import { HomeComponent } from './components/komtrax-link/home/home.component';
import { KbaEntranceComponent } from './components/shared/kba-entrance/kba-entrance.component';

// 開発用エントランス
import { DummyEntranceComponent } from './components/shared/kba-dummy-entrance/kba-dummy-entrance.component';

import { environment } from '../environments/environment';

// Services
import { ApiService } from './services/api/api.service';
import { ResourceService } from './services/api/resource.service';
import { KbaAlertService } from './services/shared/kba-alert.service';
import { CommonHeaderService } from './services/shared/common-header.service';
import { UserSettingService } from './services/api/user-setting.service';
import { AuthenticationService } from './services/shared/authentication.service';
import { EntranceService } from './services/shared/entrance.service';
import { HomeService } from './services/komtrax-link/home/home.service';

// Error handlers
import { BaseErrorHandler } from './error-handlers/base-error-hanler';

const declarations: any[] = [AppComponent, HomeComponent];

const routes: Route[] = [
  { path: '', component: HomeComponent, canActivate: [AuthenticationService] },
  {
    path: 'entrance',
    component: KbaEntranceComponent,
    canActivate: [AuthenticationService],
  },
];

if (environment.settings.useEntranceForDevelop) {
  routes.push(
    {
      path: 'dummy/entrance/tos/re-consent',
      component: DummyEntranceComponent,
    },
    { path: 'dummy/entrance', component: DummyEntranceComponent }
  );
}

@NgModule({
  declarations,
  imports: [
    RouterModule.forRoot(routes, { useHash: false }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    KbaSidemenuModule,
    KbaCommonModule,
    KCommonModule,
  ],
  providers: [
    ApiService,
    ResourceService,
    KbaAlertService,
    CommonHeaderService,
    UserSettingService,
    AuthenticationService,
    EntranceService,
    {
      provide: ErrorHandler,
      useClass: BaseErrorHandler,
    },
    HomeService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
