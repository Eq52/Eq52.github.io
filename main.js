// 动态渐变背景
let gradientStep = 0, gradientSpeed = 0.0016, gradientDir = 1;
let lightColors = [
  [143,209,225], // #8fd1e1
  [254,220,94],  // #fedc5e
  [255,255,255], // #fff
  [120,232,180], // #78e8b4
  [255,197,197]  // #ffc5c5
];
let darkColors = [
  [0,49,82],     // #003152
  [14,53,82],    // #0e3552
  [143,209,225], // #8fd1e1
  [254,220,94],  // #fedc5e
  [15,30,45]     // #0f1e2d
];
function lerp(a, b, t) { return a + (b - a) * t; }
function rgbArrToStr(arr) { return `rgb(${arr[0]},${arr[1]},${arr[2]})`; }
function updateGradientBg() {
  const isDark = document.body.classList.contains('dark');
  const colors = isDark ? darkColors : lightColors;
  let idx1 = Math.floor(gradientStep) % colors.length;
  let idx2 = (idx1 + 1) % colors.length;
  let t = gradientStep - Math.floor(gradientStep);

  let c1 = colors[idx1];
  let c2 = colors[idx2];
  let blend = [lerp(c1[0],c2[0],t), lerp(c1[1],c2[1],t), lerp(c1[2],c2[2],t)];
  let c3 = colors[(idx1+2)%colors.length];
  let c4 = colors[(idx1+3)%colors.length];
  let blend2 = [lerp(c3[0],c4[0],t), lerp(c3[1],c4[1],t), lerp(c3[2],c4[2],t)];
  document.getElementById("bg-gradient").style.background = `linear-gradient(120deg, ${rgbArrToStr(blend)} 0%, ${rgbArrToStr(blend2)} 100%)`;
  gradientStep += gradientSpeed * gradientDir;
  if (gradientStep >= colors.length-1) {
    gradientStep = colors.length-1; gradientDir = -1;
  } else if (gradientStep <= 0) {
    gradientStep = 0; gradientDir = 1;
  }
  requestAnimationFrame(updateGradientBg);
}
updateGradientBg();

// 工具数据从tools.json加载
let tools = [];
fetch('tools.json')
  .then(resp => resp.json())
  .then(data => {
    tools = data;
    loadTheme();
    renderTools();
  });

// 当前激活分类
let currentTag = "all";
// 当前搜索关键字
let currentKeyword = "";

// 工具渲染函数
function renderTools(filterTag = "all", keyword = "") {
  const grid = document.getElementById('tools-grid');
  if (!tools || tools.length === 0) {
    grid.innerHTML = `<li style="padding:2rem;text-align:center;color:#999;font-size:1.2rem;list-style:none;">正在加载工具数据...</li>`;
    return;
  }
  grid.innerHTML = '';
  let filtered = tools;
  if (filterTag !== "all") {
    filtered = filtered.filter(t => t.tags.includes(filterTag));
  }
  if (keyword && keyword.trim() !== "") {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(kw) ||
      t.desc.toLowerCase().includes(kw)
    );
  }
  if(filtered.length === 0) {
    grid.innerHTML = `<li style="padding:2rem;text-align:center;color:#999;font-size:1.2rem;list-style:none;">未找到相关工具~</li>`;
    return;
  }
  filtered.forEach(tool => {
    const tagsHTML = tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('');
    grid.innerHTML += `
    <li class="tool-card" itemscope itemtype="https://schema.org/WebApplication">
      <div class="tool-title" itemprop="name">${tool.title}</div>
      <div class="tool-desc" itemprop="description">${tool.desc}</div>
      <a class="tool-link" href="${tool.url}" target="_blank" rel="noopener noreferrer" itemprop="url">访问</a>
      <div class="tool-tags">${tagsHTML}</div>
    </li>`;
  });
}

// 分类标签切换
document.getElementById('tags').addEventListener('click', function(e){
  if(e.target.classList.contains('tag')){
    document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('active'));
    e.target.classList.add('active');
    currentTag = e.target.dataset.tag;
    renderTools(currentTag, currentKeyword);
    closeSidebarIfMobile();
  }
});
// 键盘可访问性: Tab聚焦，回车键激活
document.getElementById('tags').addEventListener('keydown', function(e){
  if(e.target.classList.contains('tag') && (e.key === "Enter" || e.key === " ")){
    e.preventDefault();
    e.target.click();
  }
});

// 汉堡菜单/侧边栏相关
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const sidebarMask = document.getElementById('sidebar-mask');
const mainContent = document.querySelector('.main-content');
const body = document.body;

function openMenu() {
  hamburger.classList.add('active');
  sidebar.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  sidebar.focus();
  sidebarMask.style.display = "block";
  body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('active');
  sidebar.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  sidebarMask.style.display = "none";
  body.style.overflow = '';
  hamburger.focus();
}
function closeSidebarIfMobile() {
  if(window.innerWidth <= 700 && sidebar.classList.contains('active')){
    closeMenu();
  }
}
hamburger.addEventListener('click', () => {
  if (sidebar.classList.contains('active')) {
    closeMenu();
  } else {
    openMenu();
  }
});
sidebarMask.addEventListener('click', () => {
  closeMenu();
});
mainContent.addEventListener('click', closeSidebarIfMobile);
window.addEventListener('resize', ()=>{
  if(window.innerWidth > 700){
    closeMenu();
  }
  // resizeParticlesCanvas(); // 注释：粒子canvas已移除
});
document.addEventListener('keydown', (e) => {
  // ESC 关闭侧边栏
  if(sidebar.classList.contains('active') && e.key === 'Escape'){
    closeMenu();
  }
});

// 主题模式切换
const themeToggle = document.getElementById('theme-toggle');
let isDark = false;
function checkSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
    isDark = true;
  }
}
function loadTheme() {
  const theme = localStorage.getItem('nav-theme');
  if(theme === 'dark') {
    document.body.classList.add('dark');
    isDark = true;
  } else if(theme === 'light') {
    document.body.classList.remove('dark');
    isDark = false;
  } else {
    checkSystemTheme();
  }

}
function saveTheme() {
  localStorage.setItem('nav-theme', isDark ? 'dark' : 'light');
}
themeToggle.addEventListener('click', function(){
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);

  saveTheme();
  renderTools(currentTag, currentKeyword);
});

// 搜索功能
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function() {
  currentKeyword = this.value;
  renderTools(currentTag, currentKeyword);
});

// Logo动画
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelector('h1').style.letterSpacing = '7px';
    document.querySelector('h1').style.transition = 'letter-spacing .9s cubic-bezier(.4,0,.2,1)';
    setTimeout(() => {
      document.querySelector('h1').style.letterSpacing = '2px';
    }, 720);
  }, 320);
});
