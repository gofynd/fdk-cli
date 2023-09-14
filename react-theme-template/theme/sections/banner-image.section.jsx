import React from 'react';
import ImageBanner from '../components/image-banner-section/image-banner.jsx';

export function Component({ props }) {
  const { bannerImage } = props;
  return bannerImage?.value ? <ImageBanner bannerImage={bannerImage} /> : null;
}
export const settings = {
  label: 'Banner Image',
  props: [
    {
      id: 'bannerImage',
      label: 'Link of the Banner Image to set',
      type: 'text',
      default: '',
    },
  ],
};
