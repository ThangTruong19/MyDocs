import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCarSearchComponent } from './kba-car-search.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

@Component({
  selector: 'app-test',
  template: `
    <app-kba-car-search
      [activeTab]="activeTab"
      [modelCarTypeCheck]="modelCarTypeCheck"
      [labels]="labels"
      [resource]="resource"
      [params]="params"
    >
    </app-kba-car-search>
  `,
})
class TestComponent {
  activeTab = 'targetCar';
  modelCarTypeCheck = false;
  resource = {
    common: { support_distributor: {} },
    car_management: { time_difference_setting: { values: [] } },
  };
  labels = {};
  params = { common: { support_distributor: {} }, car_management: {} };
}

describe('KbaCarSearchComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [KbaCommonModule, NgbModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
