import { KbaAbstractBaseComponent } from './kba-abstract-base-compoenent';
import { OnInit, ViewChild, TemplateRef } from '@angular/core';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { Title } from '@angular/platform-browser';
import { CommonHeaderService } from '../../../services/shared/common-header.service';

export abstract class KbaAbstractRegisterComponent
  extends KbaAbstractBaseComponent
  implements OnInit {
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  isUpdate = false;
  abstract params;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    protected header: CommonHeaderService = null
  ) {
    super(navigationService, title);
  }

  ngOnInit() {
    this._fetchDataForInitialize().then(async () => {
      await this.header.setHeader(this.labels, this.resource, this.functions);
      this.onLoad();
    });
  }

  /**
   * 初期表示のためのデータを取得します。
   */
  protected abstract _fetchDataForInitialize();
}
