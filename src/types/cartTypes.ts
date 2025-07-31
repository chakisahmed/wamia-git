// A generic type for monetary values, used throughout the cart
export interface Money {
  value: number;
  currency: string;
}

// A generic type for discounts
export interface Discount {
  label: string;
  amount: Money;
}

// Represents the `product.image` object
export interface ProductImage {
  url: string;
  label: string;
}

export interface PriceTiers {
    quantity: number;
    final_price: {
        value: number;
    };
    discount: {
        amount_off: number;
        percent_off: number;
    };
}
// Represents the `product` object inside a cart item
export interface CartItemProduct {
  sku: string;
  name: string;
  image: ProductImage;
  price_tiers: PriceTiers
  
}

// Represents a price tier for a product (e.g., bulk pricing)

// Represents the `configurable_options` for a configurable item
export interface ConfigurableOption {
    option_label: string;
    value_label: string;
}

// Represents the item-level prices
export interface CartItemPrices {
  price: Money;
  row_total: Money;
  discounts: Discount[] | null;
}

// Represents a single item in the cart's `items` array
export interface CartItem {
  uid: string;
  id: string; // cart_item_id
  quantity: number;
  prices: CartItemPrices;
  product: CartItemProduct;
  // This field will only exist on items that are configurable products
  configurable_options?: ConfigurableOption[];
}

// Represents the top-level `prices` object for the whole cart
export interface CartPrices {
  grand_total: Money;
  subtotal_including_tax: Money;
  discounts: Discount[] | null;
}

// Represents a shipping address and the selected method
export interface ShippingAddress {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region: { label: string } | null;
  postcode: string;
  country: { label: string };
  telephone: string;
  selected_shipping_method: {
    carrier_code: string;
    method_code: string;
    carrier_title: string;
    method_title: string;
    amount: Money;
  } | null;
}

// Represents a billing address
export interface BillingAddress {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region: { label: string } | null;
  postcode: string;
  country: { label: string };
  telephone: string;
}

// Represents a payment method option
export interface PaymentMethod {
  code: string;
  title: string;
}

// Represents the main Cart object, the result of the `CartFields` fragment
export interface Cart {
  id: string;
  total_quantity: number;
  email: string | null;
  is_virtual: boolean;
  applied_coupons: { code: string }[] | null;
  items: CartItem[];
  prices: CartPrices;
  shipping_addresses: ShippingAddress[];
  billing_address: BillingAddress | null;
  available_payment_methods: PaymentMethod[];
  selected_payment_method: PaymentMethod | null;
}