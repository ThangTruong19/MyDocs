import { Injectable } from '@angular/core';

import { Api, ApiId } from '../../types/common';

import { ApiService } from '../api/api.service';

@Injectable()
export class KbaFileUploadService {
  constructor(private api: ApiService) {}

  /**
   * ファイルアップロードリクエスト
   *
   * ファイルアップロードAPIを実行
   * タイプでリクエストURLのパスおよびフォームのアップロードファイル名を指定する
   *
   * @param path アップロード先のパス
   * @param file アップロードするファイル
   * @param json ファイルアップロード時に送信するJSON
   * @param opt オプション
   * @return 応答本文
   */
  upload(apiId: ApiId, file: File, json: string, screenCode?: string): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'uploadFile',
        this.api
          .uploadFile(apiId, file, json, screenCode)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }
}
