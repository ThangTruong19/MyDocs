import { Client } from '@microsoft/microsoft-graph-client';

export const msGraphApi = 'https://graph.microsoft.com';
const endpoint = '/me';

/**
 * MicrosoftGraph Client のメソッドやプロパティを隠蔽し、
 * AzureAdAuthentication で扱いやすいようにして提供する。
 */
export class GraphClientProvider {
  private client: Client;

  constructor(accessToken: string) {
    this.client = this.getClient(accessToken);
  }

  /**
   * Microsoft Graph Client は、 es6-promise の Promise を使用しているため、
   * ネイティブの Promise とは型が合わない。
   * ここでネイティブの Promise に置き換える。
   */
  getUserAttribute(params: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client
        .api(endpoint)
        .select(params as [string]) // Microsoft Graph Client の型定義にキャスト
        .get()
        .then(value => resolve(value))
        .catch(error => reject(error));
    });
  }

  /**
   * テストでの stub 差し替え用
   */
  getClient(accessToken: string): Client {
    return Client.init({
      authProvider: done => {
        done(null, accessToken);
      },
    });
  }
}
