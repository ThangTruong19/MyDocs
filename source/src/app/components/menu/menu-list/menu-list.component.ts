import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { Navigation } from 'app/types/navigation';
import { NavigationService } from 'app/services/shared/navigation.service';

/**
 * 管理メニュー
 */
@Component({
    selector: 'app-menu-list',
    templateUrl: './menu-list.component.html'
})
export class MenuListComponent implements OnInit, OnDestroy {

    @Output() public orderChanged: EventEmitter<void> = new EventEmitter<void>();

    private readonly NAV_WIDTH = 255;
    private readonly MARGIN = 20;

    public readonly MENU_ITEM = 'menuItems';

    public subscription: Subscription = new Subscription();

    /**
     * メニューの横幅サイズ
     */
    public get wrapperWidth(): { width: string } {
        return {
            width: `${Math.floor((window.innerWidth - this.MARGIN) / this.NAV_WIDTH) *
                this.NAV_WIDTH}px`,
        };
    }

    /**
     * メニューの一覧情報
     */
    public get navigationsMenu(): Navigation[] | null {
        return this.navigationService.navigationsMenu;
    }

    public set navigationsMenu(nav: Navigation[] | null) {
        this.navigationService.navigationsMenu = nav;
    }

    /**
     * コンストラクタ
     */
    constructor(
        private dragulaService: DragulaService,
        private navigationService: NavigationService,
        private ref: ChangeDetectorRef
    ) {
        this.initMenuDragEvent();
    }

    /**
     * コンポーネント初期化時の処理を行う。
     */
    ngOnInit(): void {
        window.addEventListener('resize', this.detectChanges);
    }

    /**
     * コンポーネント破棄時の処理を行う。
     */
    ngOnDestroy(): void {
        window.removeEventListener('resize', this.detectChanges);

        if (this.subscription && !this.subscription.closed) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * メニューのドラッグイベントの初期処理を行う。
     */
    private initMenuDragEvent(): void {
        this.dragulaService.createGroup(this.MENU_ITEM, {
            direction: 'horizontal'
        });
        this.subscription.add(this.dragulaService.dragend(this.MENU_ITEM)
            .subscribe(() => {
              this.onDragEnd();
            })
        );
    }

    /**
     * メニュー位置入れ入れ替え後の処理を行う。
     */
    public onDragEnd(): void {
        const ref: Navigation[] = this.navigationService.navigationsMenu;
        this.navigationService.saveNavigationOrder(ref);
        this.orderChanged.emit();
    }

    /**
     * EventListener で識別するための detectChanges() のラッパ
     */
    private detectChanges(): void {
        if (this.ref) {
            this.ref.detectChanges();
        }
    }
}

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html',
})
export class MenuItemComponent {

    @Input() item: any;

    /**
     * コンストラクタ
     */
    constructor(
        private router: Router
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    /**
     * メニュー項目押下時の処理を行う。
     * @param menuUrl メニュー項目のURL
     */
    public handleClick(menuUrl: string): void {
        this.router.navigated = false;
        this.router.navigateByUrl(menuUrl);
    }

}
