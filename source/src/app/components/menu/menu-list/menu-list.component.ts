import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Navigation } from 'app/types/navigation';

@Component({
    selector: 'app-menu-list',
    templateUrl: './menu-list.component.html'
})
export class MenuListComponent implements OnInit, OnDestroy {

    @Output() public orderChanged: EventEmitter<void> = new EventEmitter<void>();

    private readonly NAV_WIDTH = 255;
    private readonly MARGIN = 20;

    constructor(
        private navigationService: NavigationService,
        private ref: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        window.addEventListener('resize', this._detectChanges);
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this._detectChanges);
    }

    public get wrapperWidth(): { width: string } {
        return {
            width: `${Math.floor((window.innerWidth - this.MARGIN) / this.NAV_WIDTH) *
                this.NAV_WIDTH}px`,
        };
    }

    public get navigationsMenu(): Navigation[] | null {
        return this.navigationService.navigationsMenu;
    }

    public onDragEnd(event: Event): void {
        const ref = this.navigationService.navigationsMenu;

        this.navigationService.saveNavigationOrder(ref);
        this.orderChanged.emit();
    }

    /**
     * EventListener で識別するための detectChanges() のラッパ
     */
    private _detectChanges = (): void => {
        this.ref.detectChanges();
    };
}

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html',
})
export class MenuItemComponent {
    @Input() item: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    public handleClick(link: string): void {
        this.router.navigated = false;
        this.router.navigateByUrl(link);
    }

}
