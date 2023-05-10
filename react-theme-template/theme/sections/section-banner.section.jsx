import React from 'react';

export function Component({ props, blocks }) {
	const { imageUrl, alt, width = 100 } = props;
	return (
		<div>
			<img src={imageUrl.value} alt={alt.value} style={{ width: `${width.value}%` }} />
		</div>
	);
}

export const settings = {
	label: 'Banner',
	props: [
		{
			id: 'imageUrl',
			label: 'Banner Image Link',
			type: 'text',
			default: '',
			info: 'Link to the image that should be displayed in banner',
		},
		{
			id: 'alt',
			label: 'Alt Text',
			type: 'text',
			default: 'Image Alt',
			info: 'Image Alt',
		},
		{
			id: 'width',
			label: 'Image Width',
			type: 'text',
			default: '100',
			info: 'Width of image in %',
		},
	],
	blocks: [],
};
