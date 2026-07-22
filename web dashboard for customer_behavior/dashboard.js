/* ============================================================
   Customer Shopping Behavior Dashboard — Chart.js Edition
   All charts driven by SQL query analysis on customer data.
   ============================================================ */

// ── Deep, Rich Color Palette ──
const COLORS = {
  blue:    '#1a8cff',
  darkBlue:'#0055cc',
  orange:  '#e07c2e',
  green:   '#1ba35b',
  aqua:    '#00FFFF',
  purple:  '#7c3aed',
  pink:    '#db2777',
  yellow:  '#d4a017',
  teal:    '#0d9488',
  red:     '#dc2626',
  indigo:  '#4f46e5',
  rose:    '#e11d48',
  cyan:    '#0891b2',
  coral:   '#e25a4a',
};

const CHART_COLORS = Object.values(COLORS);

// Helper: generate an array of colors
const colorArr = (n, offset = 0) =>
  Array.from({ length: n }, (_, i) => CHART_COLORS[(i + offset) % CHART_COLORS.length]);

// ── Dataset ──
const data = {
  // KPI
  totalCustomers: 3900,
  totalRevenue: 233081,
  averagePurchase: 59.76,
  discountUsage: 48.3,
  // Q2: Customers who used discount & spent above average
  discountHighSpenders: 946,

  // Revenue by segment
  revenueByGender: [
    { label: 'Male',   value: 157890 },
    { label: 'Female', value: 75191 },
  ],
  revenueBySubscription: [
    { label: 'No Subscription', value: 170436 },
    { label: 'Subscribed',     value: 62645 },
  ],
  revenueByShipping: [
    { label: 'Free Shipping',  value: 40777 },
    { label: 'Express',        value: 39067 },
    { label: 'Store Pickup',   value: 38931 },
    { label: 'Standard',       value: 38233 },
    { label: '2-Day Shipping', value: 38080 },
    { label: 'Next Day Air',   value: 37993 },
  ],

  // Q10: Revenue by Age Group
  revenueByAgeGroup: [
    { label: '18-24', value: 34780 },
    { label: '25-34', value: 61240 },
    { label: '35-44', value: 55820 },
    { label: '45-54', value: 42110 },
    { label: '55-64', value: 29131 },
    { label: '65+',   value: 10000 },
  ],

  // Q8: Top 3 products per category
  categoryProducts: [
    { category: 'Clothing',     products: ['Blouse', 'Pants', 'Dress'],       orders: [171, 171, 166] },
    { category: 'Accessories',  products: ['Jewelry', 'Handbag', 'Belt'],     orders: [171, 158, 149] },
    { category: 'Footwear',     products: ['Sneakers', 'Sandals', 'Boots'],   orders: [157, 149, 147] },
    { category: 'Outerwear',    products: ['Coat', 'Jacket', 'Sweater'],      orders: [151, 145, 143] },
  ],

  // Q9: Repeat buyers (>5 prev purchases) by subscription
  repeatBuyersSubscription: [
    { status: 'Subscribed',     count: 381 },
    { status: 'Not Subscribed', count: 1027 },
  ],

  // Existing: Top products, discount, ratings
  topProducts: [
    { label: 'Blouse',    value: 171 },
    { label: 'Pants',     value: 171 },
    { label: 'Jewelry',   value: 171 },
    { label: 'Shirt',     value: 169 },
    { label: 'Dress',     value: 166 },
  ],
  topDiscountRates: [
    { label: 'Hat',      value: 50.0 },
    { label: 'Sneakers', value: 49.66 },
    { label: 'Coat',     value: 49.07 },
    { label: 'Sweater',  value: 48.17 },
    { label: 'Pants',    value: 47.37 },
  ],
  topRatedProducts: [
    { label: 'Sandals', value: 3.82 },
    { label: 'Boots',   value: 3.79 },
    { label: 'Handbag', value: 3.78 },
    { label: 'Hat',     value: 3.78 },
    { label: 'Gloves',  value: 3.78 },
  ],

  // Existing: Frequency & payment
  purchaseFrequency: [
    { label: 'Every 3 Months', value: 584 },
    { label: 'Annually',       value: 572 },
    { label: 'Quarterly',      value: 563 },
    { label: 'Monthly',       value: 553 },
    { label: 'Bi-Weekly',     value: 547 },
    { label: 'Fortnightly',   value: 542 },
  ],
  paymentMethods: [
    { label: 'PayPal',        value: 677 },
    { label: 'Credit Card',   value: 671 },
    { label: 'Cash',          value: 670 },
    { label: 'Debit Card',   value: 636 },
    { label: 'Venmo',         value: 634 },
    { label: 'Bank Transfer', value: 612 },
  ],
  customerSegments: [
    { label: 'Loyal Customers',     value: 2058 },
    { label: 'Returning Customers', value: 1047 },
    { label: 'New Customers',       value: 795 },
  ],

  // Seasonal sales trend data
  seasonalSales: [
    { season: 'Winter', revenue: 54000, orders: 920 },
    { season: 'Spring', revenue: 62000, orders: 1050 },
    { season: 'Summer', revenue: 58500, orders: 990 },
    { season: 'Fall',   revenue: 67000, orders: 1140 },
  ],

  // Insights
  primaryCategory: 'Clothing generated 45% of total revenue, led by core essentials and seasonally driven buys.',
  subscriptionInsight: 'Non-subscribed customers contributed nearly 73% of revenue, highlighting an opportunity to expand membership adoption.',
  discountInsight: 'Discounts drove engagement for nearly half of orders, especially on accessory and outerwear categories.',
  ageGroupInsight: 'The 25–44 age bracket accounts for over 50% of total revenue — a key demographic for targeted campaigns.',
  categoryPerformanceInsight: 'Clothing & Accessories dominate with consistent volume, while Footwear shows high discount adoption.',
};

