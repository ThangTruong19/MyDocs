import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';

@Component({
  selector: 'app-kba-menu',
  templateUrl: './home-menu.component.html',
  styleUrls: ['./home-menu.component.css'],
})
export class KbaHomeMenuComponent implements OnDestroy {
  @Input() wrapperWidth;
  @Output() orderChanged: EventEmitter<any> = new EventEmitter();

  get navigationsMenu() {
    return this.navigationService.navigationsMenu;
  }

  constructor(
    private navigationService: KbaNavigationService,
    private ref: ChangeDetectorRef
  ) {
    window.addEventListener('resize', this._detectChanges);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this._detectChanges);
  }

  onDragEnd($event) {
    const ref = this.navigationService.navigationsMenu;

    this.navigationService.saveNavigationOrder(ref);
    this.orderChanged.emit();
  }

  /**
   * EventListener で識別するための detectChanges() のラッパ
   */
  private _detectChanges = () => {
    this.ref.detectChanges();
  };
}

@Component({
  selector: 'app-kba-menu-item',
  templateUrl: './home-menu-item.component.html',
  styleUrls: ['./home-menu.component.css'],
})
export class KbaHomeMenuItemComponent {
  @Input() item;
}

@Component({
  selector: 'app-kba-home-notice',
  templateUrl: './home-notice.component.html',
})
export class KbaHomeNoticeComponent {
  @Input() labels;
  @Input() notifications;
}

@Component({
  selector: 'app-kba-home-trademark',
  templateUrl: './home-trademark.component.html',
})
export class KbaHomeTradeComponent {
  @Input() labels;
}
