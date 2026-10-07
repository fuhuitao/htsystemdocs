// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare a Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'HTSystem',
  tagline: '物流供应链管理系统 · 技术文档',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  // 注意：v4 flag 会连带启用 faster（Rspack/SWC），本机 DACL 过不了 SWC 安全校验，故不启用
  // future: {
  //   v4: true,
  // },

  // 部署到内网时改为实际域名/IP
  url: 'http://localhost',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          // blog 用作「更新日志」：每篇 = 一个版本，按发布日倒序天然成时间线
          showReadingTime: false,
          blogTitle: '更新日志',
          blogDescription: 'HTSystem 版本发布记录（版本号规则：v年.周.周内修订，如 v2026.41.0）',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: '全部版本',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'HTSystem',
        logo: {
          alt: 'HTSystem Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'defaultSidebar',
            position: 'left',
            label: '文档',
          },
          {to: '/blog', label: '更新日志', position: 'left'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '系统概览',
                to: '/docs/intro',
              },
              {
                label: '版本号规范',
                to: '/docs/dev/versioning',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: '更新日志',
                to: '/blog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} HTSystem. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
