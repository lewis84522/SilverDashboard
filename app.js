const defaultData = {
  supply: [
    {
      id: "mine",
      title: "矿山产量",
      value: "835 Moz",
      detail: "主要来自墨西哥、中国、秘鲁等矿区。",
      source: "Silver Institute《World Silver Survey 2024》",
      frequency: "年度",
    },
    {
      id: "recycle",
      title: "回收供给",
      value: "184 Moz",
      detail: "电子废料与工业废料回收贡献提升。",
      source: "Silver Institute《World Silver Survey 2024》",
      frequency: "年度",
    },
    {
      id: "gov",
      title: "政府/库存释放",
      value: "5 Moz",
      detail: "战略库存释放趋于收敛。",
      source: "GFMS & 各国统计",
      frequency: "年度",
    },
    {
      id: "hedging",
      title: "净套保供给",
      value: "-2 Moz",
      detail: "矿山锁价减少导致供给收缩。",
      source: "Metals Focus",
      frequency: "季度",
    },
  ],
  demand: [
    {
      id: "industrial",
      title: "工业需求",
      value: "597 Moz",
      detail: "电子、电气、化工与焊料需求保持韧性。",
      source: "Silver Institute《World Silver Survey 2024》",
      frequency: "年度",
    },
    {
      id: "solar",
      title: "光伏需求",
      value: "193 Moz",
      detail: "光伏装机放缓但银浆替代仍有限。",
      source: "IEA + Metals Focus",
      frequency: "季度",
    },
    {
      id: "jewelry",
      title: "首饰需求",
      value: "207 Moz",
      detail: "高价抑制部分新兴市场需求。",
      source: "Silver Institute",
      frequency: "年度",
    },
    {
      id: "investment",
      title: "实物投资（银条/银币）",
      value: "255 Moz",
      detail: "通胀预期波动导致配置节奏分化。",
      source: "Metals Focus",
      frequency: "季度",
    },
  ],
};

const commentary = [
  "2024 年仍处于供给增速低于需求增速阶段，供需缺口使库存对冲能力下降。",
  "光伏与电气化趋势对工业需求形成结构性支撑，关注银浆替代技术进展。",
  "投资需求对实际利率高度敏感，可结合美元指数与美债利率走势跟踪。",
  "库存偏低时，期货交割与现货溢价更易放大短期波动。",
];

const sources = [
  {
    name: "Silver Institute World Silver Survey",
    url: "https://www.silverinstitute.org/silver-supply-demand/",
    coverage: "全球矿山产量、回收、工业/首饰/投资需求",
    frequency: "年度",
  },
  {
    name: "Metals Focus",
    url: "https://www.metalsfocus.com/",
    coverage: "矿山套保、投资需求、精炼供给",
    frequency: "季度",
  },
  {
    name: "metals.live",
    url: "https://metals.live/",
    coverage: "现货银价/金银比实时行情",
    frequency: "实时",
  },
  {
    name: "CME Group",
    url: "https://www.cmegroup.com/markets/metals/precious/silver.html",
    coverage: "期货持仓与库存报告",
    frequency: "每日",
  },
  {
    name: "上海期货交易所",
    url: "https://www.shfe.com.cn/",
    coverage: "国内期货库存、交割量",
    frequency: "每周",
  },
  {
    name: "IEA PVPS",
    url: "https://iea-pvps.org/",
    coverage: "全球光伏装机与银浆需求",
    frequency: "季度/年度",
  },
];

const settingsForm = document.getElementById("settingsForm");
const refreshButton = document.getElementById("refreshButton");
const lastUpdated = document.getElementById("lastUpdated");

const formatNumber = (value) => {
  if (typeof value !== "number") {
    return value;
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
};

const createCard = ({ title, value, detail, source, frequency }) => {
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <h3>${title}</h3>
    <p class="value">${value}</p>
    <p>${detail}</p>
    <p class="meta">来源：${source} · 更新频率：${frequency}</p>
  `;

  return card;
};

const renderCards = (list, containerId) => {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  list.forEach((item) => container.appendChild(createCard(item)));
};

const renderSources = () => {
  const container = document.getElementById("sourceList");
  container.innerHTML = "";

  sources.forEach((source) => {
    const item = document.createElement("div");
    item.className = "source-item";
    item.innerHTML = `
      <a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a>
      <span>${source.coverage}</span>
      <span>更新频率：${source.frequency}</span>
    `;
    container.appendChild(item);
  });
};

const renderCommentary = () => {
  const container = document.getElementById("commentaryList");
  container.innerHTML = "";
  commentary.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    container.appendChild(item);
  });
};

const calculateTotals = () => {
  const parseMoz = (value) => Number.parseFloat(value.replace(/[^\d.-]/g, ""));
  const totalSupply = defaultData.supply.reduce(
    (sum, item) => sum + parseMoz(item.value),
    0
  );
  const totalDemand = defaultData.demand.reduce(
    (sum, item) => sum + parseMoz(item.value),
    0
  );
  const gap = totalSupply - totalDemand;

  document.getElementById("totalSupply").textContent = `${formatNumber(
    totalSupply
  )} Moz`;
  document.getElementById("totalDemand").textContent = `${formatNumber(
    totalDemand
  )} Moz`;
  document.getElementById("balanceGap").textContent = `${formatNumber(gap)} Moz`;
};

const loadSettings = () => {
  const settings = JSON.parse(localStorage.getItem("silverSettings") || "{}");
  [...settingsForm.elements].forEach((element) => {
    if (element.name && settings[element.name]) {
      element.value = settings[element.name];
    }
  });
};

const saveSettings = (event) => {
  event.preventDefault();
  const formData = new FormData(settingsForm);
  const settings = Object.fromEntries(formData.entries());
  localStorage.setItem("silverSettings", JSON.stringify(settings));
  alert("设置已保存，本地刷新页面即可应用。");
};

const updateMarketData = async () => {
  const spotPriceEl = document.getElementById("spotPrice");
  const ratioEl = document.getElementById("goldSilverRatio");
  const intradayEl = document.getElementById("intradayMove");

  try {
    const [silverRes, goldRes] = await Promise.all([
      fetch("https://api.metals.live/v1/spot/silver"),
      fetch("https://api.metals.live/v1/spot/gold"),
    ]);

    const silverData = await silverRes.json();
    const goldData = await goldRes.json();

    const silverPrice = Array.isArray(silverData) ? silverData[0][1] : null;
    const goldPrice = Array.isArray(goldData) ? goldData[0][1] : null;

    if (silverPrice) {
      spotPriceEl.textContent = formatNumber(silverPrice);
    }

    if (silverPrice && goldPrice) {
      const ratio = goldPrice / silverPrice;
      ratioEl.textContent = formatNumber(ratio);
    }

    if (silverPrice && silverData[0]?.[2]) {
      const openPrice = silverData[0][2];
      const change = ((silverPrice - openPrice) / openPrice) * 100;
      intradayEl.textContent = `${formatNumber(change)}%`;
    }

    lastUpdated.textContent = new Date().toLocaleString("zh-CN");
  } catch (error) {
    spotPriceEl.textContent = "获取失败";
    ratioEl.textContent = "--";
    intradayEl.textContent = "--";
    lastUpdated.textContent = "刷新失败";
  }
};

const init = () => {
  renderCards(defaultData.supply, "supplyCards");
  renderCards(defaultData.demand, "demandCards");
  renderSources();
  renderCommentary();
  calculateTotals();
  loadSettings();
  updateMarketData();
};

settingsForm.addEventListener("submit", saveSettings);
refreshButton.addEventListener("click", updateMarketData);

init();
