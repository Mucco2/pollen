import { Component } from '@angular/core';
<<<<<<< HEAD
import { PollenChartComponent } from './pollen-chart.component';
=======
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
>>>>>>> 9d7a384cd4338c776a4e20dca261b7bcd36f29ee

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
