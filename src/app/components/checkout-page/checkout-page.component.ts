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
        console.log(this.products)
      })
      .catch((err) => {
        console.log(err);
      })
  }

}
