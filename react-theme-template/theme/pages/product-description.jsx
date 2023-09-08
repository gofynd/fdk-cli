import React from 'react';
import ProductDescriptionPdp from '../page-layouts/pdp/product-description/product-description';
import { useParams } from 'react-router-dom';
import { isLoggedIn } from '../helper/auth-guard';
function ProductDescription({ fpi }) {
  const { slug } = useParams();
  return <ProductDescriptionPdp fpi={fpi} slug={slug} />;
}

ProductDescription.serverFetch = ({ fpi, router }) => {
  const slug = router?.params?.slug;
  const dataPromises = [
    // fpi.pageConfig.fetchPageConfig('PDP'),
  ];
  if (slug) {
    dataPromises.push(fpi.product.fetchProductBySlug({ slug }));
    dataPromises.push(fpi.product.fetchProductMeta({ slug: slug }));
  }

  return Promise.all(dataPromises);
};

// ProductDescription.authGuard = isLoggedIn;

export default ProductDescription;
