import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule, KeyValuePipe } from '@angular/common'; // Tilføjet KeyValuePipe for *ngFor på objects
import type { ChartOptions, ChartData } from 'chart.js';

@Component({
  selector: 'pollen-chart',
  standalone: true,
  imports: [NgChartsModule, CommonModule, KeyValuePipe], // KeyValuePipe tilføjet
  template: `
    <div class="pollen-chart-wrapper">
      <h1>Pollen tal i Danmark 🌿</h1>
      <p id="location-date" class="location-date">{{ locationDateText }}</p>

      <div class="chart-container">
        <canvas baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="chartType"
          height="450"  width="600">
        </canvas>
      </div>

      <footer>
        <p>&copy; 2025 Pollen App</p>
        <p>Data leveret af <a href="https://open-meteo.com/" target="_blank">Open-Meteo</a></p>
        <div class="pollen-footer-info">
          <h3>Forstå pollentallet</h3>
          <p>Pollentallet måles i grains/m³ og indikerer mængden af pollen i luften. Jo højere tal, desto flere symptomer kan du opleve, især hvis du er pollenallergiker.</p>
          <p>Farverne i grafen og detaljerne hjælper dig med at vurdere niveauet:</p>
          <ul>
            <li *ngFor="let category of categoryColors | keyvalue">
              <span class="legend-color-box" [style.background-color]="category.value"></span>
              {{ category.key }}: {{ getCategoryDescription(category.key) }}
            </li>
          </ul>
          <p>Hold dig opdateret og tag dine forholdsregler!</p>
        </div>
      </footer>

      <p id="error-message" class="error-message" *ngIf="errorMessage">{{ errorMessage }}</p>
    </div>
  `,
  // CSS SKAL VÆRE I 'styles' ARRAY'ET, IKKE INDE I 'template'
  
})
export class PollenChartComponent implements OnInit {

  locationDateText = 'Henter data for Hvidovre...';
  errorMessage = '';

  chartType: 'bar' = 'bar';