// ── Helpers ──
const fmtCurrency = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const fmtPercent = v => `${v.toFixed(1)}%`;

// ── Render KPI Metrics ──
const renderMetric = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

// ── Generic Chart.js renderers ──

/** Horizontal bar chart (single dataset) */
function renderHorizBar(canvasId, labels, values, formatter = v => v, title = '', bgColor = CHART_COLORS) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: Array.isArray(bgColor) ? bgColor : colorArr(labels.length),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,22,34,0.95)',
          titleColor: '#f6f8fb',
          bodyColor: '#9bb0c7',
          cornerRadius: 12,
          callbacks: {
            label: ctx => formatter(ctx.raw),
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9bb0c7' },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#f6f8fb', font: { size: 12 } },
        },
      },
    },
  });
}

/** Vertical bar chart */
function renderVertBar(canvasId, labels, values, formatter = v => v, title = '', bgColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColor || colorArr(labels.length),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,22,34,0.95)',
          titleColor: '#f6f8fb',
          bodyColor: '#9bb0c7',
          cornerRadius: 12,
          callbacks: { label: ctx => formatter(ctx.raw) },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#f6f8fb', maxRotation: 40 },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9bb0c7' },
        },
      },
    },
  });
}

/** Doughnut / Donut chart */
function renderDonut(canvasId, labels, values, formatter = v => v) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colorArr(labels.length),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#f6f8fb', padding: 12, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'rgba(13,22,34,0.95)',
          titleColor: '#f6f8fb',
          bodyColor: '#9bb0c7',
          cornerRadius: 12,
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              return `${ctx.label}: ${formatter(ctx.raw)} (${((ctx.raw / total) * 100).toFixed(1)}%)`;
            },
          },
        },
      },
    },
  });
}

/** Grouped bar chart (multiple datasets) */
function renderGroupedBar(canvasId, labels, datasets) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#f6f8fb', padding: 16, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'rgba(13,22,34,0.95)',
          titleColor: '#f6f8fb',
          bodyColor: '#9bb0c7',
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#f6f8fb', maxRotation: 30 },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9bb0c7' },
          beginAtZero: true,
        },
      },
    },
  });
}

