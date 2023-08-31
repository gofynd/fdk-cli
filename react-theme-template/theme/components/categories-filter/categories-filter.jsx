import React, { useState } from 'react';
import styles from '../../styles/categories-filter.less';
import SvgWrapper from '../svgWrapper/SvgWrapper.jsx';
import RangeInputContainer from './range-input-container/range-input-container.jsx';

const CategoriesFilter = ({
  categoryName,
  categoryNameValue,
  categoryValues,
  selectedFilters,
  categoryType,
  updateSelectedFilters,
}) => {
  const [open, setOpen] = useState(false);

  const isRangeCategories =
    categoryType === 'range' && categoryValues?.length > 0 && open;

  const isCategoriesFilter =
    categoryType !== 'range' && categoryValues?.length > 0 && open;
  return (
    <div className={styles.singleFilterContainer}>
      <div
        className={styles.filterInformationContainer}
        onClick={() => setOpen(!open)}
      >
        <p className={styles.filterHeading}>{categoryName}</p>
        <SvgWrapper
          svgSrc={'arrow-down'}
          className={styles.filterSvg}
          style={{ transform: open ? 'scale(1,-1)' : 'scale(1)' }}
        />
      </div>
      {isCategoriesFilter &&
        categoryValues.map((singleFilter) => {
          const isSelected =
            selectedFilters &&
            selectedFilters[categoryNameValue] &&
            selectedFilters[categoryNameValue][singleFilter?.value]
              ? true
              : false;
          return (
            <div
              className={styles.filterValueContainer}
              onClick={() =>
                updateSelectedFilters(categoryNameValue, singleFilter?.value)
              }
            >
              <span
                className={`${styles.svgStrokeContainer} ${
                  !isSelected ? styles.notSelected : ''
                }`}
              >
                <SvgWrapper
                  svgSrc={'selected-checkbox'}
                  className={styles.filterValueCheckBox}
                  style={{ fill: isSelected ? 'var(--buttonPrimary)' : 'none' }}
                />
              </span>
              <p className={styles.filterValueName}>{singleFilter?.display}</p>
              <p
                className={styles.filterValueCount}
              >{`(${singleFilter?.count})`}</p>
            </div>
          );
        })}
      {isRangeCategories &&
        categoryValues?.map((singleFilter) => {
          return (
            <RangeInputContainer
              singleFilter={singleFilter}
              categoryNameValue={categoryNameValue}
              updateSelectedFilters={updateSelectedFilters}
            />
          );
        })}
    </div>
  );
};

export default CategoriesFilter;
