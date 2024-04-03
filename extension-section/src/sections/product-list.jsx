import React, { useEffect } from "react";

import { useGlobalStore, useFPI } from "fdk-core/utils";

import styles from "../styles/style.css";
import { ProductCard } from "../components/ProductCard";

export function Component() {
  const fpi = useFPI();
  const products = useGlobalStore(fpi.getters.PRODUCTS);

  const productItems = products?.data?.items ?? [];
  useEffect(() => {
    if (!productItems.length) {
      fpi.products.fetchProductListing({});
    }
  }, []);

  return (
    <div>
      <h1>Product List using Extension for Sky🔥</h1>

      {!productItems.length ? (
        <h2>No Products</h2>
      ) : (
        <div class={styles.container}>
          {productItems.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
      )}
    </div>
  );
}

Component.serverFetch = ({ fpi }) => fpi.products.fetchProductListing({});

export const settings = {
  label: "Products List",
  name: "product-list",
  props: [
    {
      id: "number",
      label: "Number Of Products",
      type: "text",
      default: 1,
      info: "number of products to show",
    },
  ],
  blocks: [],
};
