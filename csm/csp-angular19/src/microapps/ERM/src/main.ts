import { bootstrapApplication } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

Chart.register(...registerables, ChartDataLabels);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
