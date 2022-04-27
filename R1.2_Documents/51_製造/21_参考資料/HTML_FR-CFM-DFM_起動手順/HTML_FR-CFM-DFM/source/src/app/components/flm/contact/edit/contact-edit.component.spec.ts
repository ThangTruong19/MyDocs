import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactEditComponent } from './contact-edit.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('ContactEditComponent', () => {
  let component: ContactEditComponent;
  let fixture: ComponentFixture<ContactEditComponent>;
  let contactService: ContactService;
  let de: DebugElement;
  let el: HTMLElement;
  const id = '1';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactEditComponent],
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
    fixture = TestBed.createComponent(ContactEditComponent);
    component = fixture.componentInstance;
    contactService = fixture.debugElement.injector.get(ContactService);
    contactService.fetchEditInitData(id).then(res => {
      spyOn(contactService, 'fetchEditInitData').and.returnValue(
        Promise.resolve(res)
      );
    });
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    fixture.whenStable().then(() => {
      el = de.query(By.css('[name=contact_label]')).nativeElement;
      expect((<HTMLInputElement>el).value).toContain('コマツ');
    });
  });

  it('should display initial value after reset', () => {
    fixture.whenStable().then(() => {
      el = de.query(By.css('[name=contact_label]')).nativeElement;
      (<HTMLInputElement>el).value = '';

      de.query(By.css('a.btn')).nativeElement.click();
      de.query(By.css('.KBA-modal-body .btn-primary')).nativeElement.click();
      fixture.detectChanges();
      expect((<HTMLInputElement>el).value).toContain('コマツ');
    });
  });

  it('should update contact', () => {
    fixture.whenStable().then(() => {
      el = de.query(By.css('[name=phone_no]')).nativeElement;
      (<HTMLInputElement>el).value = '';
      el = de.query(By.css('[name=contact_label]')).nativeElement;
      (<HTMLInputElement>el).value = 'テスト';

      de.query(By.css('.btn-primary')).nativeElement.click();
      de.query(By.css('.KBA-modal-body .btn-primary')).nativeElement.click();
      fixture.detectChanges();
      expect(component.params.contact.represent_contact.label).toContain(
        'テスト'
      );
    });
  });
});
