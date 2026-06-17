const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const THEME_KEY = "tech_blog_theme";
const GUESTBOOK_KEY = "tech_blog_guestbook";
const SPLASH_KEY = "studylog_splash_seen";

function initCustomCursor() {
  const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  if (!canUseCustomCursor) {
    document.documentElement.classList.remove("custom-cursor-boot");
    return;
  }

  document.documentElement.classList.add("custom-cursor-boot");
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "custom-cursor-dot";
  ring.className = "custom-cursor-ring";
  document.body.append(dot, ring);
  document.body.classList.add("custom-cursor-enabled");

  const savedPosition = loadFromStorage("tech_blog_cursor_position", null);
  const pointer = savedPosition || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const follower = { x: pointer.x, y: pointer.y };
  let isVisible = Boolean(savedPosition);
  let animationFrame = null;

  const placeDot = () => {
    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
  };

  const saveCursorPosition = () => {
    saveToStorage("tech_blog_cursor_position", pointer);
  };

  const showCursor = () => {
    if (isVisible) return;
    isVisible = true;
    document.body.classList.add("custom-cursor-visible");
  };

  const render = () => {
    follower.x += (pointer.x - follower.x) * 0.16;
    follower.y += (pointer.y - follower.y) * 0.16;
    ring.style.transform = `translate3d(${follower.x}px, ${follower.y}px, 0) translate(-50%, -50%)`;

    if (Math.abs(pointer.x - follower.x) > 0.2 || Math.abs(pointer.y - follower.y) > 0.2) {
      animationFrame = window.requestAnimationFrame(render);
    } else {
      follower.x = pointer.x;
      follower.y = pointer.y;
      animationFrame = null;
    }
  };

  const requestRender = () => {
    if (animationFrame === null) animationFrame = window.requestAnimationFrame(render);
  };

  const moveCursor = event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    placeDot();
    showCursor();
    requestRender();
  };

  placeDot();
  ring.style.transform = `translate3d(${follower.x}px, ${follower.y}px, 0) translate(-50%, -50%)`;
  if (isVisible) document.body.classList.add("custom-cursor-visible");

  window.addEventListener("pointermove", moveCursor, { passive: true });
  window.addEventListener("pointerdown", event => {
    moveCursor(event);
    saveCursorPosition();
    document.body.classList.add("custom-cursor-pressed");
  });
  window.addEventListener("pointerup", () => document.body.classList.remove("custom-cursor-pressed"));
  window.addEventListener("pagehide", () => {
    saveCursorPosition();
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
  });
  window.addEventListener("pointerleave", () => {
    isVisible = false;
    document.body.classList.remove("custom-cursor-visible", "custom-cursor-pressed");
  });
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(dateString));
}

function stripHTML(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function calculateReadingTime(text) {
  const cleanText = stripHTML(text || "").replace(/\s+/g, "");
  return Math.max(1, Math.ceil(cleanText.length / 450));
}

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadFromStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initSplashScreen(onDone = () => {}) {
  const splash = $("#splashScreen");
  const enter = $("#splashEnter");
  if (!splash || !enter) return false;

  const hideImmediately = () => {
    splash.classList.add("is-hidden");
    splash.setAttribute("aria-hidden", "true");
  };

  if (sessionStorage.getItem(SPLASH_KEY) === "true") {
    hideImmediately();
    return false;
  }

  const closeSplash = () => {
    sessionStorage.setItem(SPLASH_KEY, "true");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hideImmediately();
      onDone();
      return;
    }

    splash.classList.add("is-leaving");
    splash.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      splash.classList.add("is-hidden");
      onDone();
    }, 740);
  };

  enter.addEventListener("click", closeSplash);
  enter.focus({ preventScroll: true });
  return true;
}

