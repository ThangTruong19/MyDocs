import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Mode } from '../../../../../constants/flm/site-management';

@Component({
  selector: 'app-index-header',
  templateUrl: './index-header.component.html',
  styleUrls: ['./index-header.component.scss'],
})
export class IndexHeaderComponent {
  query = '';

  @Input() layout: string;
  @Input() resource;
  @Input() queryMaxLength: number;
  @Output() queryChanged: EventEmitter<string> = new EventEmitter();
  @Output() layoutChanged: EventEmitter<string> = new EventEmitter();
  @Output() customerIDSelected: EventEmitter<string> = new EventEmitter();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  /**
   * 画面を切り替える
   * @param mode 画面名
   */
  setMode(mode: string) {
    this.router.navigate(['site-management', this._getModeText(mode)]);
  }

  /**
   * 対応する画面が表示されているかを判定する
   * @param mode 画面名
   */
  isModeActive(mode: string) {
    let currentURL: string;
    this.activatedRoute.url.subscribe(
      urlSegments => (currentURL = urlSegments.join('/'))
    );
    return new RegExp(`${this._getModeText(mode)}$`).test(currentURL);
  }

  /**
   * モードに対応するラベルを取得する
   * @param mode モード
   */
  getModeLabel(mode: string) {
    if (this.resource == null) {
      return '';
    }

    return this.resource.mode.values.find(value => value.value === mode).name;
  }

  /**
   * レイアウトを切り替えのコールバック
   * @param layout レイアウト名
   */
  setLayout(layout: string) {
    this.layout = layout;
    this.layoutChanged.emit(layout);
  }

  /**
   * 指定されたレイアウトが有効であるかを判定する
   * @param layout レイアウト
   */
  isLayoutActive(layout: string) {
    return this.layout === layout;
  }

  /**
   * 検索ワード変更時のコールバック
   * @param value 検索ワード
   */
  onQueryChange(value) {
    this.queryChanged.emit(value);
  }

  /**
   * 顧客ID選択時のコールバック
   * @param value 顧客ID
   */
  onSelectCustomerId(value) {
    this.customerIDSelected.emit(value);
  }

  /**
   * モードに対応する文字列をする
   * @param mode モード
   */
  private _getModeText(mode: string) {
    switch (mode) {
      case Mode.area:
        return 'area';
      case Mode.site:
        return 'site';
    }
  }
}
