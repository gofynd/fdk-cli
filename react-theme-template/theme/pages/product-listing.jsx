import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoriesFilter from '../components/categories-filter/categories-filter';
import SvgWrapper from '../components/svgWrapper/SvgWrapper';
import Loader from '../components/loader/loader';
import useProductListing from '../page-layouts/plp/useProductListing';
import styles from '../styles/product-listing.less';
import PageNotFound from '../components/page-not-found/page-not-found';

const ProductListing = ({ fpi }) => {
  const {
    product_lists,
    selectedfilters,
    pageNo,
    currentSort,
    updateSelectedFilters,
    setPageNo,
    setCurrentSort,
  } = useProductListing(fpi);
  const router = useNavigate();
  const [sortOnOpen, setSortOnOpen] = useState(false);
  const [currentGrid, setCurrentGrid] = useState('fourgrid');

  const { filters, sort_on, page, items } = product_lists?.data || {};

  useEffect(() => {
    if (sort_on && sort_on.length > 0) {
      if (!currentSort) {
        setCurrentSort(sort_on[0]);
      } else if (typeof currentSort === 'string') {
        const sortOnValue = sort_on.find((el) => el.value === currentSort);
      }
    }
  }, [sort_on]);
  return (
    <>
      <div className={styles.productListingContainer}>
        <div className={styles.listDataContainer}>
          <div className={styles.categoriesListContainer}>
            {filters?.map((singleFilter,index) => {
              return (
                <CategoriesFilter
                  key={index}
                  categoryName={singleFilter?.key?.display}
                  categoryNameValue={singleFilter?.key?.name}
                  categoryValues={singleFilter?.values}
                  selectedFilters={selectedfilters}
                  categoryType={singleFilter?.key?.kind}
                  updateSelectedFilters={updateSelectedFilters}
                />
              );
            })}
          </div>
          <div className={styles.productsListContainer}>
            <div className={styles.productListHeadingContainer}>
              {product_lists?.data?.page?.item_total && (
                <h4 className={styles.productsCount}>
                  {product_lists?.data?.page?.item_total} items
                </h4>
              )}
              <div className={styles.productSortContainer}>
                <div className={styles.sortOnContainer}>
                  {currentSort?.display && (
                    <p className={styles.sortOnHeading}>
                      Sort by:
                      <span
                        className={styles.currentSortType}
                        onClick={() => setSortOnOpen(!sortOnOpen)}
                      >
                        {currentSort?.display}
                        <SvgWrapper
                          svgSrc={'arrow-down'}
                          className={styles.filterSvg}
                          style={{
                            transform: sortOnOpen ? 'scale(1,-1)' : 'scale(1)',
                          }}
                        />
                      </span>
                    </p>
                  )}
                  <div
                    className={`${styles.sortOnPopUpContainer} ${
                      sortOnOpen && styles.renderSortPopUp
                    }`}
                  >
                    {sort_on?.map((singleSort) => {
                      return (
                        <div
                          key={singleSort?.display}
                          className={styles.singleSortContainer}
                          onClick={() => {
                            setSortOnOpen(!sortOnOpen);
                            setCurrentSort(singleSort);
                            updateSelectedFilters(
                              'sortOn',
                              singleSort?.value,
                              true
                            );
                          }}
                        >
                          {singleSort?.display}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div
                  className={`${
                    currentGrid === 'twogrid' && styles.gridSvgContainer
                  }`}
                  onClick={() => setCurrentGrid('twogrid')}
                >
                  <SvgWrapper svgSrc={'twogrid'} />
                </div>
                <div
                  className={`${
                    currentGrid !== 'twogrid' && styles.gridSvgContainer
                  }`}
                  onClick={() => setCurrentGrid('fourgrid')}
                >
                  <SvgWrapper svgSrc={'fourgrid'} />
                </div>
              </div>
            </div>
            <div className={styles.productListingContainer}>
              {items?.length > 0 ?
                items.map((singleProduct) => {
                  return (
                    <div
                      key={singleProduct.slug}
                      className={`${
                        currentGrid === 'twogrid'
                          ? styles.twoProducts
                          : styles.fourProducts
                      }`}
                      onClick={() => router(`/product/${singleProduct?.slug}`)}
                    >
                      <img
                        src={
                          (singleProduct?.medias?.length > 0 &&
                            singleProduct?.medias[0]?.url) ||
                          'https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/wrkr/products/pictures/item/free/resize-w:550/spykar/RS13/1/3Vf6OTdx2y-_ZCRDnuJ_-Replica-Shoes-9.jpeg?dpr=2'
                        }
                        alt='productImage'
                      />
                      <h3 className={styles.productHeading}>
                        {singleProduct?.name}
                      </h3>
                      <div className={styles.productPricingContainer}>
                        <span className={styles.effectivePrice}>
                          {`${singleProduct?.price?.effective?.currency_symbol}${singleProduct?.price?.effective?.min}`}
                        </span>
                        <span className={styles.markedPrice}>
                          {`${singleProduct?.price?.marked?.currency_symbol}${singleProduct?.price?.marked?.min}`}
                        </span>
                        <span className={styles.discountPercentage}>
                          &nbsp;({singleProduct?.discount || `0%`})
                        </span>
                      </div>
                    </div>
                  );
                }):<PageNotFound title={'No Products Found'}></PageNotFound>}
            </div>
            <div className={styles.paginationListingContainer}>
              <SvgWrapper
                svgSrc={'arrow-left'}
                className={styles.paginationArrow}
                onClick={() => {
                  if (page?.has_previous) {
                    setPageNo(pageNo - 1);
                    updateSelectedFilters('page_no', pageNo - 1, true);
                  }
                }}
              />
              <div className={styles.pageCount}>{pageNo}</div>
              <SvgWrapper
                svgSrc={'arrow-right'}
                className={styles.paginationArrow}
                onClick={() => {
                  if (page?.has_next) {
                    setPageNo(pageNo + 1);
                    updateSelectedFilters('page_no', pageNo + 1, true);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {product_lists?.loading && <Loader />}
    </>
  );
};

ProductListing.serverFetch = async ({ fpi, router }) => {
  const queries = router.filterQuery;
  let defaultQuery = {
    pageNo: 1,
    pageSize: 12,
  };
  if (queries.page_no) {
    defaultQuery.pageNo = queries.page_no;
  }
  if (queries.sortOn) {
    defaultQuery.sortOn = queries.sortOn;
  }
  defaultQuery = { ...defaultQuery, ...queries };
  return fpi.products.fetchProductListing(defaultQuery);
};

export default ProductListing;
