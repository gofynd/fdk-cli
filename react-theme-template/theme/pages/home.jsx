import React from 'react';
import { SectionRenderer } from 'fdk-core/components';
import { useGlobalStore } from 'fdk-core/utils';
import Loader from '../components/loader/loader';

function Home({ numberOfSections, fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { sections = [], loading, error } = page || {};

  if (error) {
    return (
      <>
        <h1>Error Occured !</h1>
        <pre>{JSON.stringify(error, null, 4)}</pre>
      </>
    );
  }
  if (loading) {
    return <Loader />;
  }
  return (
    <div className='wrapper'>
      <SectionRenderer sections={sections} />
    </div>
  );
}

export const settings = JSON.stringify({
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
});

export const sections = JSON.stringify(
	[
		{
      attributes: {
        page: 'home'
      }
    },
	]);

Home.serverFetch = ({ fpi }) => fpi.content.fetchNavigation();

export default Home;
