import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { flatten } from 'lodash';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import * as $ from 'jquery';
import { Navigation } from 'app/types/navigation';
import { NavigationService } from 'app/services/shared/navigation.service';

@Component({
    selector: 'app-sidemenu',
    templateUrl: './sidemenu.component.html',
    styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnDestroy {

    public readonly SIDE_MENU_ITEM = 'sideMenuItems';

    @Input() public isLoading: boolean;

    @Output() public orderChanged: EventEmitter<any> = new EventEmitter<any>();

    public subscription: Subscription = new Subscription();

    public isVisible = false;

    public get navigationsSideMenu(): Navigation[] | null {
        return this.navigationService.navigationsSideMenu;
    }

    public set navigationsSideMenu(nav: Navigation[] | null) {
        this.navigationService.navigationsSideMenu = nav;
    }

    constructor(
        private dragulaService: DragulaService,
        private navigationService: NavigationService
    ) {
        this.initMenuDragEvent();
    }

    /**
     * コンポーネント破棄時の処理を行う。
     */
    ngOnDestroy(): void {
        if (this.subscription && !this.subscription.closed) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * メニューのドラッグイベントの初期処理を行う。
     */
    private initMenuDragEvent(): void {
        // this.subscription.add(this.dragulaService.drag(this.SIDE_MENU_ITEM)
        //     .subscribe((value: { el: Element }) => {
        //     this.onDragStart(value.el);
        // }));
        this.subscription.add(this.dragulaService.dragend(this.SIDE_MENU_ITEM)
            .subscribe(() => {
                this.onDragEnd();
            })
        );
    }

    public onDragStart(el: Element): void {
        const targetElement: HTMLElement = <HTMLElement>el;
        const ghost: HTMLElement = <HTMLElement>targetElement.cloneNode(true);
        ghost.style.transform = 'translateX(1000px)';
        ghost.classList.add('app-sidemenu-ghost');
        targetElement.appendChild(ghost);

        targetElement.addEventListener('dragstart', (ev: DragEvent) => {
            ev.dataTransfer.setDragImage(ghost, 0, 0);
        });

    }

    public onDragEnd(): void {
        $('.app-sidemenu-ghost').remove();

        const ref: Navigation[] = this.navigationService.navigationsSideMenu;
        this.navigationService.saveNavigationOrder(ref);
        this.orderChanged.emit();
    }

    public toggleMenuVisible(): void {
        this.isVisible = !this.isVisible;
    }

}

@Component({
    selector: 'app-sidemenu-item',
    templateUrl: './sidemenu-item.component.html',
    styleUrls: ['./sidemenu.component.scss'],
})
export class SideMenuItemComponent {

    @Input() public item: Navigation;
    @Input() public isLoading: boolean;

    public isOpened = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    public toggleIsOpened(): void {
        this.isOpened = !this.isOpened;
    }

    public isActive(nav: Navigation): boolean {
        const path: string = flatten(
                this.route.pathFromRoot.map((route: ActivatedRoute) => (<any>route.url)['value'])
            )
            .map(urlSegment => urlSegment.path)
            .filter((val: string) => val.length)
            .join('/');

        const base: string = nav.options[0].value.split('/')
            .filter((val: string) => val.length)
            .join('/');

        return base === path;
    }

    public handleClick(link: string): void {
        this.router.navigated = false;
        this.router.navigateByUrl(link);
    }

}
