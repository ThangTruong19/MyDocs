import { Component, EventEmitter, OnInit } from '@angular/core';
import { EntranceService } from 'app/services/shared/entrance.service';
import { StorageService } from 'app/services/shared/storage.service';

@Component({
    moduleId: module.id,
    selector: 'app-entrance',
    template: '',
})
export class EntranceComponent implements OnInit {
    onLoadEvent: EventEmitter<any> = new EventEmitter();

    constructor(
        private entranceService: EntranceService,
        private storageService: StorageService
    ) { }

    ngOnInit(): void {

        const groupId: string = this.groupId();

        // グループID がある場合はエントランスに遷移しない
        if (groupId) {
            location.href = this.storageService.getEntranceNextUrl();
        } else {
            this.entranceService.transitionEntrance();
        }
    }

    private groupId(): string {
        let groupId: string = this.storageService.getGroupId();
        if (groupId) {
            return groupId;
        }

        const nextUrl: string = this.storageService.getEntranceNextUrl();

        const nextUrlMatch: RegExpExecArray = /\?(?:[\w_]+=[\w\d]+&?)*group_id=(\d+)/.exec(nextUrl || '');
        if (nextUrlMatch) {
            groupId = nextUrlMatch[1];
        } else {
            groupId = null;
        }

        return groupId;
    }

}
