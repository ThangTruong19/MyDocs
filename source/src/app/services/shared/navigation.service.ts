import { Injectable } from '@angular/core';
import { chain, xor } from 'lodash';
import { Navigation } from 'app/types/navigation';
import { environment } from 'environments/environment';
import { StorageService } from 'app/services/shared/storage.service';

@Injectable()
export class NavigationService {

    public navigationsMenu: Navigation[] | null = null;
    public navigationsSideMenu: Navigation[] | null = null;

    //private storage: StorageObject;
   //  private storageKey = 'app-navigation';

    private navigationsMenuOrder: string[];

    /**
     * コンストラクタ
     */
    constructor(
        private storageService: StorageService
    ) {
       // this.storage = storageService.createStorage(this.storageKey);
    }

    /**
     * アプリケーション機能取得 API の戻り値からナビゲーションを作成します。
     * @param nav 画面 ID
     */
    public createNavigations(nav: {
        result_header: object;
        result_data: {
            functions: Navigation[];
        };
    }) {
        const functions: Navigation[] = nav.result_data.functions;
        const menu: Navigation = functions.find(
            (category: Navigation) => category.code === environment.settings.navigation.menu
        );
        const sideMenu: Navigation = functions.find(
            (category: Navigation) => category.code === environment.settings.navigation.sideMenu
        );

        this.navigationsMenu = this.omitEmpty(
            menu && menu.functions ? menu.functions : null
        );
        this.navigationsSideMenu = this.omitEmpty(
            sideMenu && sideMenu.functions ? sideMenu.functions : null
        );

        this.refresh();
    }

    /**
     * ナビゲーションのオブジェクトを破棄します。
     */
    public destroyNavigations(): void {
        this.navigationsMenu = null;
        this.navigationsSideMenu = null;
    }

    /**
     * ナビゲーションの並び順を localStorage に保存します。
     * @param ref 並び替えの元となるデータの参照
     */
    public saveNavigationOrder(ref: Navigation[] = this.navigationsMenu): void {
        if (!ref) {
            return;
        }

        const order: string[] = ref.map((nav: Navigation) => nav.code);
        let orderStr: string = null;
        if (order) {
            orderStr = JSON.stringify(order);
        }
        this.navigationsMenuOrder = order;

        this.storageService.setItem(StorageService.NAVIGATIONS_MENU_ORDER_KEY, orderStr);
    }

    /**
     * ナビゲーションを再構築します。
     */
    public refresh() {
        const order: string[] = this.loadNavigationOrder();

        this.navigationsMenu = this.constructNavigationsFromOrder(
            order,
            this.navigationsMenu
        );
        this.navigationsSideMenu = this.constructNavigationsFromOrder(
            order,
            this.navigationsSideMenu
        );
    }

    /**
     * ナビゲーションの並び順を localStorage から取得します。
     */
    private loadNavigationOrder(): string[] {
        if (this.navigationsMenuOrder) {
            return this.navigationsMenuOrder;
        }

        const orderStr: string = this.storageService.getItem(StorageService.NAVIGATIONS_MENU_ORDER_KEY);
        if (orderStr) {
            return JSON.parse(orderStr);
        } else {
            return null;
        }

    }

    /**
     * ナビゲーションの並び順からナビゲーションを構築します。
     * @param order ナビゲーションの並び順
     * @param navigations 並べ替えられる前のナビゲーション
     */
    private constructNavigationsFromOrder(
        order: string[],
        navigations: Navigation[]
    ): Navigation[] | null {
        if (!navigations) {
            return null;
        }

        if (order == null) {
            this.saveNavigationOrder();
            return navigations;
        }

        if (this.isNavigationChange(order, navigations)) {
            this.storageService.removeItem(StorageService.NAVIGATIONS_MENU_ORDER_KEY);
            return navigations;
        }

        return chain(order)
            .map(key => navigations.find(nav => key === nav.code))
            .compact()
            .value();
    }

    /**
     * 並び順としてセーブされているナビゲーションとAPIで取得したナビゲーションとに
     * 項目数やコードの差異があるかの判定
     * @param order ナビゲーションの並び順
     * @param navigations 並べ替えられる前のナビゲーション
     * @return true 差異がある / false 差異がない
     */
    private isNavigationChange(order: any, navigations: any): boolean {
        return xor(order, navigations.map((nav: any) => nav.code)).length > 0;
    }

    private omitEmpty(navigations: any) {
        if (navigations == null) {
            return null;
        }

        return navigations.filter((nav: any) => nav.functions.length);
    }

}
