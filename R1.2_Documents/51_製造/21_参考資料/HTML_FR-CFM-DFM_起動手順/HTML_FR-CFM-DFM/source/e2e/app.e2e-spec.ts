import { NgkNewKbaPage } from './app.po';

describe('KMT_NGK_NEWKBA App', () => {
  let page: NgkNewKbaPage;

  beforeEach(() => {
    page = new NgkNewKbaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
