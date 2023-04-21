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

export function Component({ tiles, title }) {
	if (!tiles?.length) {
		return null;
	}

	return (
		<div style={styles.section}>
			<h1 style={styles.title}>{title}</h1>
			<div style={styles.swipeGallery}>
				{
					tiles.map((tile, index) => (
						<div style={styles.tile} key={title + index + tile.url}>
							<img src={tile.url} alt={tile.alt} />
						</div>
					))
				}
			</div>
		</div>
	);
}

export const settings = {
	label: 'Link',
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
