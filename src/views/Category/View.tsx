import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { StringParam, useQueryParam } from 'use-query-params';

import { IFilters } from '@types';

import { MetaWrapper, NotFound, OfflinePlaceholder } from '../../components';
import NetworkStatus from '../../components/NetworkStatus';
import { PRODUCTS_PER_PAGE } from '../../core/config';
import {
  convertSortByFromString, convertToAttributeScalar, getGraphqlIdFromDBId, maybe
} from '../../core/utils';
import Page from './Page';
import { TypedCategoryProductsQuery } from './queries';

type ViewProps = RouteComponentProps<{
  id: string;
}>;

export const FilterQuerySet = {
  encode(valueObj) {
    const str = [];
    Object.keys(valueObj).forEach(value => {
      str.push(value + "_" + valueObj[value].join("_"));
    });
    return str.join(".");
  },

  decode(strValue) {
    const obj = {};
    const propsWithValues = strValue.split(".").filter(n => n);
    propsWithValues.map(value => {
      const propWithValues = value.split("_").filter(n => n);
      obj[propWithValues[0]] = propWithValues.slice(1);
    });
    return obj;
  },
};

export const View: React.FC<ViewProps> = ({ match }) => {
  const [sort, setSort] = useQueryParam("sortBy", StringParam);
  const [attributeFilters, setAttributeFilters] = useQueryParam(
    "filters",
    FilterQuerySet
  );

  const clearFilters = () => {
    setAttributeFilters({});
  };

  const onFiltersChange = (name, value) => {
    if (attributeFilters && attributeFilters.hasOwnProperty(name)) {
      if (attributeFilters[name].includes(value)) {
        if (filters.attributes[`${name}`].length === 1) {
          const att = { ...attributeFilters };
          delete att[`${name}`];
          setAttributeFilters({
            ...att,
          });
        } else {
          setAttributeFilters({
            ...attributeFilters,
            [`${name}`]: attributeFilters[`${name}`].filter(
              item => item !== value
            ),
          });
        }
      } else {
        setAttributeFilters({
          ...attributeFilters,
          [`${name}`]: [...attributeFilters[`${name}`], value],
        });
      }
    } else {
      setAttributeFilters({ ...attributeFilters, [`${name}`]: [value] });
    }
  };

  const filters: IFilters = {
    attributes: attributeFilters,
    pageSize: PRODUCTS_PER_PAGE,
    priceGte: null,
    priceLte: null,
    sortBy: sort || null,
  };
  const variables = {
    ...filters,
    attributes: filters.attributes
      ? convertToAttributeScalar(filters.attributes)
      : {},
    id: getGraphqlIdFromDBId(match.params.id, "Category"),
    sortBy: convertSortByFromString(filters.sortBy),
  };

  const sortOptions = [
    {
      label: "Цэвэрлэх...",
      value: null,
    },
    {
      label: "Үнэ өсөхөөр",
      value: "price",
    },
    {
      label: "Үнэ буурахаар",
      value: "-price",
    },
    {
      label: "Нэр өсөхөөр",
      value: "name",
    },
    {
      label: "Нэр буурахаар",
      value: "-name",
    },
    {
      label: "Хуучин нь эхэндээ",
      value: "updated_at",
    },
    {
      label: "Шинэ нь эхэндээ",
      value: "-updated_at",
    },
  ];

  return (
    <NetworkStatus>
      {isOnline => (
        <TypedCategoryProductsQuery
          variables={variables}
          errorPolicy="all"
          loaderFull
        >
          {({ loading, data, loadMore }) => {
            const canDisplayFilters = maybe(
              () => !!data.attributes.edges && !!data.category.name,
              false
            );

            if (canDisplayFilters) {
              const handleLoadMore = () =>
                loadMore(
                  (prev, next) => ({
                    ...prev,
                    products: {
                      ...prev.products,
                      edges: [...prev.products.edges, ...next.products.edges],
                      pageInfo: next.products.pageInfo,
                    },
                  }),
                  { after: data.products.pageInfo.endCursor }
                );

              return (
                <MetaWrapper
                  meta={{
                    description: data.category.seoDescription,
                    title: data.category.seoTitle,
                    type: "product.category",
                  }}
                >
                  <Page
                    clearFilters={clearFilters}
                    attributes={data.attributes.edges.map(edge => edge.node)}
                    category={data.category}
                    displayLoader={loading}
                    hasNextPage={maybe(
                      () => data.products.pageInfo.hasNextPage,
                      false
                    )}
                    sortOptions={sortOptions}
                    activeSortOption={filters.sortBy}
                    filters={filters}
                    products={data.products}
                    onAttributeFiltersChange={onFiltersChange}
                    onLoadMore={handleLoadMore}
                    activeFilters={
                      filters!.attributes
                        ? Object.keys(filters!.attributes).length
                        : 0
                    }
                    onOrder={value => {
                      setSort(value.value);
                    }}
                  />
                </MetaWrapper>
              );
            }

            if (data && data.category === null) {
              return <NotFound />;
            }

            if (!isOnline) {
              return <OfflinePlaceholder />;
            }
          }}
        </TypedCategoryProductsQuery>
      )}
    </NetworkStatus>
  );
};

export default View;
