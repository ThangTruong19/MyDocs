import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import Cropper from 'cropperjs';
import { TrimmingData } from '../../../../../types/flm/contact';
import { KbaAbstractModalComponent } from '../../../../shared/kba-abstract-component/kba-abstract-modal-compoenent';

@Component({
  selector: 'app-photo-modal-content',
  templateUrl: './photo-modal.component.html',
  styleUrls: ['./photo-modal.component.scss'],
})
export class PhotoModalComponent extends KbaAbstractModalComponent
  implements OnInit {
  @ViewChild('imageContainer', { static: true }) imageElementRef: ElementRef;
  @Input() fileName: string;
  @Input() imageSrc: string;
  @Input() url: string;
  @Input() imageSize: { width: number; height: number };
  @Input() labels: any;
  @Input() minimumLimit;
  @Input() submit: (TrimmingData) => void;

  cropper: Cropper;
  cropWidth = 228;
  cropHeight = 304;
  containerWidth = 600;
  containerHeight = 400;
  cropperBaseOptions = {
    aspectRatio: this.cropWidth / this.cropHeight,
    center: false,
    checkOrientation: false,
    viewMode: 2,
    autoCropArea: 1,
    dragMode: 'none',
    rotatable: false,
    zoomOnTouch: false,
    zoomOnWheel: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    movable: false,
    guides: false,
    restore: false,
    highlight: false,
    toggleDragModeOnDblclick: false,
  };

  constructor(activeModal: NgbActiveModal) {
    super(activeModal);
  }

  ngOnInit() {
    const cropperOptions = _.merge(
      {},
      this.cropperBaseOptions,
      this._getCropBoxMinOption()
    );
    const image = this.imageElementRef.nativeElement;
    image.onload = () => {
      if (this.cropper == null) {
        this.cropper = new Cropper(image, cropperOptions);
      }
    };
  }

  /**
   * 登録ボタン押下コールバック
   */
  onClickSubmit() {
    const data = this.cropper.getData(true);
    const croppedImage = this.cropper.getCroppedCanvas();
    this.submit({
      image: croppedImage,
      trimData: {
        base_point_x: String(data.x < 0 ? 0 : data.x),
        base_point_y: String(data.y < 0 ? 0 : data.y),
        width: String(data.width),
        height: String(data.height),
      },
    });
    this._close('submit');
    setTimeout(() => {
      URL.revokeObjectURL(this.url);
    }, 500);
  }

  /**
   * 閉じるボタン押下コールバック
   */
  onClickClose() {
    this._close('close');
    setTimeout(() => {
      URL.revokeObjectURL(this.url);
    }, 500);
  }

  /**
   * トリミング領域最小サイズを画像の拡大・縮小率に合わせて変換したものを取得
   * @return 変換後トリミング領域最小サイズ
   */
  private _getCropBoxMinOption() {
    let cropperRatio: number;
    if (
      this.containerWidth / +this.imageSize.width <
      this.containerHeight / +this.imageSize.height
    ) {
      cropperRatio = this.containerWidth / +this.imageSize.width;
    } else {
      cropperRatio = this.containerHeight / +this.imageSize.height;
    }

    if (
      this.cropWidth / +this.minimumLimit.min_width <
      this.cropHeight / +this.minimumLimit.min_height
    ) {
      return { minCropBoxWidth: +this.minimumLimit.min_width * cropperRatio };
    } else {
      return { minCropBoxHeight: +this.minimumLimit.min_height * cropperRatio };
    }
  }
}
