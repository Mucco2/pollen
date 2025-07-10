import { Component } from '@angular/core';
import { PollenChartComponent } from './pollen-chart/pollen-chart.component';
@Component({
  selector: 'my-app',
  standalone: true,
  imports: [PollenChartComponent],
  template: `
    <h1>Pollental i Danmark 🌿</h1>
    <pollen-chart></pollen-chart>
  `
})
export class AppComponent {}