function setActiveNav() {
  const page = document.body.dataset.page;
  const current = page === "post" ? "blog" : page;
  const navLinks = $("#navLinks");
  const links = $$(".nav-link");
  let activeLink = null;

  const moveIndicator = link => {
    if (!navLinks || !link || window.matchMedia("(max-width: 760px)").matches) return;
    const navRect = navLinks.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navLinks.style.setProperty("--nav-indicator-x", `${linkRect.left - navRect.left + 14}px`);
    navLinks.style.setProperty("--nav-indicator-width", `${Math.max(16, linkRect.width - 28)}px`);
    navLinks.style.setProperty("--nav-indicator-opacity", "1");
  };

  links.forEach(link => {
    const isActive = link.dataset.nav === current;
    link.classList.toggle("active", isActive);
    if (isActive) {
      activeLink = link;
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    link.addEventListener("mouseenter", () => moveIndicator(link));
    link.addEventListener("focus", () => moveIndicator(link));
  });

  navLinks?.addEventListener("mouseleave", () => moveIndicator(activeLink));
  window.addEventListener("resize", () => moveIndicator(activeLink));
  window.requestAnimationFrame(() => moveIndicator(activeLink));
}

const prefetchedPages = new Set();

function shouldPrefetchPages() {
  if (window.location.protocol === "file:") return false;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return true;
  if (connection.saveData) return false;

  const effectiveType = String(connection.effectiveType || "").toLowerCase();
  return !effectiveType.includes("2g");
}

function prefetchInternalPage(href) {
  if (!shouldPrefetchPages() || !href) return;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

  let targetUrl;
  try {
    targetUrl = new URL(href, window.location.href);
  } catch {
    return;
  }

  if (targetUrl.origin !== window.location.origin) return;
  if (targetUrl.pathname === window.location.pathname && targetUrl.hash) return;
  if (prefetchedPages.has(targetUrl.href)) return;

  prefetchedPages.add(targetUrl.href);
  const request = () => {
    window.fetch(targetUrl.href, { credentials: "same-origin" }).catch(() => {
      prefetchedPages.delete(targetUrl.href);
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(request, { timeout: 1200 });
  } else {
    window.setTimeout(request, 0);
  }
}

function initPageTransitions() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const linkSelector = "a[href]";

  const warmupLinks = scope => {
    $$(linkSelector, scope).forEach(link => {
      prefetchInternalPage(link.getAttribute("href"));
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => warmupLinks(document.body), { timeout: 1600 });
  } else {
    window.setTimeout(() => warmupLinks(document.body), 600);
  }

  document.addEventListener("pointerover", event => {
    const link = event.target.closest(linkSelector);
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
    prefetchInternalPage(link.getAttribute("href"));
  });

  document.addEventListener("focusin", event => {
    const link = event.target.closest(linkSelector);
    if (!link) return;
    prefetchInternalPage(link.getAttribute("href"));
  });

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest(linkSelector);
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin) return;
    if (targetUrl.pathname === window.location.pathname && targetUrl.hash) return;

    event.preventDefault();
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, 60);
  });
}

function initMobileNav() {
  const button = $("#mobileToggle");
  const links = $("#navLinks");
  if (!button || !links) return;

  button.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  links.addEventListener("click", event => {
    if (event.target.matches("a")) {
      links.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }
  });
}

