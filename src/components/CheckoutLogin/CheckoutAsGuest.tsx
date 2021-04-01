import React from "react";
// import { FormattedMessage } from "react-intl";

// import { Link } from "react-router-dom";
// import { Button, OverlayTheme, OverlayType } from "..";
import { OverlayTheme, OverlayType } from "..";
import { OverlayContextInterface } from "../Overlay";

const CheckoutAsGuest: React.FC<{
  overlay: OverlayContextInterface;
  checkoutUrl: string;
}> = ({ overlay, checkoutUrl }) => (
  <div className="checkout-login__guest">
    {/* <h3 className="checkout__header">
      <FormattedMessage defaultMessage="Зочны хувиар үргэлжлүүл" />
    </h3>
    <p>
      <FormattedMessage defaultMessage="If you don’t wish to register an account, don’t worry. You can checkout as a guest. We care about you just as much as any registered user." />
    </p>
    <Link to={checkoutUrl}>
      <Button testingContext="continueAsGuestButton">
        <FormattedMessage defaultMessage="Зочны хувиар үргэлжлүүл" />
      </Button>
    </Link> */}

    <p>
      {/* <FormattedMessage defaultMessage="or you can" />{" "} */}
      <span
        data-test="showRegisterOverlay"
        className="u-link"
        onClick={() => overlay.show(OverlayType.register, OverlayTheme.right)}
      >
        {/* <FormattedMessage defaultMessage="create an account" /> */}
        Шинээр бүртгүүлэх
      </span>
    </p>
  </div>
);

export default CheckoutAsGuest;
