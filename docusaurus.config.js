// @ts-check
/** One site, two sections: Integration guides and SDK reference.
 *  Splitting these across two sites means two deploys, two searches, and merchants
 *  bouncing between domains mid-integration. */
const config = {
  title: 'Paywize Docs',
  tagline: 'Accept payments on your website',
  favicon: 'img/favicon.ico',
  url: 'https://docs.paywize.in',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'warn' } },
  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    ['classic', {
      docs: {
        routeBasePath: '/',
        sidebarPath: './sidebars.js',
        editUrl: 'https://github.com/paywize/paywize-docs/edit/main/',
      },
      blog: false,
      theme: { customCss: './src/css/custom.css' },
    }],
  ],

  themeConfig: {
    colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
    navbar: {
      title: 'Paywize',
      items: [
        { type: 'docSidebar', sidebarId: 'integration', position: 'left', label: 'Integration' },
        { type: 'docSidebar', sidebarId: 'sdk', position: 'left', label: 'SDK Reference' },
        { href: 'https://github.com/paywize', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Integration', items: [
          { label: 'Quickstart', to: '/integration/quickstart' },
          { label: 'Web checkout', to: '/integration/web-checkout' },
          { label: 'Webhooks', to: '/integration/webhooks' },
        ]},
        { title: 'SDKs', items: [
          { label: 'Node.js', to: '/sdk/node' },
          { label: 'Browser JS', to: '/sdk/js' },
        ]},
      ],
      copyright: `© ${new Date().getFullYear()} Paywize Technologies Private Limited`,
    },
    prism: { additionalLanguages: ['bash', 'json'] },
  },
};

export default config;
