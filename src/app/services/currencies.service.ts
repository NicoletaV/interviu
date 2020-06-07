import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const currency_rates_url = 'http://data.fixer.io/api/latest?access_key=bb540433bf623720dfb8ba40dd366e0b';


@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {

  constructor(private http: HttpClient) { }

  getCurrencyRates() {
    return this.http.get(currency_rates_url);
  }
}
