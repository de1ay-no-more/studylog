const articles = [
  {
    id: "html-semantic",
    title: "HTML5 语义化标签学习笔记",
    category: "HTML",
    date: "2026-06-02",
    summary: "从 header、main、article 到 section，梳理语义化标签如何提升结构清晰度与可访问性。",
    tags: ["HTML5", "语义化", "可访问性"],
    url: "posts/html-semantic.html",
    featured: true
  },
  {
    id: "css-grid-flex",
    title: "CSS Flex 与 Grid：什么时候该用哪一个？",
    category: "CSS",
    date: "2026-05-26",
    summary: "对比一维布局和二维布局的差异，用项目卡片、导航栏和文章列表举例说明选择思路。",
    tags: ["CSS3", "Flex", "Grid", "响应式"],
    url: "posts/css-grid-flex.html",
    featured: true
  },
  {
    id: "js-localstorage",
    title: "使用 localStorage 实现前端数据持久化",
    category: "JavaScript",
    date: "2026-05-18",
    summary: "以留言板为例，介绍浏览器本地存储、JSON 序列化、表单验证和安全渲染。",
    tags: ["JavaScript", "localStorage", "表单验证"],
    url: "posts/js-localstorage.html",
    featured: true
  },
  {
    id: "responsive-design",
    title: "响应式网页设计基础：从移动端开始思考",
    category: "学习笔记",
    date: "2026-05-10",
    summary: "记录 viewport、流式布局、断点、触控目标和移动端可读性等响应式设计要点。",
    tags: ["响应式", "移动端", "用户体验"],
    url: "posts/responsive-design.html",
    featured: false
  },
  {
    id: "dark-theme",
    title: "深色主题设计实践：不只是把背景变黑",
    category: "CSS",
    date: "2026-04-30",
    summary: "总结深色界面的层级、对比、边框、阴影与主题变量，让暗黑风格保持简洁且可读。",
    tags: ["暗黑模式", "CSS 变量", "视觉设计"],
    url: "posts/dark-theme.html",
    featured: false
  }
];

const projects = [
  {
    title: "Vista-AI 新闻聚合",
    type: "个人项目",
    status: "进行中",
    description: "基于 Java 与 Python 混合架构的 AI 新闻聚合问答系统，支持全文检索、RAG 问答与热度趋势分析。",
    role: "全栈开发",
    tags: ["Spring Boot", "FastAPI", "Qdrant", "Elasticsearch", "Redis", "MySQL"],
    cover: "VISTA",
    coverTone: "vista",
    link: "https://www.vistasearch.site/"
  },
  {
    title: "仿 BILIBILI 在线视频分享系统",
    type: "个人项目",
    status: "已完成",
    description: "基于 Spring Cloud 微服务架构的一站式视频平台，按业务域拆分为资源、主站、互动、管理后台四个独立服务，支持视频发布、在线播放、弹幕评论、智能搜索等核心功能。",
    role: "全栈开发",
    tags: ["Spring Cloud", "Nacos", "Gateway", "OpenFeign", "Seata", "Elasticsearch", "Redis", "MySQL", "FFmpeg"],
    cover: "视频分享系统",
    coverTone: "bilibili",
    link: ""
  },
  {
    title: "StudyLog 个人技术博客",
    type: "课程项目",
    status: "已完成",
    description: "基于 HTML5、CSS3 与原生 JavaScript 构建的静态个人技术博客，包含文章列表、分类筛选、关键词搜索、主题切换、留言板和响应式布局。",
    role: "页面结构、视觉样式与前端交互实现",
    tags: ["HTML5", "CSS3", "JavaScript", "Responsive", "localStorage"],
    cover: "个人博客",
    coverTone: "blog",
    link: "index.html"
  }
];

const skills = [
  { name: "HTML / CSS / JavaScript", level: 86 },
  { name: "Spring Boot 与微服务", level: 82 },
  { name: "搜索引擎与数据存储", level: 78 },
  { name: "Python FastAPI 与 AI 应用", level: 74 },
  { name: "响应式页面与交互体验", level: 80 }
];


