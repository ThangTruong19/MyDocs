import { Injectable } from '@angular/core';
import { unset, uniq, compact, filter, difference } from 'lodash';

@Injectable()
export class KbaStorageService {
  createStorage(storageKey: string): KbaStorageObject {
    return new KbaStorageObject(storageKey);
  }
}

export class KbaStorageObject {
  private cache: object = {};
  private keys: string[] = [];
  private masterKey: string;

  constructor(private storageKey: string) {
    this.masterKey = `_${this.storageKey}-keys`;

    const keysRaw = localStorage.getItem(this.masterKey);

    if (keysRaw == null) {
      localStorage.setItem(this.masterKey, '');
    } else {
      this.keys = compact(keysRaw.split(','));
    }
  }

  /**
   * localStorage に保存されているデータを取得します。
   * キャッシュにデータがある場合そちらを返します。
   * @param key データを特定するキー
   */
  get(key: string = null): any {
    if (key == null) {
      return this.getKeys();
    }

    if (this.cache[key] == null) {
      try {
        const str = localStorage.getItem(this._getKey(key));

        this.cache[key] = JSON.parse(str);
      } catch (e) {
        console.error(e);
        this.delete(key);
      }
    }

    return this.cache[key];
  }

  /**
   * ストレージに存在するキーの配列を取得します。
   */
  getKeys(): string[] {
    return this.keys;
  }

  /**
   * localStorage にデータを保存します。
   * @param key データを特定するキー
   * @param item 保存するデータ
   */
  set(key: string, item: any): void {
    const data = JSON.stringify(item);

    this.keys.push(key);
    this.keys = uniq(this.keys);
    localStorage.setItem(this._getKey(key), data);
    localStorage.setItem(this.masterKey, this.keys.join(','));
    this.cache[key] = item;
  }

  /**
   * localStorage およびキャッシュからデータを削除します。
   * @param key データを特定するキー
   */
  delete(key: string): void {
    unset(this.cache, key);
    this.keys = this.keys.filter(k => k !== key);
    localStorage.removeItem(this._getKey(key));
    localStorage.setItem(this.masterKey, this.keys.join(','));
  }

  /**
   * localStorage にデータを保存するためのキーを生成します。
   * @param key データを特定するキー
   */
  private _getKey(key: string): string {
    return `${this.storageKey}--${key}`;
  }
}
