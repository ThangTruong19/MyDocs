import { Component, EventEmitter, OnInit } from '@angular/core';
import { EntranceService } from 'app/services/shared/entrance.service';
import { environment } from 'environments/environment';

@Component({
    moduleId: module.id,
    selector: 'app-entrance',
    template: '',
})
export class EntranceComponent implements OnInit {
    onLoadEvent: EventEmitter<any> = new EventEmitter();

    constructor(
        private entranceService: EntranceService
    ) { }

    ngOnInit(): void {
        const appCode: string = (window as any).settings.azureAdAuthenticationInfo.clientId;
        const nextUrl: string = localStorage.getItem(
            environment.settings.appPrefix + '-entrance-next'
        );
        const nextUrlMatch: RegExpExecArray = /\?(?:[\w_]+=[\w\d]+&?)*group_id=(\d+)/.exec(nextUrl || '');
        const groupId: string = localStorage.getItem(`group_id.${appCode}`) || (nextUrlMatch ? nextUrlMatch[1] : null);

        // グループID がある場合はエントランスに遷移しない
        if (groupId) {
            location.href = localStorage.getItem(
                environment.settings.appPrefix + '-entrance-next'
            );
        } else {
            this.entranceService.transitionEntrance();
        }
    }

}
