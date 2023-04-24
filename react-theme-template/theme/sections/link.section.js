import React from 'react';
import { Link } from 'react-router-dom';

export function Component({ props, blocks }) {
	const { label, url, target } = props;
	return (
		target.value === '_blank'
			? (
				<a href={url.value} target={target.value}>
					{label.value}
				</a>
			)
			: <Link to={url.value}>{label.value}</Link>
	);
}

export const settings = {
	label: 'Link',
	props: [
		{
			id: 'label',
			label: 'Link Label',
			type: 'text',
			default: 'Section Link',
			info: 'Label to show for link',
		},
		{
			id: 'url',
			label: 'URL',
			type: 'text',
			default: '/',
			info: 'URl for link',
		},
		{
			id: 'target',
			label: 'Link Target',
			type: 'text',
			default: '',
			info: 'HTML target attribute for link',
		},
	],
	blocks: [],
};