function initThemeToggle() {
  const button = $("#themeToggle");
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }

  const renderIcon = isLight => isLight
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"></path></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.2A7.6 7.6 0 0 1 9.8 3 8.9 8.9 0 1 0 21 14.2Z"></path></svg>`;

  const updateLabel = () => {
    if (!button) return;
    const isLight = document.body.classList.contains("light-theme");
    button.classList.toggle("is-light", isLight);
    button.setAttribute("aria-pressed", String(isLight));
    button.setAttribute("aria-label", isLight ? "当前为浅色主题，点击切换到暗色主题" : "当前为暗色主题，点击切换到浅色主题");
    button.innerHTML = `
      <span class="theme-toggle-track" aria-hidden="true">
        <span class="theme-toggle-thumb">${renderIcon(isLight)}</span>
      </span>
      <span class="theme-toggle-label">${isLight ? "浅色" : "深色"}</span>
    `;
  };

  updateLabel();

  if (!button) return;
  button.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    updateLabel();
    showToast(isLight ? "已切换到浅色主题" : "已切换到暗色主题");
  });
}

function initAnimations() {
  const animatedItems = $$('[data-animate]');
  if (!animatedItems.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedItems.forEach(item => item.classList.add("is-visible"));
    return;
  }

  animatedItems.forEach((item, index) => {
    if (!item.style.getPropertyValue("--animate-delay")) {
      item.style.setProperty("--animate-delay", `${Math.min(index, 5) * 70}ms`);
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  animatedItems.forEach(item => observer.observe(item));
}

function showToast(message) {
  let toast = $("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function createArticleCard(article) {
  return `
    <article class="card article-card" data-category="${escapeHTML(article.category)}">
      <a class="article-card-link" href="${escapeHTML(article.url)}" aria-label="阅读文章：${escapeHTML(article.title)}">
        <div class="card-body">
          <div class="card-meta">
            <span>${formatDate(article.date)}</span>
            <span>·</span>
            <span>${escapeHTML(article.category)}</span>
            <span>·</span>
            <span>${calculateReadingTime(article.summary)} 分钟读完</span>
          </div>
          <h3 class="card-title">${escapeHTML(article.title)}</h3>
          <p class="card-text">${escapeHTML(article.summary)}</p>
          <div class="card-meta">
            ${article.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
          </div>
          <span class="card-read-more" aria-hidden="true">阅读全文 →</span>
        </div>
      </a>
    </article>
  `;
}

function initHomePage() {
  const latestContainer = $("#latestPosts");
  if (latestContainer) {
    const latest = [...articles]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    latestContainer.innerHTML = latest.map(createArticleCard).join("");
  }

  const typeTarget = $("#typewriter");
  if (typeTarget) typewriter(typeTarget, ["记录前端学习", "拆解网页交互", "构建简洁体验"]);
}

function typewriter(element, phrases) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const phrase = phrases[phraseIndex];
    element.textContent = phrase.slice(0, charIndex) + "_";

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      setTimeout(tick, 95);
    } else if (!deleting) {
      deleting = true;
      setTimeout(tick, 1200);
    } else if (charIndex > 0) {
      charIndex -= 1;
      setTimeout(tick, 45);
    } else {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, 260);
    }
  };

  tick();
}

function initBlogPage() {
  const list = $("#articleList");
  const filters = $("#categoryFilters");
  const search = $("#blogSearch");
  const sort = $("#sortSelect");
  const count = $("#resultCount");
  if (!list || !filters) return;

  let activeCategory = "全部";
  const categories = ["全部", ...new Set(articles.map(article => article.category))];
  filters.innerHTML = categories.map(category => `
    <button class="filter-btn ${category === "全部" ? "active" : ""}" type="button" data-category="${category}" aria-pressed="${category === "全部" ? "true" : "false"}">${category}</button>
  `).join("");

  const render = () => {
    const keyword = (search?.value || "").trim().toLowerCase();
    const sortMode = sort?.value || "desc";
    let result = articles.filter(article => {
      const matchCategory = activeCategory === "全部" || article.category === activeCategory;
      const haystack = [article.title, article.summary, article.category, ...article.tags].join(" ").toLowerCase();
      const matchKeyword = !keyword || haystack.includes(keyword);
      return matchCategory && matchKeyword;
    });

    result.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortMode === "asc" ? diff : -diff;
    });

    if (count) count.textContent = `共 ${result.length} 篇文章`;
    list.innerHTML = result.length
      ? result.map((article, index) => createArticleCard(article, index)).join("")
      : `<div class="empty-state">没有找到相关文章，请换一个分类或关键词。</div>`;
  };

  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    $$(".filter-btn", filters).forEach(item => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });

  search?.addEventListener("input", render);
  sort?.addEventListener("change", render);
  render();
}

function initReadingProgress() {
  const bar = $("#readingProgressBar");
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight <= 0 ? 0 : Math.min(100, (scrollTop / scrollHeight) * 100);
    bar.style.width = `${progress}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initPostPage() {
  const pageId = document.body.dataset.articleId;
  const article = articles.find(item => item.id === pageId);
  if (!article) return;

  const readingMeta = $("#readingTime");
  const articleBody = $(".article-body");
  if (readingMeta && articleBody) {
    readingMeta.textContent = `${calculateReadingTime(articleBody.innerHTML)} 分钟阅读`;
  }
}

function initAboutPage() {
  renderSkills();
  initGuestbook();
}

function renderSkills() {
  const container = $("#skillList");
  if (!container) return;
  container.innerHTML = skills.map(skill => `
    <div class="skill-row">
      <div class="skill-info">
        <strong>${escapeHTML(skill.name)}</strong>
        <span>${skill.level}%</span>
      </div>
      <div class="skill-bar" aria-label="${escapeHTML(skill.name)} 熟练度 ${skill.level}%">
        <span style="--level: ${skill.level}%"></span>
      </div>
    </div>
  `).join("");
}

function initGuestbook() {
  const form = $("#guestbookForm");
  const list = $("#guestbookList");
  const clearButton = $("#clearMessages");
  if (!form || !list) return;

  let messages = loadFromStorage(GUESTBOOK_KEY, []);

  const renderMessages = () => {
    if (!messages.length) {
      list.innerHTML = `<div class="empty-state">还没有留言，欢迎写下第一条反馈。</div>`;
      return;
    }

    list.innerHTML = messages.map(item => `
      <article class="message-card">
        <header>
          <strong>${escapeHTML(item.nickname)}</strong>
          <time datetime="${item.createdAt}">${formatDate(item.createdAt)}</time>
        </header>
        <p>${escapeHTML(item.message)}</p>
      </article>
    `).join("");
  };

  const setError = (name, message) => {
    const target = $(`[data-error="${name}"]`);
    if (target) target.textContent = message;
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const nickname = $("#nickname").value.trim();
    const message = $("#message").value.trim();
    let valid = true;

    setError("nickname", "");
    setError("message", "");

    if (nickname.length < 2 || nickname.length > 20) {
      setError("nickname", "昵称需要 2-20 个字符。");
      valid = false;
    }

    if (message.length < 5 || message.length > 200) {
      setError("message", "留言内容需要 5-200 个字符。");
      valid = false;
    }

    if (!valid) return;

    messages.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nickname,
      message,
      createdAt: new Date().toISOString()
    });
    saveToStorage(GUESTBOOK_KEY, messages);
    form.reset();
    renderMessages();
    showToast("留言已保存到浏览器本地");
  });

  clearButton?.addEventListener("click", () => {
    if (!messages.length) return;
    if (confirm("确定清空所有本地留言吗？")) {
      messages = [];
      saveToStorage(GUESTBOOK_KEY, messages);
      renderMessages();
      showToast("留言已清空");
    }
  });

  renderMessages();
}

