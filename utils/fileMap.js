const componentMapping = {
  'product-listing': 'plp',
  'product-description': 'pdp',
  header: 'header',
  footer: 'footer',
  'cart-review': 'cart_review',
  'cart-landing': 'cart_landing',
  'order-review': 'order_review',
  categories: 'categories',
  collections: 'collections',
  'screen-saver': 'screensaver',
  'compare-products': 'compare_products'
};

const getComponentKey = val => {
  return componentMapping[val];
};

module.exports = { getComponentKey };