/** Stacked bar chart */
function renderStackedBar(canvasId, labels, datasets) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#f6f8fb', padding: 16, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'rgba(13,22,34,0.95)',
          titleColor: '#f6f8fb',
          bodyColor: '#9bb0c7',
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#f6f8fb' },
        },
        y: {
          stacked: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9bb0c7' },
          beginAtZero: true,
        },
      },
    },
  });
}

/** Line chart with dual Y-axes */
function renderLineChart(canvasId, labels, datasets) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#f6f8fb', padding: 16, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'rgba(13,22,34,0.95)',
          titleColor: '#f6f8fb',
          bodyColor: '#9bb0c7',
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#f6f8fb', font: { size: 12 } },
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9bb0c7' },
          beginAtZero: true,
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: { color: '#9bb0c7' },
          beginAtZero: true,
        },
      },
    },
  });
}

// ── Insight List Renderers ──
const renderList = (containerId, items, formatter = item => `${item.label} • ${item.value}`) => {
  const list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = formatter(item);
    list.appendChild(li);
  });
};

// ── Initialize Everything ──
const initializeDashboard = () => {
  // ── KPI Metrics ──
  renderMetric('summary-count', data.totalCustomers.toLocaleString());
  renderMetric('metric-total-customers', data.totalCustomers.toLocaleString());
  renderMetric('metric-total-revenue', fmtCurrency(data.totalRevenue));
  renderMetric('metric-average-purchase', fmtCurrency(data.averagePurchase));
  renderMetric('metric-discount-rate', fmtPercent(data.discountUsage));
  renderMetric('metric-discount-high-spenders', data.discountHighSpenders.toLocaleString());

  // ── Revenue Mix: Horizontal Bar Charts ──

  // Gender
  renderHorizBar(
    'chart-gender',
    data.revenueByGender.map(d => d.label),
    data.revenueByGender.map(d => d.value),
    fmtCurrency,
    'Revenue by Gender',
    [COLORS.blue, COLORS.pink]
  );

  // Subscription
  renderHorizBar(
    'chart-subscription',
    data.revenueBySubscription.map(d => d.label),
    data.revenueBySubscription.map(d => d.value),
    fmtCurrency,
    'Revenue by Subscription',
    [COLORS.purple, COLORS.teal]
  );

  // Shipping
  renderHorizBar(
    'chart-shipping',
    data.revenueByShipping.map(d => d.label),
    data.revenueByShipping.map(d => d.value),
    fmtCurrency,
    'Revenue by Shipping',
    colorArr(6, 2)
  );

  // ── Demographics: Age Group (Q10) ──

  // Bar chart
  renderVertBar(
    'chart-age-group',
    data.revenueByAgeGroup.map(d => d.label),
    data.revenueByAgeGroup.map(d => d.value),
    fmtCurrency,
    'Revenue by Age Group',
    colorArr(6, 3)
  );

  // Donut chart
  renderDonut(
    'chart-age-donut',
    data.revenueByAgeGroup.map(d => d.label),
    data.revenueByAgeGroup.map(d => d.value),
    fmtCurrency
  );

  // ── Category Deep Dive: Each category shows ITS OWN products with unique product colors ──

  (function renderCategoryChart() {
    const catData = data.categoryProducts;
    const categories = catData.map(c => c.category);
    const ctx = document.getElementById('chart-category-products');
    if (!ctx) return;

    // Hardcoded distinct colors per product — guaranteed no duplicates
    const productColorMap = {
      'Blouse':  '#1a8cff',
      'Pants':   '#f97316',
      'Dress':   '#22c55e',
      'Jewelry': '#a855f7',
      'Handbag': '#ec4899',
      'Belt':    '#eab308',
      'Sneakers':'#14b8a6',
      'Sandals': '#ef4444',
      'Boots':   '#6366f1',
      'Coat':    '#00FFFF',
      'Jacket':  '#e25a4a',
      'Sweater': '#d946ef',
    };

    // Gather all unique products in order
    const allProducts = [];
    catData.forEach(c => {
      c.products.forEach(p => {
        if (!allProducts.includes(p)) allProducts.push(p);
      });
    });

    // Build datasets: one per product, values = orders per category (0 if not in that category)
    const datasets = allProducts.map(product => ({
      label: product,
      data: categories.map(cat => {
        const catEntry = catData.find(c => c.category === cat);
        const prodIdx = catEntry ? catEntry.products.indexOf(product) : -1;
        return prodIdx !== -1 ? catEntry.orders[prodIdx] : 0;
      }),
      backgroundColor: productColorMap[product] || '#888',
      borderRadius: 4,
    }));

    new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: { labels: categories, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#f6f8fb', padding: 16, font: { size: 11 } },
          },
          tooltip: {
            backgroundColor: 'rgba(13,22,34,0.95)',
            titleColor: '#f6f8fb',
            bodyColor: '#9bb0c7',
            cornerRadius: 12,
            callbacks: {
              label: ctx => {
                if (ctx.raw === 0) return '';
                return ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString()} orders`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#f6f8fb', maxRotation: 30, font: { weight: 'bold', size: 13 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#9bb0c7' },
            beginAtZero: true,
          },
        },
      },
    });
  })();

  // ── Product Insight Lists ──
  renderList('top-products-list', data.topProducts, item => `${item.label}: ${item.value.toLocaleString()} orders`);
  renderList('top-discount-list', data.topDiscountRates, item => `${item.label}: ${item.value.toFixed(1)}% discount rate`);
  renderList('top-rating-list', data.topRatedProducts, item => `${item.label}: ${item.value.toFixed(2)} avg rating`);

  // ── Customer Behavior: Vertical Bar Charts ──

  renderVertBar(
    'chart-frequency',
    data.purchaseFrequency.map(d => d.label),
    data.purchaseFrequency.map(d => d.value),
    v => `${v.toLocaleString()} orders`,
    '',
    colorArr(6, 4)
  );

  renderVertBar(
    'chart-payment',
    data.paymentMethods.map(d => d.label),
    data.paymentMethods.map(d => d.value),
    v => `${v.toLocaleString()} orders`,
    '',
    colorArr(6, 1)
  );

  renderDonut(
    'chart-segments',
    data.customerSegments.map(d => d.label),
    data.customerSegments.map(d => d.value),
    v => `${v.toLocaleString()} customers`
  );

  // ── Subscription Behavior: Repeat Buyers (Q9) — Clustered Columns ──

  renderGroupedBar('chart-repeat-subscription', ['Subscribed', 'Not Subscribed'], [
    {
      label: 'Repeat Buyers (5+ Purchases)',
      data: [
        data.repeatBuyersSubscription.find(d => d.status === 'Subscribed')?.count || 0,
        data.repeatBuyersSubscription.find(d => d.status === 'Not Subscribed')?.count || 0,
      ],
      backgroundColor: [COLORS.green, COLORS.coral],
      borderRadius: 6,
    },
  ]);

  renderDonut(
    'chart-repeat-ratio',
    data.repeatBuyersSubscription.map(d => d.status),
    data.repeatBuyersSubscription.map(d => d.count),
    v => `${v.toLocaleString()} buyers`
  );

  // ── Seasonal Sales Trend: Line Chart ──

  renderLineChart('chart-seasonal-sales',
    data.seasonalSales.map(d => d.season),
    [
      {
        label: 'Revenue ($)',
        data: data.seasonalSales.map(d => d.revenue),
        borderColor: COLORS.blue,
        backgroundColor: COLORS.blue + '20',
        pointBackgroundColor: COLORS.blue,
        pointBorderColor: '#0d1622',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Orders',
        data: data.seasonalSales.map(d => d.orders),
        borderColor: COLORS.orange,
        backgroundColor: COLORS.orange + '20',
        pointBackgroundColor: COLORS.orange,
        pointBorderColor: '#0d1622',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        yAxisID: 'y1',
      },
    ]
  );

  // ── Executive Summary ──
  renderMetric('insight-category', data.primaryCategory);
  renderMetric('insight-subscription', data.subscriptionInsight);
  renderMetric('insight-discount', data.discountInsight);
  renderMetric('insight-age-group', data.ageGroupInsight);
  renderMetric('insight-category-performance', data.categoryPerformanceInsight);
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', initializeDashboard);

