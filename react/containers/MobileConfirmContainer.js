import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { withRouter } from 'next/router';
import creditCartType from 'credit-card-type';
import moment from 'moment';
import axios from 'axios';
import {
  packages,
  billingFormValidator,
  normalizeCardNumber,
  normalizeSecurityCode,
  getParameterByName,
  getQueryString,
  getRevenueAfterDiscount,
  getDiscountPercent,
  getDiscountAmount,
  testCardNumbers,
} from 'helpers';
import {
  TextField,
  Spinner,
  MobileCardExpiryField,
  FooterMobileNew,
} from 'react/components/common';
import { OrderActions } from 'redux/actions';

/**
 * @class MobileConfirmContainerComponent
 * @extends {React.PureComponent}
 * @description This is the equivalant of PromoCheckoutContainer on Mobile
 */
class MobileConfirmContainerComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isSame: true,
      summaryOpen: false,
      pack: {},
    };
    this.toggleSummary = this.toggleSummary.bind(this);
  }

  componentDidMount() {
    const { localStorage } = window;
    // eslint-disable-next-line
    this.setState({
      pack: JSON.parse(localStorage.getItem('pack')),
      summaryOpen: !this.props.isAuthentic.isAuthenticUser,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.submitStatus !== 'success' &&
      this.props.submitStatus === 'success'
    ) {
      const queryString = getQueryString();
      setTimeout(
        () => window.location.assign(`/promo/mobile/upsell-1?${queryString}`),
        1000,
      );
    }
  }

  getPrice() {
    const priceToShow = this.state.pack.packagePrice || this.state.pack.price;
    return priceToShow;
  }

  sendTransactionDetails = () => {
    const { localStorage } = window;
    const { cid } = this.props.query;
    const id = `${this.state.pack.id}`;
    const revenue = getRevenueAfterDiscount({ cid, revenue: this.getPrice() });
    const abtastyParams = JSON.parse(localStorage.getItem('abtastyParams'));
    const eventsArray = ['mobile-hp-benefits-module-test-checkout'];
    const tracking_data = {
      device_type: 'MOBILE_PHONE',
      ip: abtastyParams ? abtastyParams.ip : '',
      origin: 'MobileConfirmContainer',
      timestamp: moment().format(),
      visitor_id: abtastyParams ? abtastyParams.visitorId : '',
    };
    const postData = {};

    eventsArray.forEach((event, index) => {
      postData[index] = {
        name: event,
        id,
        revenue,
        shipping: '0',
        tracking_data,
        action: 'transaction_event',
      };
    });

    axios.post('/multicampaign-abtasty', postData);
  };

  confirmOrder = values => {
    // this.sendTransactionDetails();
    const { localStorage } = window;
    const customerData = JSON.parse(localStorage.getItem('leadData'));

    if (this.state.isSame) {
      values.Email = customerData.email;
      values.Phone = customerData.phoneNumber;
      values.Address1 = customerData.address1;
      values.Address2 = customerData.address2;
      values.City = customerData.city;
      values.FirstName = customerData.firstName;
      values.LastName = customerData.lastName;
      values.ZipCode = customerData.postalCode;
      values.State = customerData.state;
    }

    const { router } = this.props;
    const pack = { id: getParameterByName('productId') };
    this.props.placeOrder({
      values,
      pack,
      router,
      nextUrl: '/promo/mobile/upsell-1',
      cid: this.props.query.cid,
    });
  };

  toggleSummary() {
    this.setState({ summaryOpen: !this.state.summaryOpen });
  }

  _checkCardType(cc) {
    if (!cc) return;

    const value = cc.toString().replace(/\s/g, '');
    const cc_type = creditCartType(value);

    if (cc_type && cc_type[0] && value.length > 3) {
      this.setState({ active_cc_type: cc_type[0].type });
    } else if (value.length < 3) {
      this.setState({ active_cc_type: '' });
    } else if (value.slice(0, 4) === testCardNumbers[0].slice(0, 4)) {
      this.setState({ active_cc_type: 'visa' });
    }
  }

  render() {
    const { active_cc_type } = this.state;

    return (
      <div id="container">
        {this.props.submitStatus === 'submitting' && <Spinner />}
        <img src="/static/promo/mobile/images/images/top-img.jpg" alt="" />
        <div id="ck-sec2">
          <p className="chk-toptxt1" style={{ margin: '0px' }}>
            enter your payment information
          </p>
          {/*<div id="form-info">*/}
            {/*<div className="detailbox">*/}
              {/*<div*/}
                {/*className={`${*/}
                  {/*this.state.summaryOpen ? 'rotate' : ''*/}
                {/*} order-summry smrhding`}*/}
                {/*onClick={this.toggleSummary}*/}
              {/*>*/}
                {/*Order Summary*/}
              {/*</div>*/}
              {/*<div*/}
                {/*className={`${*/}
                  {/*this.state.summaryOpen ? '' : 'display-none'*/}
                {/*} rgtbox`}*/}
              {/*>*/}
                {/*<div className="pricelist" id="btl1">*/}
                  {/*<p className="rgtboxtxt1">*/}
                    {/*<span>Yeah Keto</span>*/}
                    {/*<br />*/}
                    {/*{this.state.pack.name}{' '}*/}
                  {/*</p>*/}
                  {/*<ul className="rgtlist">*/}
                    {/*<li className="one">Price:</li>*/}
                    {/*<li className="two">${this.state.pack.packagePrice}</li>*/}
                    {/*<li className="one">Shipping &amp; Handling:</li>*/}
                    {/*<li className="two"> $0.00 </li>*/}
                    {/*<li*/}
                      {/*className="one"*/}
                      {/*style={{*/}
                        {/*background: '#143869',*/}
                        {/*color: '#fff',*/}
                        {/*marginTop: '15px',*/}
                      {/*}}*/}
                    {/*>*/}
                      {/*<span>TOTAL:</span>*/}
                    {/*</li>*/}
                    {/*<li*/}
                      {/*className="two"*/}
                      {/*style={{*/}
                        {/*background: '#143869',*/}
                        {/*color: '#fff',*/}
                        {/*marginTop: '15px',*/}
                      {/*}}*/}
                    {/*>*/}
                      {/*<span>${this.state.pack.packagePrice}</span>*/}
                    {/*</li>*/}
                  {/*</ul>*/}
                {/*</div>*/}
                {/*<center>*/}
                  {/*<img*/}
                    {/*src="/static/promo/mobile/images/images/post.jpg"*/}
                    {/*width="100%"*/}
                    {/*alt=""*/}
                  {/*/>*/}
                {/*</center>*/}
              {/*</div>*/}
            {/*</div>*/}
          {/*</div>*/}
        </div>
        <div className="clearall" />
        <div className="frm-bg checkout">
          <div className="sameas">
            <div className="membership">
              <div className="cards">
                {this.props.isAuthentic.isAuthenticUser && (
                  <span className="cards-prefix">We accept:</span>
                )}
                <span
                  className={`card-visa ${
                    active_cc_type === 'visa' ? 'active' : ''
                  }`}
                >
                  <img src="/static/Visa.png" className="card-image" alt="" />
                </span>
                <span
                  className={`card-mastercard ${
                    active_cc_type === 'master-card' ? 'active' : ''
                  }`}
                >
                  <img
                    src="/static/Mastercard.png"
                    className="card-image"
                    alt=""
                  />
                </span>
                <span
                  className={`card-discover" ${
                    active_cc_type === 'american-express' ? 'active' : ''
                  }`}
                >
                  <img src="/static/amex.png" className="card-image" alt="" />
                </span>
                <span
                  className={`card-discover" ${
                    active_cc_type === 'discover' ? 'active' : ''
                  }`}
                >
                  <img
                    src="/static/discover.png"
                    className="card-image"
                    alt=""
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="clearall" />
          <div
            style={{ display: 'block', padding: '0 0 0 33px' }}
            className="mobile-payment-wrapper"
            id="cardDiv"
          >
            <div className="clearall" />
            <div className="clearall" />
            <Field
              containerClass="frmelmnts2"
              component={TextField}
              name="cardNumber"
              className="creditcard"
              placeholder="•••• •••• •••• ••••"
              onChange={e => this._checkCardType(e.target.value)}
              label="Card Number*:"
              normalize={normalizeCardNumber}
              type="tel"
              autoComplete="cc-number"
              autoCorrect="off"
            />
            <div className="clearall" />
            <Field name="cardExpiry" component={MobileCardExpiryField} />
            <div className="clearall" />
            <Field
              name="cardSecurityCode"
              component={props => {
                const hasError = props.meta.touched && props.meta.error;
                const valid = props.input.value && props.meta.valid;
                return (
                  <div
                    className={`frmelmnts2 frmelmnts-cvv fv-has-feedback ${hasError &&
                      'fv-has-error'} ${valid && 'fv-has-success'}`}
                  >
                    <label>
                      CVV/CID<span>*</span>:
                    </label>
                    <input
                      {...props.input}
                      className="short"
                      autoCorrect="off"
                      autoComplete="cc-csc"
                      type="tel"
                    />
                    <i
                      style={{ display: hasError || valid }}
                      className={`fv-control-feedback mobile-cvv ${hasError &&
                        'fa fa-times'} ${valid && 'fa fa-check'}`}
                    />
                    <img
                      src="/static/promo/mobile/images/cvv.png"
                      width="402"
                      height="69"
                      alt=""
                      className="cvv"
                    />
                    <div className="clearall" />
                    {props.meta.touched &&
                      props.meta.error && (
                        <small className="fv-help-block">
                          {props.meta.error}
                        </small>
                      )}
                  </div>
                );
              }}
              normalize={normalizeSecurityCode}
            />
          </div>
        </div>
        <div className="clearall" />
        <div className="btn-box">
          <img
            src="/static/promo/mobile/images/images/secure-img.png"
            className="secure-img"
            alt=""
          />
          <a href="#" onClick={this.props.handleSubmit(this.confirmOrder)}>
            <img
              src="/static/promo/mobile/images/images/ck-btn.png"
              alt=""
              className="trial-btn pulse"
            />
          </a>
          <img
            src="/static/promo/mobile/images/images/c-logo.png"
            alt=""
            className="c-logo"
          />
        </div>
        <FooterMobileNew />
      </div>
    );
  }
}

// eslint-disable-next-line
const MobileConfirmContainerPage = reduxForm({
  form: 'MobileConfirmForm',
  validate: billingFormValidator,
})(withRouter(MobileConfirmContainerComponent));

function mapStateToProps(reduxState, ownProps) {
  const { productId } = ownProps.query;
  const pack = packages.find(p => String(p.id) === String(productId));
  let props = {
    initialValues: {},
    pack,
    abtastyParams: reduxState.auth.abtastyParams,
    isAuthentic: reduxState.auth.isAuthentic,
  };

  if (reduxState.order) {
    props = {
      ...props,
      submitStatus: reduxState.order.placeOrderStatus,
      submitFailure: reduxState.order.placeOrderError,
    };
  }

  return props;
}

const MobileConfirmContainer = connect(mapStateToProps, {
  ...OrderActions,
})(MobileConfirmContainerPage);

export default MobileConfirmContainer;
