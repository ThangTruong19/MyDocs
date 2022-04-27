import { Component, OnInit, ElementRef, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit {
  @Input() data: {
    data: number[];
    color: string;
  }[] = [];
  @Input() columns: (string | number)[] = [];
  @Input() max?: number;

  hostElement: HTMLElement;
  graphElement: HTMLElement;
  graphStyle: {
    width: string;
    height: string;
  };

  constructor(elRef: ElementRef) {
    this.hostElement = elRef.nativeElement;
  }

  ngOnInit() {
    this.graphElement = <HTMLElement>this.hostElement.querySelector('.graph');
    this._drawGraph();
  }

  /**
   * グラフを描画する
   */
  private _drawGraph() {
    {
      Highcharts.chart(this.graphElement, {
        chart: {
          type: 'column',
        },
        title: {
          text: '',
        },
        xAxis: {
          categories: this.columns,
          labels: {
            step: 1,
          },
        },
        yAxis: {
          max: this.max,
          title: {
            text: '',
          },
        },
        tooltip: {
          headerFormat: '',
          pointFormat:
            '<span style="border-color:{point.color}">{point.y:.2f}</span>',
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
          series: {
            stacking: 'normal',
          },
        },
        legend: {
          enabled: false,
        },
        series: this.data,
        credits: {
          enabled: false,
        },
      });
    }
  }
}
