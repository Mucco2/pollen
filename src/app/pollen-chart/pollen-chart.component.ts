import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import type { ChartOptions, ChartData } from 'chart.js';


@Component({
  selector: 'pollen-chart',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './pollen-chart.component.html', // Bruger ekstern HTML-fil
  styleUrls: ['./pollen-chart.component.css']   // Bruger ekstern CSS-fil
})
export class PollenChartComponent implements OnInit {
getCategoryDescription(arg0: unknown) {
throw new Error('Method not implemented.');
}

  locationDateText = 'Henter data for Hvidovre...';
  errorMessage = '';

  chartType: 'bar' = 'bar';

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Pollental (grains/m³)' }
      },
      x: {
        title: { display: true, text: 'Pollentyper' }
      }
    },
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Pollental',
        data: [],
        backgroundColor: [],
        borderColor: '#00000022',
        borderWidth: 1,
      }
    ]
  };

  // GPS-koordinater for Hvidovre
  private hvidovreLocation = {
    latitude: 55.65,
    longitude: 12.47
  };
categoryColors: ReadonlyMap<unknown, unknown> | undefined;

  async ngOnInit() {
    await this.fetchAndDisplayPollenData();
  }

  private async fetchAndDisplayPollenData() {
    const pollenTyper = "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen";
    const API_URL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${this.hvidovreLocation.latitude}&longitude=${this.hvidovreLocation.longitude}&hourly=${pollenTyper}&domains=cams_europe`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Kunne ikke hente data fra Open-Meteo serveren.');

      const data = await response.json();

      if (!data.hourly) throw new Error('API-data mangler \'hourly\' felter');

      this.processPollenData(data.hourly);

    } catch (err: any) {
      this.errorMessage = `Kunne ikke hente pollental. Fejl: ${err.message}`;
      this.locationDateText = 'Hvidovre';
    }
  }

  private getCategoryFromValue(value: number) {
    if (value <= 1) return "Low";
    if (value <= 50) return "Moderate";
    if (value <= 200) return "High";
    return "Very High";
  }

  private processPollenData(hourlyData: any) {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const nowISO = now.toISOString().slice(0, 16);

    const timeIndex = hourlyData.time.findIndex((t: string) => t === nowISO);
    if (timeIndex === -1) {
      this.errorMessage = 'Kunne ikke finde pollental for den nuværende time.';
      return;
    }

    this.locationDateText = `Hvidovre - Viser tal for kl. ${now.getHours()}:00`;

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    const colorMap = {
      'Low': '#34D399',
      'Moderate': '#FBBF24',
      'High': '#F97316',
      'Very High': '#EF4444'
    };

    // Udvælg pollen-typer og værdier
    for (const pollenType in hourlyData) {
      if (pollenType !== 'time') {
        const value = hourlyData[pollenType][timeIndex];
        if (value > 0) {
          const displayName = pollenType.replace('_pollen', '').replace(/^\w/, c => c.toUpperCase());
          const category = this.getCategoryFromValue(value);
          labels.push(displayName);
          data.push(Math.round(value));
          backgroundColor.push(colorMap[category] || '#3B82F6');
        }
      }
    }

    if (labels.length === 0) {
      this.errorMessage = 'Ingen pollen i luften lige nu. God dag!';
      return;
    }

    this.chartData.labels = labels;
    this.chartData.datasets[0].data = data;
    this.chartData.datasets[0].backgroundColor = backgroundColor;
    this.errorMessage = '';
  }
}
