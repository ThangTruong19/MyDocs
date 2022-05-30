import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cd-request-number-select-list',
  templateUrl: './cd-request-number-select-list.component.html',
  styleUrls: ['./cd-request-number-select-list.component.scss']
})
export class CdRequestNumberSelectListComponent implements OnInit {
    @Input() data: any;
    @Input() thList: any;
    @Input() labels: any;
    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };
    sortingParams = {
        sort: '',
        sortLabel: '',
    }

  constructor() { }

  ngOnInit(): void {
    console.log(this.data);
    this.lists.originList = this.data;
    this.lists.visibleList = this.lists.originList;

  }

}
