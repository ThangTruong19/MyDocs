/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, Input, OnInit } from '@angular/core';

/**
 * 全選択破棄確認
 * @author van-lan
 */
@Component({
  selector: 'app-input-data-all-cancel-confirm',
  templateUrl: './input-data-all-cancel-confirm.component.html',
  styleUrls: ['./input-data-all-cancel-confirm.component.scss']
})
export class InputDataAllCancelConfirmComponent implements OnInit {
  @Input() public labels: Object;
  constructor() { }

  ngOnInit(): void {
  }

}
