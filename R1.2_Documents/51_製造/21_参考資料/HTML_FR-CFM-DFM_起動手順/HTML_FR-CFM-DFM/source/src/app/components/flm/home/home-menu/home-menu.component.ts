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
  @Output() orderChanged: EventEmitter<any> = new EventEmitter();
  private navWidth = 255;
  private margin = 20;

  get wrapperWidth() {
    return {
      width: `${Math.floor((window.innerWidth - this.margin) / this.navWidth) *
        this.navWidth}px`,
    };
  }

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
