import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
  Principal,
} from "azle";
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

$update;
export function updateProductPrice(id: string, newPrice: number): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        price: newPrice,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function searchProductsByBrand(brand: string): Result<Vec<Product>, string> {
  const products = productStorage.values().filter((product) => product.brand === brand);
  return Result.Ok(products);
}

$update;
export function addProductImage(id: string, imageUrl: string): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        image: imageUrl,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function searchProductsByOwner(owner: Principal): Result<Vec<Product>, string> {
  const products = productStorage.values().filter((product) => product.owner === owner);
  return Result.Ok(products);
}

$update;
export function updateProductName(id: string, newName: string): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        name: newName,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function getProductByBrandAndSize(brand: string, size: string): Result<Product, string> {
  const product = productStorage.values().find((p) => p.brand === brand && p.size === size);
  if (product) {
    return Result.Ok(product);
  } else {
    return Result.Err<Product, string>(`No product with brand=${brand} and size=${size} found.`);
  }
}

$update;
export function updateProductSize(id: string, newSize: string): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        size: newSize,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function getProductByOwnerAndName(owner: Principal, name: string): Result<Product, string> {
  const product = productStorage.values().find((p) => p.owner === owner && p.name === name);
  if (product) {
    return Result.Ok(product);
  } else {
    return Result.Err<Product, string>(`No product with owner=${owner} and name=${name} found.`);
  }
}

$update;
export function deleteProductByOwner(owner: Principal, id: string): Result<Product, string> {
  if (productStorage.has(id)) {
    const existingProduct = productStorage.get(id);
    if (existingProduct && existingProduct.owner === owner) {
      productStorage.remove(id);
      return Result.Ok<Product, string>(existingProduct);
    } else {
      return Result.Err<Product, string>(`You are not the owner of the product with id=${id}.`);
    }
  } else {
    return Result.Err<Product, string>(`Product with id=${id} not found.`);
  }
}

$query;
export function searchProductsByPriceRange(minPrice: number, maxPrice: number): Result<Vec<Product>, string> {
  const products = productStorage.values().filter((product) => product.price >= minPrice && product.price <= maxPrice);
  return Result.Ok(products);
}

$update;
export function updateProductBrand(id: string, newBrand: string): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        brand: newBrand,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function getProductBySize(size: string): Result<Vec<Product>, string> {
  const products = productStorage.values().filter((product) => product.size === size);
  return Result.Ok(products);
}

$update;
export function updateProductImage(id: string, newImage: string): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        image: newImage,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function searchProductsByGender(gender: string): Result<Vec<Product>, string> {
  const products = productStorage.values().filter((product) => product.gender === gender);
  return Result.Ok(products);
}

$update;
export function updateProductOwner(id: string, newOwner: Principal): Result<Product, string> {
  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      const updatedProduct: Product = {
        ...existingProduct,
        owner: newOwner,
        updatedAt: Opt.Some(ic.time()),
      };

      productStorage.insert(updatedProduct.id, updatedProduct);
      return Result.Ok<Product, string>(updatedProduct);
    },
    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

$query;
export function getProductByGenderAndBrand(gender: string, brand: string): Result<Vec<Product>, string> {
  const products = productStorage.values().filter((p) => p.gender === gender && p.brand === brand);
  return Result.Ok(products);
}
