import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { flatten } from 'lodash';
import * as $ from 'jquery';

@Component({
  selector: 'app-kba-sidemenu',
  templateUrl: './kba-sidemenu.component.html',
  styleUrls: ['./kba-sidemenu.component.scss'],
})
export class KbaSidemenuComponent {
  isVisible = false;

  @Output() orderChanged: EventEmitter<any> = new EventEmitter();
  @Input() isLoading: boolean;

  constructor(private navigationService: KbaNavigationService) {}

  get navigationsSideMenu() {
    return this.navigationService.navigationsSideMenu;
  }

  toggleMenuVisible($event): void {
    this.isVisible = !this.isVisible;
  }

  onDragStart($event) {
    const ghost = $event.srcElement.cloneNode(true);
    ghost.style.transform = 'translateX(1000px)';
    ghost.classList.add('kba-sidemenu-ghost');
    $event.srcElement.parentNode.appendChild(ghost);
    $event.dataTransfer.setDragImage(ghost, 0, 0);
  }

  onDragEnd($event) {
    $('.kba-sidemenu-ghost').remove();

    const ref = this.navigationService.navigationsSideMenu;
    this.navigationService.saveNavigationOrder(ref);
    this.orderChanged.emit();
  }
}

@Component({
  selector: 'app-kba-sidemenu-item',
  templateUrl: './kba-sidemenu-item.component.html',
  styleUrls: ['./kba-sidemenu.component.scss'],
})
export class KbaSideMenuItemComponent {
  operations: object;
  isOpened = false;

  @Input() item: object;
  @Input() isLoading: boolean;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  toggleIsOpened() {
    this.isOpened = !this.isOpened;
  }

  isActive(nav) {
    const path = flatten(
      this.route.pathFromRoot.map(route => route.url['value'])
    )
      .map(urlSegment => urlSegment.path)
      .filter((val: string) => val.length)
      .join('/');

    const base = nav.options[0].value.split('/')
      .filter((val: string) => val.length)
      .join('/');

    return base === path;
  }

  handleClick(link: string) {
    this.router.navigated = false;
    this.router.navigateByUrl(link);
  }
}
