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

        this.checkout_products.forEach((elem) => {
          elem.currency = 'USD';
        });
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

  changeCurrency(selectedCurrency) {
    let old_currency;
    if (this.checkout_products[0]) {
      old_currency = this.checkout_products[0].currency;
    } else {
      old_currency = this.cart_products[0].currency;
    }

    let old_currency_rate = this.currency_rates.find((rate) => {
      return rate.name == old_currency;
    }).value;

    let new_currency  = selectedCurrency;

    let new_currency_rate = this.currency_rates.find((rate) => {
      return rate.name == new_currency;
    }).value;

    this.checkout_products.forEach((product) => {
      product.price *= new_currency_rate;
      product.price /= old_currency_rate;
      product.currency = new_currency;
    });

    this.total_price = 0;
    this.cart_products.forEach((product) => {
      product.price *= new_currency_rate;
      product.price /= old_currency_rate;
      product.currency = new_currency;
      product.total = product.quantity * product.price;
      this.total_price += product.total;
    });
  }

}
