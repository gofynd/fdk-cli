import React from 'react';
// import styles from './SvgWrapper.less';
import { svgTitleComponentsMappings } from '../../constants/svgtitleComponentsMappings';

function SvgWrapper({ svgSrc, children, ...props }) {
  const SvgComponent = svgTitleComponentsMappings[svgSrc];
  return SvgComponent ? (
    <SvgComponent {...props}> {children} </SvgComponent>
  ) : (
    <></>
  );

}

export default SvgWrapper;
