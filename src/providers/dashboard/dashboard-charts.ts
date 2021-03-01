import { Injectable } from '@angular/core';
import { Logger } from '@pharma/pharma-component-utils';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { UserStore } from '../../stores/user.store';
import { DailyCaptureProvider } from '../daily-capture/daily-capture';
import { DashboardLogicProvider } from './dashboard-logic';

// tslint:disable:no-magic-numbers
@Injectable()
export class DashboardChartsProvider {
  public datasets;

  constructor(
    public logger: Logger,
    public dailyCapture: DailyCaptureProvider,
    public userStore: UserStore,
    public chartData: DashboardLogicProvider
  ) {}

  public makeLineChart() {
    const canvas = document.querySelector('#lineCanvas');
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, 'rgba(148, 194, 74, 0.9)');
    gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    const lineOptions = {
      responsive: true,
      animation: {
        duration: 0
      },
      maintainAspectRatio: true,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
              color: '#A8A7A7',
              tickMarkLength: 30
            },
            ticks: {
              autoSkip: false,
              maxTicksLimit: 7,
              maxRotation: 0,
              minRotation: 0
            }
          }
        ],
        yAxes: [
          {
            // only linear but allow scale type registration.
            // This allows extensions to exist solely for log scale for instance
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-0',
            gridLines: {
              display: false,
              color: '#A8A7A7'
            },
            ticks: {
              beginAtZero: true,
              padding: 12,
              suggestedMin: 0,
              suggestedMax: this.calcLifetimeSavingsGraphMinMax(),
              min: 0,
              max: this.calcLifetimeSavingsGraphMinMax(),
              stepSize: this.calcLifetimeSavingsGraphMinMax() / 10,
              callback: (value, index, values) => {
                value = value.toString();
                value = value.split(/(?=(?:...)*$)/);
                value = value.join(',');

                return value;
              }
            }
          }
        ]
      },
      legend: {
        display: false,
        labels: {
          usePointStyle: true
        },
        position: 'bottom'
      }
    };

    this.datasets = [
      {
        label: 'Dataset 1',
        borderColor: gradient,
        pointRadius: 8,
        pointHoverRadius: 8,
        pointBackgroundColor: '#1B8C92',
        borderWidth: 0.3,
        pointBorderColor: 'white',
        backgroundColor: gradient,
        data: this.getProjectedTwelveWeekSavings()
      }
    ];
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getProjectedLabels(),
        datasets: this.datasets
      },
      options: lineOptions
    });
  }

  public makeChart(dailyDataNo?: boolean) {
    // tslint:disable:cyclomatic-complexity

    Chart.helpers.drawRoundedTopRectangle = (
      ctx,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      // top right corner
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      // bottom right	corner
      ctx.lineTo(x + width, y + height);
      // bottom left corner
      ctx.lineTo(x, y + height);
      // top left
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    Chart.elements.RoundedTopRectangle = Chart.elements.Rectangle.extend({
      // tslint:disable-next-line:object-literal-shorthand
      draw: function() {
        const ctx = this._chart.ctx;
        const vm = this._view;

        let left: number;
        let right: number;
        let top: number;
        let bottom: number;
        let signX: number;
        let signY: number;
        let borderSkipped: string;
        let borderWidth: number = vm.borderWidth;

        if (!vm.horizontal) {
          // bar
          left = vm.x - vm.width / 2;
          right = vm.x + vm.width / 2;
          top = vm.y;
          bottom = vm.base;
          signX = 1;
          signY = bottom > top ? 1 : -1;
          borderSkipped = vm.borderSkipped || 'bottom';
        } else {
          // horizontal bar
          left = vm.base;
          right = vm.x;
          top = vm.y - vm.height / 2;
          bottom = vm.y + vm.height / 2;
          signX = right > left ? 1 : -1;
          signY = 1;
          borderSkipped = vm.borderSkipped || 'left';
        }
        // Canvas doesn't allow us to stroke inside the width so we can
        // adjust the sizes to fit if we're setting a stroke on the line
        if (borderWidth) {
          // borderWidth shold be less than bar width and bar height.
          const barSize = Math.min(
            Math.abs(left - right),
            Math.abs(top - bottom)
          );
          borderWidth = borderWidth > barSize ? barSize : borderWidth;
          const halfStroke = borderWidth / 2;
          // Adjust borderWidth when bar top position is near vm.base(zero).
          const borderLeft =
            left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
          const borderRight =
            right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
          const borderTop =
            top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
          const borderBottom =
            bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
          // not become a vertical line?
          if (borderLeft !== borderRight) {
            top = borderTop;
            bottom = borderBottom;
          }
          // not become a horizontal line?
          if (borderTop !== borderBottom) {
            left = borderLeft;
            right = borderRight;
          }
        }

        // calculate the bar width and roundess
        const barWidth = Math.abs(left - right);
        const roundness = this._chart.config.options.barRoundness || 0.5;
        const radius: number = barWidth * roundness * 0.5;

        // keep track of the original top of the bar
        const prevTop: number = top;

        // move the top down so there is room to draw the rounded top
        top = prevTop + radius;
        const barRadius = top - prevTop;

        ctx.beginPath();
        ctx.fillStyle = '#1b8c92';
        ctx.strokeStyle = vm.borderColor;
        ctx.lineWidth = borderWidth;

        // draw the rounded top rectangle
        Chart.helpers.drawRoundedTopRectangle(
          ctx,
          left,
          top - barRadius + 1,
          barWidth,
          bottom - prevTop,
          barRadius
        );

        ctx.fill();
        if (borderWidth) {
          ctx.stroke();
        }

        // restore the original top value so tooltips and scales still work
        top = prevTop;
      }
    });

    Chart.defaults.roundedBar = Chart.helpers.clone(Chart.defaults.bar);

    Chart.controllers.roundedBar = Chart.controllers.bar.extend({
      dataElementType: Chart.elements.RoundedTopRectangle
    });

    const canvas = document.querySelector('#barCanvas');
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    const yAxesConfig = this.getCigarettesPerDayChartConfig();

    const lineOptions = {
      responsive: true,
      barRoundness: 1,
      animation: {
        duration: 0
      },
      maintainAspectRatio: true,
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              tickMarkLength: 30,
              color: 'rgba(0, 0, 0, 0)'
            },
            ticks: {
              autoSkip: false,
              maxTicksLimit: 7,
              maxRotation: 0,
              minRotation: 0
            }
          }
        ],
        yAxes: [
          {
            // only linear but allow scale type registration.
            // This allows extensions to exist solely for log scale for instance
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-0',
            gridLines: {
              zeroLineColor: '#A8A7A7'
            },
            ticks: {
              beginAtZero: true,
              padding: 12,
              fontSize: yAxesConfig.fontSize,
              min: 0,
              max: yAxesConfig.maxSize,
              stepSize: yAxesConfig.stepSize
            }
          }
        ]
      },
      legend: {
        display: false,
        labels: {
          usePointStyle: true
        },
        position: 'bottom'
      }
    };

    this.datasets = [
      {
        label: 'Dataset 1',
        backgroundColor: '#232323',
        borderColor: '#FFFFFF',
        borderWidth: 1,
        data: this.getDailyCigarettes(dailyDataNo)
      }
    ];
    new Chart(ctx, {
      type: 'roundedBar',
      data: {
        labels: this.getWeekLabels(),
        datasets: this.datasets
      },
      options: lineOptions
    });
  }

  public getProjectedLabels(): string[] {
    return ['Wk 2', 'Wk 4', 'Wk 6', 'Wk 8', 'Wk 10', 'Wk 12'];
  }

  public getWeekLabels(): string[] {
    const SIX = 6;
    let i = 0;
    const weekLabels: string[] = [];
    for (i = 0; i <= SIX; i++) {
      weekLabels.push(
        moment
          .unix(moment().unix())
          .subtract(i, 'day')
          .format('ddd')
          .toUpperCase()
      );
    }
    weekLabels.reverse();

    return weekLabels;
  }

  /**
   * NNR-12 / BRK-014
   * Resize the y-axis on the Projected Lifetime Savings line graph to accommodate
   * totals over $1000
   * Checks each entry in this.getProjectedTwelveWeekSavings(), if one of the highest is between 0 - 1000, then 1000 is the max
   * if highest are between 1000 - 2000, then 2000 is the max etc
   *
   **/
  private calcLifetimeSavingsGraphMinMax() {

    const projSavings = this.getProjectedTwelveWeekSavings();

    let max = 1000;

    projSavings.map(sav => {
      if (sav <= max) {
        return max;
      } else {
        max += 1000;
      }
    });

    return max;
  }

  public getDailyCigarettes(dailyDataNo?: boolean): number[] {
    const SIX = 6; // week 0-6 days
    let i = 0;
    const dailyCigarettes: number[] = [];
    for (i = 0; i <= SIX; i++) {
      const day = moment
        .unix(moment().unix())
        .subtract(i, 'day')
        .format('YYYY-MM-DD');
      const cigarettesSmokedObject = this.dailyCapture.getCigarettesEnteredForDay(
        day,
        this.chartData.getCigarettesSmokedPerDay()
      );
      dailyCigarettes.push(cigarettesSmokedObject.cigarettesSmoked);
    }
    dailyCigarettes.reverse();

    return dailyCigarettes;
  }

  public getProjectedTwelveWeekSavings(): number[] {
    // two weeks worth of savings
    const costPerCigarette = this.chartData.getCostPerCigarette();
    let costSavings: number[] = [];

    const FOURTEEN_DAYS = 14;
    const TWELVE_WEEKS = 12;
    const startDate = this.userStore.user.startDate;
    let isFuture = false;
    // index for the day. Champix Start Date is considered position 0
    // and we count upwards
    let indexDate = moment(startDate);
    let totalForTwoWeekCycle = 0;
    let i; // index for week cycle counter (14 weeks)
    let j; // index for 14 day cycle

    for (i = 0; i <= TWELVE_WEEKS; ) {
      totalForTwoWeekCycle = 0;
      for (j = 0; j < FOURTEEN_DAYS; j++) {
        const date = indexDate.format('YYYY-MM-DD');
        indexDate = indexDate.add(1, 'day');

        if (moment(date).isSameOrBefore(moment())) {
          const cigarettesSmokedObject = this.dailyCapture.getCigarettesEnteredForDay(
            date,
            this.chartData.getCigarettesSmokedPerDay()
          );
          if (cigarettesSmokedObject.validDate) {
            if (
              cigarettesSmokedObject.cigarettesSmoked <
              this.chartData.getCigarettesSmokedPerDay()
            ) {
              totalForTwoWeekCycle +=
                cigarettesSmokedObject.cigarettesSmoked * costPerCigarette;
            } else {
              totalForTwoWeekCycle +=
                this.chartData.getCigarettesSmokedPerDay() *
                this.chartData.getCostPerCigarette();
            }
          }
        } else {
          isFuture = true;
          break;
        }
      }
      let savings;
      if (isFuture === false) {
        savings = totalForTwoWeekCycle;
        if (i !== 0) {
          savings += costSavings[costSavings.length - 1];
        }
      } else {
        // future datapoints will be less than 14 days worth of data or 0
        savings = totalForTwoWeekCycle;
        if (i !== 0) {
          savings += costSavings[costSavings.length - 1];
          if (isFuture && j === 0) {
            savings = 0;
          }
        }
      }
      costSavings.push(savings); // add previous value
      i += 2;
    }

    this.logger.log(`costSavings graph ${costSavings}`);

    costSavings = [];

    costSavings = [87.5, 185.4, 250.3, 503.6, 750.6, 1834.6];
    this.logger.log(`costSavings graph modded ${costSavings}`);

    return costSavings;
  }

  // Private

  /* Adjust chart sizing params according to cigs smoked per day */
  private getCigarettesPerDayChartConfig(): any {
    const cigarettesSmokedPerDay = this.chartData.getCigarettesSmokedPerDay();
    const response: any = { stepSize: 10, fontSize: 12, canvasHeight: 50 };

    if (cigarettesSmokedPerDay <= 10) {
      response.stepSize = 2;
      response.canvasHeight = 80;
      response.maxSize = 40;

      return response;
    }
    if (cigarettesSmokedPerDay <= 25) {
      response.stepSize = 5;
      response.maxSize = 70;

      return response;
    }
    if (cigarettesSmokedPerDay <= 100) {
      response.stepSize = 10;
      response.maxSize = 140;

      return response;
    }

    return response;
  }
}
