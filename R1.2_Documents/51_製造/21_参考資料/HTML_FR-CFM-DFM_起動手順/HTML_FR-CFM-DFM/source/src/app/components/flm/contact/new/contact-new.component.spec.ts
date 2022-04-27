import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { ContactNewComponent } from './contact-new.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('ContactNewComponent', () => {
  let component: ContactNewComponent;
  let fixture: ComponentFixture<ContactNewComponent>;
  let contactService: ContactService;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;
  let phoneNoDebug: DebugElement;
  let emailAddressDebug: DebugElement;
  let officePhoneNoDebug: DebugElement;
  let cellPhoneNoDebug: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ContactService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContactNewComponent);
    component = fixture.componentInstance;
    contactService = fixture.debugElement.injector.get(ContactService);
    contactService.fetchInitNew().then(res => {
      spyOn(contactService, 'fetchInitNew').and.returnValue(
        Promise.resolve(res)
      );
    });

    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('ページタイトルが正しく表示されること', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      titleDebug = fixture.debugElement.query(By.css('.KBA-page-title'));
      titleEl = titleDebug.nativeElement;
      expect(titleEl.innerHTML).toEqual('連絡先管理　登録');
    });
  }));

  it('代表の入力項目が表示、一般の入力項目は非表示となっていること', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      phoneNoDebug = fixture.debugElement.query(
        By.css('input[name="phone_no"]')
      );
      emailAddressDebug = fixture.debugElement.query(
        By.css('input[name="email_address"]')
      );
      officePhoneNoDebug = fixture.debugElement.query(
        By.css('input[name="office_phone_no"]')
      );
      cellPhoneNoDebug = fixture.debugElement.query(
        By.css('input[name="cell_phone_no"]')
      );

      expect(phoneNoDebug).toBeTruthy();
      expect(emailAddressDebug).toBeFalsy();
      expect(officePhoneNoDebug).toBeFalsy();
      expect(cellPhoneNoDebug).toBeFalsy();
    });
  }));
});
