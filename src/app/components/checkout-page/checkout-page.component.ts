import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { CurrenciesService } from 'src/app/services/currencies.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(private productsService: ProductsService, private currenciesService: CurrenciesService) { }

  products: any = [];
  checkout_products: any = [];
  cart_products: any = [];
  total_price: any = 0;

  currency_rates: any = [];
  selectedCurrency: any = {};

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.productsService.getProducts().toPromise()
      .then((data) => {
        this.products = data;
        this.products.sort(this.compareByPrice);
        this.checkout_products = this.products;
        this.cart_products = [];
        this.getCurrencyRates();
      })
      .catch((err) => {
        console.log(err);
      })
  }

  compareByPrice(a, b) {
    if (a.price < b.price) {
      return 1;
    }

    if (a.price > b.price) {
      return -1;
    }

    return 0;
  }

  getCurrencyRates() {
    this.currenciesService.getCurrencyRates().toPromise()
      .then((data: any) => {
        var rates = JSON.parse(JSON.stringify(data.rates));
        this.currency_rates.push({ name: 'USD', value: rates.USD });
        this.currency_rates.push({ name: 'EUR', value: rates.EUR });
        this.currency_rates.push({ name: 'GBP', value: rates.GBP });
        this.currency_rates.push({ name: 'RON', value: rates.RON });
        this.selectedCurrency = this.currency_rates[0];
      })
      .catch((err) => {
        console.log(err);
      })
  }

  addToCart(index) {
    this.cart_products.push(this.checkout_products[index]);

    let index_last_elem = this.cart_products.length - 1;
    this.cart_products[index_last_elem].quantity = 1;
    this.cart_products[index_last_elem].total = this.cart_products[index_last_elem].price;
    this.total_price += this.cart_products[index_last_elem].total;

    this.checkout_products.splice(index, 1);
  }

  deleteFromCart(index) {
    this.checkout_products.push(this.cart_products[index]);
    this.checkout_products.sort(this.compareByPrice);

    this.total_price -= this.cart_products[index].total;
    this.cart_products.splice(index, 1);
  }

  updateQuantity($event, index) {
    if ($event.value > 0) {
      this.cart_products[index].quantity = $event.value;
      this.total_price -= this.cart_products[index].total;
      this.cart_products[index].total = this.cart_products[index].quantity * this.cart_products[index].price;
      this.total_price += this.cart_products[index].total;
    }
  }

  changeCurrency(index) {
    this.selectedCurrency = this.currency_rates[index];
    console.log(this.selectedCurrency);
    // sa pun moneda peste tot this.selectedCurrency, dar sa fac si transformarile in monede
  }

}
