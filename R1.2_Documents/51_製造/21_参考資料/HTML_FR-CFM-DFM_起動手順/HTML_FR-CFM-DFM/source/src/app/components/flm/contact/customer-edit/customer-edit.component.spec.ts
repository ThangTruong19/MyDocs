import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCustomerEditComponent } from './customer-edit.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ApiService } from '../../../../services/api/api.service';
import { HttpClientModule } from '@angular/common/http';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('ContactCustomerEditComponent', () => {
  let component: ContactCustomerEditComponent;
  let fixture: ComponentFixture<ContactCustomerEditComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactCustomerEditComponent],
      imports: [KbaCommonModule, HttpClientModule, RouterTestingModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        CommonHeaderService,
        ContactService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCustomerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display image', () => {
    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('img'));
      expect(de).toBeTruthy();
    });
  });
});
