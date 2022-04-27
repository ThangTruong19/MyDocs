import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ApiService } from '../../../../services/api/api.service';
import { ResourceService } from '../../../../services/api/resource.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ClassService } from '../../../../services/flm/class/class.service';
import { ClassNewComponent } from './class-new.component';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('ClassNewComponent', () => {
  let component: ClassNewComponent;
  let fixture: ComponentFixture<ClassNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        ResourceService,
        KbaAlertService,
        CommonHeaderService,
        ClassService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
