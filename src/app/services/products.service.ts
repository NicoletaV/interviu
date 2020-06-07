import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const products_url = 'http://private-32dcc-products72.apiary-mock.com/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService { 

  constructor(private http: HttpClient) { }

  getProducts() {
    return this.http.get(products_url);
  }
}
