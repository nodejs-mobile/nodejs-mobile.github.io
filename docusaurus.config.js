// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Node.js Mobile',
  tagline: 'Full-fledged Node.js on Android and iOS',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://nodejs-mobile.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'nodejs-mobile', // Usually your GitHub org/user name.
  projectName: 'nodejs-mobile.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/nodejs-mobile/nodejs-mobile.github.io/tree/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/nodejs-mobile/nodejs-mobile.github.io/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Node.js Mobile',
        logo: {
          alt: 'Node.js Mobile logo',
          src: 'img/nodejs-mobile-logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'guide/intro',
            position: 'left',
            label: 'Guide'
          },
          {
            type: 'doc',
            docId: 'api/differences',
            position: 'left',
            label: 'API'
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/nodejs-mobile',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Guide',
                to: '/docs/guide/intro',
              },
              {
                label: 'API',
                to: '/docs/api/differences',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/nodejs-mobile',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/nodejs-mobile/nodejs-mobile/discussions',
              },
              {
                label: 'Open Collective',
                href: 'https://opencollective.com/nodejs-mobile',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
            ],
          },
        ],
        copyright: `Node.js Mobile is NOT endorsed by or affiliated with the Node.js Foundation.${'\n\n'}
        Copyright © 2017–2021 Janea Systems, with contributions by
        Copyright © 2022–${new Date().getFullYear()} André Staltz.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java'],
      },
    }),
};

module.exports = config;
