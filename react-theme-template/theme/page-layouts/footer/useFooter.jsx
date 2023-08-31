import { useEffect } from 'react';
import { useGlobalStore } from 'fdk-core/utils';
import { getProps, getThemeGlobalConfig } from '../../helper/theme';

const useFooter = (fpi) => {
  const CONTENT = useGlobalStore(fpi.getters.CONTENT);

  const THEME = useGlobalStore(fpi.getters.THEME);

  const CONTACT_INFO = useGlobalStore(fpi.getters.CONTACT_INFO);

  const globalConfig = getThemeGlobalConfig(THEME?.config);




  useEffect(() => {
    if (
      !(CONTENT?.navigation?.items && CONTENT?.navigation?.items[0]?.navigation)
    ) {
      fpi.content.fetchNavigation();
    }
  }, []);

  return {
    zglobalConfig: globalConfig,
    navigation:
      CONTENT?.navigation?.items && CONTENT?.navigation?.items[0]?.navigation,
    appInfo: CONTACT_INFO,
    support: CONTENT?.support_information,
    footerProps:THEME?.config?.list[0]?.global_config?.custom?.props
  };
};

export default useFooter;
