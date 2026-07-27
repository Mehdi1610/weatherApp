import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';
import { WeatherService } from '../../../services/weather/weather';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { getWeatherIcon } from '../../../utils/weather-icon.util';

@Component({
  selector: 'app-home',
  imports: [FormsModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  cityInput = '';
  isLoading = signal(false);
  errorMessage = signal('');
  showDays = signal(true);

  private readonly weatherService = inject(WeatherService);
  private searchSubject = new Subject<string>();

  weatherData = toSignal(
    this.searchSubject.pipe(
      tap(() => {
        this.errorMessage.set('');
        this.showDays.set(true); 
      }),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((city: string) => {
        if (!city.trim()) {
          this.isLoading.set(false);
          return of(null);
        }
        this.isLoading.set(true);
        return this.weatherService.getWeather(city).pipe(
          tap(() => this.isLoading.set(false)),
          catchError(() => {
            this.errorMessage.set('Ville introuvable');
            this.isLoading.set(false);
            return of(null);
          })
        );
      })
    ),
    { initialValue: null }
  );

  onCityInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  toggleDays(): void {
    this.showDays.update((v) => !v);
  }

  getIcon(code: number): string {
    return getWeatherIcon(code);
  }
}