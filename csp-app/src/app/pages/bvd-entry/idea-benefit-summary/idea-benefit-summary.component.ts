import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-idea-benefit-summary',
  templateUrl: './idea-benefit-summary.component.html',
  styleUrls: ['./idea-benefit-summary.component.scss']
})


export class IdeaBenefitSummaryComponent implements OnInit {
  //optionValue;
  constructor() { }

  ngOnInit() {
  }
  displayedColumns: string[] = ['currentState','futureState','savingsperMonth','savingsperYear','netBenefit'];
  dataSource = benefitSummaryData;

 
}

export interface benefitSummary {
  currentState: string;
  futureState: string;
  savingsperMonth: string;
  savingsperYear: string;
  netBenefit : string
}



const benefitSummaryData :  benefitSummary[] = [

  {currentState: '$ 80',futureState:'$ 100',savingsperMonth:'$ 4',savingsperYear:'$ 24',netBenefit:'$ 200'},

  {currentState: '$ 80',futureState:'$ 100',savingsperMonth:'$ 4',savingsperYear:'$ 24',netBenefit:'$ 200'},

  {currentState: '$ 80',futureState:'$ 100',savingsperMonth:'$ 4',savingsperYear:'$ 24',netBenefit:'$ 200'},
]
