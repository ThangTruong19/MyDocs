import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';

import { ClassIndexComponent } from './class-index.component';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';
import { ApiService } from '../../../../services/api/api.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAccordionModule } from '../../../../modules/shared/kba-accordion.module';
import { KbaStorageService } from '../../../../services/shared/kba-storage.service';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ClassService } from '../../../../services/flm/class/class.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('ClassIndexComponent', () => {
  let component: ClassIndexComponent;
  let fixture: ComponentFixture<ClassIndexComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassIndexComponent],
      imports: [
        KbaSidemenuModule,
        HttpClientModule,
        KbaAccordionModule,
        RouterTestingModule,
        KbaCommonModule,
      ],
      providers: [
        KbaNavigationService,
        ApiService,
        UserSettingService,
        ClassService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClassIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
