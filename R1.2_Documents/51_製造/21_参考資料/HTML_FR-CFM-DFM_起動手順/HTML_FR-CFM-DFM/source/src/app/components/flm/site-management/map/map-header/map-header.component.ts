import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-map-header',
  templateUrl: './map-header.component.html',
  styleUrls: ['./map-header.component.scss'],
})
export class MapHeaderComponent implements OnInit, OnDestroy {
  @Input() labels;
  @Input() resource;
  @Input() userSettingParams: { [path: string]: boolean } = {};

  @Output() saveMapOptions: EventEmitter<never> = new EventEmitter();
  @Output() toggleDisplayLandmarks: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleDisplayBondAreas: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleDisplayUserSettingBoundParams: EventEmitter<{
    path: string;
    value: boolean;
  }> = new EventEmitter();

  displayPulldownVisible = false;
  optionPulldownVisible = false;

  displayLandmarks = false;
  displayBondAreas = false;

  carCaptionResourcePaths = [
    'model_type_serial_caption_display_kind',
    'customer_car_no_caption_display_kind',
    'customer_label_caption_display_kind',
  ];
  landmarkCaptionResourcePaths = ['landmark_label_caption_display_kind'];

  ngOnInit() {
    document.addEventListener('click', this.closePulldownHandler);
    this.carCaptionResourcePaths = this.carCaptionResourcePaths.filter(
      path => this.resource[path] != null
    );
    this.landmarkCaptionResourcePaths = this.landmarkCaptionResourcePaths.filter(
      path => this.resource[path] != null
    );
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closePulldownHandler);
  }

  /**
   * 表示のプルダウンを開閉する
   * @param event イベント
   */
  toggleDisplayPulldown(event) {
    event.stopPropagation();
    this.optionPulldownVisible = false;
    this.displayPulldownVisible = !this.displayPulldownVisible;
  }

  /**
   * オプションのプルダウンを開閉する
   * @param event イベント
   */
  toggleOptionPulldown(event) {
    event.stopPropagation();
    this.displayPulldownVisible = false;
    this.optionPulldownVisible = !this.optionPulldownVisible;
  }

  /**
   * マップの設定を保存する押下時のコールバック
   */
  onClickSaveMapOptions() {
    this.saveMapOptions.emit();
  }

  /**
   * ランドマークの表示切り替え時のコールバック
   */
  onClickDisplayLandmarks() {
    this.displayLandmarks = !this.displayLandmarks;
    this.toggleDisplayLandmarks.emit(this.displayLandmarks);
  }

  /**
   * 保税エリアの表示切り替え時のコールバック
   */
  onClickDisplayBondAreas() {
    this.displayBondAreas = !this.displayBondAreas;
    this.toggleDisplayBondAreas.emit(this.displayBondAreas);
  }

  /**
   * ユーザ設定に紐づく要素切り替えののコールバック
   * @param path リソースのパス
   */
  onClickDisplayUserSettingBoundParams(path: string) {
    this.userSettingParams[path] = !this.userSettingParams[path];
    this.toggleDisplayUserSettingBoundParams.emit({
      path,
      value: this.userSettingParams[path],
    });
  }

  /**
   * プルダウンを閉じる
   */
  closePulldownHandler = () => {
    this.displayPulldownVisible = false;
    this.optionPulldownVisible = false;
  };
}
