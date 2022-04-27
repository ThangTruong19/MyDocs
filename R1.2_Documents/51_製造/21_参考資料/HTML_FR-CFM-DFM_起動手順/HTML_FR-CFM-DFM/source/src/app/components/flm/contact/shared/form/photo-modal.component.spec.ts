import { ComponentFixture, TestBed } from '@angular/core/testing';
import { async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../../../../../modules/shared/kba-common.module';
import { PhotoModalComponent } from './photo-modal.component';

describe('PhotoModalComponent', () => {
  let component: PhotoModalComponent;
  let fixture: ComponentFixture<PhotoModalComponent>;
  let modalService: NgbActiveModal;
  let cropper: any;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;
  let fileNameDebug: DebugElement;
  let fileNameEl: HTMLElement;
  let submitDebug: DebugElement;
  let submitEl: HTMLInputElement;
  const labels = {
    trimming_modal_title: 'トリミング',
    cancel: 'キャンセル',
    submit: '登録',
  };
  const imageSize = { width: 1280, height: 960 };
  const minimumLimit = { min_width: '480', min_height: '640' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PhotoModalComponent],
      imports: [KbaCommonModule],
      providers: [NgbActiveModal],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoModalComponent);
    component = fixture.componentInstance;
    modalService = TestBed.get(NgbActiveModal);
    component.fileName = 'test_file.jpg';
    component.imageSrc = 'a';
    component.submit = () => {};
    cropper = { getData: null, getCroppedCanvas: null };
    spyOn(component, '_close');
    spyOn(cropper, 'getData').and.returnValue({
      x: 10,
      y: 20,
      width: 200,
      height: 300,
    });
    spyOn(cropper, 'getCroppedCanvas').and.returnValue('aaaaa');
    spyOn(component, 'submit');
    titleDebug = fixture.debugElement.query(By.css('h1'));
    titleEl = titleDebug.nativeElement;
    fileNameDebug = fixture.debugElement.query(By.css('p.image-header'));
    fileNameEl = fileNameDebug.nativeElement;
    submitDebug = fixture.debugElement.query(By.css('.submit'));
    submitEl = submitDebug.nativeElement;
    component.labels = labels;
    component.imageSize = imageSize;
    component.minimumLimit = minimumLimit;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture.detectChanges();
    expect(titleEl.textContent).toContain('トリミング');
  });

  it('画像ファイル名が正しく表示されること', () => {
    expect(fileNameEl.textContent).toContain('test_file.jpg');
  });

  describe('登録ボタンについて', () => {
    it('トリミング情報をもとに処理がおこなわれること', () => {
      component.imageSrc = 'aaaaaaaaaa';
      component.cropper = cropper;
      fixture.detectChanges();
      submitDebug.triggerEventHandler('click', null);
      expect(component.submit).toHaveBeenCalledWith({
        image: 'aaaaa',
        trimData: {
          base_point_x: '10',
          base_point_y: '20',
          width: '200',
          height: '300',
        },
      });
      expect(component['_close']).toHaveBeenCalled();
    });
  });
});
