import { TestBed, inject } from '@angular/core/testing';

import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceService],
    });
  });

  it('サービスが作成されること', inject(
    [ResourceService],
    (service: ResourceService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('正しくparse処理ができていること', inject(
    [ResourceService],
    (service: ResourceService) => {
      const mock = {
        search_name: {
          help: '氏名のヘルプ文言',
          name: '氏名',
          type: 10,
          placeholder_text: 'プレースホルダ',
          values: [],
        },
      };

      const res = service.parse({
        resources: [
          {
            path: 'search_name',
            name: '氏名',
            help: '氏名のヘルプ文言',
            type: 10,
            placeholder_text: 'プレースホルダ',
            items: [],
          },
        ],
      });
      expect(res).toEqual(mock);
    }
  ));
});
