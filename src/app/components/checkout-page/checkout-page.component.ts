import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(private productsService: ProductsService) { }

  products: any = [];

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.productsService.getProducts().toPromise()
      .then((data) => {
        this.products = data;
        this.products.sort((a, b) => (a.price < b.price) ? 1 : ((a.price > b.price) ? -1 : 0));
        console.log(this.products)
      })
      .catch((err) => {
        console.log(err);
      })
  }

}
