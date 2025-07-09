import { Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ProductService } from './product.service';

@Resolver()
export class ProductResolver {
  @Inject() productService: ProductService;

  @Query(() => String)
  getProduct() {
    const product = this.productService.getProduct();
    return `${product.name}`;
  }
}
