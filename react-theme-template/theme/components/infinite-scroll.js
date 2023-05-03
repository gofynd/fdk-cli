import React from 'react';

export function InfinteScroll(props) {
	const {
		children,
		loader,
	} = props;
	const domRef = React.useRef(null);

	const handleObserver = (entries) => {
		const target = entries[0];
		if (target.isIntersecting) {
			console.log('[SCROLL]: Fetch More data now');
			loader();
		}
	};

	React.useEffect(() => {
		const option = {
			root: null,
			rootMargin: '20px',
			threshold: 0,
		};
		const observer = new IntersectionObserver(handleObserver, option);
		if (domRef.current) observer.observe(domRef.current);

		return () => {
			if (domRef.current) {
				observer.unobserve(domRef.current);
			}
		};
	}, [handleObserver]);

	return (
		<>
			<h2>I am infinte scroll component</h2>
			{children}
			<div ref={domRef} />
		</>
	);
}
