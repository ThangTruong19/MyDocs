// Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { KbaSidemenuModule } from './modules/shared/kba-sidemenu.module';
import { KbaCommonModule } from './modules/shared/kba-common.module';
import { DndModule } from 'ngx-dnd';
import { KCommonModule } from './vendor/k-common-module/module';

// Componets
import { AppComponent } from './components/flm/app/app.component';
import { HomeComponent } from './components/flm/home/home.component';
import {
  KbaHomeMenuComponent,
  KbaHomeMenuItemComponent,
} from './components/flm/home/home-menu/home-menu.component';

// 開発用エントランス
import { KbaEntranceComponent } from './components/shared/kba-entrance/kba-entrance.component';
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
];

const routes: Route[] = [
  { path: '', component: HomeComponent, canActivate: [AuthenticationService] },
  {
    path: 'contacts',
    loadChildren: () =>
      import('./modules/flm/contact.module').then(m => m.ContactModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'operators',
    loadChildren: () =>
      import('./modules/flm/operator.module').then(m => m.OperatorModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'flags',
    loadChildren: () =>
      import('./modules/flm/flag.module').then(m => m.FlagModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'group_area',
    loadChildren: () =>
      import('./modules/flm/group-area.module').then(m => m.GroupAreaModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'classes',
    loadChildren: () =>
      import('./modules/flm/class.module').then(m => m.ClassModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'smr_interval',
    loadChildren: () =>
      import('./modules/flm/smr-interval.module').then(
        m => m.SmrIntervalModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'cars',
    loadChildren: () =>
      import('./modules/flm/car.module').then(m => m.CarModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/flm/user.module').then(m => m.UserModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./modules/flm/customer.module').then(m => m.CustomerModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'subgroups',
    loadChildren: () =>
      import('./modules/flm/subgroup.module').then(m => m.SubgroupModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'histories',
    loadChildren: () =>
      import('./modules/flm/history.module').then(m => m.HistoryModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'service_contracts',
    loadChildren: () =>
      import('./modules/flm/service-contract.module').then(
        m => m.ServiceContractModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'fuel_interval_items',
    loadChildren: () =>
      import('./modules/flm/fuel.module').then(m => m.FuelModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'rental_cars',
    loadChildren: () =>
      import('./modules/flm/rental-car.module').then(m => m.RentalCarModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'landmarks',
    loadChildren: () =>
      import('./modules/flm/landmark.module').then(m => m.LandmarkModule),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'site-management',
    loadChildren: () =>
      import('./modules/flm/site-management.module').then(
        m => m.SiteManagementModule
      ),
    canActivateChild: [AuthenticationService],
  },
  {
    path: 'support_distributor_change',
    loadChildren: () =>
      import('./modules/flm/support-distributor-change.module').then(
        m => m.SupportDistributorChangeModule
      ),
    canActivateChild: [AuthenticationService],
  },
];

if (environment.settings.useEntranceForDevelop) {
  routes.push(
    {
      path: 'entrance',
      component: KbaEntranceComponent,
      canActivate: [AuthenticationService],
    },
    {
      path: 'dummy/entrance/tos/re-consent',
      component: DummyEntranceComponent,
    },
    { path: 'dummy/entrance', component: DummyEntranceComponent },
    { path: 'entrance/group/switch', component: DummyEntranceComponent },
    { path: 'd/fm', redirectTo: '' },
    { path: 'c/fm', redirectTo: '' }
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
    ResourceService,
    ApiService,
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
