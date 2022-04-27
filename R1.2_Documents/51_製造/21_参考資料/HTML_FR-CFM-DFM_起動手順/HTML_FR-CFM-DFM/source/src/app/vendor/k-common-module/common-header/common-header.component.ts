import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { CommonConfig, ConfigItems, ConfigLabels, HeaderItem, HeaderLabels, UserItems } from '../interfaces';

@Component({
  /* tslint:disable component-selector */
  selector: 'common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonHeaderComponent {
  @Input() headerItems: HeaderItem[];
  @Input() labels: HeaderLabels;
  @Input() userIconPath: string;
  @Input() userItems: UserItems;
  @Input() configItems: ConfigItems;
  @Input() configValues: CommonConfig;
  @Input() configLabels: ConfigLabels;

  @Input() isHome = false;
  @Input() isLoggedIn = false;
  @Input() signOutIsPermitted = false;

  @Output() clickHome = new EventEmitter<MouseEvent>();
  @Output() clickManagementUser = new EventEmitter<MouseEvent>();
  @Output() clickHeaderItem = new EventEmitter<string>();
  @Output() clickUserItem = new EventEmitter<string>();
  @Output() submitConfig = new EventEmitter<CommonConfig>();
  @Output() signOut = new EventEmitter<void>();

  @ViewChild('configTrigger', { static: false})
  configTrigger: ElementRef

  isPermittedMenuItem(): boolean {
    return !!this.headerItems && this.headerItems.length > 0;
  }

  isPermittedUserLink(): boolean {
    return !!this.userItems || this.signOutIsPermitted;
  }

  onClickHome(ev: MouseEvent) {
    this.clickHome.next(ev);
  }

  onClickManagementUser(ev: MouseEvent) {
    this.clickManagementUser.next(ev);
  }

  onSubmitConfig(v: CommonConfig) {
    this.submitConfig.emit(v);
  }

  onClickHeaderItem(item: HeaderItem) {
    if (!item.isEnabled) {
      return;
    }

    this.clickHeaderItem.emit(item.id);
  }

  onClickUserItem(item: HeaderItem) {
    if (!item.isEnabled) {
      return;
    }

    this.clickUserItem.emit(item.id);
  }

  onClickSignOut() {
    this.signOut.emit();
  }
}
