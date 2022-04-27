import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { KCommonModule } from '../../../vendor/k-common-module/module';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaAlertModule } from '../../../modules/shared/kba-alert.module';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { UserSettingService } from '../../../services/api/user-setting.service';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        RouterTestingModule,
        KCommonModule,
        KbaAlertModule,
        KbaCommonModule,
      ],
      providers: [
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
