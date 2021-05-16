import * as React from "react";
import { useAlert } from "react-alert";

import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";

import { DropdownMenu, IconButton } from "@components/atoms";
import { TaxedMoney } from "@components/containers";
// import { OrderDetail_lines } from "@saleor/sdk/lib/fragments/gqlTypes/OrderDetail";
// import { OrderByToken_orderByToken } from "@saleor/sdk/lib/queries/gqlTypes/OrderByToken";
// import { UserOrderByToken_orderByToken } from "@saleor/sdk/lib/queries/gqlTypes/UserOrderByToken";
import {
  checkoutMessages,
  translateOrderStatus,
  translatePaymentStatus,
} from "@temp/intl";

import { orderHistoryUrl } from "../../../app/routes";
import { AddressSummary, CartTable, NotFound } from "../../../components";
// import { ILine } from "../../../components/CartTable/ProductRow";
import { PRODUCT_TYPE_SHIPPING } from "@app/custom/constants";
// import ProductList from "../../../components/OverlayManager/Cart/ProductList";
import { OrderPayment } from "./OrderPayment";
import { OrderNote } from "./OrderNote";
import { TypedPaymentOrderRemain } from "./query";
import { UserOrderByToken_orderByToken } from "./gqlTypes/UserOrderByToken";

const ptShippingId = PRODUCT_TYPE_SHIPPING;

// const extractOrderLines = (lines: any[]): any[] => {
//   console.log(lines);
//   return lines.map((line) => ({
//     quantity: line.quantity,
//     totalPrice: line.totalPrice,
//     ...line.variant,
//     name: line.productName,
//   }));
//   // .sort((a, b) =>
//   //   b.variant.id.toLowerCase().localeCompare(a.variant.id.toLowerCase())
//   // );
// };

const extractOrderLinesUshop = (lines: any[]): any[] => {
  const ushops = [];

  const variants = lines.map(tmp => tmp.variant);
  const productVariants = variants.filter(
    tmp => tmp.product.productType.id !== ptShippingId
  );
  const shippingVariants = variants.filter(
    tmp => tmp.product.productType.id === ptShippingId
  );

  productVariants.map(variant => {
    const shop = ushops.find(el => el.id === variant.product.ushop.id);
    const line = lines.find(el => el.variant.id === variant.id);

    // if (variant.product.metadata) {
    //   line.variant.product["metadata"] = variant.product.metadata;
    // }

    if (!shop) {
      ushops.push({
        ...variant.product.ushop,
        lines: [line],
      });
    } else {
      shop.lines.push(line);
    }
  });

  shippingVariants.map(el => {
    const ushop = ushops.find(shop => shop.id === el.product.ushop.id);

    if (ushop) {
      ushop.shippingVariant = el;
    }
  });

  console.log(ushops);
  return ushops;
};

const Page: React.FC<{
  guest: boolean;
  order: UserOrderByToken_orderByToken;
  refetchOrder: any;
  downloadInvoice: () => void;
}> = props => {
  const { guest, order, refetchOrder, downloadInvoice } = props;
  const intl = useIntl();
  const alert = useAlert();

  const onCompletedPayment = () => {
    // console.log("complete payment");
    alert.show({ title: "Төлбөр амжилттай төлөгдлөө" }, { type: "success" });
    refetchOrder();
  };

  return order ? (
    <>
      {!guest && (
        <Link className="order-details__link" to={orderHistoryUrl}>
          <FormattedMessage defaultMessage="Захиалгын түүх руу очих" />
        </Link>
      )}
      <div className="order-details__header">
        <div className="">
          <h4>
            <FormattedMessage
              defaultMessage="Захиалгын дугаар: #{orderNum}"
              values={{ orderNum: order.number }}
            />
          </h4>
          <p className="order-details__status">
            {translatePaymentStatus(order.paymentStatusDisplay, intl)} /{" "}
            {translateOrderStatus(order.statusDisplay, intl)}
          </p>
        </div>
        {"invoices" in order && order.invoices?.length > 0 && (
          <div className="order-details__header-menu">
            <DropdownMenu
              type="clickable"
              header={
                <IconButton
                  testingContext="expandButton"
                  name="expand"
                  size={28}
                />
              }
              items={[
                {
                  onClick: downloadInvoice,
                  content: (
                    <span>
                      <FormattedMessage
                        defaultMessage="Download invoice"
                        description="action in popup menu in order view"
                      />
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
      <div className="">
        {Math.abs(order.totalBalance.amount) > 0 && (
          <TypedPaymentOrderRemain onCompleted={onCompletedPayment}>
            {paymentOrderRemain => (
              <OrderPayment order={order} mutation={paymentOrderRemain} />
            )}
          </TypedPaymentOrderRemain>
        )}
      </div>
      {/* <div className="order-details__body">
        <ProductList lines={order.lines} />
      </div> */}
      <CartTable
        lines={extractOrderLinesUshop(order.lines)}
        totalCost={<TaxedMoney taxedMoney={order.total} />}
        deliveryCost={<TaxedMoney taxedMoney={order.shippingPrice} />}
        subtotal={order.subtotal}
      />

      <table className="ushop-price-table" style={{ fontSize: "1rem" }}>
        <tbody>
          <tr>
            <td>Барааны нийт</td>
            <td>
              <TaxedMoney taxedMoney={order.subtotal} />
            </td>
          </tr>
          {order.shippingPrice && (
            <tr>
              <td>Хүргэлт</td>
              <td>
                <TaxedMoney taxedMoney={order.shippingPrice} />
              </td>
            </tr>
          )}
          {order.total && (
            <tr>
              <td>Захиалгын нийт</td>
              <td>
                <TaxedMoney taxedMoney={order.total} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="order-details__summary">
        <div>
          <h4>
            <FormattedMessage {...checkoutMessages.shippingAddress} />
          </h4>
          <AddressSummary
            address={order.shippingAddress}
            email={order.userEmail}
            // paragraphRef={this.shippingAddressRef}
          />
        </div>
      </div>
      {!guest && (
        <div>
          <OrderNote order={order} />
        </div>
      )}
    </>
  ) : (
    <NotFound />
  );
};
export default Page;
