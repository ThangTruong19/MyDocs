import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SubgroupIndexComponent } from './subgroup-index.component';
import { SubgroupDetailComponent } from './detail/subgroup-detail.component';

import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SubgroupService } from '../../../../services/flm/subgroup/subgroup.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SubgroupIndexComponent', () => {
  let component: SubgroupIndexComponent;
  let fixture: ComponentFixture<SubgroupIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubgroupIndexComponent, SubgroupDetailComponent],
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
    fixture = TestBed.createComponent(SubgroupIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
