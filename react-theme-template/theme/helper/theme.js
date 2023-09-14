/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
export const getProps = (schema, props = {}) => {

	// check schema props available
	const isSchemaProps = schema && schema.props && schema.props.length;

	// check page props available
	const isPageProps = props && props.props;

	if (isSchemaProps && isPageProps) {
		// iterate over schema props and if page props does not have key , then add it
		for (let i = 0; i < schema.props.length; i += 1) {
			// if page props already have key continue
			// eslint-disable-next-line no-prototype-builtins
			if (props.props.hasOwnProperty([schema.props[i].id])) {
				// eslint-disable-next-line no-continue
				continue;
			}

			// add key in page props with default value
			// eslint-disable-next-line no-param-reassign
			props.props[schema.props[i].id] = schema.props[i].default;
		}
	}
	return props;
};

export const getThemeGlobalConfig = (theme_config) => {
	if (theme_config) {
		const { current_list, global_schema } = theme_config;
		if (global_schema) {
			// check if current list is there
			if (current_list && current_list.global_config) {
				return getProps(
					global_schema,
					current_list.global_config.custom,
				);
			}
			return getProps(global_schema, { props: {} });
		}
	}
	return { props: {} };
};

// eslint-disable-next-line consistent-return
export function getThemePageConfig(theme_config, current_page) {
	if (theme_config) {
		const { current_list } = theme_config;
		if (current_page) {
			let pageConfig = null;
			// check current list
			if (current_list && current_list.page) {
				pageConfig = current_list.page.find((it) => it.page === current_page.value);
			}

			const pageSchemaConfig = current_page;
			if (pageConfig) {
				return getProps(pageSchemaConfig, pageConfig.settings);
			}
			return getProps(pageSchemaConfig, { props: {} });
		}
		return { props: {} };
	}
}

export function filterSocialLink(appInfo) {
	const arrSocialLinks = [];
	for (const key in appInfo.social_links) {
		const item = appInfo.social_links[key];
		const { icon, link, title } = item;
		if (icon && link && title) {
			arrSocialLinks.push(item);
		}
	}
	return arrSocialLinks;
}
