import React, { useEffect } from "react";

import { useGlobalStore, useFPI } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import styles from "../styles/style.css";
import { ProductCard } from "../components/ProductCard";

export function Component({ props }) {
  const fpi = useFPI();
  const products = useGlobalStore(fpi.getters.PRODUCTS);

  const productItems = products?.data?.items ?? [];
  useEffect(() => {
    if (!productItems.length) {
      fpi.catalog.getProducts({});
    }
  }, []);

  const title = props?.title?.value ?? 'Extension Title Default'

  return (
    <div>
      <Helmet>
        <title>{ title }</title>
      </Helmet>
      <h1>Products List</h1>

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

Component.serverFetch = ({ fpi }) => fpi.catalog.getProducts({});

export const settings = {
  label: "Product List",
  name: "product-list",
  props: [
    {
      id: "title",
      label: "Page Title",
      type: "text",
      default: "Extension Title",
      info: "Page Title",
    },
  ],
  blocks: [],
};
