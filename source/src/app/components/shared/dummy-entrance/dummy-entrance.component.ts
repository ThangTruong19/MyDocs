import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { NavigationService } from 'app/services/shared/navigation.service';
import { ApiService } from 'app/services/api/api.service';

@Component({
    moduleId: module.id,
    selector: 'app-dummy-entrance',
    templateUrl: './dummy-entrance.component.html',
    styleUrls: ['./dummy-entrance.component.scss'],
})

// Root 直下エントランス画面の代わり
export class DummyEntranceComponent extends AbstractBaseComponent
    implements OnInit {

    public groups: {
        id: string;
        label: string;
    }[];
    public filter = '';
    private next: string;
    private appCode: string;

    public get filteredGroups(): {
        id: string;
        label: string;
    }[] {
        return (
            this.groups &&
            this.groups.filter(group => group.label.includes(this.filter))
                .slice(0, 50)
        );
    }

    constructor(
        protected nav: NavigationService,
        protected override title: Title,
        private activatedRoute: ActivatedRoute,
        private api: ApiService
    ) {
        super(nav, title);

        this.activatedRoute.queryParams.subscribe((p: Params) => {
            if (p.app_code) {
                this.appCode = p.app_code;
            }
            if (p.next) {
                this.next = p.next;
            }
        });

        this.onLoad();
    }

    public async ngOnInit(): Promise<void> {
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

    public aredirect(groupId: string): void {
        if (this.next.split('?').length > 1) {
            location.href = `${this.next}&group_id=${groupId}`;
        } else {
            location.href = `${this.next}?group_id=${groupId}`;
        }
    }

}
