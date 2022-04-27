import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'app-map-route',
  templateUrl: './map-route.component.html',
  styleUrls: ['./map-route.component.scss'],
})
export class MapRouteComponent {
  @Input() labels;
  @Input() geocoderEnabled;
  @Input() currentAddress;
  @Input() loading;
  @Input() set showGuide(val) {
    this._showGuide = val;
    this.ref.detectChanges();
    this.showGuideChange.emit(val);
  }
  get showGuide() {
    return this._showGuide;
  }

  @Output() searchFromPresentLocation: EventEmitter<never> = new EventEmitter();
  @Output() searchFromInputLocation: EventEmitter<string> = new EventEmitter();
  @Output() searchFromClickedPoint: EventEmitter<never> = new EventEmitter();
  @Output() closeMapRoute: EventEmitter<never> = new EventEmitter();
  @Output() back: EventEmitter<never> = new EventEmitter();
  @Output() showGuideChange: EventEmitter<boolean> = new EventEmitter();

  inputLocation: string;
  _showGuide: boolean;

  get showSpinner() {
    return this.showGuide && this.loading;
  }

  constructor(private ref: ChangeDetectorRef) {}

  /**
   * 現在地からのルートを表示ボタン押下時のコールバック
   */
  onClickRouteFromPresentLocation() {
    this.showGuide = true;
    this.searchFromPresentLocation.emit();
  }

  /**
   * 現在地を入力確定ボタン押下時のコールバック
   */
  onClickRouteFromInputLocation() {
    this.showGuide = true;
    this.searchFromInputLocation.emit(this.inputLocation);
  }

  /**
   * クリック地点からのルートを表示ボタン押下時のコールバック
   */
  onClickRouteFromClickedPoint() {
    this.showGuide = true;
    this.searchFromClickedPoint.emit();
  }

  /**
   * 閉じるボタン押下時のコールバック
   */
  onClickCloseMapRoute() {
    this.showGuide = false;
    this.closeMapRoute.emit();
  }

  /**
   * 戻るボタン押下時のコールバック
   */
  onClickBack() {
    this.showGuide = false;
    this.back.emit();
  }
}
