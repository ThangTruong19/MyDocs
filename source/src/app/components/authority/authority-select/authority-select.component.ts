import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { chain, includes, cloneDeep, isEmpty, uniq } from 'lodash';
import { ModalService } from 'app/services/shared/modal.service';

@Component({
  selector: 'app-authority-select',
  templateUrl: './authority-select.component.html',
  styleUrls: ['./authority-select.component.scss']
})
export class AuthoritySelectComponent  {
  @ViewChild('authoritySelectModalContent', { static: false })
  authoritySelectModalContent: TemplateRef<null>;

  @Input() customHeader: TemplateRef<any>;
  @Input() customContent: TemplateRef<any>;
  @Input() authorities: any[];
  @Input() labels: any;
  @Input() defaultAuthorities: any[] = [];
  @Input() selectedAuthorities: any[] = [];
  @Input() resource: any;
  @Input() data: any;
  @Input() accessLevel: any;
  @Input() customSelectButtons: any;
  @Input() customSelectedAuthorities: any;
  @Input() allowUnselectedAuthorities = false;
  @Output() select: EventEmitter<any> = new EventEmitter<any>();
  @Output() open: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  evacuateSelectedAuthorities: any[] = [];

  constructor(private modalService: ModalService) {}

  /**
  * 権限チェック
  * @param value チェックされた権限コード
  */
  authorityChecked(value: any):void {
    if (includes(this.evacuateSelectedAuthorities, value)) {
      this.evacuateSelectedAuthorities.splice(
        this.evacuateSelectedAuthorities.indexOf(value),
        1
      );
    } else {
      this.evacuateSelectedAuthorities.push(value);
    }
    this.modalService.enableOk = this.isValid();
  }

  /**
  * 権限全選択/解除
  * @param selectedAuthorities チェックの対象権限
  */
  toggleCheckAll(selectedAuthorities: any):void {
    this.evacuateSelectedAuthorities = cloneDeep(selectedAuthorities);
    this.modalService.enableOk = this.isValid();
  }

  /**
   * 選択ボタン押下時のコールバック
   */
  onClickSelect():void {
    const size_lg = 'lg'

    if (isEmpty(this.defaultAuthorities)) {
      this.evacuateSelectedAuthorities = cloneDeep(this.selectedAuthorities);
    } else {
      this.evacuateSelectedAuthorities = uniq(
        this.selectedAuthorities.concat(this.defaultAuthorities)
      );
    }

    this.open.emit();
    this.modalService.open({
      title: this.labels.select_modal_title,
      labels: this.labels,
      content: this.authoritySelectModalContent,
      okBtnLabel: this.labels.reflect_btn,
      enableOk: this.isValid(),
      closeBtnLabel: this.labels.cancel || this.labels.close,
      ok: () => {
        this.selectedAuthorities = this.getAuthorities(
          this.evacuateSelectedAuthorities
        ).map(item => item.value);
        this.select.emit(this.selectedAuthorities);
      },
      close: () => this.close.emit(),
    }, {
      size: size_lg,
    });
  }

  /**
   * チェックボックスのチェック
   */
  isValid(): boolean {
    return (
      this.allowUnselectedAuthorities ||
      !isEmpty(this.evacuateSelectedAuthorities)
    );
  }

  /**
   * 選択済みタグの x ボタン押下時の処理
   * @param value 選択済みタグに紐づけられた 値
   */
  onClickRemoveTag(value: any):void {
    this.selectedAuthorities = this.selectedAuthorities.filter(
      item => item !== value
    );
    this.evacuateSelectedAuthorities = cloneDeep(this.selectedAuthorities);
  }

    /**
   * アイテムの取得
   * @param items アイテム
   * @param value 値
   */
  getItem(items: any[], value: string): any {

    const index = items.findIndex(i => i.value === value);
    const item = items[index];

    return {
      ...item,
      index,
    };
  }

  /**
   * セレクトボックスのリセット
   */
  reset():void {
    this.selectedAuthorities.length = 0;
    this.evacuateSelectedAuthorities.length = 0;
  }

  /**
   * 権限の名称取得
   *
   * 値に対応する名前を取得する。
   *
   * @param value 値
   */
  getAuthorities(values: string[]): any[] {
    return chain(values)
      .reduce((array, val) => {
        const { name, value, index } = this.getItem(this.authorities, val);
        array.push({
          name,
          value,
          index,
        });
        return array;
      }, [])
      .orderBy('index')
      .value();
  }

  /**
   * 選択内容を params 用に整形して返します。
   */
  getSelectedParam(): string[] {
    return this.selectedAuthorities;
  }
}
