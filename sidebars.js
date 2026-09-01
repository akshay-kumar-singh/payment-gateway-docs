/** Two sidebars = the two sections in the navbar. */
const sidebars = {
  integration: [
    'intro',
    { type: 'category', label: 'Get started', collapsed: false,
      items: ['integration/quickstart', 'integration/web-checkout'] },
    { type: 'category', label: 'Confirm the payment', collapsed: false,
      items: ['integration/confirm', 'integration/webhooks'] },
    'integration/testing',
  ],
  sdk: [
    'sdk/overview',
    { type: 'category', label: 'Server SDKs', collapsed: false, items: ['sdk/node'] },
    { type: 'category', label: 'Client SDKs', collapsed: false, items: ['sdk/js'] },
  ],
};
export default sidebars;
