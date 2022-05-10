import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cs-input-data-cancel-confirm',
  templateUrl: './cs-input-data-cancel-confirm.component.html',
  styleUrls: ['./cs-input-data-cancel-confirm.component.scss']
})
export class CsInputDataCancelConfirmComponent implements OnInit {
  @Input()
  public labels: Object;

  constructor() { }

  ngOnInit(): void {
  }

}
