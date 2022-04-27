import { Component, EventEmitter, OnInit } from '@angular/core';
import { EntranceService } from '../../../services/shared/entrance.service';
import { environment } from '../../../../environments/environment';

@Component({
  moduleId: module.id,
  selector: 'app-kba-entrance',
  template: '',
})
export class KbaEntranceComponent implements OnInit {
  onLoadEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private entranceService: EntranceService
  ) {}

  ngOnInit() {
    const appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;
    const nextUrl = localStorage.getItem(
      environment.settings.appPrefix + '-entrance-next'
    );
    const nextUrlMatch = /\?(?:[\w_]+=[\w\d]+&?)*group_id=(\d+)/.exec(nextUrl || '');
    const groupId = localStorage.getItem(`group_id.${appCode}`) || (nextUrlMatch ? nextUrlMatch[1] : null);

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
