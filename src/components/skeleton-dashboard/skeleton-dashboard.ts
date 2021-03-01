import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'skeleton-dashboard',
  templateUrl: 'skeleton-dashboard.html',
})
export class SkeletonDashboardComponent implements OnInit {

  @Input() public hasDataLoaded;
  public remainingDays: number;
  public daysText: string;
  public untilYourQuitDateText: string;

  public savedDollars: string;
  public savedCents: string;
  public savedText: string;
  public projectedText: string;
  public projectedLifeSavings: string;

  constructor() {
    // stub
  }

  public ngOnChanges(changes: SimpleChanges) {
    // stub
  }

  public ngOnInit() {
    // Setup default data

    this.remainingDays = 0;
    this.daysText = 'days';
    this.untilYourQuitDateText = 'until your quit date';
    this.savedDollars = '0';
    this.savedCents = '00';

    this.savedText = 'saved';
    this.projectedText = 'projected lifetime savings';
    this.projectedLifeSavings = '$100000';
  }
}
