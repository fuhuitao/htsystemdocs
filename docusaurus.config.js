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

  // GitHub Pages 部署地址：https://fuhuitao.github.io/htsystemdocs/
  // 若以后迁移到内网/自定义域名，改这两行即可
  url: 'https://fuhuitao.github.io/',
  baseUrl: '/htsystemdocs/',

  // GitHub Pages 部署信息（Actions 工作流依赖）
  organizationName: 'fuhuitao',
  projectName: 'htsystemdocs',
  // GitHub Pages 静态托管推荐关闭尾斜杠（避免 /path/ 与 /path 双份缓存）
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  // Mermaid 架构图渲染（架构/数据模型文档依赖）
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

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
                label: '总体架构',
                to: '/docs/architecture/overall',
              },
              {
                label: '踩坑记录',
                to: '/docs/pitfalls/',
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