  // Forbedret chartOptions
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Vigtigt for at Chart.js respekterer dine højde/bredde indstillinger bedre
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pollental (grains/m³)',
          font: {
            size: 14, // Større font
            weight: 'bold'
          },
          color: '#555'
        },
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)' // Lysere gitterlinjer
        }
      },
      x: {
        title: {
          display: true,
          text: 'Pollentyper',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#555'
        },
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false // Fjern lodrette gitterlinjer for et renere look
        }
      }
    },
    plugins: {
      legend: {
        display: false, // Skjuler standardlegenden, da vi laver vores egen
      },
      tooltip: { // Tilføjer mere detaljerede tooltips
        callbacks: {
          label: function(this: PollenChartComponent, context: import('chart.js').TooltipItem<'bar'>) {
            let label = context.dataset.label || '';
            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(context.parsed.y) + ' grains/m³';
            }
            const category = this.getCategoryFromValue(context.parsed.y as number);
            label += ` (${category})`;
            return label;
          }.bind(this), // Binding er nødvendig for at 'this' refererer til komponenten
        }
      }
    },
    // Tilføjer animerede effekter for et federe look
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Pollental',
        data: [],
        backgroundColor: [],
        borderColor: '#ffffff55', // Mere transparent border
        borderWidth: 2, // Lidt tykkere border
        borderRadius: 4, // Afrundede hjørner på søjlerne
        hoverBackgroundColor: '#007bffaa', // Farve ved hover
        hoverBorderColor: '#007bff',
      }
    ]
  };

  // Kortlægning af kategorifarver for legenden
  categoryColors = {
    'Low': '#34D399',
    'Moderate': '#FBBF24',
    'High': '#F97316',
    'Very High': '#EF4444'
  };

  // GPS-koordinater for Hvidovre
  private hvidovreLocation = {
    latitude: 55.65,
    longitude: 12.47
  };

  async ngOnInit() {
    await this.fetchAndDisplayPollenData();
  }

  private async fetchAndDisplayPollenData() {
    const pollenTyper = "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen";
    const API_URL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${this.hvidovreLocation.latitude}&longitude=${this.hvidovreLocation.longitude}&hourly=${pollenTyper}&domains=cams_europe`;

    try {
      this.locationDateText = 'Henter de seneste pollental for Hvidovre...';
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Kunne ikke hente data fra Open-Meteo serveren: ${response.statusText}`);

      const data = await response.json();

      if (!data.hourly) throw new Error('API-data mangler \'hourly\' felter.');

      this.processPollenData(data.hourly);

    } catch (err: any) {
      this.errorMessage = `Fejl ved indlæsning af pollental: ${err.message}`;
      this.locationDateText = 'Hvidovre'; // Vis stadig lokation ved fejl
      this.chartData.labels = []; // Sørg for at rydde diagrammet ved fejl
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[0].backgroundColor = [];
    }
  }

  private getCategoryFromValue(value: number): string {
    if (value <= 1) return "Low";
    if (value <= 50) return "Moderate";
    if (value <= 200) return "High";
    return "Very High";
  }

  // Ny metode til at hente billeder baseret på pollentype
  getPollenImage(pollenType: string): string {
    const imageName = pollenType.toLowerCase().replace(' ', '');
    // Antager, at du har billeder i 'assets/pollen-icons/' mappen
    // F.eks. assets/pollen-icons/alder.png
    switch (imageName) {
      case 'alder': return 'assets/pollen-icons/alder.png';
      case 'birch': return 'assets/pollen-icons/birch.png';
      case 'grass': return 'assets/pollen-icons/grass.png';
      case 'mugwort': return 'assets/pollen-icons/mugwort.png';
      case 'ragweed': return 'assets/pollen-icons/ragweed.png';
      default: return 'assets/pollen-icons/default.png'; // Et standardbillede
    }
  }

  // Ny metode til at give en beskrivelse af hver kategori
  getCategoryDescription(category: string): string {
    switch (category) {
      case 'Low': return 'Meget lavt pollental. Få eller ingen symptomer.';
      case 'Moderate': return 'Moderat pollental. Milde symptomer kan forekomme.';
      case 'High': return 'Højt pollental. Symptomer er sandsynlige, især for allergikere.';
      case 'Very High': return 'Meget højt pollental. Kraftige symptomer er forventet.';
      default: return '';
    }
  }

  private processPollenData(hourlyData: any) {
    const now = new Date();
    now.setMinutes(0, 0, 0); // Sæt til hel time for at matche API'ens timestempler
    const nowISO = now.toISOString().slice(0, 16);

    const timeIndex = hourlyData.time.findIndex((t: string) => t === nowISO);

    let dataToProcessIndex = timeIndex;
    if (dataToProcessIndex === -1) {
        // Hvis den præcise aktuelle time ikke findes, find den seneste tilgængelige
        const lastIndex = hourlyData.time.length - 1;
        if (lastIndex >= 0) {
            dataToProcessIndex = lastIndex;
            const latestTime = new Date(hourlyData.time[lastIndex]);
            this.locationDateText = `Hvidovre - Viser tal for kl. ${latestTime.getHours()}:00 (Seneste tilgængelige data)`;
            this.errorMessage = 'Kunne ikke finde pollental for den præcise aktuelle time. Viser seneste tilgængelige data.';
        } else {
            this.errorMessage = 'Ingen data tilgængelig for pollental.';
            this.chartData.labels = [];
            this.chartData.datasets[0].data = [];
            this.chartData.datasets[0].backgroundColor = [];
            return;
        }
    } else {
        this.locationDateText = `Hvidovre - Viser tal for kl. ${now.getHours()}:00`;
    }

    this.fillChartData(hourlyData, dataToProcessIndex);
  }

  private fillChartData(hourlyData: any, timeIndex: number) {
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    for (const pollenType in hourlyData) {
      if (pollenType !== 'time') {
        const value = hourlyData[pollenType][timeIndex];
        // Inkluderer kun pollen med en positiv værdi.
        // Hvis du ønsker at vise pollenarter, der er 0, fjern da 'if (value > 0)'
        if (value > 0) {
          const displayName = pollenType.replace('_pollen', '').replace(/^\w/, c => c.toUpperCase());
          const category = this.getCategoryFromValue(value);
          labels.push(displayName);
          data.push(Math.round(value));
          backgroundColor.push(this.categoryColors[category as keyof typeof this.categoryColors] || '#3B82F6');
        }
      }
    }

    if (labels.length === 0) {
      this.errorMessage = 'Ingen pollen er registreret i luften lige nu. Nyd dagen!';
      this.chartData.labels = []; // Ryd diagramdata
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[0].backgroundColor = [];
    } else {
      this.chartData.labels = labels;
      this.chartData.datasets[0].data = data;
      this.chartData.datasets[0].backgroundColor = backgroundColor;
      this.errorMessage = ''; // Ryd fejlbesked, hvis data er hentet
    }
  }
}