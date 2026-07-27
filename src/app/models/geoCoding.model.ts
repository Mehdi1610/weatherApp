export interface GeoCodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface GeoCodingResponse {
    results? : GeoCodingResult[];
} 