import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SubgroupEditComponent } from './subgroup-edit.component';

import { SubgroupService } from '../../../../services/flm/subgroup/subgroup.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SubgroupEditComponent', () => {
  let component: SubgroupEditComponent;
  let fixture: ComponentFixture<SubgroupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubgroupEditComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        SubgroupService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubgroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
