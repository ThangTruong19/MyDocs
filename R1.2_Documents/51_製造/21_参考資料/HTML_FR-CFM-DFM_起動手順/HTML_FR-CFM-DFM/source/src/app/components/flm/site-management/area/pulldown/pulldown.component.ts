import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Resource, ResourceValue } from '../../../../../types/common';

@Component({
  selector: 'app-pulldown',
  templateUrl: './pulldown.component.html',
  styleUrls: ['./pulldown.component.scss'],
})
export class PulldownComponent implements OnInit, OnDestroy {
  @Input() set resourceItem(item) {
    this.resource = item;
    this.selectedItem = item.values[0];
    this.select.emit(this.selectedItem.value);
  }

  @Output() select: EventEmitter<string> = new EventEmitter();

  selectedItem: ResourceValue;
  pulldownVisible = false;
  resource: Resource;

  ngOnInit() {
    document.addEventListener('click', this.handleClickOthers);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOthers);
  }

  /**
   * トリガーボタンクリック時のコールバック
   * @param event クリックイベント
   */
  handleClickTrigger(event: MouseEvent) {
    event.stopPropagation();

    this.pulldownVisible = !this.pulldownVisible;
  }

  /**
   * 項目選択時のコールバック
   * @param event クリックイベント
   * @param item 選択肢
   */
  onSelectItem(event: MouseEvent, item: ResourceValue) {
    if (item === this.selectedItem) {
      event.stopPropagation();
      return;
    }

    this.selectedItem = item;
    this.select.emit(item.value);
  }

  /**
   * プルダウンの外をクリックした時のコールバック
   */
  handleClickOthers = () => {
    this.pulldownVisible = false;
  };
}
