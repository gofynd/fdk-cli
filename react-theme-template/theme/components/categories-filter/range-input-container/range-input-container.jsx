import React, { useState, useEffect } from 'react';
import { replaceQueryPlaceholders } from '../../../helper/utils';
import styles from '../../../styles/categories-filter.less';

function RangeInputContainer({
  singleFilter,
  updateSelectedFilters,
  categoryNameValue,
}) {
  const [minVal, setMinVal] = useState(
    singleFilter?.selected_min || singleFilter?.min
  );
  const [maxVal, setMaxVal] = useState(
    singleFilter?.selected_max || singleFilter?.max
  );

  const [mounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (mounted) {
      updateSelectedFilters(
        categoryNameValue,
        replaceQueryPlaceholders(
          singleFilter?.query_format,
          Math.floor(minVal),
          Math.floor(maxVal)
        ),
        true
      );
    } else {
      setIsMounted(true);
    }
  }, [minVal, maxVal]);

  return (
    <div className={styles.rangeContainer}>
      <div className={styles.rangeTitleContainer}>
        <div>From</div>
        <div>To</div>
      </div>
      <div className={styles.rangeInputContainer}>
        <div>
          {singleFilter?.currency_symbol && (
            <span className={styles.currencySymbol}>
              {singleFilter?.currency_symbol}
            </span>
          )}
          <input
            type='number'
            value={minVal}
            min={singleFilter?.min}
            max={singleFilter?.max}
            className={styles.rangeInputContainer}
            onChange={(event) => setMinVal(event?.target?.value)}
          />
        </div>
        <div>
          {singleFilter?.currency_symbol && (
            <span className={styles.currencySymbol}>
              {singleFilter?.currency_symbol}
            </span>
          )}
          <input
            type='number'
            value={maxVal}
            min={singleFilter?.min}
            max={singleFilter?.max}
            className={styles.rangeInputContainer}
            onChange={(event) => setMaxVal(event?.target?.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default RangeInputContainer;
