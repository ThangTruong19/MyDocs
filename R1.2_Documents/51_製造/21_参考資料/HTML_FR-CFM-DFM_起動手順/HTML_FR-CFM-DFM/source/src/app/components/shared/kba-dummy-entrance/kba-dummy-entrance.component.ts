import { Component, EventEmitter, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { KbaAbstractBaseComponent } from '../kba-abstract-component/kba-abstract-base-compoenent';

import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../services/api/api.service';
import { AuthenticationService } from '../../../services/shared/authentication.service';

@Component({
  moduleId: module.id,
  selector: 'app-dummy-entrance',
  templateUrl: './kba-dummy-entrance.component.html',
  styleUrls: ['./kba-dummy-entrance.component.scss'],
})

// Root 直下エントランス画面の代わり
export class DummyEntranceComponent extends KbaAbstractBaseComponent
  implements OnInit {
  next: string;
  appCode: string;
  onLoadEvent: EventEmitter<any> = new EventEmitter();
  groupId: string;
  groups: {
    id: string;
    label: string;
  }[];
  filter = '';

  get filteredGroups() {
    return (
      this.groups &&
      this.groups.filter(group => group.label.includes(this.filter))
        .slice(0, 50)
    );
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private authService: AuthenticationService
  ) {
    super(nav, title);

    this.activatedRoute.queryParams.subscribe(p => {
      if (p.app_code) {
        this.appCode = p.app_code;
      }
      if (p.next) {
        this.next = p.next;
      }
    });

    this.onLoad();
  }

  async ngOnInit() {
    try {
      const {
        result_data: {
          user: { groups },
        },
      } = await this.api.fetchCatalog();
      this.groups = groups;
    } catch (e) {
      this.groups = [];
    }
  }

  redirect(groupId: string) {
    if (this.next.split('?').length > 1) {
      location.href = `${this.next}&group_id=${groupId}`;
    } else {
      location.href = `${this.next}?group_id=${groupId}`;
    }
  }
}
