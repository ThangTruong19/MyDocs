import { ComponentFixture, TestBed } from '@angular/core/testing';
import { async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ValuesPipe } from '../../../pipes/values.pipe';
import { KbaModalComponent } from './kba-modal.component';

describe('KbaModalComponent', () => {
  let comp: KbaModalComponent;
  let fixture: ComponentFixture<KbaModalComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const labels = {
    close: '閉じる',
    ok_btn: 'OK',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaModalComponent, ValuesPipe],
      providers: [{ provide: NgbActiveModal }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaModalComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('h1'));
    el = de.nativeElement;
  });

  it('should be created', () => {
    expect(comp).toBeTruthy();
  });

  it('should display title', () => {
    comp.title = 'テストタイトル';
    comp.labels = labels;
    fixture.detectChanges();
    expect(el.textContent).toContain(comp.title);
  });
});
