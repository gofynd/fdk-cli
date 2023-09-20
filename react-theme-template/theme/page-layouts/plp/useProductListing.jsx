import { useEffect, useState, useMemo, useCallback } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useLocation, useNavigate, createSearchParams } from "react-router-dom";
import { SINGLE_FILTER_VALUES } from "../../helper/constant";

let isProductListingMounted = false;

const useProductListing = (fpi) => {
  const location = useLocation();
  const queryParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  const [selectedfilters, setSelectedFilters] = useState(() => {
    const tempSelected = {};
    queryParams?.forEach((value, key) => {
      if (!SINGLE_FILTER_VALUES[key]) {
        if (tempSelected[key] && !tempSelected[key][value]) {
          tempSelected[key][value] = true;
        } else if (!tempSelected[key]) {
          tempSelected[key] = {};
          tempSelected[key][value] = true;
        }
      }
    });
    return tempSelected;
  });
  const [currentSort, setCurrentSort] = useState(() => {
    let sortDefaultValue = queryParams.get("sortOn") ?? null;
    return sortDefaultValue;
  });
  const [pageNo, setPageNo] = useState(() => {
    let defaultPageNo = queryParams.get("page_no") ?? 1;
    return defaultPageNo;
  });
  const PAGE_SIZE = 12;
  const navigate = useNavigate();
  const product_lists = useGlobalStore(fpi?.getters?.PRODUCTS);
  useEffect(() => {
    const selectedFiltersArr = Object.keys(selectedfilters);
    if (isProductListingMounted) {
      const tempHistoryObject = {};
      for (let j = 0; j < selectedFiltersArr.length; j += 1) {
        const filtersValue = Object.keys(
          selectedfilters[selectedFiltersArr[j]]
        );
        if (filtersValue.length === 1) {
          tempHistoryObject[selectedFiltersArr[j]] = filtersValue[0];
        } else {
          tempHistoryObject[selectedFiltersArr[j]] = filtersValue;
        }
      }
      navigate({
        pathname: location?.pathname,
        search: `?${createSearchParams(tempHistoryObject)}`,
      });
      const query = {
        pageNo: pageNo,
        pageSize: PAGE_SIZE,
      };
      if (tempHistoryObject?.sortOn) {
        query.sortOn = tempHistoryObject?.sortOn;
        delete tempHistoryObject.sortOn;
      }
      if (Object.keys(tempHistoryObject).length > 0) {
        query.f = tempHistoryObject;
      }
      fpi.products.fetchProductListing(query);
    } else if (!isProductListingMounted) {
      isProductListingMounted = true;
    }
  }, [selectedfilters]);

  useEffect(() => {
    // This is Differentiated and Use For Making the Calls if the Value is Not Present in Store
    if (
      (!product_lists?.data?.items || product_lists?.data?.items === 0) &&
      !product_lists?.loading
    ) {
      const selectedFiltersArr = Object.keys(selectedfilters);
      const tempHistoryObject = {};
      for (let j = 0; j < selectedFiltersArr.length; j += 1) {
        const filtersValue = Object.keys(
          selectedfilters[selectedFiltersArr[j]]
        );
        if (filtersValue.length === 1) {
          tempHistoryObject[selectedFiltersArr[j]] = filtersValue[0];
        } else {
          tempHistoryObject[selectedFiltersArr[j]] = filtersValue;
        }
      }
      navigate({
        pathname: location?.pathname,
        search: `?${createSearchParams(tempHistoryObject)}`,
      });
      const query = {
        pageNo: pageNo,
        pageSize: PAGE_SIZE,
      };
      if (tempHistoryObject?.sortOn) {
        query.sortOn = tempHistoryObject?.sortOn;
        delete tempHistoryObject.sortOn;
      }
      if (Object.keys(tempHistoryObject).length > 0) {
        query.f = tempHistoryObject;
      }
      fpi.products.fetchProductListing(query);
    }
  }, []);

  const updateSelectedFilters = (department, value, isSingleValuedFilter) => {
    const tempFilters = { ...selectedfilters };
    if (selectedfilters[department] && selectedfilters[department][value]) {
      delete tempFilters[department][value];
      if (Object.keys(selectedfilters[department]).length === 0) {
        delete tempFilters[department];
      }
    } else if (
      selectedfilters[department] &&
      !selectedfilters[department][value]
    ) {
      tempFilters[department][value] = true;
    } else if (!selectedfilters[department]) {
      (tempFilters[department] = {}), (tempFilters[department][value] = true);
    }
    if (
      isSingleValuedFilter &&
      Object.keys(tempFilters[department]).length > 1
    ) {
      tempFilters[department] = { [value]: true };
    }
    setSelectedFilters(tempFilters);
  };
  return {
    product_lists,
    selectedfilters,
    pageNo,
    currentSort,
    updateSelectedFilters,
    setPageNo,
    setCurrentSort,
  };
};

export default useProductListing;
