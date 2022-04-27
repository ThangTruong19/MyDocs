import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { KbaCommonModule } from '../shared/kba-common.module';

import { SiteComponent } from '../../components/flm/site-management/site/site.component';
import { IndexHeaderComponent } from '../../components/flm/site-management/shared/index-header/index-header.component';
import { ListComponent } from '../../components/flm/site-management/shared/list/list.component';
import { MapListComponent } from '../../components/flm/site-management/shared/map-list/map-list.component';
import { StatComponent } from '../../components/flm/site-management/stat/stat.component';
import { DetailHeaderComponent } from '../../components/flm/site-management/shared/detail-header/detail-header.component';
import { StatHeaderComponent } from '../../components/flm/site-management/stat/stat-header/stat-header.component';
import { GraphComponent } from '../../components/flm/site-management/stat/graph/graph.component';
import { MapComponent } from '../../components/flm/site-management/map/map.component';
import { MapHeaderComponent } from '../../components/flm/site-management/map/map-header/map-header.component';
import { MapRouteComponent } from '../../components/flm/site-management/map/map-route/map-route.component';
import { AreaComponent } from '../../components/flm/site-management/area/area.component';
import { PulldownComponent } from '../../components/flm/site-management/area/pulldown/pulldown.component';
import { NoListComponent } from '../../components/flm/site-management/shared/no-list/no-list.component';

import { SiteManagementService } from '../../services/flm/site-management/site-management.service';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([
      { path: 'site', component: SiteComponent },
      { path: 'area', component: AreaComponent },
      { path: 'detail/stat/site/:id', component: StatComponent },
      { path: 'detail/map/site/:id', component: MapComponent },
      { path: 'detail/stat/area/:id', component: StatComponent },
      { path: 'detail/map/area/:id', component: MapComponent },
      { path: 'detail/stat', component: StatComponent },
      { path: 'detail/map', component: MapComponent },
    ]),
  ],
  declarations: [
    SiteComponent,
    AreaComponent,
    IndexHeaderComponent,
    ListComponent,
    MapListComponent,
    StatComponent,
    DetailHeaderComponent,
    StatHeaderComponent,
    GraphComponent,
    MapComponent,
    MapHeaderComponent,
    MapRouteComponent,
    PulldownComponent,
    NoListComponent,
  ],
  providers: [SiteManagementService],
})
export class SiteManagementModule {}
