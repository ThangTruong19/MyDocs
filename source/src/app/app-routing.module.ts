import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DummyEntranceComponent } from 'app/components/shared/dummy-entrance/dummy-entrance.component';
import { EntranceComponent } from 'app/components/shared/entrance/entrance.component';
import { AuthenticationService } from 'app/services/shared/authentication.service';

const useEntranceForDevelop: boolean = (window as any).settings.useEntranceForDevelop;

const routes: Routes = [
    {
        path: 'history',
        loadChildren: () =>
            import('app/modules/history-mgt-list.module').then(m => m.HistoryMgtListModule),
        canActivateChild: [AuthenticationService],
    },
    {
        path: 'authority',
        loadChildren: () =>
            import('app/modules/authority-mgt-list.module').then(m => m.AuthorityMgtListModule),
        canActivateChild: [AuthenticationService],
    },
    {
        path: 'customize_request_status',
        loadChildren: () =>
            import('app/modules/customize-request-status-list.module').then(m => m.CustomizeRequestStatusListModule),
        canActivateChild: [AuthenticationService],
    },
    {
        path: 'customize_data_request',
        loadChildren: () =>
            import('app/modules/cd-request-detail.module').then(m => m.CdRequestDetailModule),
        canActivateChild: [AuthenticationService],
    },
    {
        path: 'customize_setting_upload',
        loadChildren: () =>
            import('app/modules/cs-upload.module').then(m => m.CsUploadModule),
        canActivateChild: [AuthenticationService],
    },
    {
        path: 'customize_setting',
        loadChildren: () =>
            import('app/modules/cs-detail.module').then(m => m.CsDetailModule),
        canActivateChild: [AuthenticationService],
    },
    {
        path: 'cars',
        loadChildren: () =>
            import('app/modules/car-list.module').then(m => m.CarListModule),
        canActivateChild: [AuthenticationService],
    },
    {   path: '',
        loadChildren: () =>
            import('app/modules/menu.module').then(m => m.MenuModule),
        canActivate: [AuthenticationService],
    },
];

if (useEntranceForDevelop) {
    routes.push(
        {
            path: 'entrance',
            component: EntranceComponent,
            canActivate: [AuthenticationService],
        },
        {
            path: 'dummy/entrance/tos/re-consent',
            component: DummyEntranceComponent,
        },
        { path: 'dummy/entrance', component: DummyEntranceComponent },
        { path: 'entrance/group/switch', component: DummyEntranceComponent },
    );
}

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true }),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
