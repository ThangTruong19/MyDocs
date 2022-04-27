// Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { KbaSidemenuModule } from './modules/shared/kba-sidemenu.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KbaCommonModule } from './modules/shared/kba-common.module';
import { DndModule } from 'ngx-dnd';
import { KCommonModule } from './vendor/k-common-module/module';

// Componets
import { AppComponent } from './components/opa/app/app.component';
import { HomeComponent } from './components/opa/home/home.component';
import {
  KbaHomeMenuComponent,
  KbaHomeMenuItemComponent,
  KbaHomeNoticeComponent,
  KbaHomeTradeComponent,
} from './components/opa/home/home-menu/home-menu.component';
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

// Error handlers
import { BaseErrorHandler } from './error-handlers/base-error-hanler';

const declarations: any[] = [
  AppComponent,
  HomeComponent,
  KbaHomeMenuComponent,
  KbaHomeMenuItemComponent,
  KbaHomeNoticeComponent,
  KbaHomeTradeComponent,
];

const routes: Route[] = [
  { path: '', component: HomeComponent, canActivate: [AuthenticationService] },
  {
    path: 'entrance',
    component: KbaEntranceComponent,
    canActivate: [AuthenticationService],
  },
  {
    path: 'system_notifications',
    loadChildren: () =>
      import('./modules/opa/system-notification.module').then(
        m => m.SystemNotificationModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'custom_car_attributes',
    loadChildren: () =>
      import('./modules/opa/custom-car-attribute.module').then(
        m => m.CustomCarAttributeModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'report_macro',
    loadChildren: () =>
      import('./modules/opa/report-macro.module').then(
        m => m.ReportMacroModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'flag_conditions',
    loadChildren: () =>
      import('./modules/opa/flag-condition.module').then(
        m => m.FlagConditionModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'service_contract',
    loadChildren: () =>
      import('./modules/opa/service-contract.module').then(
        m => m.ServiceContractModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'groups',
    loadChildren: () =>
      import('./modules/opa/group.module').then(m => m.GroupModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/opa/user.module').then(m => m.UserModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'histories',
    loadChildren: () =>
      import('./modules/opa/history.module').then(m => m.HistoryModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'management_car_setting',
    loadChildren: () =>
      import('./modules/opa/management-car-setting.module').then(
        m => m.ManagementCarSettingModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'business_types',
    loadChildren: () =>
      import('./modules/opa/business-type.module').then(
        m => m.BusinessTypeModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'user_screen',
    loadChildren: () =>
      import('./modules/opa/user-screen.module').then(m => m.UserScreenModule),
    canActivateChild: [AuthenticationService],
  },
];

if (environment.settings.useEntranceForDevelop) {
  routes.push(
    {
      path: 'dummy/entrance/tos/re-consent',
      component: DummyEntranceComponent,
    },
    { path: 'dummy/entrance', component: DummyEntranceComponent },
    { path: 'entrance/group/switch', component: DummyEntranceComponent },
    { path: 'admin', redirectTo: '' }
  );
}

@NgModule({
  declarations,
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      onSameUrlNavigation: 'reload',
    }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    KbaSidemenuModule,
    KbaCommonModule,
    DndModule.forRoot(),
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
