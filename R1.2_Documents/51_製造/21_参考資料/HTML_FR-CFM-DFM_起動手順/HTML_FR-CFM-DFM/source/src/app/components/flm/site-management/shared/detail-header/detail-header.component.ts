import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { KbaStorageService } from '../../../../../services/shared/kba-storage.service';

@Component({
  selector: 'app-detail-header',
  templateUrl: './detail-header.component.html',
  styleUrls: ['./detail-header.component.scss'],
})
export class DetailHeaderComponent implements OnInit {
  @Input() labels;
  @Input() url: string;
  @Input() title: string;

  id: string;
  tempUrl: string;

  get activeTab() {
    if (/stat/.test(this.url)) {
      return 'stat';
    }

    if (/map/.test(this.url)) {
      return 'map';
    }

    return null;
  }

  constructor(private router: Router, storageService: KbaStorageService) {
    this.tempUrl = storageService
      .createStorage('jobsite.site-management')
      .get('tempUrl');
  }

  ngOnInit() {
    this.id = this.url.match(/(?:site|area)\/\d+/)
      ? this.url.match(/(?:site|area)\/\d+/)[0]
      : '';
  }

  /**
   * 戻るボタン押下時のコールバック
   */
  handleClickBack() {
    this.router.navigateByUrl(this.tempUrl);
  }
}
