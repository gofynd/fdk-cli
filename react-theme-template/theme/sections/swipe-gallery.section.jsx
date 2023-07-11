import React from 'react';

const styles = {
	section: {

	},
	title: {
		textAlign: 'center',
	},
	swipeGallery: {
		overflow: 'scroll',
		display: 'flex',
	},
	tile: {
		margin: '10px',
	},
};

export function Component({ props, blocks }) {
	const { title } = props;
	if (!blocks?.length) {
		return null;
	}

	return (
		<div style={styles.section}>
			<h1 style={styles.title}>{title.value}</h1>
			<div style={styles.swipeGallery}>
				{
					blocks?.map(({ props: tile }, index) => (
						<div style={styles.tile} key={title.value + index + tile.url.value}>
							<img src={tile.url.value} alt={tile.alt.value} />
						</div>
					))
				}
			</div>
		</div>
	);
}

export const settings = {
	label: 'Swipe Gallery',
	blocks: [
		{
			label: 'Image card',
			type: 'gallery',
			props: [
				{
					id: 'url',
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
		},
	],
	props: [
		{
			id: 'title',
			label: 'Title',
			type: 'text',
			default: '',
			info: 'Link to the image that should be displayed in banner',
		},
	],
};
