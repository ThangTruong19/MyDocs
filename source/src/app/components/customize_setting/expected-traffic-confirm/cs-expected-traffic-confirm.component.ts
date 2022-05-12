import { Component, Input, OnInit } from '@angular/core';
import { TableHeader } from 'app/types/common';

@Component({
  selector: 'app-cs-expected-traffic-confirm',
  templateUrl: './cs-expected-traffic-confirm.component.html',
  styleUrls: ['./cs-expected-traffic-confirm.component.scss']
})
export class CsExpectedTrafficConfirmComponent implements OnInit {
  @Input()
  public inputData: any[];
  @Input()
  public labels: Object;
  @Input()
  public initThLst: TableHeader[];

  dataTable1: any[];
  dataTable2: any[];

  constructor() { }

  ngOnInit(): void {
    console.log('Table data: ' + JSON.stringify(this.inputData));
    console.log("Data Length: " + this.inputData.length);
    // TODO: Setting data for the 2 table (Q&A)
    this.dataTable1 = this.inputData.slice(0,6);
    this.dataTable2 = this.inputData.slice(6);

  }

}
