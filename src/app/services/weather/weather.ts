import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ForecastResponse, WeatherData } from '../../models/weather.model';
import { GeoCodingResponse } from '../../models/geoCoding.model';
import { getWeatherDescription, getWeatherIcon } from '../../utils/weather-icon.util';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly forecastUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<WeatherData> {

    const geocodingParams = {
      name: city,
      count: '1',
      language: 'fr',
      format: 'json',
    };
//Convertir la ville entrée en coordonnées via geocoding

    return this.http
      .get<GeoCodingResponse>(this.geocodingUrl, { params: geocodingParams })
      .pipe(
        switchMap((geoResponse) => {
          if (!geoResponse.results || geoResponse.results.length === 0) {
            return throwError(() => new Error('Ville introuvable'));
          }

          const location = geoResponse.results[0];

          const forecastParams = {
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min',
            timezone: 'auto', 
            forecast_days: '7', 
          };
//Recuperer les weatherData a l'aide des coordonnées

          return this.http
            .get<ForecastResponse>(this.forecastUrl, { params: forecastParams })
            .pipe(
              map((forecast): WeatherData => ({
                city: location.name,
                country: location.country,
                temperature: Math.round(forecast.current.temperature_2m),
                windSpeed: Math.round(forecast.current.wind_speed_10m),
                humidity: forecast.current.relative_humidity_2m,
                weatherCode: forecast.current.weather_code,
                description: getWeatherDescription(forecast.current.weather_code),
                daily: forecast.daily.time.map((date,i) =>({
                  date,
                  weatherCode: forecast.daily.weather_code[i],
                  description: getWeatherIcon(forecast.daily.weather_code[i]),
                  tempMax: Math.round(forecast.daily.temperature_2m_max[i]),
                  tempMin: Math.round(forecast.daily.temperature_2m_min[i]),
                }))
              }))
            );
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }


}