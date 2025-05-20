import React, { useEffect } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";  // Importing hooks from fdk-core utilities
import { Helmet } from "react-helmet-async";  // Importing Helmet for managing changes to the document head
import styles from "../styles/style.css";  // Importing CSS styles
import { ProductCard } from "../components/ProductCard";  // Importing the ProductCard component

// GraphQL query as a template literal string to fetch products with dynamic variables
const PLP_PRODUCTS = `query products(
  $first: Int
  $pageNo: Int
  $after: String
  $pageType: String
) {
  products(
    first: $first
    pageNo: $pageNo
    after: $after
    pageType: $pageType
  ) {
    page {
      current
      next_id
      has_previous
      has_next
      item_total
      type
      size
    }
    items {
        price {
            effective {
                currency_code
                currency_symbol
                max
                min
            }
        }
        media {
            alt
            type
            url
        }
        slug
        name
    }
  }
}
`;

// Functional component definition using destructuring to access props
export function Component({ title = 'Extension Title Default' }) {
  const fpi = useFPI();  // Using a custom hook to access functional programming interface
  const products = useGlobalStore(fpi.getters.PRODUCTS);  // Accessing global store to retrieve products
  const productItems = products?.items ?? [];  // Nullish coalescing operator to handle undefined products

  // useEffect to perform side effects, in this case, data fetching
  useEffect(() => {
    // Checking if productItems is empty and then executing GraphQL query
    if (!productItems.length) {
      const payload = {
        enableFilter: true,  // Enabling filter option in the query
        first: 12,           // Number of products to fetch
        pageNo: 1,           // Initial page number
        pageType: "number",  // Type of pagination
      };
      fpi.executeGQL(PLP_PRODUCTS, payload);
    }
  }, [productItems.length, fpi]);  // Dependency array to limit the execution of useEffect

  // Conditionally rendering based on the availability of product items
  if (!productItems.length) {
    return <h2>No Products Found</h2>;  // Display message when no products are found
  }

  return (
    <div>
      <Helmet>
        <title>{title}</title>  // Setting the title of the page using Helmet
      </Helmet>
      <h1>Products List</h1>
      <div className={styles.container}>
        {productItems.map((product) => (
          <ProductCard product={product} key={product.slug} />  // Rendering ProductCard components for each product
        ))}
      </div>
    </div>
  );
}

// Server-side fetching logic for server-side rendering (SSR)
Component.serverFetch = ({ fpi }) => {
  const payload = {
    enableFilter: true,
    first: 12,
    pageNo: 1,
    pageType: "number",
  };

  fpi.custom.setValue("test-extension", true);  // Custom settings for the server-side execution context

  return fpi.executeGQL(PLP_PRODUCTS, payload);  // Executing GraphQL query on the server
};

// Exporting component settings for potential dynamic UI management or configuration panels
export const settings = {
  label: "Product List",
  name: "product-list",
  props: [
    {
      id: "title",
      label: "Page Title",
      type: "text",
      default: "Extension Title",
      info: "Set the page title for the product list."  // Description for the property
    },
  ],
  blocks: [],
};
