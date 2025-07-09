import { Component } from '@angular/core';
<<<<<<< HEAD
import { PollenChartComponent } from './pollen-chart/pollen-chart.component';
=======
<<<<<<< HEAD
import { PollenChartComponent } from './pollen-chart.component';
=======
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
>>>>>>> 9d7a384cd4338c776a4e20dca261b7bcd36f29ee
>>>>>>> 93407307f9e0a982decb31978f21b8647a20c8ae

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
