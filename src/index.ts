import {$query,$update,Record,StableBTreeMap,Vec,match,Result,nat64,ic,Opt,Principal,} from"azle";
import { v4 as uuidv4 } from "uuid";
  
  type Product = Record<{
    id: string;
    name: string;
    gender: string;
    size: string;
    price: number;
    brand: string;
    image: string;
    owner: Principal;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
  }>;
  
  type ProductPayload = Record<{
    name: string;
    gender: string;
    size: string;
    price: number;
    brand: string;
    image: string;
  }>;
  
  
  
  const productStorage = new StableBTreeMap<string, Product>(0, 44, 1024);
  
  $update;
  export function createProduct(payload: ProductPayload): Result<Product, string> {
    const product: Product = {
      id: uuidv4(),
      createdAt: ic.time(),
      updatedAt: Opt.None,
      ...payload,
      owner: ic.caller(),
    };
  
    productStorage.insert(product.id, product);
    return Result.Ok<Product, string>(product);
  }
  
  $query;
  export function getProduct(id: string): Result<Product, string> {
    return match(productStorage.get(id), {
      Some: (product) => Result.Ok<Product, string>(product),
      None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
    });
  }
  
  $query;
  export function getAllProducts(): Result<Vec<Product>, string> {
    return Result.Ok(productStorage.values());
  }
  
  $update;
  export function updateProduct(id: string, payload: ProductPayload): Result<Product, string> {
    return match(productStorage.get(id), {
      Some: (existingProduct) => {
        const updatedProduct: Product = {
          ...existingProduct,
          ...payload,
          updatedAt: Opt.Some(ic.time()),
        };
  
        productStorage.insert(updatedProduct.id, updatedProduct);
        return Result.Ok<Product, string>(updatedProduct);
      },
      None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
    });
  }
  
  $update;
  export function deleteProduct(id: string): Result<Product, string> {
    return match(productStorage.get(id), {
      Some: (existingProduct) => {
        productStorage.remove(id);
        return Result.Ok<Product, string>(existingProduct);
      },
      None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
    });
  }
  
  
  globalThis.crypto = {
    //@ts-ignore
    getRandomValues: () => {
      let array = new Uint8Array(32);
  
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
  
      return array;
    },
  };
  
  zip -r E_commerce.zip .
