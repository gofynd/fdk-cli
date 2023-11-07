import React from 'react';
import BestCollectionSection from '../components/best-collection-section/best-collection-section.jsx';
import { getGlobalConfigValue } from '../helper/utils.js';

export function Component({ props,blocks, globalConfig }) {
  let margin_bottom = getGlobalConfigValue(
    globalConfig,
    "section_margin_bottom"
  );
  const { collectionHeading, collectionSubHeading } = props;
  return blocks?.length > 0 ? (
    <BestCollectionSection
    style={{ marginBottom: `${margin_bottom}px` }}
      heading={collectionHeading}
      subHeading={collectionSubHeading}
      products={blocks}
    />
  ) : null;
}

export const settings = {
  label: 'Best Collection',
  props: [
    {
      id: 'collectionHeading',
      label: 'Collections Heading',
      type: 'text',
      default: 'Best Selling Collection',
    },
    {
      id: 'collectionSubHeading',
      label: 'Collections Sub Heading',
      type: 'text',
      default: 'Quality Shoes that lasts a Lifetime',
    },
  ],
  blocks: [
    {
      label: 'Product Card',
      type: 'gallery',
      props: [
        {
          id: 'productImage',
          label: 'Product Image Link',
          type: 'text',
          default: '',
        },
        {
          id: 'productTitle',
          label: 'Title of the Product',
          type: 'text',
          default: '',
        },
        {
          id: 'productMRP',
          label: 'MRP of the Product',
          type: 'text',
          default: '',
        },
        {
          id: 'productDiscountedPrice',
          label: 'Product Discounted Price',
          type: 'text',
          default: '',
        },
        {
          id: 'productId',
          label: 'Id of the Product so can go to that product description Page',
          type: 'text',
          default: '',
        },
      ],
    },
  ],
};
