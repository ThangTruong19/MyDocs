/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, Input, OnInit } from '@angular/core';

/**
 * 選択破棄確認
 * @author van-lan
 */
@Component({
  selector: 'app-input-data-cancel-confirm',
  templateUrl: './input-data-cancel-confirm.component.html',
  styleUrls: ['./input-data-cancel-confirm.component.scss']
})
export class InputDataCancelConfirmComponent implements OnInit {
  @Input() public labels: Object;
  constructor() { }

  ngOnInit(): void {
  }

}
