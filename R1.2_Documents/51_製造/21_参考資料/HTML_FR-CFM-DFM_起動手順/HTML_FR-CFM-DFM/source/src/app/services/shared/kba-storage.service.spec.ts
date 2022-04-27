import { TestBed, inject } from '@angular/core/testing';

import { KbaStorageService, KbaStorageObject } from './kba-storage.service';
import { isEqual } from 'lodash';

describe('KbaStorageService', () => {
  let service: KbaStorageService;
  let storage: KbaStorageObject;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KbaStorageService],
    });
  });

  beforeEach(inject([KbaStorageService], (s: KbaStorageService) => {
    service = s;
    storage = service.createStorage('test');
  }));

  afterEach(() => {
    storage.getKeys().forEach(key => {
      storage.delete(key);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be create storage', () => {
    expect(storage).toBeTruthy();
  });

  it('should set / get item', () => {
    const data = 'Dolore duis laborum ad ex laborum magna minim eiusmod id.';

    storage.set('test', data);
    expect(storage.get('test')).toBe(data);
  });

  it('should get keys', () => {
    storage.set('test1', 1);
    storage.set('test2', 1);
    storage.set('test3', 1);

    const keys = storage.getKeys();
    const test = (() => isEqual(keys, ['test1', 'test2', 'test3']))();

    expect(test).toBeTruthy();
  });

  it('should get item from localStorage', () => {
    const key = 'test';
    const data = { a: 1 };

    storage.set(key, data);
    storage['cache'] = {};

    const test = (() => isEqual(storage.get(key), data))();

    expect(test).toBeTruthy();
  });

  it('should delete item', () => {
    storage.set('test', 1);
    storage.delete('test');

    expect(storage.get('test')).toBeNull();
  });

  it('should delete method removes key', () => {
    storage.set('test1', 1);
    storage.set('test2', 1);
    storage.set('test3', 1);
    storage.delete('test1');

    const keys = storage.getKeys();
    const test = (() => isEqual(keys, ['test2', 'test3']))();

    expect(test).toBeTruthy();
  });
});
