import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnInit } from '@angular/core';
import { OperatorRegisterComponent } from './operator-register.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import * as _ from 'lodash';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-test-component',
  template: `
    <div *ngIf="!isLoading">
      <app-operator-register
        [labels]="labels"
        [resource]="resource"
        (registered)="onRegisterdOperator()"
      >
      </app-operator-register>
    </div>
  `,
})
class TestComponent implements OnInit {
  labels;
  resource;
  isLoading = true;

  constructor(private operatorService: OperatorService) {}

  ngOnInit() {
    this.operatorService.fetchOperatorInitData().then((res: any) => {
      this.labels = res.label.operatorIndex;
      this.resource = res.resource;
      this.isLoading = false;
    });
  }
}

describe('OperatorRegisterComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let operatorService: OperatorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, OperatorRegisterComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        OperatorService,
        KbaModalService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    operatorService = fixture.debugElement.injector.get(OperatorService);
    fixture.detectChanges();
  }));

  it('should be created', async(() => {
    fixture.whenStable().then(() => {
      expect(component).toBeTruthy();
    });
  }));
});
