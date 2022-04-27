import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';

import { HistoryComponent } from './history.component';

import { HistoryService } from '../../../services/flm/history/history.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        HistoryService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
