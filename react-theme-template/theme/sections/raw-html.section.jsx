import React from 'react';

export function Component({ props }) {
	const { code } = props;
	return (
		!code?.value ? null
			: (
				<div dangerouslySetInnerHTML={{ __html: code.value }} />
			)
	);
}

export const settings = {
	label: 'Raw HTML',
	props: [
		{
			id: 'code',
			label: 'Your Code Here',
			type: 'code',
			default: '',
			info: 'Add Your custom HTML Code below. You can also use the full screen icon to open a code editor and add your code',
		},
	],
	blocks: [],
};
