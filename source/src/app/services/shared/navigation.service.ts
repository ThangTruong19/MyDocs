import { Injectable } from '@angular/core';
import { chain, xor } from 'lodash';
import { Navigation } from 'app/types/navigation';
import { environment } from 'environments/environment';
import { StorageService, StorageObject } from 'app/services/shared/storage.service';

@Injectable()
export class NavigationService {
    public navigationsMenu: Navigation[] | null = null;
    public navigationsSideMenu: Navigation[] | null = null;

    private storage: StorageObject;
    private storageKey = 'app-navigation';
    private orderKey = 'order';

    constructor(storageService: StorageService) {
        this.storage = storageService.createStorage(this.storageKey);
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

        const order: string[] = ref.map(nav => nav.code);

        this.storage.set(this.orderKey, order);
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
        const storageData = this.storage.get(this.orderKey);

        if (storageData == null) {
            return null;
        }

        return storageData;
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
            this.storage.delete(this.orderKey);
            return navigations;
        }

        return chain(order)
            .map(key => navigations.find(nav => key === nav.code))
            .compact()
            .value();
    }

    /**
     * 並び順としてセーブされているナビゲーションとAPIで取得したナビゲーションとに
     * 項目数やコードの食い違いがあるかの判定
     * @param order ナビゲーションの並び順
     * @param navigations 並べ替えられる前のナビゲーション
     * @return true 食い違いがある / false 食い違いがない
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
