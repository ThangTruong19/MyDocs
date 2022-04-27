import {
  async,
  ComponentFixture,
  TestBed,
  inject,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { KbaAlertComponent } from './kba-alert.component';
import { KbaAlertModule } from '../../../modules/shared/kba-alert.module';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { environment } from '../../../../environments/environment';

describe('KbaAlertComponent', () => {
  let component: KbaAlertComponent;
  let fixture: ComponentFixture<KbaAlertComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaAlertModule],
      providers: [KbaAlertService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show message', () => {
    component['alertService'].show('test message');
    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('.alert'));
    el = de.nativeElement;
    expect(el.textContent).toContain('test message');
  });

  it('should reflect alert type', () => {
    component['alertService'].show('test message', false, 'danger');
    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('.alert'));
    el = de.nativeElement;
    expect(el.className).toContain('alert-danger');
  });

  it('should disappears automatically', fakeAsync(() => {
    component['alertService'].show('test message', false);
    tick(environment.settings.notificationDisplayTime * 3);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-alert-messages'));
      el = de.nativeElement;
      expect(window.getComputedStyle(el).opacity).toBe('0');
    });
  }));

  it('should not disappears automatically if "manual" is true', fakeAsync(() => {
    component['alertService'].show('test message', true);
    tick(environment.settings.notificationDisplayTime * 3);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-alert-messages'));
      el = de.nativeElement;
      expect(window.getComputedStyle(el).opacity).toBe('1');
    });
  }));

  it('can close manually', () => {
    component['alertService'].show('test message', true);
    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('.close'));
    el = de.nativeElement;
    el.click();
    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('.KBA-alert-messages'));
    el = de.nativeElement;
    expect(el.className).toContain('faded');
  });
});
