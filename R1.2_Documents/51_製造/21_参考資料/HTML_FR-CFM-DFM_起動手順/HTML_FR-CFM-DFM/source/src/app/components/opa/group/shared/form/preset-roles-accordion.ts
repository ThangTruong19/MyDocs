interface PresetRole {
  group_kind_id: string;
  authorities: {
    id: string;
    default_kind: string;
  }[];
}

/**
 * 配下グループの権限選択アコーディオンを管理するオブジェクト
 */
export class PresetRolesAccordion {
  accordionHeight = {
    btn: 63,
    header: 34,
    row: 52,
  };
  isOpened = false;
  get height(): string {
    const height =
      this.accordionHeight.btn +
      (this.role.authorities.length ? this.accordionHeight.header : 0) +
      this.accordionHeight.row * this.role.authorities.length;

    return height + 'px';
  }

  constructor(private role: PresetRole) {}
}
