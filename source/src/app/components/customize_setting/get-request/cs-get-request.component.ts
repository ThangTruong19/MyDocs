import { Component, Input, OnInit } from '@angular/core';

/**
 * カスタマイズ設定取得要求
 */
@Component({
  selector: 'app-cs-get-request',
  templateUrl: './cs-get-request.component.html',
  styleUrls: ['./cs-get-request.component.scss']
})
export class CsGetRequestComponent implements OnInit {
  @Input()
  public labels: Object;

  constructor() { }

  ngOnInit(): void {alert('ok?');
  }

}
