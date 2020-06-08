import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { CurrenciesService } from 'src/app/services/currencies.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(
    private productsService: ProductsService,       // service used to get products from pdf api
    private currenciesService: CurrenciesService,   // service used to get products from pdf api
    private route: ActivatedRoute,                  // service used to get params from url 
    private router: Router                          // service used to navigate to specified url
    ) {}

  products: any = [];                               // array of products
  checkout_products: any = [];                      // array containing elements from left box (checkout)
  cart_products: any = [];                          // array containing elements from right box (cart)
  total_price: any = 0;                             // total amount displayed at the bottom of cart box

  currency_rates: any = [];                         // array of currency rates from pdf api
  url_currency: any = '';                           // used to store url currency name if valid

  ngOnInit() {
    this.getUrlCurrency();
    this.getProducts();
  }

  /**
   * The function takes currency parameter from url and saves it if
   * it's valid; otherwise, it refreshes the checkout page.
   */
  getUrlCurrency () {
    this.route.paramMap.subscribe(params => {
      let param_url = params.get("currency");
      if (param_url && ['USD', 'EUR', 'GBP'].includes(param_url.toUpperCase())) {
        this.url_currency = param_url.toUpperCase();
      } else {
        this.router.navigate(['checkout']);
      }
    });
  }

  /**
   * This function gets the products array through ProductsService, using HttpClient
   * "get" request, then sort it descending by price and initialise checkout and cart
   * products. After that, "getCurrencyRates" function is called.
   */
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

  /**
   * This function takes 2 elements and compare them by price field. It's called
   * when an array is sorted. 
   */
  compareByPrice(a, b) {
    if (a.price < b.price) {
      return 1;
    }

    if (a.price > b.price) {
      return -1;
    }

    return 0;
  }

  /**
   * This function gets the rates array through CurrenciesService, using
   * HttpClient "get" request, and then stores the specified currency names
   * and values into the "currency_rates" array. It adds a new field "currency"
   * on "checkout_products" array elements, initialised accordingly.
   */
  getCurrencyRates() {
    this.currenciesService.getCurrencyRates().toPromise()
      .then((data: any) => {
        var rates = JSON.parse(JSON.stringify(data.rates));
        this.currency_rates.push({ name: 'USD', value: rates.USD });
        this.currency_rates.push({ name: 'EUR', value: rates.EUR });        
        this.currency_rates.push({ name: 'GBP', value: rates.GBP });

        this.checkout_products.forEach((elem) => {
          if (!this.url_currency) {
            elem.currency = 'USD';
          } else {
            elem.currency = this.url_currency;
          }
        });
      })
      .catch((err) => {
        console.log(err);
      })
  }

  /**
   * This function is triggered when "Add to cart" button is being pressed.
   * It receives the index of the chosen product element from checkout list.
   * The product is pushed into cart array; "quantity" and "total" fields are
   * added and initialised, also the "total_price" variable is updated.
   * After these operations, the selected element is removed from checkout
   * products list.
   */
  addToCart(index) {
    this.cart_products.push(this.checkout_products[index]);

    let index_last_elem = this.cart_products.length - 1;
    this.cart_products[index_last_elem].quantity = 1;
    this.cart_products[index_last_elem].total = this.cart_products[index_last_elem].price;
    this.total_price += this.cart_products[index_last_elem].total;

    this.checkout_products.splice(index, 1);
  }

  /**
   * This function is triggered when remove "X" button is being pressed.
   * It receives the index of the chosen product element from cart list.
   * The product is pushed into checkout array and sorted again by price;
   * the "total_price" variable is updated. After these operations, the
   * selected element is removed from cart products list.  
   */
  deleteFromCart(index) {
    this.checkout_products.push(this.cart_products[index]);
    this.checkout_products.sort(this.compareByPrice);

    this.total_price -= this.cart_products[index].total;
    this.cart_products.splice(index, 1);
  }

  /**
   * This function is triggered when the user modifies a product quantity
   * from the cart table. It doesn't do anything if the value received is
   * not a valid number: a positive not null integer. Otherwise, the "quantity"
   * field of the selected cart product is updated, the "total" field is
   * substracted from the "total_price", and then is updated with the new
   * value (new quantity * price), finally the new "total" field is added
   * to the "total_price".
   */
  updateQuantity($event, index) {
    if ($event.value > 0) {
      this.cart_products[index].quantity = $event.value;
      this.total_price -= this.cart_products[index].total;
      this.cart_products[index].total = this.cart_products[index].quantity * this.cart_products[index].price;
      this.total_price += this.cart_products[index].total;
    }
  }

  /**
   * The function is triggered when the user selects a currency from the
   * currency selector. It receives the currency name: "selectedCurrency".
   * Then, needed variables are initialised:
   * "old_currency" - the name of the currency before being changed
   * "old_currency_rate" - the official value for the old currency, from currency_rates
   * "new_currency" - the name of the chosen currency ("selectedCurrency")
   * "new_currency_rate" - the official value for the new currency, from currency_rates
   * After having these values, "price" and "currency" fields from "checkout_products"
   * and "cart_products" arrays are updated. For "price" it uses the formula:
   * (new price) = (old price * new currency rate) / (old currency rate)
   * Furthermore, for the cart products it updates the "total" field and the
   * variable "total_price" too.
   */
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
