import React from 'react';
import { SectionRenderer, useGlobalStore } from 'fdk-core';
import style from '../styles/homepage.less';
import testImage from '../assets/images/test.png';

function Home({ numberOfSections, fpi }) {
	const {
		sections, isLoading, error, pageData,
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

	return (
		<div className="wrapper">
			<img src={testImage} alt="alt sample" />
			<h1 className={style.my_class}>
				This is
				{' '}
				<span>Blue text </span>
				Home Page updated locally
			</h1>
			<SectionRenderer
				sections={sections}
				actualSections={pageData.sections}
			/>
		</div>
	);
}

// Home.serverFetch = ({ fpi }) => fpi.client.pageConfig.fetchPageConfig('HOME');

export default Home;
