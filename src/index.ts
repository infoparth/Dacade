// Import necessary modules
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Principal,
  Result,
  match,
  Vec,
  nat64,
  ic,
  Opt,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Define the Product record structure
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

// Define the payload for creating a new Product record
type ProductPayload = Record<{
  name: string;
  gender: string;
  size: string;
  price: number;
  brand: string;
  image: string;
}>;

// Define a storage container for products
const productStorage = new StableBTreeMap<string, Product>(0, 44, 1024);

// Function to create a new Product record
$update;
export function createProduct(payload: ProductPayload): Result<Product, string> {
  if (!payload.name || !payload.gender || !payload.size || payload.price <= 0 || !payload.brand || !payload.image) {
    // Validation: Check if required fields in the payload are missing or invalid
    return Result.Err<Product, string>("Missing or invalid required fields in payload");
  }

  // Create a new Product object
  const product: Product = {
    id: uuidv4(),
    createdAt: ic.time(),
    updatedAt: Opt.None,
    name: payload.name,
    gender: payload.gender,
    size: payload.size,
    price: payload.price,
    brand: payload.brand,
    image: payload.image,
    owner: ic.caller(),
  };

  try {
    // Insert the new Product record into storage
    productStorage.insert(product.id, product);
  } catch (error) {
    return Result.Err<Product, string>("Error occurred during product insertion");
  }

  return Result.Ok<Product, string>(product);
}

// Function to retrieve a Product by its ID
$query;
export function getProduct(id: string): Result<Product, string> {
  if (!id) {
    // Validation: Check if ID is invalid or missing
    return Result.Err<Product, string>(`Invalid id=${id}.`);
  }
  try {
    return match(productStorage.get(id), {
      Some: (product) => Result.Ok<Product, string>(product),
      None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
    });

  } catch (error) {
    return Result.Err<Product, string>(`Error while retrieving product with id ${id}`);
  }
}

// Function to retrieve all Products
$query;
export function getAllProducts(): Result<Vec<Product>, string> {
  try {
    return Result.Ok(productStorage.values());
  } catch (error) {
    return Result.Err(`Failed to get all products: ${error}`);
  }
}

// Function to update a Product record
$update;
export function updateProduct(id: string, payload: ProductPayload): Result<Product, string> {
  if (!id) {
    // Validation: Check if ID is invalid or missing
    return Result.Err<Product, string>('Invalid id.');
  }

  if (!payload.name || !payload.gender || !payload.size || payload.price <= 0 || !payload.brand || !payload.image) {
    // Validation: Check if required fields in the payload are missing or invalid
    return Result.Err<Product, string>('Missing or invalid required fields in payload.');
  }

  return match(productStorage.get(id), {
    Some: (existingProduct) => {
      // Create an updated Product object
      const updatedProduct: Product = {
        id: existingProduct.id,
        name: payload.name,
        gender: payload.gender,
        size: payload.size,
        price: payload.price,
        brand: payload.brand,
        image: payload.image,
        owner: existingProduct.owner,
        createdAt: existingProduct.createdAt,
        updatedAt: Opt.Some(ic.time()),
      };

      try {
        // Update the Product record in storage
        productStorage.insert(updatedProduct.id, updatedProduct);
        return Result.Ok<Product, string>(updatedProduct);
      } catch (error) {
        return Result.Err<Product, string>(`Error updating product: ${error}`);
      }
    },

    None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
  });
}

// Function to delete a Product by its ID
$update;
export function deleteProduct(id: string): Result<Product, string> {
  if (!id) {
    // Validation: Check if ID is invalid or missing
    return Result.Err<Product, string>(`Invalid id=${id}.`);
  }
  try {
    return match(productStorage.get(id), {
      Some: (existingProduct) => {
        // Check if the caller is the owner of the Product
        if (existingProduct.owner.toString() !== ic.caller.toString()) {
          return Result.Err<Product, string>("User does not have the right to delete product");
        }

        // Remove the Product from storage
        productStorage.remove(id);
        return Result.Ok<Product, string>(existingProduct);
      },
      None: () => Result.Err<Product, string>(`Product with id=${id} not found.`),
    });
  } catch (error) {
    return Result.Err<Product, string>(`Error deleting product with id=${id}: ${error}`);
  }
}


// Set up a random number generator for generating UUIDs
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
