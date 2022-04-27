export class CautionIcon {
  /**
   * コーション用のアイコンフォントを取得する
   */
  iconFont(icon_font_no: string): string {
    return ('00' + icon_font_no).slice(-2);
  }
}
