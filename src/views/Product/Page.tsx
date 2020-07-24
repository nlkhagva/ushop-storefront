import classNames from "classnames";
import React from "react";
import Media from "react-media";

import { ProductDescription as NewProductDescription } from "../../@next/components/molecules";
import { ProductGallery } from "../../@next/components/organisms";
import { Breadcrumbs, ProductDescription } from "../../components";
import { structuredData } from "../../core/SEO/Product/structuredData";
import { generateCategoryUrl, generateProductUrl } from "../../core/utils";
import { smallScreen } from "../../globalStyles/scss/variables.scss";
import UshopLogo from "../../images/unurshop/logo-v3.png";
import GalleryCarousel from "./GalleryCarousel";
import OtherProducts from "./Other";
import { IProps } from "./types";

const populateBreadcrumbs = product => [
  {
    link: generateCategoryUrl(product.category.id, product.category.name),
    value: product.category.name,
  },
  {
    link: generateProductUrl(product.id, product.name),
    value: product.name,
  },
];

const Page: React.FC<
  IProps & {
    queryAttributes: Record<string, string>;
    onAttributeChangeHandler: (slug: string | null, value: string) => void;
  }
> = ({ add, product, items, queryAttributes, onAttributeChangeHandler }) => {
  const productGallery: React.RefObject<HTMLDivElement> = React.useRef();

  const [variantId, setVariantId] = React.useState("");

  const getImages = () => {
    if (product.variants && variantId) {
      const variant = product.variants
        .filter(variant => variant.id === variantId)
        .pop();
      if (variant.images.length > 0) {
        return variant.images;
      }
      return product.images;
    }
    return product.images;
  };

  const productDescription = (
    <ProductDescription
      items={items}
      productId={product.id}
      name={product.name}
      productVariants={product.variants}
      pricing={product.pricing}
      queryAttributes={queryAttributes}
      addToCart={add}
      setVariantId={setVariantId}
      onAttributeChangeHandler={onAttributeChangeHandler}
    />
  );

  return (
    <div className="product-page">
      <div className="container">
        <Breadcrumbs breadcrumbs={populateBreadcrumbs(product)} />
      </div>
      <div className="container">
        <div className="product-page__product">
          {/* Add script here */}
          <script className="structured-data-list" type="application/ld+json">
            {structuredData(product)}
          </script>

          {/*  */}
          <Media query={{ maxWidth: smallScreen }}>
            {matches =>
              matches ? (
                <>
                  <img
                    src={UshopLogo}
                    alt="Zara"
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      height: "60px",
                      width: "60px",
                      zIndex: 2,
                      borderRadius: "100%",
                      boxShadow: "1px 1px 5px rgba(0,0,0,.3)",
                    }}
                  />
                  <GalleryCarousel images={getImages()} />
                  <div className="product-page__product__info">
                    {productDescription}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="product-page__product__gallery"
                    ref={productGallery}
                  >
                    <ProductGallery images={getImages()} />
                  </div>
                  <div className="product-page__product__info">
                    <div
                      className={classNames(
                        "product-page__product__info--fixed"
                      )}
                    >
                      {productDescription}
                    </div>
                  </div>
                </>
              )
            }
          </Media>
        </div>
      </div>
      <div className="container">
        <div className="product-page__product__description">
          <NewProductDescription
            descriptionJson={product.descriptionJson}
            attributes={product.attributes}
          />
        </div>
      </div>
      <OtherProducts products={product.category.products.edges} />
    </div>
  );
};

export default Page;
