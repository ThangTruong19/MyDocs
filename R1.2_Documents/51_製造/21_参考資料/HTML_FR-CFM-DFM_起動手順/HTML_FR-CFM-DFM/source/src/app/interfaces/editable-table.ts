export interface EditableTable {
  detailedly: boolean;
  updatable: boolean;
  deletable: boolean;

  /**
   * 詳細ボタン押下時の処理
   */
  onClickDetail(target: any);

  /**
   * 変更ボタン押下時の処理
   */
  onClickEdit(target: any);

  /**
   * 削除ボタン押下時の処理
   */
  onClickDelete(target: any);
}
