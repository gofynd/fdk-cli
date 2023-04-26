import React from 'react';
import sections from '../sections';

function Section({
	section,
}) {
	const { sectionKey, props } = section;

	const AppliedSection = sections[sectionKey];

	if (!AppliedSection) {
		return (<p>Invalid Section Identifier</p>);
	}

	const SectionComponent = AppliedSection.Component;

	if (!SectionComponent) {
		return (
			<p>
				Theme Error: Make sure the section
				{sectionKey}
				{' '}
				exports a Component named function
				{' '}
			</p>
		);
	}

	return <SectionComponent {...props} />;
}

export default Section;
