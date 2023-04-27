import React from 'react';
import { SectionRenderer, useGlobalStore } from 'fdk-core';
import style from '../styles/homepage.less';

function Home({ numberOfSections, fpi }) {
	const {
		sections, isLoading, error,
	} = useGlobalStore((store) => store[fpi.getters.PAGE_CONFIG]);

	if (isLoading) {
		return (
			<h2>
				Loading
				{numberOfSections}
				{' '}
				sections
			</h2>
		);
	}

	if (error) {
		return (
			<>
				<h1>Error Occured !</h1>
				<pre>
					{JSON.stringify(error, null, 4)}
				</pre>
			</>
		);
	}

	const updateButtonHandler = () => {
		fpi.client.pageConfig.updateSectionsForPreview({ index: 0, newIndex: 1 });
	};

	return (
		<div className="wrapper">
			<h1 className={style.my_class}>
				This is
				{' '}
				<span>Blue text </span>
				Home Page updated locally
			</h1>
			<button onClick={updateButtonHandler}>
				Update Sections
			</button>
			<SectionRenderer
				sections={sections}
				actualSections={sections}
			/>
		</div>
	);
}

// Home.serverFetch = ({ fpi }) => fpi.client.pageConfig.fetchPageConfig('HOME');

export default Home;
