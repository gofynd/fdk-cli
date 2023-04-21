import React from 'react';

export function Component({ label, url, target }) {
	return (
		<a href={url} target={target}>
			{label}
		</a>
	);
}

export const settings = {
	label: 'Link',
	props: [
		{
			label: 'Link Label',
			type: 'string',
			default: 'Section Link',
			info: 'Label to show for link',
		},
		{
			label: 'URL',
			type: 'string',
			default: '/',
			info: 'URl for link',
		},
		{
			label: 'Link Target',
			type: 'string',
			default: '_blank',
			info: 'HTML target attribute for link',
		},
	],
	blocks: [],
};