function getProjectMetaClass(value) {
  if (value === "进行中") return "project-status-progress";
  if (value === "已完成") return "project-status-done";
  return "project-type";
}

function initProjectsPage() {
  const grid = $("#projectGrid");
  if (!grid) return;

  let activeIndex = 0;

  const renderCard = (project, index) => {
    const meta = [project.type, project.status].filter(Boolean);
    const hasLink = Boolean(project.link && project.link !== "#");
    const isExternal = /^https?:\/\//i.test(project.link || "");
    const linkAttrs = hasLink
      ? `href="${escapeHTML(project.link)}"${isExternal ? " target=\"_blank\" rel=\"noopener\"" : ""}`
      : "";
    const action = hasLink
      ? `<a class="project-action" ${linkAttrs}>查看项目 →</a>`
      : `<span class="project-action is-disabled">链接待补充</span>`;

    return `
      <article class="card project-card" data-project-index="${index}" tabindex="0" aria-label="项目：${escapeHTML(project.title)}">
        <div class="project-cover project-cover-${escapeHTML(project.coverTone || "default")}" aria-label="${escapeHTML(project.title)} 项目封面">
          <span>${escapeHTML(project.cover || project.title)}</span>
        </div>
        <div class="card-body">
          ${meta.length ? `<div class="project-meta">${meta.map(item => `<span class="${getProjectMetaClass(item)}">${escapeHTML(item)}</span>`).join("")}</div>` : ""}
          <h3 class="card-title">${escapeHTML(project.title)}</h3>
          <p class="card-text">${escapeHTML(project.description)}</p>
          ${project.role ? `<p class="project-role"><span>负责内容</span>${escapeHTML(project.role)}</p>` : ""}
          <div class="project-tags">
            ${project.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
          </div>
          ${action}
        </div>
      </article>
    `;
  };

  grid.classList.remove("grid", "grid-3");
  grid.classList.add("project-carousel");
  grid.innerHTML = `
    <button class="project-nav project-nav-prev" type="button" aria-label="查看上一个项目">←</button>
    <div class="project-stage" role="list" aria-live="polite">
      ${projects.map(renderCard).join("")}
    </div>
    <button class="project-nav project-nav-next" type="button" aria-label="查看下一个项目">→</button>
  `;

  const cards = $$(".project-card", grid);
  const previous = $(".project-nav-prev", grid);
  const next = $(".project-nav-next", grid);

  const update = () => {
    cards.forEach((card, index) => {
      const offset = ((index - activeIndex + projects.length + 1) % projects.length) - 1;
      card.dataset.position = String(offset);
      card.classList.toggle("is-active", offset === 0);
      card.setAttribute("aria-current", offset === 0 ? "true" : "false");
      card.setAttribute("tabindex", offset === 0 ? "0" : "-1");
    });
  };

  const goTo = index => {
    activeIndex = (index + projects.length) % projects.length;
    update();
  };

  previous?.addEventListener("click", () => goTo(activeIndex - 1));
  next?.addEventListener("click", () => goTo(activeIndex + 1));

  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;

  cards.forEach((card, index) => {
    card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      if (index !== activeIndex) goTo(index);
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goTo(index);
      }
    });

    if (canTilt) {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-y * 11).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 11).toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    }
  });

  grid.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") goTo(activeIndex - 1);
    if (event.key === "ArrowRight") goTo(activeIndex + 1);
  });

  update();
}

document.addEventListener("DOMContentLoaded", () => {
  initCustomCursor();
  initPageTransitions();
  setActiveNav();
  initMobileNav();
  initThemeToggle();
  initReadingProgress();

  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "blog") initBlogPage();
  if (page === "post") initPostPage();
  if (page === "about") initAboutPage();
  if (page === "projects") initProjectsPage();

  const splashPending = page === "home" && initSplashScreen(() => initAnimations());
  if (!splashPending) initAnimations();
});
