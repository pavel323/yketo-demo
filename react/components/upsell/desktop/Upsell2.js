import React from 'react';
import { PromoSession } from 'react/components/common';
import { getQueryString } from 'helpers';

/**
 * @class Upsell2
 * @extends {React.PureComponent}
 * @description Desktop Component rendered after Upsell2 page
 */
class Upsell2 extends React.PureComponent {
  upgrade = () => {
    this.props.upgrade(4167, '/promo/desktop/thankyou');
  };

  skipUpsell = () => {
    window.location.assign(`/promo/desktop/upsell-2-1?${getQueryString()}`);
  };

  render() {
    return (
      <React.Fragment>
        <PromoSession pageType="upsellPage2" />
        <div className="up-bg">
          <div className="inner-container">
            <div className="up-inr">
              <img
                src="/static/promo/desktop/img/logo.png"
                className="up-logo"
                alt=""
              />
              <img
                src="/static/promo/desktop/img/chk-hdr.png"
                alt=""
                className="up-steps"
              />
              <div className="inr-chk inr-pack inr-upsell">
                <div className="upsell-sec">
                  <p className="up-hdg">
                    WAIT! YOU QUALIFY FOR A LIMITED TIME DISCOUNT
                  </p>
                  <p className="up-sub-hdg">
                    93% of customers who purchase <span>Yeah Keto</span> also
                    purchase <span>Yeah Caralluma</span>
                  </p>
                  <div className="up-box-bg">
                    <div className="up-lft up1-1-lft">
                      <img
                        src="/static/promo/desktop/img/up2-1-prd.png"
                        alt=""
                        className="up-prd"
                      />
                      <img
                        src="/static/promo/desktop/img/up-lft-img1.png"
                        alt=""
                        className="up-lft-img1"
                      />
                      <div className="up-seal">
                        <p>
                          save<br />$44%
                        </p>
                      </div>
                    </div>
                    <div className="up-rgt">
                      <p className="up-rgt-txt1">Curb Your Cravings With</p>
                      <img
                        src="/static/promo/desktop/img/up1-logo.png"
                        className="up1-logo"
                        alt=""
                      />
                      <p className="up-rgt-txt3">
                        Advanced Appetite Suppression*
                      </p>
                      <ul className="up-list">
                        <li>
                          <img
                            src="/static/promo/desktop/img/up-tick.png"
                            alt=""
                            className="for-desk"
                          />
                          <p>
                            Suppress<br />
                            <span>Appetite</span>
                          </p>
                        </li>
                        <li>
                          <img
                            src="/static/promo/desktop/img/up-tick.png"
                            alt=""
                            className="for-desk"
                          />
                          <p>
                            Reduces<br />
                            <span>Overeating</span>
                          </p>
                        </li>
                        <li>
                          <img
                            src="/static/promo/desktop/img/up-tick.png"
                            alt=""
                            className="for-desk"
                          />
                          <p>
                            Boost<br />
                            <span>Weight Loss</span>
                          </p>
                        </li>
                      </ul>
                      <div className="up-prd-info">
                        <p className="up-prd-p1 up2-prd-p1">
                          <span>Buy 2 Bottles + Get 1 Free</span>
                          <br />Save 60% Today{' '}
                        </p>
                        <p className="prd-prc prd1-1-prc">
                          <span>
                            <img
                              src="/static/promo/desktop/img/price-cut.png"
                              alt=""
                            />$120/<sup>ea</sup>
                          </span>{' '}
                          48/<sup>ea</sup>
                        </p>
                        <a onClick={this.upgrade}>
                          <img
                            src="/static/promo/desktop/img/up-btn.png"
                            alt="Update Order"
                            className="up-btn"
                          />
                        </a>
                        <a onClick={this.skipUpsell}>
                          <p className="no-p">
                            {' '}
                            No thanks, I’m not interested{' '}
                          </p>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export { Upsell2 };
