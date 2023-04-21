import React from 'react';

export function Component({ imageUrl, alt, width = 100 }) {
	return (
		<div>
			<img src={imageUrl} alt={alt} style={{ width: `${width}%` }} />
		</div>
	);
}

export const settings = {
	label: 'Banner',
	props: [
		{
			label: 'Banner Image Link',
			type: 'string',
			default: '',
			info: 'Link to the image that should be displayed in banner',
		},
		{
			label: 'Alt Text',
			type: 'string',
			default: 'Image Alt',
			info: 'Image Alt',
		},
		{
			label: 'Image Width',
			type: 'number',
			default: 100,
			info: 'Width of image in %',
		},
	],
	blocks: [],
};
