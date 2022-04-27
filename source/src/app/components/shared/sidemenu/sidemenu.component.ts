import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigation } from 'app/types/navigation';
import { NavigationService } from 'app/services/shared/navigation.service';
import { flatten } from 'lodash';
import * as $ from 'jquery';

@Component({
    selector: 'app-sidemenu',
    templateUrl: './sidemenu.component.html',
    styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent {

    @Output() public orderChanged: EventEmitter<any> = new EventEmitter<any>();
    @Input() public isLoading: boolean;

    public isVisible = false;

    public get navigationsSideMenu(): Navigation[] | null {
        return this.navigationService.navigationsSideMenu;
    }

    constructor(private navigationService: NavigationService) { }

    public toggleMenuVisible($event: Event): void {
        this.isVisible = !this.isVisible;
    }

    public onDragStart(event: Event): void {
        const targetElement: HTMLElement = <HTMLElement>event.target;
        const ghost: HTMLElement = <HTMLElement>targetElement.cloneNode(true);
        ghost.style.transform = 'translateX(1000px)';
        ghost.classList.add('app-sidemenu-ghost');
        targetElement.appendChild(ghost);

        targetElement.addEventListener('dragstart', (ev: DragEvent) => {
            ev.dataTransfer.setDragImage(ghost, 0, 0);
        });

    }

    public onDragEnd($event: Event): void {
        $('.app-sidemenu-ghost').remove();

        const ref = this.navigationService.navigationsSideMenu;
        this.navigationService.saveNavigationOrder(ref);
        this.orderChanged.emit();
    }

}

@Component({
    selector: 'app-sidemenu-item',
    templateUrl: './sidemenu-item.component.html',
    styleUrls: ['./sidemenu.component.scss'],
})
export class SideMenuItemComponent {
    operations: object;
    public isOpened = false;

    @Input() item: any;

    @Input() isLoading: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    public toggleIsOpened(): void {
        this.isOpened = !this.isOpened;
    }

    public isActive(nav: any): boolean {
        const path: string = flatten(
            this.route.pathFromRoot.map((route: any) => route.url['value'])
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
