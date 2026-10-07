import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    emoji: '🧭',
    title: '总体架构',
    description: (
      <>
        模块化分层 · ArchTests 架构守卫 · 认证授权 · 24 表数据模型，一张图讲清系统全貌。
      </>
    ),
    to: '/docs/architecture/overall',
  },
  {
    emoji: '🕳️',
    title: '踩坑记录',
    description: (
      <>
        真实踩过的坑：现象 → 根因 → 解法 → 预防。.NET 并行竞态、SWC 缓存、软删除唯一索引……
        同样的坑不踩第二遍。
      </>
    ),
    to: '/docs/pitfalls/',
  },
  {
    emoji: '🏷️',
    title: '版本号规范',
    description: (
      <>
        CalVer 周版本制：v年.ISO周.周内修订。文档、git tag、部署三处对齐，每周一发。
      </>
    ),
    to: '/docs/dev/versioning',
  },
  {
    emoji: '📜',
    title: '更新日志',
    description: (
      <>
        每个版本一篇：改了什么、修了什么、为什么。支持 RSS 订阅。
      </>
    ),
    to: '/blog',
  },
];

function Feature({emoji, title, description, to}) {
  return (
    <div className={clsx('col col--3')}>
      <Link to={to} className={styles.featureCard}>
        <div className="text--center padding-top--lg">
          <span className={styles.featureEmoji}>{emoji}</span>
        </div>
        <div className="text--center padding-horiz--md padding-bottom--lg">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
