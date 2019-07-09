import React from 'react';

const packages = [
  {
    id: 4165,
    title: (
      <React.Fragment>
        Buy 3 Bottles +<span> Get 2 FREE</span>
      </React.Fragment>
    ),
    name: 'BUY 3 BOTTLES + GET 2 FREE',
    img: 'product-box1.png',
    desktopImg: '5pack.png',
    msg: 'BEST VALUE PACKAGE',
    regularPrice: '345.00',
    price: '39.00',
    packagePrice: '195.00',
    upsell: 1,
    saveAmount: '214.98',
  },
  {
    id: 4163,
    title: (
      <React.Fragment>
        BUY 2 BOTTLES <span> + GET 1 FREE</span>
      </React.Fragment>
    ),
    name: 'BUY 2 BOTTLES + GET 1 FREE',
    img: 'product-box2.png',
    desktopImg: '3pack.png',
    msg: 'POPULAR PACKAGE',
    regularPrice: '207.00',
    price: '49.00',
    packagePrice: '147.00',
    upsell: 2,
    saveAmount: '127.93',
  },
  {
    id: 4161,
    title: <React.Fragment>BUY 1 BOTTLE</React.Fragment>,
    name: 'BUY 1 BOTTLE',
    img: 'product-box3.png',
    desktopImg: '1pack.png',
    msg: 'SIMPLER PACKAGE',
    regularPrice: '79.00',
    price: '69.00',
    packagePrice: '69.00',
    upsell: 3,
    saveAmount: '26.20',

  },
];

export { packages };
