export interface WeatherData  {
  city: string;
  country: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  description: string;
  weatherCode: number;
  daily: DailyForecast[]
}

export interface ForecastResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}
  export interface DailyForecast {
  date: string;
  weatherCode: number;
  description: string;
  tempMax: number;
  tempMin: number;

}