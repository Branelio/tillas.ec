// ==============================================
// Navigation Types — React Navigation
// ==============================================

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'product/[slug]': { slug: string };
  'payment/[orderId]': { orderId: string };
  'orders': undefined;
  'cart': undefined;
  'profile': undefined;
  'search': undefined;
  'drops': undefined;
  'checkout': undefined;
  'loyalty': undefined;
  'login': undefined;
  'register': undefined;
};
