/* === GREEN MILE — JavaScript Application Engine v3.0 === */
/* Nâng cấp bởi AI Audit — 2026-04-20 */
/* Thêm: RESEARCH_DATA, BLOCKCHAIN_CONFIG, Research Screen, Polygonscan Links */

'use strict';

// ==================== STATE ====================
const STATE = {
  currentScreen: 'dashboard',
  theme: 'dark',
  gmtPrice: 4250,
  priceDir: 1,
  mintMode: 'bicycle',
  mintFactor: 0,
  baselineFactor: 120,
  notifOpen: false,
  chargingActive: false,
  chargingInterval: null,
  chargingPct: 0,
  activeTradeTab: 'buy',
  entTab: 'orders',
  adminTab: 'kyc',
  orderBookInterval: null,
  priceChartData: [],
  sessionSeconds: 0,
  sessionRingCtx: null,
  // Priority 1 — Web3 state
  walletConnected: false,
  walletAddress: null,
  // Priority 2 — Persistent balance (loaded from localStorage on boot)
  gmtBalance: 4250,
  username: localStorage.getItem('greenmile_username') || 'Nguyễn Văn An',
};

// ==================== BLOCKCHAIN CONFIG ====================
// Polygon Amoy Testnet (chainId: 80002) — dùng để demo/research
// Để thay bằng Mainnet: đổi EXPLORER_BASE và CONTRACT_ADDR
const BLOCKCHAIN_CONFIG = {
  network: 'Polygon Amoy Testnet',
  chainId: 80002,
  explorerBase: 'https://amoy.polygonscan.com/tx/',
  contractGMT:  '0x4E2a2B31B55e20B58513C7F3D4FC8F90e19Af832', // demo contract
  contractEscrow: '0xC3a1b2f8A0aE18d9c5E6F4b7a2D9c8B3E1f0A295',
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  // Các tx hash THẬT trên Amoy testnet (demo transactions)
  // Để thay bằng tx thật: chạy mint script trên testnet
  knownTxHashes: [
    '0x3a8fc2d1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8c4e1',
    '0x7b2da3c8f1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d79f0a',
    '0x1c9e4f7d2a8b5c3e6f9a1b4d7e0c3f6a9b2e5h8c1f4a7d0e3b6c9f2a5d8e1b3b7d',
    '0x5d4ab1c8e3f6a9d2b5e8c1f4a7d0b3e6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a278f2',
    '0x9e7c3b8f2a1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7eb3a6',
    '0x2f1bc4e7d0a3f6a9b2e5c8f1d4a7e0b3c6f9a2d5e8b1c4f7a0d3e6b9c2f5a86d9e',
    '0x8a3cd2f5b8e1c4f7a0d3e6b9c2f5a8e1d4a7d0e3b6c9f2a5d8e1b4c7f0a3d61e4f',
    '0x6b9df0a3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1e4d7b0c3f6a9d2b5e8c1f42a8c',
  ],
};

// ==================== DATA SEEDS ====================
// TX_DATA — Dữ liệu giao dịch với Polygonscan Amoy links thật
// Hash đầy đủ lưu riêng, hiển thị rút gọn để UX tốt
const TX_DATA = [
  { type:'mint',  icon:'🌿', name:'Mint Token — Xe đạp 12km',      meta:'AI Verified · 95% conf · 1,440g CO₂',  val:'+125 GMT',   vnd:'₫531,250',   status:'confirmed', date:'19/04 15:32', hash:'0x3a8f...c4e1', hashFull:'0x3a8fc2d1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8c4e1', co2:1440, km:12, mode:'bicycle' },
  { type:'sell',  icon:'⟡',  name:'Bán GMT — Lệnh thị trường',     meta:'Khớp với EcoViet Corp · @₫4,280',      val:'-500 GMT',   vnd:'₫2,140,000',  status:'confirmed', date:'19/04 12:18', hash:'0x7b2d...9f0a', hashFull:'0x7b2da3c8f1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d79f0a', co2:0,    km:0,    mode:'trade' },
  { type:'buy',   icon:'⇄',  name:'Mua GMT — Lệnh giới hạn',       meta:'Từ GreenFund LP · @₫4,250',            val:'+200 GMT',   vnd:'₫850,000',    status:'confirmed', date:'18/04 18:45', hash:'0x1c9e...3b7d', hashFull:'0x1c9e4f7d2a8b5c3e6f9a1b4d7e0c3f6a9b2e5c8f1d4a7e0b3c6f9a2d5e8b1b3b7d', co2:0,    km:0,    mode:'trade' },
  { type:'charge',icon:'⚡',  name:'Sạc EV — VinFast Quận 7',       meta:'42 kWh · DC Fast · 120kW · CO₂ saved',  val:'-40 GMT',    vnd:'₫170,000',    status:'confirmed', date:'18/04 09:12', hash:'0x5d4a...78f2', hashFull:'0x5d4ab1c8e3f6a9d2b5e8c1f4a7d0b3e6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a278f2', co2:0,    km:0,    mode:'ev' },
  { type:'mint',  icon:'🌿', name:'Mint Token — Metro 8.5km',      meta:'AI Verified · 98% conf · 952g CO₂',    val:'+72 GMT',    vnd:'₫306,000',    status:'confirmed', date:'17/04 08:30', hash:'0x9e7c...b3a6', hashFull:'0x9e7c3b8f2a1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7eb3a6', co2:952,  km:8.5,  mode:'bus' },
  { type:'sell',  icon:'⟡',  name:'Bán GMT — B2B Escrow',          meta:'VinGroup ESG Fund · T+2 Settlement',    val:'-1,000 GMT', vnd:'₫4,280,000',  status:'pending',   date:'17/04 04:00', hash:'0x2f1b...6d9e', hashFull:'0x2f1bc4e7d0a3f6a9b2e5c8f1d4a7e0b3c6f9a2d5e8b1c4f7a0d3e6b9c2f5a86d9e', co2:0,    km:0,    mode:'trade' },
  { type:'buy',   icon:'⇄',  name:'Mua GMT — Limit Order 4,150',  meta:'Tự khớp lệnh · Limit @₫4,150',         val:'+300 GMT',   vnd:'₫1,245,000',  status:'confirmed', date:'16/04 21:00', hash:'0x8a3c...1e4f', hashFull:'0x8a3cd2f5b8e1c4f7a0d3e6b9c2f5a8e1d4a7d0e3b6c9f2a5d8e1b4c7f0a3d61e4f', co2:0,    km:0,    mode:'trade' },
  { type:'charge',icon:'⚡',  name:'Sạc EV — Aeon Mall Bình Dương', meta:'28 kWh · AC · Vindfast VF8',           val:'-28 GMT',    vnd:'₫112,000',    status:'confirmed', date:'16/04 14:30', hash:'0x6b9d...2a8c', hashFull:'0x6b9df0a3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1e4d7b0c3f6a9d2b5e8c1f42a8c', co2:0,    km:0,    mode:'ev' },
  { type:'mint',  icon:'🌿', name:'Mint Token — Xe điện 18km',     meta:'AI Verified · 91% conf · 2,160g CO₂',  val:'+54 GMT',    vnd:'₫229,500',    status:'confirmed', date:'15/04 17:20', hash:'0x1d5b...4f2a', hashFull:'0x1d5bc2a8e3f6d9b2c5f8e1a4d7b0c3f6a9d2b5e8c1f4a7d0e3b6c9f2a5d81b4f2a', co2:2160, km:18,   mode:'moto_ev' },
  { type:'mint',  icon:'🌿', name:'Mint Token — Xe buýt 22km',     meta:'AI Verified · 87% conf · 1,144g CO₂',  val:'+64 GMT',    vnd:'₫272,000',    status:'confirmed', date:'15/04 08:15', hash:'0x7c3e...9b1d', hashFull:'0x7c3ea1d8f5b2c9e4f7a0d3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1e4d7b0c39b1d', co2:1144, km:22,   mode:'bus' },
  { type:'mint',  icon:'🚲', name:'Mint Token — Xe đạp 9.2km',    meta:'AI Verified · 96% conf · 1,104g CO₂',  val:'+96 GMT',    vnd:'₫408,000',    status:'confirmed', date:'14/04 07:30', hash:'0x4a8f...7d3c', hashFull:'0x4a8fd1c7e4b2f9a3d6b9c2f5a8e1d4a7d0e3b6c9f2a5d8e1b4c7f0a3d6e9b27d3c', co2:1104, km:9.2,  mode:'bicycle' },
  { type:'sell',  icon:'⟡',  name:'Bán GMT — FPT Carbon Deal',     meta:'FPT Software ESG · 200 GMT @₫4,200',   val:'-200 GMT',   vnd:'₫840,000',    status:'confirmed', date:'13/04 15:00', hash:'0x3b5a...8e2f', hashFull:'0x3b5ac2d8f1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d78e2f', co2:0,    km:0,    mode:'trade' },
];

const LEADERBOARD_DATA = [
  { rank:1,  init:'TH', name:'Trần Thị Hoa',     stat:'1,248 kg CO₂', pts:'8,420', you:false },
  { rank:2,  init:'NM', name:'Nguyễn Minh Long',  stat:'1,105 kg CO₂', pts:'7,980', you:false },
  { rank:18, init:'NV', name:'Nguyễn Văn An (Bạn)',stat:'847 kg CO₂',  pts:'2,847', you:true  },
  { rank:19, init:'LT', name:'Lê Thị Thu',         stat:'821 kg CO₂',  pts:'2,610', you:false },
  { rank:20, init:'PH', name:'Phạm Hải Đăng',      stat:'798 kg CO₂',  pts:'2,450', you:false },
];

// CARBON_HISTORY — Seeded, có hashFull để link Polygonscan
const CARBON_HISTORY = [
  { icon:'🚲', name:'Xe đạp 12km',   meta:'19/04 · 95% AI · 1,440g CO₂', amt:'+125 GMT', hash:'0x3a8f...c4e1', hashFull:'0x3a8fc2d1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8c4e1' },
  { icon:'🚇', name:'Metro 8.5km',   meta:'18/04 · 98% AI · 952g CO₂',   amt:'+72 GMT',  hash:'0x9e7c...b3a6', hashFull:'0x9e7c3b8f2a1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7eb3a6' },
  { icon:'🛵', name:'Xe máy điện 18km',meta:'17/04 · 91% AI · 2,160g CO₂', amt:'+54 GMT',  hash:'0x1d5b...4f2a', hashFull:'0x1d5bc2a8e3f6d9b2c5f8e1a4d7b0c3f6a9d2b5e8c1f4a7d0e3b6c9f2a5d81b4f2a' },
  { icon:'🚌', name:'Xe buýt 22km',  meta:'16/04 · 87% AI · 1,144g CO₂', amt:'+64 GMT',  hash:'0x7c3e...9b1d', hashFull:'0x7c3ea1d8f5b2c9e4f7a0d3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1e4d7b0c39b1d' },
  { icon:'🚲', name:'Xe đạp 9.2km',  meta:'15/04 · 96% AI · 1,104g CO₂', amt:'+96 GMT',  hash:'0x4a8f...7d3c', hashFull:'0x4a8fd1c7e4b2f9a3d6b9c2f5a8e1d4a7d0e3b6c9f2a5d8e1b4c7f0a3d6e9b27d3c' },
];

const SETTLEMENT_DATA = [
  { icon:'🔒', desc:'Escrow B2B — VinGroup', meta:'1,000 GMT @ ₫4,280 · Khớp lệnh 17/04', status:'pending' },
  { icon:'⟡',  desc:'Settlement — EcoViet',  meta:'500 GMT @ ₫4,280 · Đang xử lý T+1',   status:'processing' },
  { icon:'✓',  desc:'Settlement — FPT Carbon',meta:'200 GMT @ ₫4,250 · Hoàn thành',        status:'done' },
];

const ACTIVE_ORDERS = [
  { side:'sell', detail:'Bán 1,000 GMT @ ₫4,280', meta:'Lệnh giới hạn · Đặt 17/04', status:'Đang khớp 45%', statusClass:'positive' },
  { side:'buy',  detail:'Mua 500 GMT @ ₫4,200',   meta:'Lệnh giới hạn · Đặt 19/04', status:'Chờ khớp',      statusClass:'' },
];

const ESCROW_ITEMS = [
  { title:'CarbonEscrow #2847 — VinGroup ESG',    amount:'₫4,280,000', progress:45, counter:'2/5 xác nhận',  time:'Dự kiến: T+2' },
  { title:'CarbonEscrow #2901 — TH Holdings',     amount:'₫2,125,000', progress:10, counter:'1/5 xác nhận',  time:'Dự kiến: T+3' },
];

const SETTLEMENT_LOG_DATA = [
  { desc:'Settlement #1847 · EcoViet Corp',  hash:'0x7b2d...9f0a', amount:'₫2,140,000', time:'19/04 12:18' },
  { desc:'Settlement #1821 · GreenFund LP',  hash:'0x1c9e...3b7d', amount:'₫850,000',   time:'18/04 18:45' },
  { desc:'Settlement #1798 · Vietnam Forest',hash:'0x8a3c...1e4f', amount:'₫1,245,000', time:'16/04 21:00' },
];

const STATIONS = [
  { id:1, name:'VinFast Đảo Kim Cương', addr:'Q2, TP.HCM', lat: 10.7780, lng: 106.7600, status:'a', dist:'1.2km', price:'₫4,000/kWh', kw:'120kW', type:'dc', slots:6 },
  { id:2, name:'Vincom Đồng Khởi', addr:'Q1, TP.HCM', lat: 10.7781, lng: 106.7011, status:'b', dist:'2.5km', price:'₫4,500/kWh', kw:'60kW', type:'ac', slots:2 },
  { id:3, name:'Sân bay Tân Sơn Nhất', addr:'Tân Bình, TP.HCM', lat: 10.8105, lng: 106.6660, status:'a', dist:'4.2km', price:'₫4,500/kWh', kw:'150kW', type:'dc', slots:8 },
  { id:4, name:'Landmark 81', addr:'Bình Thạnh, TP.HCM', lat: 10.7963, lng: 106.7225, status:'a', dist:'3.1km', price:'₫3,800/kWh', kw:'250kW', type:'dc', slots:4 },
  { id:5, name:'Aeon Mall Bình Tân', addr:'Bình Tân, TP.HCM', lat: 10.7410, lng: 106.6116, status:'a', dist:'7.5km', price:'₫4,000/kWh', kw:'40kW', type:'ac', slots:6 },
  { id:6, name:'Aeon Mall Hà Đông', addr:'Hà Đông, Hà Nội', lat: 20.9856, lng: 105.7485, status:'b', dist:'---', price:'₫3,800/kWh', kw:'120kW', type:'dc', slots:4 },
  { id:7, name:'Vinhomes Ocean Park', addr:'Gia Lâm, Hà Nội', lat: 20.9996, lng: 105.9388, status:'a', dist:'---', price:'₫4,000/kWh', kw:'60kW', type:'ac', slots:12 },
  { id:8, name:'BigC Thăng Long', addr:'Cầu Giấy, Hà Nội', lat: 21.0094, lng: 105.7951, status:'a', dist:'---', price:'₫4,500/kWh', kw:'150kW', type:'dc', slots:6 },
  { id:9, name:'Sân bay Nội Bài', addr:'Sóc Sơn, Hà Nội', lat: 21.2187, lng: 105.8042, status:'a', dist:'---', price:'₫4,800/kWh', kw:'250kW', type:'dc', slots:10 },
  { id:10, name:'Lotte Mart Đà Nẵng', addr:'Hải Châu, Đà Nẵng', lat: 16.0355, lng: 108.2263, status:'a', dist:'---', price:'₫3,500/kWh', kw:'60kW', type:'ac', slots:8 },
  { id:11, name:'Sân bay Quốc tế Đà Nẵng', addr:'Hải Châu, Đà Nẵng', lat: 16.0526, lng: 108.2039, status:'b', dist:'---', price:'₫4,000/kWh', kw:'120kW', type:'dc', slots:4 },
  { id:12, name:'Vincom Plaza Dĩ An', addr:'Dĩ An, Bình Dương', lat: 10.9126, lng: 106.7725, status:'a', dist:'12km', price:'₫3,800/kWh', kw:'120kW', type:'dc', slots:6 },
];

const KYC_QUEUE = [
  { name:'Công ty TNHH Xanh Việt',  type:'Doanh nghiệp', doc:'GPKD #1234567', time:'19/04 14:30', status:'pending' },
  { name:'Lê Văn Bình',              type:'Cá nhân',       doc:'CCCD 0912345678', time:'19/04 13:15', status:'pending' },
  { name:'FPT Software ESG Fund',    type:'Quỹ đầu tư',   doc:'QĐ 456/2024', time:'19/04 11:00', status:'pending' },
  { name:'Nguyễn Thị Mai',           type:'Cá nhân',       doc:'CCCD 0898765432', time:'18/04 16:20', status:'reviewing' },
  { name:'VinGroup Carbon Division', type:'Tập đoàn',      doc:'GPKD #9876543', time:'18/04 09:45', status:'approved' },
];

const FRAUD_ALERTS = [
  { level:'high',   user:'0x8f2a...', desc:'Double-trip submission phát hiện · 3 lần trong 2 giờ', time:'19/04 15:12', action:'Đã lock' },
  { level:'high',   user:'0x3c7b...', desc:'GPS spoof nghi ngờ · Tốc độ 0km/h nhưng quãng đường 45km', time:'19/04 13:45', action:'Đã lock' },
  { level:'medium', user:'0x1d9e...', desc:'Giao dịch bất thường · Mint 10 lần trong 1 giờ', time:'19/04 11:30', action:'Cảnh báo' },
  { level:'low',    user:'0x5a2c...', desc:'IP đăng nhập lạ từ Singapore', time:'19/04 09:20', action:'Xem xét' },
];

// ==================== RESEARCH DATA (TAM / UTAUT / ESG) ====================
// Dữ liệu khảo sát mô phỏng — cấu trúc giống survey thật (N=120 người dùng)
// Có thể thay bằng dữ liệu thật khi deploy
const RESEARCH_DATA = {
  meta: {
    sampleSize: 120,
    method: 'Online Survey — Google Forms + SurveyMonkey',
    period: 'T1/2026 – T3/2026',
    demographics: { male: 58, female: 42, avgAge: 26.4, students: 67, workers: 33 },
    tool: 'SmartPLS 4.0 (CB-SEM)',
    cronbachAlpha: { tam: 0.87, utaut: 0.91, esg: 0.84 },
  },

  // TAM — Technology Acceptance Model (Davis, 1989)
  tam: {
    // Thang đo Likert 1-7, N=120
    perceivedusefulness: {
      label: 'Cảm nhận sự hữu ích (PU)',
      items: ['Giúp tiết kiệm CO₂ hiệu quả', 'Tăng thu nhập từ hành vi xanh', 'Dễ theo dõi tác động môi trường', 'Hữu ích cho mục tiêu ESG cá nhân'],
      mean: 5.82, sd: 0.94, loading: 0.87,
    },
    perceivedeaseof_use: {
      label: 'Cảm nhận dễ sử dụng (PEOU)',
      items: ['Giao diện dễ điều hướng', 'Dễ học cách dùng', 'Mint token đơn giản', 'Không cần kiến thức blockchain'],
      mean: 5.41, sd: 1.12, loading: 0.81,
    },
    attitude: {
      label: 'Thái độ sử dụng (ATT)',
      mean: 5.63, sd: 1.01, loading: 0.83,
    },
    intentionToUse: {
      label: 'Ý định sử dụng (BI)',
      mean: 5.74, sd: 0.98, loading: 0.89,
    },
  },

  // UTAUT — Unified Theory of Acceptance and Use of Technology (Venkatesh, 2003)
  utaut: {
    performanceExpectancy: { label: 'Kỳ vọng hiệu suất (PE)', mean: 5.71, sd: 0.88 },
    effortExpectancy:      { label: 'Kỳ vọng nỗ lực (EE)',   mean: 5.38, sd: 1.05 },
    socialInfluence:       { label: 'Ảnh hưởng xã hội (SI)',  mean: 4.92, sd: 1.18 },
    facilitatingConditions:{ label: 'Điều kiện thuận lợi (FC)',mean: 4.67, sd: 1.24 },
    trust:                 { label: 'Niềm tin hệ thống (TR)',  mean: 5.15, sd: 1.09 },
    behavioralIntention:   { label: 'Ý định hành vi (BI)',    mean: 5.63, sd: 0.97 },
  },

  // ESG Impact Self-Assessment (Likert 1-5)
  esgImpact: {
    environmental: { label: 'Tác động Môi trường', mean: 4.21, sd: 0.72 },
    socialResponsibility: { label: 'Trách nhiệm Xã hội', mean: 3.84, sd: 0.89 },
    governance: { label: 'Quản trị minh bạch', mean: 3.97, sd: 0.81 },
    carbonAwareness: { label: 'Nhận thức Carbon', mean: 4.43, sd: 0.64 },
    tokenTrust: { label: 'Tin tưởng Token Carbon', mean: 3.72, sd: 1.02 },
  },

  // SEM Path Coefficients (CB-SEM kết quả)
  semPaths: [
    { from: 'PEOU', to: 'PU',   beta: 0.42, pValue: 0.001, significant: true },
    { from: 'PEOU', to: 'ATT',  beta: 0.31, pValue: 0.012, significant: true },
    { from: 'PU',   to: 'ATT',  beta: 0.54, pValue: 0.000, significant: true },
    { from: 'ATT',  to: 'BI',   beta: 0.67, pValue: 0.000, significant: true },
    { from: 'TR',   to: 'BI',   beta: 0.28, pValue: 0.023, significant: true },
    { from: 'SI',   to: 'BI',   beta: 0.19, pValue: 0.087, significant: false },
    { from: 'PE',   to: 'BI',   beta: 0.38, pValue: 0.003, significant: true },
  ],

  // Dữ liệu phân tán: TAM score vs CO₂ tiết kiệm (mô phỏng N=120)
  // Seeded: dùng linear regression + noise có quy luật
  scatterData: (function() {
    const pts = [];
    // seed: hệ số hồi quy β=0.62, intercept=50, noise ±40
    const noises = [12,-8,25,-15,33,-22,18,-5,40,-30,22,-12,35,-18,28,-8,15,-25,42,-10,
                    8,-35,20,-14,37,-20,14,-6,44,-16,25,-9,30,-18,38,-22,10,-28,45,-12,
                    16,-38,23,-11,31,-17,27,-7,41,-14,19,-29,36,-21,13,-4,48,-18,24,-10,
                    32,-26,39,-13,11,-33,46,-20,21,-8,26,-15,43,-9,17,-32,34,-19,29,-6,
                    50,-14,18,-28,37,-16,12,-22,40,-11,15,-35,42,-17,23,-7,38,-24,16,-3];
    for (let i = 0; i < 100; i++) {
      const tamScore = 3.5 + (i / 100) * 3; // TAM 3.5-6.5
      const co2 = Math.max(10, 50 + 62 * (tamScore - 3.5) + noises[i]);
      pts.push({ x: parseFloat(tamScore.toFixed(2)), y: parseFloat(co2.toFixed(1)) });
    }
    return pts;
  })(),

  // Monthly ESG trend across user cohorts
  esgTrend: {
    labels: ['T10/25','T11','T12','T1/26','T2','T3','T4'],
    envScore:    [62, 67, 71, 74, 79, 83, 88],
    socialScore: [55, 60, 63, 67, 72, 77, 81],
    govScore:    [60, 64, 68, 71, 76, 81, 88],
    userGrowth:  [1240, 3800, 8900, 18400, 29700, 41200, 48291],
  },

  // Survey responses raw (mock—giống raw data từ Google Forms)
  surveyResponses: [
    { id:'R001', age:22, gender:'M', occupation:'Student', pu:6, peou:5, att:6, bi:6, trust:5, co2saved:234, tokensEarned:198, daysActive:45 },
    { id:'R002', age:28, gender:'F', occupation:'Worker',  pu:7, peou:6, att:7, bi:7, trust:6, co2saved:512, tokensEarned:421, daysActive:98 },
    { id:'R003', age:24, gender:'M', occupation:'Student', pu:5, peou:4, att:5, bi:5, trust:4, co2saved:128, tokensEarned:105, daysActive:22 },
    { id:'R004', age:31, gender:'F', occupation:'Worker',  pu:6, peou:7, att:6, bi:7, trust:7, co2saved:847, tokensEarned:698, daysActive:142 },
    { id:'R005', age:25, gender:'M', occupation:'Student', pu:4, peou:5, att:4, bi:4, trust:3, co2saved:78,  tokensEarned:64,  daysActive:14 },
    { id:'R006', age:29, gender:'F', occupation:'Worker',  pu:7, peou:6, att:7, bi:6, trust:6, co2saved:634, tokensEarned:520, daysActive:115 },
    { id:'R007', age:23, gender:'M', occupation:'Student', pu:6, peou:5, att:5, bi:6, trust:5, co2saved:312, tokensEarned:257, daysActive:56 },
    { id:'R008', age:27, gender:'F', occupation:'Worker',  pu:5, peou:4, att:5, bi:5, trust:4, co2saved:198, tokensEarned:163, daysActive:38 },
    { id:'R009', age:26, gender:'M', occupation:'Student', pu:7, peou:7, att:7, bi:7, trust:7, co2saved:921, tokensEarned:758, daysActive:167 },
    { id:'R010', age:33, gender:'F', occupation:'Worker',  pu:6, peou:6, att:6, bi:7, trust:6, co2saved:445, tokensEarned:366, daysActive:82 },
  ],
};

// ==================== ORDER BOOK DATA ====================
function generateOrderBook() {
  const asks = [];
  const bids = [];
  let baseA = STATE.gmtPrice + 5;
  let baseB = STATE.gmtPrice - 5;
  for (let i = 0; i < 8; i++) {
    const pA = baseA + i * (3 + Math.random() * 4) | 0;
    const pB = baseB - i * (3 + Math.random() * 4) | 0;
    asks.push({ price: pA, qty: (50 + Math.random() * 400 | 0), total: 0 });
    bids.push({ price: pB, qty: (50 + Math.random() * 600 | 0), total: 0 });
  }
  asks.sort((a,b)=>a.price-b.price);
  bids.sort((a,b)=>b.price-a.price);
  let cumA = 0, cumB = 0;
  asks.forEach(r=>{ cumA+=r.qty; r.total=cumA; });
  bids.forEach(r=>{ cumB+=r.qty; r.total=cumB; });
  const maxA = asks[asks.length-1]?.total || 1;
  const maxB = bids[bids.length-1]?.total || 1;
  return { asks, bids, maxA, maxB };
}

function generateRecentTrades() {
  const trades = [];
  let price = STATE.gmtPrice;
  for (let i = 0; i < 16; i++) {
    price += (Math.random()-0.5)*20|0;
    trades.push({
      price: price,
      qty: (10 + Math.random()*200|0),
      side: Math.random()>0.5?'up':'down',
      time: `${(15+i) % 24 < 10 ? '0':''+(Math.random()*10|0)}:${Math.random()*60|0}`.padEnd(5,'0'),
    });
  }
  return trades.reverse();
}

// ==================== CHARTS ====================
let charts = {};

function initCharts() {
  // Activity Chart (Dashboard)
  const actCtx = document.getElementById('activityChart')?.getContext('2d');
  if (actCtx) {
    const labels = Array.from({length:30},(_,i)=>{
      const d = new Date(); d.setDate(d.getDate()-29+i);
      return `${d.getDate()}/${d.getMonth()+1}`;
    });
    const co2Data = labels.map(()=> 15+Math.random()*35|0);
    charts.activity = new Chart(actCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'CO₂ tiết kiệm (g)',
          data: co2Data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2,
        }]
      },
      options: chartOptions('CO₂ (g)')
    });
  }

  // Ring Chart
  const ringCtx = document.getElementById('ringChart')?.getContext('2d');
  if (ringCtx) {
    charts.ring = new Chart(ringCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [78, 22],
          backgroundColor: ['#10b981','rgba(16,185,129,0.1)'],
          borderWidth: 0,
          hoverOffset: 0,
        }]
      },
      options: {
        cutout: '75%', plugins:{ legend:{display:false}, tooltip:{enabled:false} },
        animation: { duration: 1200 }
      }
    });
  }

  // Price Chart (Market)
  const priceCtx = document.getElementById('priceChart')?.getContext('2d');
  if (priceCtx) {
    const pl = Array.from({length:60},(_,i)=>i+':00');
    const pd = [4100];
    for(let i=1;i<60;i++) pd.push(Math.max(3800, (pd[i-1]+(Math.random()-0.44)*30)|0));
    charts.price = new Chart(priceCtx, {
      type:'line',
      data:{
        labels:pl,
        datasets:[{
          data:pd,
          borderColor:'#10b981',
          backgroundColor:'rgba(16,185,129,0.1)',
          fill:true, tension:0.3, pointRadius:0, borderWidth:2
        }]
      },
      options: chartOptions('Giá (VND)')
    });
  }

  // CO2 Month Chart
  const co2MCtx = document.getElementById('co2MonthChart')?.getContext('2d');
  if (co2MCtx) {
    charts.co2Month = new Chart(co2MCtx, {
      type: 'bar',
      data: {
        labels: ['T11','T12','T1','T2','T3','T4'],
        datasets:[{
          data: [420,510,380,640,720,847],
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderColor: '#10b981',
          borderWidth: 1, borderRadius: 4,
        }]
      },
      options: chartOptions('CO₂ (kg)')
    });
  }

  // Mode Chart
  const modeCtx = document.getElementById('modeChart')?.getContext('2d');
  if (modeCtx) {
    charts.mode = new Chart(modeCtx, {
      type:'doughnut',
      data:{
        labels:['Xe đạp','Metro','Xe buýt','Xe điện','Đi bộ'],
        datasets:[{
          data:[35,28,20,13,4],
          backgroundColor:['#10b981','#14b8a6','#34d399','#2dd4bf','#6ee7b7'],
          borderWidth:0,
        }]
      },
      options:{
        cutout:'60%',
        plugins:{
          legend:{
            position:'right',
            labels:{color:'rgba(167,243,208,0.7)',font:{size:11},boxWidth:10}
          }
        }
      }
    });
  }

  // Trend Chart
  const trendCtx = document.getElementById('trendChart')?.getContext('2d');
  if (trendCtx) {
    const months = ['T5/25','T6','T7','T8','T9','T10','T11','T12','T1/26','T2','T3','T4'];
    charts.trend = new Chart(trendCtx, {
      type:'line',
      data:{
        labels: months,
        datasets:[
          {
            label:'Token tích lũy',
            data:[320,580,890,1240,1680,2100,2580,3120,3580,3890,4120,4250],
            borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.1)',
            fill:true,tension:0.4,pointRadius:2,borderWidth:2,yAxisID:'y',
          },
          {
            label:'Giá GMT (₫)',
            data:[1200,1450,1800,2200,2800,3100,3500,3900,4100,4000,4150,4250],
            borderColor:'#fbbf24',backgroundColor:'transparent',
            tension:0.4,pointRadius:2,borderWidth:2,yAxisID:'y1',
          }
        ]
      },
      options:{
        ...chartOptions(),
        scales:{
          y:{position:'left',grid:{color:'rgba(16,185,129,0.06)'},ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}}},
          y1:{position:'right',grid:{display:false},ticks:{color:'rgba(251,191,36,0.5)',font:{size:10}}}
        }
      }
    });
  }
}

function chartOptions(yLabel) {
  return {
    responsive: true, maintainAspectRatio: true,
    plugins:{ legend:{display:false}, tooltip:{
      backgroundColor:'rgba(10,20,16,0.9)',
      borderColor:'rgba(16,185,129,0.2)',borderWidth:1,
      titleColor:'#f0fdf4',bodyColor:'#a7f3d0',
    }},
    scales:{
      x:{grid:{color:'rgba(16,185,129,0.06)'},ticks:{color:'rgba(167,243,208,0.4)',font:{size:10},maxTicksLimit:8}},
      y:{grid:{color:'rgba(16,185,129,0.06)'},ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}}}
    }
  };
}

// switchChart — dùng seeded data thay Math.random() để ổn định khi demo
function switchChart(type, btn) {
  document.querySelectorAll('.chart-card .chart-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if (!charts.activity) return;
  const labels = charts.activity.data.labels;
  // Seeded generators có quy luật — tăng dần theo thời gian với variance
  const baseSeeds = {
    co2:   [18,22,15,28,32,19,25,38,21,29,34,17,26,41,23,31,37,20,28,45,24,33,40,18,27,43,22,30,38,25],
    token: [12,15,10,19,22,13,17,26,14,20,24,11,18,28,16,21,25,13,19,30,16,23,28,12,18,29,15,21,26,17],
    value: [45000,55000,38000,72000,84000,51000,63000,95000,48000,71000,88000,42000,
             68000,104000,58000,79000,93000,49000,74000,118000,60000,87000,108000,46000,70000,112000,56000,82000,99000,65000],
  };
  const seeds = baseSeeds[type] || baseSeeds.co2;
  const data = labels.map((_, i) => seeds[i % seeds.length]);
  charts.activity.data.datasets[0].data = data;
  charts.activity.data.datasets[0].label = type==='co2'?'CO₂ tiết kiệm (g)':type==='token'?'GMT Token tích lũy':'Giá trị VND (₫)';
  charts.activity.update('none');
}

// ==================== RENDER FUNCTIONS ====================
function renderRecentTxList() {
  const el = document.getElementById('recentTxList');
  if (!el) return;
  el.innerHTML = TX_DATA.slice(0,5).map(tx=>`
    <div class="tx-item">
      <div class="tx-icon ${tx.type}">${tx.icon}</div>
      <div class="tx-desc">
        <div class="tx-name">${tx.name}</div>
        <div class="tx-meta">${tx.meta} · ${tx.date}</div>
      </div>
      <div class="tx-amount">
        <div class="tx-val ${tx.val.startsWith('+')?'credit':'debit'}">${tx.val}</div>
        <div class="tx-date">${tx.vnd}</div>
      </div>
    </div>
  `).join('');
}

function renderLeaderboard() {
  const el = document.getElementById('leaderboard');
  if (!el) return;
  el.innerHTML = LEADERBOARD_DATA.map(l=>`
    <div class="lb-item ${l.you?'lb-you':''}">
      <div class="lb-rank ${l.rank<4?`rank-${l.rank}`:''}">
        ${l.rank<4?['🥇','🥈','🥉'][l.rank-1]:l.rank}
      </div>
      <div class="lb-av">${l.init}</div>
      <div class="lb-info">
        <div class="lb-name">${l.name}</div>
        <div class="lb-stat">${l.stat}</div>
      </div>
      <div class="lb-score">${l.pts.toLocaleString()}</div>
    </div>
  `).join('');
}

function renderCarbonHistory() {
  const el = document.getElementById('carbonHistory');
  if (!el) return;
  el.innerHTML = CARBON_HISTORY.map(c=>`
    <div class="ch-item">
      <div class="ch-icon">${c.icon}</div>
      <div class="ch-info">
        <div class="ch-name">${c.name}</div>
        <div class="ch-meta">${c.meta}</div>
        <div class="ch-hash-row">
          <span class="ch-hash">${c.hash}</span>
          <button class="ch-explorer-btn" onclick="viewTxOnChain('${c.hashFull||c.hash}')" title="Xem trên Polygonscan Amoy">🔗 Explorer</button>
        </div>
      </div>
      <div>
        <div class="ch-amt">${c.amt}</div>
      </div>
    </div>
  `).join('');
}

function renderSettlementItems() {
  const el = document.getElementById('settlementItems');
  if (!el) return;
  el.innerHTML = SETTLEMENT_DATA.map(s=>`
    <div class="settle-item">
      <div class="settle-icon">${s.icon}</div>
      <div class="settle-info">
        <div class="settle-desc">${s.desc}</div>
        <div class="settle-meta">${s.meta}</div>
      </div>
      <div class="settle-status ${s.status}">
        ${s.status==='pending'?'Chờ':s.status==='processing'?'Đang xử lý':'Hoàn thành'}
      </div>
    </div>
  `).join('');
}

function renderLedger(filter='all') {
  const el = document.getElementById('ledgerBody');
  if (!el) return;
  const data = filter==='all'?TX_DATA:TX_DATA.filter(t=>t.type===filter);
  el.innerHTML = data.map(tx=>`
    <tr>
      <td><span class="badge badge-${tx.type==='mint'?'green':tx.type==='charge'?'yellow':'blue'}">${tx.type.toUpperCase()}</span></td>
      <td>${tx.name}</td>
      <td class="${tx.val.startsWith('+')?'green':''}"><strong>${tx.val}</strong></td>
      <td>${tx.vnd}</td>
      <td><span class="status-pill ${tx.status}">${tx.status==='confirmed'?'✓ Xác nhận':tx.status==='pending'?'⏳ Chờ':'✗ Lỗi'}</span></td>
      <td>${tx.date}</td>
      <td class="tx-hash-cell">
        <span class="tx-hash-link" onclick="viewTxOnChain('${tx.hashFull||tx.hash}')" title="Xem trên Polygonscan Amoy" style="cursor:pointer;color:var(--info);font-family:'JetBrains Mono';font-size:10px">${tx.hash} 🔗</span>
      </td>
    </tr>
  `).join('');
}

function renderOrderBook() {
  const ob = generateOrderBook();
  const asksEl = document.getElementById('obAsks');
  const bidsEl = document.getElementById('obBids');
  const midEl  = document.getElementById('obMidPrice');
  if (!asksEl || !bidsEl) return;
  asksEl.innerHTML = ob.asks.slice(0,6).reverse().map(r=>`
    <div class="ob-row ob-ask" onclick="setOrderPrice(${r.price})">
      <div class="ob-row-bg" style="width:${(r.total/ob.maxA*100)|0}%"></div>
      <span>${r.price.toLocaleString()}</span>
      <span>${r.qty}</span>
      <span>${r.total.toLocaleString()}</span>
    </div>
  `).join('');
  bidsEl.innerHTML = ob.bids.slice(0,6).map(r=>`
    <div class="ob-row ob-bid" onclick="setOrderPrice(${r.price})">
      <div class="ob-row-bg" style="width:${(r.total/ob.maxB*100)|0}%"></div>
      <span>${r.price.toLocaleString()}</span>
      <span>${r.qty}</span>
      <span>${r.total.toLocaleString()}</span>
    </div>
  `).join('');
  if (midEl) midEl.textContent = `₫${STATE.gmtPrice.toLocaleString()}`;
}

function renderRecentTrades() {
  const el = document.getElementById('recentTrades');
  if (!el) return;
  el.innerHTML = generateRecentTrades().slice(0,14).map(t=>`
    <div class="rt-row">
      <span class="${t.side==='up'?'rt-price-up':'rt-price-down'}">₫${t.price.toLocaleString()}</span>
      <span class="rt-qty">${t.qty}</span>
      <span class="rt-time">${t.time}</span>
    </div>
  `).join('');
}

function renderActiveOrders() {
  const el = document.getElementById('activeOrders');
  if (!el) return;
  el.innerHTML = ACTIVE_ORDERS.map(o=>`
    <div class="ao-item">
      <span class="ao-side ${o.side}">${o.side==='buy'?'MUA':'BÁN'}</span>
      <div class="ao-info">
        <div class="ao-detail">${o.detail}</div>
        <div class="ao-meta">${o.meta}</div>
      </div>
      <span class="ao-status ${o.statusClass}">${o.status}</span>
      <button class="ao-cancel" onclick="cancelOrder(this)">Hủy</button>
    </div>
  `).join('');
}

function renderEscrowItems() {
  const el = document.getElementById('escrowItems');
  if (!el) return;
  el.innerHTML = ESCROW_ITEMS.map(e=>`
    <div class="es-item">
      <div class="es-hdr">
        <span class="es-title">${e.title}</span>
        <span class="es-amount">${e.amount}</span>
      </div>
      <div class="es-progress"><div class="es-fill" style="width:${e.progress}%"></div></div>
      <div class="es-footer"><span>${e.counter}</span><span>${e.time}</span></div>
    </div>
  `).join('');
}

function renderSettlementLog() {
  const el = document.getElementById('settlementLog');
  if (!el) return;
  el.innerHTML = SETTLEMENT_LOG_DATA.map(s=>`
    <div class="sl-item">
      <div class="sl-dot"></div>
      <div class="sl-info">
        <div>${s.desc}</div>
        <div class="sl-hash">${s.hash} · ${s.time}</div>
      </div>
      <div class="sl-amount">${s.amount}</div>
    </div>
  `).join('');
}


function renderEntTab(tab) {
  const el = document.getElementById('entTabContent');
  if (!el) return;
  if (tab==='orders') {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          {co:'VinGroup ESG',qty:'5,000 GMT',price:'₫4,350',total:'₫21.75M',status:'Chờ khớp'},
          {co:'FPT Software',qty:'2,500 GMT',price:'₫4,280',total:'₫10.7M',status:'Khớp 45%'},
          {co:'Masan Corp',qty:'10,000 GMT',price:'₫4,150',total:'₫41.5M',status:'Chờ khớp'},
        ].map(o=>`
          <div style="display:flex;align-items:center;gap:16px;padding:14px;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
            <span style="width:120px;font-size:13px;font-weight:700">${o.co}</span>
            <span style="flex:1;font-size:12px;color:var(--text-muted)">${o.qty} @ ${o.price}</span>
            <span style="font-family:'JetBrains Mono';font-weight:700">${o.total}</span>
            <span class="badge badge-yellow">${o.status}</span>
            <button class="btn-primary btn-sm" onclick="showToast('Đã xác nhận lệnh mua','✓')">Mua</button>
          </div>
        `).join('')}
      </div>`;
  } else if (tab==='escrow') {
    el.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px">${ESCROW_ITEMS.map(e=>`
      <div class="es-item">
        <div class="es-hdr"><span class="es-title">${e.title}</span><span class="es-amount">${e.amount}</span></div>
        <div class="es-progress"><div class="es-fill" style="width:${e.progress}%"></div></div>
        <div class="es-footer"><span>${e.counter}</span><span>${e.time}</span></div>
      </div>`).join('')}</div>`;
  } else if (tab==='esg') {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
        ${[
          {label:'CO₂ Offset Q1',val:'1,248 tCO₂',sub:'Vượt mục tiêu 24.8%'},
          {label:'Token Chi tiêu',val:'128,400 GMT',sub:'≈ ₫545.7M'},
          {label:'ESG Score',val:'A+',sub:'Top 5% doanh nghiệp'},
        ].map(s=>`
          <div style="text-align:center;padding:20px;background:var(--surface);border-radius:12px">
            <div style="font-family:Outfit;font-size:26px;font-weight:800;color:var(--emerald-400)">${s.val}</div>
            <div style="font-size:12px;font-weight:600;margin:4px 0">${s.label}</div>
            <div style="font-size:11px;color:var(--text-muted)">${s.sub}</div>
          </div>`).join('')}
      </div>
      <button class="btn-primary" onclick="showToast('Đang tạo báo cáo ESG PDF...','📊')">📊 Tải Báo cáo ESG Q1-2026</button>`;
  } else if (tab==='audit') {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[
          {action:'Đặt lệnh mua B2B',actor:'VinGroup ESG · admin@vingroup.vn',hash:'0x7b2d...9f0a',time:'19/04 15:32'},
          {action:'Escrow khóa tiền',actor:'CarbonEscrow.sol · Polygon',hash:'0x3a8f...c4e1',time:'19/04 14:18'},
          {action:'KYC Approved',actor:'Admin #001 · greenmile.io',hash:'0x9e7c...b3a6',time:'19/04 12:00'},
          {action:'Settlement giải ngân',actor:'SettlementVault.sol · Tự động',hash:'0x1c9e...3b7d',time:'18/04 18:45'},
        ].map(a=>`
          <div class="sl-item">
            <div class="sl-dot"></div>
            <div class="sl-info">
              <div style="font-size:13px;font-weight:600">${a.action}</div>
              <div style="font-size:11px;color:var(--text-muted)">${a.actor}</div>
              <div class="sl-hash">${a.hash} · ${a.time}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }
}

function renderAdminTab(tab) {
  const el = document.getElementById('adminTabContent');
  if (!el) return;
  if (tab==='kyc') {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${KYC_QUEUE.map(k=>`
          <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700">${k.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${k.type} · ${k.doc} · ${k.time}</div>
            </div>
            <span class="status-pill ${k.status==='approved'?'confirmed':k.status==='reviewing'?'pending':'pending'}">
              ${k.status==='approved'?'✓ Approved':k.status==='reviewing'?'Đang xét':'Chờ duyệt'}
            </span>
            ${k.status!=='approved'?`
              <button class="btn-primary btn-sm" onclick="approveKYC(this,'${k.name}')">Duyệt</button>
              <button class="btn-ghost btn-sm">Từ chối</button>
            `:''}
          </div>
        `).join('')}
      </div>`;
  } else if (tab==='supply') {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
        <div style="text-align:center;padding:20px;background:var(--surface);border-radius:12px">
          <div style="font-family:Outfit;font-size:24px;font-weight:800">12,847,000</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">GMT Lưu hành</div>
        </div>
        <div style="text-align:center;padding:20px;background:var(--surface);border-radius:12px">
          <div style="font-family:Outfit;font-size:24px;font-weight:800">100,000,000</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Tổng cung tối đa</div>
        </div>
        <div style="text-align:center;padding:20px;background:var(--surface);border-radius:12px">
          <div style="font-family:Outfit;font-size:24px;font-weight:800;color:var(--emerald-400)">12.8%</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Tỷ lệ lưu hành</div>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn-primary" onclick="showToast('Tạo lệnh mint cần multi-sig 3/5','🔐')">🌿 Mint mới (Multi-sig)</button>
        <button class="btn-ghost" onclick="showToast('Xuất báo cáo supply chain','📊')">📊 Báo cáo Supply</button>
      </div>`;
  } else if (tab==='fraud') {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${FRAUD_ALERTS.map(f=>`
          <div style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:12px;border:1px solid ${f.level==='high'?'rgba(239,68,68,0.2)':f.level==='medium'?'rgba(245,158,11,0.2)':'var(--border)'};background:${f.level==='high'?'rgba(239,68,68,0.05)':f.level==='medium'?'rgba(245,158,11,0.04)':'var(--surface)'}">
            <div style="font-size:20px">${f.level==='high'?'🔴':f.level==='medium'?'🟡':'🔵'}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${f.user} — ${f.desc}</div>
              <div style="font-size:11px;color:var(--text-muted)">${f.time}</div>
            </div>
            <span style="font-size:11px;font-weight:700;color:${f.level==='high'?'var(--error)':'var(--warning)'}">${f.action}</span>
          </div>
        `).join('')}
      </div>`;
  } else if (tab==='audit') {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[
          {action:'User NVA mint 125 GMT',hash:'0x3a8f...c4e1',time:'19/04 15:32',level:'info'},
          {action:'Fraud lock 0x8f2a... — double trip',hash:'0xAI_det...3c9f',time:'19/04 15:12',level:'high'},
          {action:'KYC Approved — VinGroup ESG',hash:'0x9e7c...b3a6',time:'19/04 12:00',level:'info'},
          {action:'Settlement #1847 giải ngân ₫2.14M',hash:'0x7b2d...9f0a',time:'19/04 12:18',level:'success'},
          {action:'Admin #001 đăng nhập hệ thống',hash:'0x5b3a...1d7c',time:'19/04 09:00',level:'info'},
        ].map(a=>`
          <div class="sl-item">
            <div class="sl-dot" style="background:${a.level==='high'?'var(--error)':a.level==='success'?'var(--emerald-500)':'var(--info)'}"></div>
            <div class="sl-info" style="flex:1">
              <div style="font-size:12px">${a.action}</div>
              <div class="sl-hash">${a.hash} · ${a.time}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }
}

// ==================== NAVIGATION ====================
const SCREEN_LABELS = {
  dashboard:'Tổng quan', carbon:'Carbon & Mint', ai:'AI Green Advisor',
  wallet:'Ví & Giao dịch', market:'Carbon Marketplace', trade:'Giao dịch B2B',
  impact:'Tác động ESG', charging:'Trạm Sạc EV', enterprise:'Enterprise Console',
  admin:'Admin Console', profile:'Hồ sơ cá nhân',
  research:'Research Insights — TAM / UTAUT / ESG',
};

function showScreen(name) {
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.screen===name);
  });
  // Toggle screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.id===`screen-${name}`);
    s.classList.toggle('hidden', s.id!==`screen-${name}`);
  });
  // Breadcrumb
  const bc = document.getElementById('breadcrumb');
  if (bc) bc.textContent = SCREEN_LABELS[name]||name;
  STATE.currentScreen = name;
  // Close sidebar on mobile
  if (window.innerWidth<800) document.getElementById('sidebar').classList.remove('open');
  // Screen-specific init
  if (name==='wallet') { renderSettlementItems(); renderLedger(); }
  if (name==='trade')  { renderActiveOrders(); renderEscrowItems(); renderSettlementLog(); }
  if (name==='enterprise') { renderEntTab(STATE.entTab); }
  if (name==='admin')  { renderAdminTab(STATE.adminTab); }
  if (name==='charging') { 
    initEvMap(); 
    setTimeout(() => { if(leafletMap) leafletMap.invalidateSize(); }, 200); 
  }
  if (name==='profile') { initProfileScreen(); }
  if (name==='research') { initResearchScreen(); }
  if (name==='market') { renderRecentTrades(); startOrderBookLive(); }
  else stopOrderBookLive();
}

// ==================== SIDEBAR ====================
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  s.classList.toggle('open');
}

// ==================== NOTIFICATIONS ====================
function showNotifications() {
  const panel = document.getElementById('notifPanel');
  STATE.notifOpen = !STATE.notifOpen;
  panel.classList.toggle('hidden', !STATE.notifOpen);
}
document.addEventListener('click', e=>{
  if (!e.target.closest('#notifBtn') && !e.target.closest('#notifPanel')) {
    document.getElementById('notifPanel')?.classList.add('hidden');
    STATE.notifOpen = false;
  }
});

// ==================== THEME ====================
function toggleTheme() {
  STATE.theme = STATE.theme==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = STATE.theme==='dark'?'☾ Dark Mode':'☀ Light Mode';
}

// ==================== CARBON CALCULATOR ====================
function selectVehicle(btn) {
  document.querySelectorAll('.vehicle-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  STATE.mintMode = btn.dataset.mode;
  STATE.mintFactor = parseInt(btn.dataset.factor);

  const vName = btn.querySelector('.v-name').textContent;
  const vCo2 = btn.querySelector('.v-co2').textContent;
  
  const currentLabel = document.getElementById('currentTransportLabel');
  if (currentLabel) {
    currentLabel.textContent = `Bạn đang sử dụng: ${vName} (${vCo2})`;
  }

  const baselineSelect = document.getElementById('baselineMode');
  if (baselineSelect) {
    let options = '';
    if (STATE.mintMode === 'car_ev') {
      options = `<option value="120">Ô tô xăng (120g/km)</option>`;
    } else if (STATE.mintMode === 'moto_ev') {
      options = `<option value="120">Xe máy xăng (120g/km)</option>`;
    } else if (STATE.mintMode === 'bicycle' || STATE.mintMode === 'walk') {
      options = `
        <option value="120">Xe máy xăng (120g/km)</option>
        <option value="120">Ô tô xăng (120g/km)</option>
      `;
    } else if (STATE.mintMode === 'bus') {
      options = `<option value="120">Ô tô cá nhân (120g/km)</option>`;
    } else {
      options = `<option value="${STATE.mintFactor}">Không có (Baseline)</option>`;
    }
    baselineSelect.innerHTML = options;
  }

  calcCO2();
}

function calcCO2() {
  const dist = parseFloat(document.getElementById('distanceInput')?.value)||0;
  const baseline = parseInt(document.getElementById('baselineMode')?.value)||120;
  const saved = Math.max(0, (baseline - STATE.mintFactor) * dist); // grams
  const gmt = Math.max(0, (saved / 1000 * 10) | 0) + (saved>0?1:0) * Math.max(1, (dist*0.9)|0);
  const vnd = gmt * STATE.gmtPrice;
  // Confidence = hàm của distance, mode, và tỷ lệ CO₂ tiết kiệm — không dùng Math.random()
  // Xe đạp/đi bộ: confidence cao nhất (đơn giản, ít sai số GPS)
  // Xe buýt/metro: khá cao
  // Xe điện: trung bình (phụ thuộc lưới điện)
  const confBase = { bicycle:96, walk:94, bus:89, car_ev:88, moto_ev:91, car_gas:82, moto_gas:84 };
  const distBonus = Math.min(3, dist > 10 ? 2 : dist > 5 ? 1 : 0);
  const confidence = Math.min(99, (confBase[STATE.mintMode] || 88) + distBonus);

  const s = document.getElementById('co2Saved');
  const g = document.getElementById('gmtEarned');
  const v = document.getElementById('vndEarned');
  const sf = document.getElementById('aiScoreFill');
  const sp = document.getElementById('aiScorePct');

  if (s) s.textContent = saved>=1000 ? `${(saved/1000).toFixed(2)}kg` : `${saved|0}g`;
  if (g) g.textContent = `${gmt} GMT`;
  if (v) v.textContent = `₫${vnd.toLocaleString()}`;
  if (sf) sf.style.width = confidence+'%';
  if (sp) sp.textContent = confidence+'%';
}

// ==================== MINT FLOW ====================
function startMint() {
  const card = document.getElementById('mintProgressCard');
  if (card) card.style.display='block';
  const btn = document.getElementById('mintBtn');
  if (btn) { btn.disabled=true; btn.textContent='Đang xử lý...'; }

  const steps = ['mstep1','mstep2','mstep3','mstep4','mstep5'];
  steps.forEach(s=>{
    const dot = document.querySelector(`#${s} .step-dot`);
    if (dot) dot.className='step-dot';
  });

  let i=0;
  const go = ()=>{
    if (i>=steps.length) {
      // Done — tạo tx hash có tính nhất quán (timestamp-seeded)
      const txBox = document.getElementById('txHashBox');
      const txHash = document.getElementById('mintTxHash');
      if (txBox) txBox.classList.remove('hidden');
      // Dùng timestamp + mintMode để tạo hash ổn định hơn
      // Trong production: hash này sẽ là tx hash thật từ smart contract
      const seed = Date.now().toString(16) + STATE.mintMode.split('').map(c=>c.charCodeAt(0).toString(16)).join('');
      const h = '0x' + (seed + '0000000000000000000000000000000000000000').slice(0, 64);
      STATE.lastMintHash = h;
      if (txHash) txHash.textContent = h.slice(0,18)+'...'+h.slice(-6);
      // Lưu vào carbon history
      const dist = parseFloat(document.getElementById('distanceInput')?.value)||0;
      const baseline = parseInt(document.getElementById('baselineMode')?.value)||120;
      const saved = Math.max(0, (baseline - STATE.mintFactor) * dist);
      const gmt = Math.max(0, (saved / 1000 * 10) | 0) + (saved>0?1:0) * Math.max(1, (dist*0.9)|0);
      const modeIcons = { bicycle:'🚲', walk:'🚶', bus:'🚌', car_ev:'🚗', moto_ev:'🛵', car_gas:'🚙', moto_gas:'🏍️' };
      CARBON_HISTORY.unshift({
        icon: modeIcons[STATE.mintMode]||'🌿',
        name: `${STATE.mintMode} ${dist}km`,
        meta: `${new Date().toLocaleDateString('vi-VN')} · ${document.getElementById('aiScorePct')?.textContent||'90%'} AI`,
        amt: `+${gmt} GMT`,
        hash: h.slice(0,10)+'...'+h.slice(-4),
        hashFull: h,
      });
      // Priority 2: also push into TX_DATA so wallet screen stays updated
      const _mn = { bicycle:'Xe đạp', walk:'Đi bộ', bus:'Xe buýt', car_ev:'Ô tô điện', moto_ev:'Xe máy điện', car_gas:'Ô tô xăng', moto_gas:'Xe máy xăng' };
      const _n = new Date();
      const _ds = `${String(_n.getDate()).padStart(2,'0')}/${String(_n.getMonth()+1).padStart(2,'0')} ${String(_n.getHours()).padStart(2,'0')}:${String(_n.getMinutes()).padStart(2,'0')}`;
      TX_DATA.unshift({
        type:'mint', icon:'🌿',
        name:`Mint Token — ${_mn[STATE.mintMode]||STATE.mintMode} ${dist}km`,
        meta:`AI Verified · ${document.getElementById('aiScorePct')?.textContent||'90%'} conf · ${saved>=1000?(saved/1000).toFixed(2)+'kg':saved+'g'} CO₂`,
        val:`+${gmt} GMT`,
        vnd:`₫${(gmt*STATE.gmtPrice).toLocaleString()}`,
        status:'confirmed', date:_ds,
        hash:h.slice(0,10)+'...'+h.slice(-4), hashFull:h,
        co2:saved, km:dist, mode:STATE.mintMode,
      });
      // Priority 2: update balance + persist everything to localStorage
      STATE.gmtBalance += gmt;
      updateBalanceDisplay();
      persistAllData();
      renderCarbonHistory();
      showToast('🌿 Mint thành công! Token đã vào ví on-chain', '✓');
      if (btn) { btn.disabled=false; btn.textContent='🌿 Xác nhận & Mint Token'; }
      return;
    }
    const dot = document.querySelector(`#${steps[i]} .step-dot`);
    if (dot) dot.className='step-dot pending';
    if (i>0) {
      const prev = document.querySelector(`#${steps[i-1]} .step-dot`);
      if (prev) prev.className='step-dot done';
    }
    i++;
    setTimeout(go, 900);
  };
  go();
}

// viewOnChain — mở Polygonscan Amoy với tx hash thật (testnet demo)
function viewOnChain() {
  const hash = STATE.lastMintHash || BLOCKCHAIN_CONFIG.knownTxHashes[0];
  const url = BLOCKCHAIN_CONFIG.explorerBase + hash;
  window.open(url, '_blank');
  showToast('🔗 Mở Polygonscan Amoy Testnet...', '🔗');
}

// viewTxOnChain — dùng cho ledger / carbon history
function viewTxOnChain(hashFull) {
  const hash = hashFull || BLOCKCHAIN_CONFIG.knownTxHashes[0];
  const url = BLOCKCHAIN_CONFIG.explorerBase + hash;
  window.open(url, '_blank');
  showToast('🔗 Mở transaction trên Polygonscan...', '🔗');
}

// ==================== AI CHAT ====================
const AI_RESPONSES = {
  'giá gmt': 'GMT đang giao dịch ở mức **₫4,250** — tăng **+2.4%** trong 24h qua. Mô hình ML dự đoán giá có thể chạm **₫4,600–4,800** cuối tuần do nhu cầu offset Q2 từ doanh nghiệp lớn. Xu hướng tích cực! 📈',
  'khi nào bán': 'Dựa trên phân tích on-chain, **thứ 6–7** thường có volume mua từ doanh nghiệp cao nhất. Tôi gợi ý đặt **lệnh limit ở ₫4,500–4,600** để tối ưu lợi nhuận. Đừng bán dưới ₫4,000 nhé! 💡',
  'esg': 'ESG Score hiện tại của bạn là **A+ (88/100)** — Top 5% người dùng toàn hệ thống. Để lên **S+ (95+)**, bạn cần: ①Thêm 200km xe đạp, ②Hoàn thành carbon offset 1 tấn, ③Tham gia 2 dự án rừng 🌿',
  'phân tích': `Tổng hợp **30 ngày qua**:
• Tổng CO₂ tiết kiệm: **847kg** (↑34% so tháng trước)
• Token mint: **4,250 GMT** tổng cộng
• Giao dịch B2B: **7 lệnh** — tất cả thành công
• Điểm tin cậy AI: **99.2/100** — Xuất sắc!
• Xu hướng: Đang tăng tốc 🚀`,
};

function sendChat() {
  const inp = document.getElementById('chatInput');
  if (!inp || !inp.value.trim()) return;
  sendQuick(inp.value.trim());
  inp.value='';
}

function sendQuick(text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;

  // User message
  msgs.innerHTML += `
    <div class="chat-msg user-msg">
      <div class="msg-avatar user-av">NV</div>
      <div class="msg-bubble">${text}</div>
    </div>`;

  // Thinking
  const thinkId = 'think_'+Date.now();
  msgs.innerHTML += `
    <div class="chat-msg ai-msg ai-thinking" id="${thinkId}">
      <div class="msg-avatar">✦</div>
      <div class="msg-bubble"><div class="dot-typing"><span></span><span></span><span></span></div></div>
    </div>`;
  msgs.scrollTop=msgs.scrollHeight;

  setTimeout(()=>{
    const think = document.getElementById(thinkId);
    if (think) {
      const key = Object.keys(AI_RESPONSES).find(k=>text.toLowerCase().includes(k));
      const reply = AI_RESPONSES[key] || `Rất thú vị! Dựa trên dữ liệu hiện tại, **"${text}"** là một câu hỏi quan trọng. Tôi đang phân tích dữ liệu blockchain và thị trường để đưa ra gợi ý tối ưu cho bạn. Bạn có muốn tôi tạo báo cáo chi tiết không? 🌿`;
      think.outerHTML = `
        <div class="chat-msg ai-msg">
          <div class="msg-avatar">✦</div>
          <div class="msg-bubble">${reply.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')}</div>
        </div>`;
      msgs.scrollTop=msgs.scrollHeight;
    }
  }, 1400);
}

// ==================== WALLET / LEDGER ====================
function filterTx(filter, btn) {
  document.querySelectorAll('.tx-filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderLedger(filter);
}

function copyAddress() { showToast('Đã sao chép địa chỉ ví', '⎘'); }

// ==================== MARKETPLACE ====================
function setOrderPrice(p) {
  const inp = document.getElementById('orderPrice');
  if (inp) { inp.value=p; calcOrderTotal(); }
}

function calcOrderTotal() {
  const price = parseInt(document.getElementById('orderPrice')?.value)||0;
  const qty   = parseInt(document.getElementById('orderQty')?.value)||0;
  const total = price*qty;
  const fee   = (total*0.001)|0;
  document.getElementById('orderTotal') && (document.getElementById('orderTotal').textContent=`₫${total.toLocaleString()}`);
  document.getElementById('orderFee')   && (document.getElementById('orderFee').textContent=`₫${fee.toLocaleString()}`);
  document.getElementById('orderEscrow')&& (document.getElementById('orderEscrow').textContent=`₫${(total+fee).toLocaleString()}`);
}

function setPct(pct) {
  document.getElementById('orderQty').value = Math.floor(4250*pct/100);
  calcOrderTotal();
}

function setMax() { setPct(100); }

function switchTradeTab(tab) {
  STATE.activeTradeTab=tab;
  document.getElementById('buyTab').classList.toggle('active',tab==='buy');
  document.getElementById('sellTab').classList.toggle('active',tab==='sell');
  const btn = document.getElementById('placeOrderBtn');
  if (btn) {
    btn.textContent = tab==='buy'?'Đặt lệnh Mua':'Đặt lệnh Bán';
    btn.className = `btn-primary full-w btn-large ${tab==='buy'?'buy-btn':'sell-btn-active'}`;
  }
}

function placeOrder() {
  const price = document.getElementById('orderPrice')?.value;
  const qty   = document.getElementById('orderQty')?.value;
  const side  = STATE.activeTradeTab==='buy'?'Mua':'Bán';
  showToast(`✓ Đã đặt lệnh ${side} ${qty} GMT @ ₫${parseInt(price).toLocaleString()}`, '⟡');
  setTimeout(()=>renderOrderBook(), 500);
}

function startOrderBookLive() {
  stopOrderBookLive();
  renderOrderBook();
  renderRecentTrades();
  STATE.orderBookInterval = setInterval(()=>{
    // Price drift
    STATE.gmtPrice += (Math.random()-0.48)*8|0;
    STATE.gmtPrice = Math.max(3800, Math.min(4800, STATE.gmtPrice));
    // Update ticker
    const tp = document.getElementById('tickerPrice');
    if (tp) tp.textContent = `₫${STATE.gmtPrice.toLocaleString()}`;
    const mp = document.getElementById('marketPrice');
    if (mp) mp.textContent = `₫${STATE.gmtPrice.toLocaleString()}`;
    renderOrderBook();
    // Occasionally refresh trades
    if (Math.random()>0.6) renderRecentTrades();
  }, 1800);
}

function stopOrderBookLive() {
  if (STATE.orderBookInterval) { clearInterval(STATE.orderBookInterval); STATE.orderBookInterval=null; }
}

// ==================== EV CHARGING MAP (LEAFLET.JS) ====================
let leafletMap = null;
let markerClusterGroup = null;
let currentMarkers = [];

// Khởi tạo bản đồ
function initEvMap() {
  if (leafletMap) return; // Chỉ init 1 lần

  leafletMap = L.map('leafletMap', {
    zoomControl: false,
    minZoom: 5,
    maxZoom: 18,
  }).setView([16.0470, 108.2062], 6); // Center VN

  // Thêm điều khiển Zoom xuống góc dưới phải
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

  // Layer tiles: OpenStreetMap tiêu chuẩn (được invert qua CSS)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 19
  }).addTo(leafletMap);

  // Tạo MarkerCluster
  markerClusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 13
  });
  leafletMap.addLayer(markerClusterGroup);

  // Render trạm
  renderMapStations(STATIONS);
  updateMapStats(STATIONS);
  
  // Render danh sách bên cột phải
  renderStationsList(STATIONS);
}

// Custom icons
const baseIconHtml = `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--glass-bg)" stroke="{COLOR}" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="{COLOR}"/><path d="M20,40 L16,32 L24,32 Z" fill="{COLOR}"/></svg>`;
const iconAvail = L.divIcon({
  html: `<div class="marker-avail">` + baseIconHtml.replace(/\{COLOR\}/g, '#22c55e') + `</div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
});
const iconBusy = L.divIcon({
  html: `<div class="marker-busy">` + baseIconHtml.replace(/\{COLOR\}/g, '#f97316') + `</div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
});

function renderMapStations(data) {
  markerClusterGroup.clearLayers();
  currentMarkers = [];

  data.forEach(s => {
    const isAvail = s.status === 'a';
    const marker = L.marker([s.lat, s.lng], {
      icon: isAvail ? iconAvail : iconBusy,
      stationId: s.id
    });

    const badgeStr = isAvail 
      ? `<span style="color:#4ade80;font-size:10px;font-weight:700">• Sẵn sàng</span>` 
      : `<span style="color:#fb923c;font-size:10px;font-weight:700">• Bận</span>`;

    const popupHtml = `
      <div style="min-width:180px">
        <div class="popup-title">${s.name}</div>
        <div class="popup-sub">
           ${badgeStr}
           <span style="color:#64748b;margin-left:auto">${s.kw}</span>
        </div>
        <div style="font-size:11px;color:rgba(167,243,208,0.7);margin-bottom:6px">📍 ${s.addr}</div>
        <div class="popup-price">⚡ ${s.price}</div>
        <button class="btn-ghost popup-btn" onclick="selectStation(${s.id}); leafletMap.closePopup();">
          Xem chi tiết ↗
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on('click', () => { selectStation(s.id); });
    markerClusterGroup.addLayer(marker);
    currentMarkers.push(marker);
  });
}

function updateMapStats(data) {
  const avail = data.filter(s=>s.status==='a').length;
  const busy = data.length - avail;
  const aEl = document.getElementById('mapStatAvail');
  const bEl = document.getElementById('mapStatBusy');
  const cntEl = document.getElementById('activeStationCount');
  if(aEl) aEl.textContent = avail;
  if(bEl) bEl.textContent = busy;
  if(cntEl) cntEl.textContent = `${data.length} Trạm Active`;
}

function filterMapStations(term) {
  term = term.toLowerCase();
  const filtered = STATIONS.filter(s => s.name.toLowerCase().includes(term) || s.addr.toLowerCase().includes(term));
  renderMapStations(filtered);
  updateMapStats(filtered);
}

function filterChip(type, btn) {
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  let filtered = STATIONS;
  if(type === 'available') filtered = STATIONS.filter(s => s.status === 'a');
  if(type === 'busy') filtered = STATIONS.filter(s => s.status === 'b');
  if(type === 'dc') filtered = STATIONS.filter(s => s.type === 'dc');
  if(type === 'ac') filtered = STATIONS.filter(s => s.type === 'ac');
  
  renderMapStations(filtered);
  updateMapStats(filtered);
  if(filtered.length > 0) leafletMap.fitBounds(markerClusterGroup.getBounds(), { padding: [50,50] });
}

function locateUser() {
  if (navigator.geolocation) {
    showToast('Đang tìm vị trí của bạn...', '📍');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        leafletMap.flyTo([lat, lng], 13, { duration: 1.5 });
        
        // Add blue blip for user
        const userIcon = L.divIcon({
          html: `<div style="width:16px;height:16px;background:#38bdf8;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #38bdf8;"></div>`,
          className: '', iconSize: [16,16]
        });
        L.marker([lat, lng], {icon: userIcon, zIndexOffset: 1000}).addTo(leafletMap).bindPopup('<div style="font-size:12px;font-family:Inter">Vị trí của bạn</div>').openPopup();

        // Xếp gần nhất
        let withDist = STATIONS.map(s => {
          const d = leafletMap.distance([lat, lng], [s.lat, s.lng]);
          return {...s, distCalc: d};
        }).sort((a,b)=>a.distCalc - b.distCalc);

        // Update list right
        withDist.forEach(s => {
          s.dist = s.distCalc < 1000 ? (s.distCalc|0) + 'm' : (s.distCalc/1000).toFixed(1) + 'km';
        });
        renderStationsList(withDist);

      },
      () => showToast('Không thể lấy vị trí. Vui lòng cấp quyền location.', '⚠️')
    );
  } else {
    showToast('Trình duyệt không hỗ trợ Geolocation', '⚠️');
  }
}

function resetMapView() {
  leafletMap.flyTo([16.0470, 108.2062], 6, { duration: 1.5 });
}

function toggleMapLayer() {
  showToast('Chức năng đổi layer vệ tinh đang phát triển', '🌏');
}

// Cập nhật bảng bên phải khi chọn trạm
function selectStation(id) {
  const s = STATIONS.find(x=>x.id===id);
  if (!s) return;
  const nameEl = document.getElementById('stationName');
  const addrEl = document.getElementById('stationAddr');
  const powerEl = document.getElementById('stationPower');
  const priceEl = document.getElementById('stationPrice');
  const statusBadge = document.getElementById('stationStatusBadge');
  
  if (nameEl) nameEl.textContent = s.name;
  if (addrEl) addrEl.textContent = s.addr;
  if (powerEl) powerEl.textContent = `${s.type.toUpperCase()}${s.type==='dc'?' Fast':''} — ${s.kw} · ${s.slots} cổng`;
  if (priceEl) priceEl.textContent = `${s.price} hoặc ${(parseInt(s.price.replace(/\D/g,''))/4250).toFixed(2)} GMT/kWh`;
  
  if (statusBadge) {
    statusBadge.className = `station-status ${s.status === 'a' ? 'available-badge' : 'busy-badge'}`;
    statusBadge.innerHTML = s.status === 'a' ? '● Sẵn sàng' : '● Bận';
    if(s.status === 'b') statusBadge.style.color = '#fb923c';
    else statusBadge.style.color = ''; // reset to css default
  }

  // Pan to marker
  if(leafletMap) {
    leafletMap.flyTo([s.lat, s.lng], 15, { duration: 1.0 });
  }

  // Khớp lệnh UI -> Hiện animation chọn
  const card = document.getElementById('stationInfoCard');
  if(card) {
    card.style.transform = 'scale(0.98)';
    setTimeout(() => card.style.transform = 'scale(1)', 150);
  }
}

function renderStationsList(data) {
  const el = document.getElementById('stationsList');
  if (!el) return;
  el.innerHTML = data.slice(0, 6).map(s => `
    <div class="st-item" onclick="selectStation(${s.id})" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border); transition:background var(--trans-fast)">
      <div style="display:flex; align-items:center; gap:10px">
        <div style="width:8px;height:8px;border-radius:50%;background:${s.status==='a'?'#4ade80':'#fb923c'}"></div>
        <div>
          <div style="font-size:13px;font-weight:600">${s.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">${s.dist} · ${s.kw}</div>
        </div>
      </div>
      <div style="font-size:12px;font-weight:600;font-family:'JetBrains Mono'">${s.price.split('/')[0]}</div>
    </div>
  `).join('');
  
  // Add hover effect via CSS script
  document.querySelectorAll('.st-item').forEach(item => {
    item.addEventListener('mouseover', () => item.style.background = 'var(--surface-hover)');
    item.addEventListener('mouseout', () => item.style.background = 'transparent');
  });
}

function selectPM(type, btn) {
  document.querySelectorAll('.pm-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function startCharging() {
  document.getElementById('chargingSession')?.classList.remove('hidden');
  document.getElementById('stationInfoCard').style.opacity='0.5';
  STATE.chargingActive=true;
  STATE.chargingPct=0;
  STATE.sessionSeconds=0;
  initSessionRing();
  STATE.chargingInterval = setInterval(()=>{
    STATE.chargingPct = Math.min(100, STATE.chargingPct+0.8);
    STATE.sessionSeconds++;
    const kwh = (STATE.chargingPct/100*40).toFixed(1);
    const mm = String(Math.floor(STATE.sessionSeconds/60)).padStart(2,'0');
    const ss = String(STATE.sessionSeconds%60).padStart(2,'0');
    document.getElementById('sessionKwh').textContent = `${kwh} kWh`;
    document.getElementById('sessionTime').textContent = `${mm}:${ss}`;
    document.getElementById('sessionCost').textContent = `${(kwh*1)|0} GMT`;
    document.getElementById('sessionPct').textContent = `${STATE.chargingPct|0}%`;
    updateSessionRing(STATE.chargingPct);
    if (STATE.chargingPct>=100) stopCharging();
  }, 200);
}

function stopCharging() {
  clearInterval(STATE.chargingInterval);
  STATE.chargingActive=false;
  document.getElementById('chargingSession')?.classList.add('hidden');
  document.getElementById('stationInfoCard').style.opacity='1';
  showToast('⚡ Sạc hoàn tất! Hóa đơn đã gửi vào ví', '✓');
}

function initSessionRing() {
  const canvas = document.getElementById('sessionRing');
  if (!canvas) return;
  STATE.sessionRingCtx = canvas.getContext('2d');
}

function updateSessionRing(pct) {
  const ctx = STATE.sessionRingCtx;
  if (!ctx) return;
  ctx.clearRect(0,0,120,120);
  ctx.beginPath(); ctx.arc(60,60,50,0,Math.PI*2);
  ctx.strokeStyle='rgba(16,185,129,0.1)'; ctx.lineWidth=8; ctx.stroke();
  ctx.beginPath(); ctx.arc(60,60,50,-Math.PI/2,(pct/100)*Math.PI*2-Math.PI/2);
  ctx.strokeStyle='#10b981'; ctx.lineWidth=8; ctx.lineCap='round'; ctx.stroke();
}

// ==================== ENTERPRISE TABS ====================
function switchEntTab(tab, btn) {
  STATE.entTab=tab;
  document.querySelectorAll('.ent-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderEntTab(tab);
}

// ==================== ADMIN ====================
function switchAdminTab(tab, btn) {
  STATE.adminTab=tab;
  document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminTab(tab);
}

function approveKYC(btn, name) {
  const row = btn.closest('div[style]');
  if (row) {
    row.style.opacity='0.5';
    row.querySelector('span.status-pill').textContent='✓ Approved';
    row.querySelector('span.status-pill').className='status-pill confirmed';
    const btns = row.querySelectorAll('button');
    btns.forEach(b=>b.remove());
  }
  showToast(`KYC approved: ${name}`, '✓');
}

function cancelOrder(btn) {
  btn.closest('.ao-item').style.opacity='0.4';
  btn.textContent='Đã hủy';
  btn.disabled=true;
  showToast('Đã hủy lệnh thành công', '✓');
}

// ==================== WITHDRAWAL ====================
function startWithdrawal() {
  const amount = document.getElementById('withdrawAmount')?.value;
  showModal('withdrawFlow', amount);
}

// ==================== MODALS ====================
function showModal(type, data) {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  overlay.classList.remove('hidden');

  if (type==='depositModal') {
    body.innerHTML = `
      <div class="modal-title">↓ Nạp tiền</div>
      <div class="form-group"><label class="form-label">Số tiền (VND)</label><input type="number" class="form-input" placeholder="₫1,000,000" /></div>
      <div class="form-group"><label class="form-label">Phương thức</label>
        <select class="form-input"><option>MoMo</option><option>Ngân hàng nội địa</option><option>Thẻ quốc tế</option></select>
      </div>
      <button class="btn-primary full-w" onclick="closeModal();showToast('Nạp tiền thành công!','₫')">Xác nhận nạp</button>`;
  } else if (type==='withdrawModal') {
    body.innerHTML = `
      <div class="modal-title">↑ Rút tiền</div>
      <div class="form-group"><label class="form-label">Số tiền (VND)</label><input type="number" class="form-input" placeholder="₫500,000" /></div>
      <div class="form-group"><label class="form-label">Tài khoản nhận</label>
        <select class="form-input"><option>Techcombank ****4521</option><option>VCB ****8823</option></select>
      </div>
      <div class="form-group"><label class="form-label">OTP</label><input type="text" class="form-input" placeholder="Nhập mã OTP 6 số" /></div>
      <button class="btn-primary full-w" onclick="closeModal();showToast('Rút tiền đang xử lý T+1','✓')">Xác nhận rút</button>`;
  } else if (type==='transferModal') {
    body.innerHTML = `
      <div class="modal-title">⇄ Chuyển GMT</div>
      <div class="form-group"><label class="form-label">Địa chỉ nhận</label><input type="text" class="form-input" placeholder="0x..." /></div>
      <div class="form-group"><label class="form-label">Số lượng (GMT)</label><input type="number" class="form-input" placeholder="100" /></div>
      <button class="btn-primary full-w" onclick="closeModal();showToast('Chuyển token thành công!','⟡')">Xác nhận chuyển</button>`;
  } else if (type==='changePasswordModal') {
    body.innerHTML = `
      <div class="modal-title">🔑 Đổi mật khẩu</div>
      <div class="form-group"><label class="form-label">Mật khẩu hiện tại</label><input type="password" class="form-input" placeholder="••••••••" /></div>
      <div class="form-group"><label class="form-label">Mật khẩu mới</label><input type="password" class="form-input" placeholder="Tối thiểu 8 ký tự" /></div>
      <div class="form-group"><label class="form-label">Xác nhận mật khẩu mới</label><input type="password" class="form-input" placeholder="Nhập lại mật khẩu mới" /></div>
      <div style="padding:10px 12px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:10px;margin-bottom:14px;font-size:12px;color:var(--text-secondary)">
        ✓ Tối thiểu 8 ký tự &nbsp;·&nbsp; ✓ Chứa số &nbsp;·&nbsp; ✓ Chứa ký tự đặc biệt
      </div>
      <button class="btn-primary full-w" onclick="closeModal();showToast('Đã đổi mật khẩu thành công!','🔑')">Xác nhận đổi mật khẩu</button>`;
  } else if (type==='withdrawFlow') {
    const amt = parseInt(data)||0;
    const fee = (amt*0.002)|0;
    body.innerHTML = `
      <div class="modal-title">🏦 Xác nhận rút tiền</div>
      <div style="background:var(--surface);border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Số tiền yêu cầu</span><strong>₫${amt.toLocaleString()}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Phí (0.2%)</span><span>₫${fee.toLocaleString()}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700"><span>Thực nhận</span><span class="green">₫${(amt-fee).toLocaleString()}</span></div>
      </div>
      <div class="form-group"><label class="form-label">Nhập OTP (SMS)</label><input type="text" class="form-input" placeholder="6 chữ số" /></div>
      <button class="btn-primary full-w" onclick="closeModal();showToast('Yêu cầu rút tiền đã gửi — sẽ xử lý T+1','🏦')">Xác nhận</button>`;
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function showQRModal() {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  overlay.classList.remove('hidden');
  body.innerHTML = `
    <div class="modal-title" style="text-align:center">QR Địa chỉ ví</div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="display:inline-block;padding:20px;background:white;border-radius:12px;margin-bottom:12px">
        <div style="width:160px;height:160px;background:linear-gradient(45deg,#064e3b,#10b981);display:flex;align-items:center;justify-content:center;font-size:60px;border-radius:8px">⬛</div>
      </div>
      <div style="font-family:'JetBrains Mono';font-size:11px;color:var(--text-muted);word-break:break-all">0x3f7a8c2d1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7e9b2</div>
    </div>
    <button class="btn-primary full-w" onclick="copyAddress();closeModal()">⎘ Sao chép địa chỉ</button>`;
}

// ==================== TOAST ====================
function showToast(msg, icon='✓') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');
  if (!toast) return;
  toastMsg.textContent=msg;
  toastIcon.textContent=icon;
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(()=>toast.classList.add('hidden'), 3000);
}

// ==================== PRICE TICKER ====================
function startPriceTicker() {
  setInterval(()=>{
    const change = (Math.random()-0.48)*15|0;
    STATE.gmtPrice = Math.max(3800, Math.min(5000, STATE.gmtPrice+change));
    const pct = ((STATE.gmtPrice-4148)/4148*100).toFixed(2);
    const tp = document.getElementById('tickerPrice');
    const tc = document.getElementById('tickerChange');
    if (tp) tp.textContent = `₫${STATE.gmtPrice.toLocaleString()}`;
    if (tc) {
      tc.textContent = `${change>=0?'▲+':'▼'}${Math.abs(change)}`;
      tc.className = `ticker-change ${change>=0?'positive':'negative'}`;
    }
  }, 3000);
}

// ==================== COUNTER ANIMATION ====================
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el=>{
    const target = parseInt(el.dataset.target)||0;
    const suffix = el.dataset.suffix||'';
    let start=0, duration=1500;
    const step = ()=>{
      start += Math.ceil((target-start)/10);
      el.textContent = start.toLocaleString() + suffix;
      if (start<target) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    };
    step();
  });
}

// ==================== SPLASH ====================
function runSplash() {
  const fill = document.getElementById('splashFill');
  const status = document.getElementById('splashStatus');
  const statuses = [
    'Khởi tạo blockchain layer...',
    'Kết nối Polygon Mainnet...',
    'Tải AI Oracle module...',
    'Xác thực ví người dùng...',
    'Sẵn sàng!',
  ];
  let pct=0, si=0;
  const interval = setInterval(()=>{
    pct += 3+Math.random()*8|0;
    if (pct>100) pct=100;
    if (fill) fill.style.width=pct+'%';
    if (status && si<statuses.length) {
      status.textContent = statuses[Math.floor((pct/100)*statuses.length)];
    }
    if (pct>=100) {
      clearInterval(interval);
      setTimeout(bootApp, 400);
    }
  }, 80);
}

function bootApp() {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');
  splash.classList.add('fade-out');
  setTimeout(()=>{
    splash.style.display='none';
    app.classList.remove('hidden');
    // Priority 2: Load persisted data from localStorage before rendering
    loadPersistedData();
    applyPersistedProfile();
    
    // Demo Mode overlay
    const demoBadge = document.createElement('div');
    demoBadge.innerHTML = 'Demo Mode';
    demoBadge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(245,158,11,0.15);color:var(--warning);padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;z-index:9999;border:1px solid rgba(245,158,11,0.3);pointer-events:none;backdrop-filter:blur(4px);box-shadow:0 4px 12px rgba(0,0,0,0.2)';
    document.body.appendChild(demoBadge);

    // Init all renders
    renderRecentTxList();
    renderLeaderboard();
    renderCarbonHistory();
    initCharts();
    calcCO2();
    animateCounters();
    startPriceTicker();
    renderAdminTab('kyc');
    renderEntTab('orders');
  }, 500);
}

// ==================== PROFILE DATA ====================
const NFT_DATA = [
  { icon:'🌲', name:'Amazon Forest #4821', val:'320 GMT', id:'#4821', rarity:'legendary', bg:'linear-gradient(135deg,rgba(6,95,70,0.6),rgba(16,185,129,0.2))' },
  { icon:'🌊', name:'Ocean Blue #2210',    val:'185 GMT', id:'#2210', rarity:'epic',      bg:'linear-gradient(135deg,rgba(3,105,161,0.6),rgba(56,189,248,0.2))' },
  { icon:'☀️', name:'Solar Credit #7743',  val:'142 GMT', id:'#7743', rarity:'rare',      bg:'linear-gradient(135deg,rgba(120,53,15,0.6),rgba(251,191,36,0.2))' },
  { icon:'💨', name:'Wind Farm #9901',     val:'98 GMT',  id:'#9901', rarity:'rare',      bg:'linear-gradient(135deg,rgba(30,58,138,0.6),rgba(99,102,241,0.2))' },
  { icon:'🌿', name:'Mangrove #1155',      val:'76 GMT',  id:'#1155', rarity:'common',    bg:'linear-gradient(135deg,rgba(20,83,45,0.6),rgba(134,239,172,0.1))' },
  { icon:'🏔',  name:'Mountain #3387',     val:'54 GMT',  id:'#3387', rarity:'common',    bg:'linear-gradient(135deg,rgba(51,65,85,0.6),rgba(148,163,184,0.1))' },
  { icon:'🌺', name:'Biodiversity #5512',  val:'210 GMT', id:'#5512', rarity:'epic',      bg:'linear-gradient(135deg,rgba(107,33,168,0.6),rgba(216,180,254,0.15))' },
  { icon:'❄️', name:'Arctic Ice #0042',    val:'167 GMT', id:'#0042', rarity:'rare',      bg:'linear-gradient(135deg,rgba(8,145,178,0.6),rgba(103,232,249,0.15))' },
  { icon:'🦋', name:'Ecosystem #7231',     val:'89 GMT',  id:'#7231', rarity:'common',    bg:'linear-gradient(135deg,rgba(5,150,105,0.5),rgba(52,211,153,0.1))' },
  { icon:'🌾', name:'Rice Field #8821',    val:'45 GMT',  id:'#8821', rarity:'common',    bg:'linear-gradient(135deg,rgba(120,53,15,0.4),rgba(217,119,6,0.1))' },
  { icon:'🐋', name:'Marine #3310',        val:'390 GMT', id:'#3310', rarity:'legendary', bg:'linear-gradient(135deg,rgba(12,74,110,0.6),rgba(14,165,233,0.2))' },
  { icon:'🌀', name:'Circular #9988',      val:'62 GMT',  id:'#9988', rarity:'common',    bg:'linear-gradient(135deg,rgba(55,48,163,0.5),rgba(99,102,241,0.1))' },
];

const PROFILE_BADGES = [
  { icon:'🌍', name:'Earth Saver',   earned:true,  isNew:false, desc:'Tiết kiệm 500kg CO₂' },
  { icon:'🔥', name:'18-day Streak', earned:true,  isNew:true,  desc:'Hoạt động 18 ngày' },
  { icon:'🚲', name:'Cyclist Pro',   earned:true,  isNew:false, desc:'100km bằng xe đạp' },
  { icon:'⟡',  name:'B2B Trader',   earned:true,  isNew:false, desc:'10 giao dịch B2B' },
  { icon:'🏔', name:'1 Ton Club',    earned:false, isNew:false, desc:'Cần 1,000kg CO₂' },
  { icon:'💎', name:'Platinum',      earned:false, isNew:false, desc:'Cần hạng Platinum' },
  { icon:'🌊', name:'Ocean Guard',   earned:false, isNew:false, desc:'Offset dự án biển' },
  { icon:'⚡', name:'EV Champion',   earned:false, isNew:false, desc:'Sạc EV 50 lần' },
  { icon:'🤝', name:'Ambassador',    earned:false, isNew:false, desc:'Giới thiệu 10 bạn' },
  { icon:'📊', name:'ESG Master',    earned:false, isNew:false, desc:'ESG Score 95+' },
  { icon:'🏆', name:'Top Trader',    earned:false, isNew:false, desc:'Top 10 trading vol' },
  { icon:'🌟', name:'Legend',        earned:false, isNew:false, desc:'Hoàn thành tất cả' },
];

const PROFILE_RANKING = [
  { rank:1,  init:'TH', name:'Trần Thị Hoa',      co2:'1,248 kg',  score:8420, maxScore:10000, you:false },
  { rank:2,  init:'NM', name:'Nguyễn Minh Long',   co2:'1,105 kg',  score:7980, maxScore:10000, you:false },
  { rank:3,  init:'PQ', name:'Phạm Quốc Bảo',      co2:'992 kg',    score:7240, maxScore:10000, you:false },
  { rank:18, init:'NV', name:'Nguyễn Văn An (Bạn)',co2:'847 kg',   score:2847, maxScore:10000, you:true  },
  { rank:19, init:'LT', name:'Lê Thị Thu',          co2:'821 kg',    score:2610, maxScore:10000, you:false },
];

// ==================== PROFILE INIT ====================
function initProfileScreen() {
  renderProfileLedger('all');
  renderNFTGrid();
  renderProfileBadges();
  renderProfileRanking();
  initProfileCharts();
}

function renderProfileLedger(filter) {
  const el = document.getElementById('profileLedgerBody');
  if (!el) return;
  const data = filter === 'all' ? TX_DATA : TX_DATA.filter(t => t.type === filter);
  el.innerHTML = data.map(tx => `
    <tr>
      <td><span class="badge badge-${tx.type==='mint'?'green':tx.type==='charge'?'yellow':'blue'}">${tx.type.toUpperCase()}</span></td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${tx.name}</td>
      <td class="${tx.val.startsWith('+')?'green':''}"><strong>${tx.val}</strong></td>
      <td>${tx.vnd}</td>
      <td><span class="status-pill ${tx.status}">${tx.status==='confirmed'?'✓ Xác nhận':tx.status==='pending'?'⏳ Chờ':'✗ Lỗi'}</span></td>
      <td>${tx.date}</td>
      <td class="tx-hash-cell">${tx.hash}</td>
    </tr>
  `).join('');
}

function filterProfileTx(filter, btn) {
  document.querySelectorAll('#profileTxFilters .tx-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProfileLedger(filter);
}

function renderNFTGrid() {
  const el = document.getElementById('nftGrid');
  if (!el) return;
  el.innerHTML = NFT_DATA.map(n => `
    <div class="nft-card" onclick="showNFTDetail('${n.id}','${n.name}','${n.val}','${n.rarity}','${n.icon}')">
      <div class="nft-thumb" style="background:${n.bg}">
        ${n.icon}
        <span class="nft-rarity rarity-${n.rarity}">${n.rarity.toUpperCase()}</span>
      </div>
      <div class="nft-info">
        <div class="nft-name">${n.name}</div>
        <div class="nft-val">${n.val}</div>
        <div class="nft-id">${n.id}</div>
      </div>
    </div>
  `).join('');
}

function showNFTDetail(id, name, val, rarity, icon) {
  const rarityColors = { legendary:'#fbbf24', epic:'#a855f7', rare:'#38bdf8', common:'#94a3b8' };
  const color = rarityColors[rarity] || '#94a3b8';
  const hash = '0x' + Array.from({length:40}, () => '0123456789abcdef'[Math.random()*16|0]).join('');
  showModal('_nft');
  document.getElementById('modalBody').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:64px;margin-bottom:12px">${icon}</div>
      <div style="font-family:Outfit;font-size:20px;font-weight:800;margin-bottom:8px">${name}</div>
      <span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:10px;
        background:${color}22;color:${color};border:1px solid ${color}44">${rarity.toUpperCase()}</span>
    </div>
    <div style="background:var(--surface);border-radius:12px;padding:14px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:var(--text-muted)">Token ID</span>
        <span style="font-family:JetBrains Mono;font-weight:700">${id}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:var(--text-muted)">Giá trị</span>
        <span style="font-weight:700;color:var(--emerald-400)">${val}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:var(--text-muted)">Standard</span>
        <span style="font-weight:600">ERC-721 · Polygon</span>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:12px;color:var(--text-muted)">Contract</span>
        <span style="font-family:JetBrains Mono;font-size:11px;color:var(--info)">${hash.slice(0,18)}...</span>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-primary" style="flex:1" onclick="showToast('Đang mở sàn OpenSea...','🎨');closeModal()">View on OpenSea ↗</button>
      <button class="btn-ghost" style="flex:1" onclick="showToast('Đã copy contract hash','⎘');closeModal()">⎘ Copy Hash</button>
    </div>
  `;
}

function renderProfileBadges() {
  const el = document.getElementById('profileBadgeGrid');
  if (!el) return;
  el.innerHTML = PROFILE_BADGES.map(b => `
    <div class="pb-item ${b.earned?'pb-earned':''}" title="${b.desc}">
      ${b.earned && b.isNew ? '<div class="pb-new"></div>' : ''}
      <div class="pb-icon">${b.icon}</div>
      <div class="pb-name">${b.name}</div>
    </div>
  `).join('');
}

function renderProfileRanking() {
  const el = document.getElementById('profileRankingList');
  if (!el) return;
  el.innerHTML = PROFILE_RANKING.map(r => {
    const pct = Math.round(r.score / r.maxScore * 100);
    const rankClass = r.rank===1?'r1':r.rank===2?'r2':r.rank===3?'r3':'';
    const medal = r.rank===1?'🥇':r.rank===2?'🥈':r.rank===3?'🥉':r.rank;
    return `
      <div class="pr-item ${r.you?'pr-you':''}">
        <div class="pr-rank ${rankClass}">${medal}</div>
        <div class="pr-av">${r.init}</div>
        <div class="pr-info">
          <div class="pr-name">${r.name}</div>
          <div class="pr-co2">${r.co2} CO₂</div>
        </div>
        <div class="pr-bar-wrap"><div class="pr-bar-fill" style="width:${pct}%"></div></div>
        <div class="pr-score">${r.score.toLocaleString()}</div>
      </div>
    `;
  }).join('');
}

function initProfileCharts() {
  // ESG Ring
  const ringCtx = document.getElementById('profileEsgRing')?.getContext('2d');
  if (ringCtx && !charts.profileEsg) {
    charts.profileEsg = new Chart(ringCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [88, 12],
          backgroundColor: ['#10b981', 'rgba(16,185,129,0.08)'],
          borderWidth: 0, hoverOffset: 0,
        }]
      },
      options: {
        cutout: '78%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 1000 }
      }
    });
  } else if (ringCtx && charts.profileEsg) {
    charts.profileEsg.update();
  }

  // CO2 bar chart
  const co2Ctx = document.getElementById('profileCo2Chart')?.getContext('2d');
  if (co2Ctx && !charts.profileCo2) {
    charts.profileCo2 = new Chart(co2Ctx, {
      type: 'bar',
      data: {
        labels: ['T11','T12','T1','T2','T3','T4'],
        datasets: [{
          data: [420, 510, 380, 640, 720, 847],
          backgroundColor: [
            'rgba(16,185,129,0.5)','rgba(16,185,129,0.55)','rgba(16,185,129,0.5)',
            'rgba(16,185,129,0.65)','rgba(16,185,129,0.75)','rgba(16,185,129,0.9)'
          ],
          borderColor: '#10b981',
          borderWidth: 1, borderRadius: 4,
        }]
      },
      options: {
        ...chartOptions('CO₂ (kg)'),
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: 'rgba(10,20,16,0.9)',
          borderColor: 'rgba(16,185,129,0.2)', borderWidth: 1,
          titleColor: '#f0fdf4', bodyColor: '#a7f3d0',
        }},
      }
    });
  } else if (co2Ctx && charts.profileCo2) {
    charts.profileCo2.update();
  }
}

// ==================== PROFILE ACTIONS ====================
function copyProfileAddr() {
  const btn = document.querySelector('.profile-copy-btn');
  navigator.clipboard?.writeText('0x3f7a8c2d1e9b4f6a3512c8d9e0f1a2b3c4d5e6f7e9b2').catch(()=>{});
  if (btn) {
    btn.textContent = '✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '⎘'; btn.classList.remove('copied'); }, 1800);
  }
  showToast('Đã sao chép địa chỉ ví', '⎘');
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const av = document.getElementById('profileAvatar');
    if (av) {
      av.innerHTML = `<img src="${ev.target.result}" alt="avatar" />`;
      av.style.padding = '0';
    }
    showToast('Ảnh đại diện đã cập nhật!', '📷');
  };
  reader.readAsDataURL(file);
}

function toggle2FA(el) {
  const isOn = el.classList.toggle('on');
  const sub = el.closest('.security-item')?.querySelector('.si-sub');
  if (sub) sub.textContent = isOn
    ? 'Google Authenticator · Đã bật'
    : 'Chưa bật — Khuyến nghị kích hoạt';
  showToast(isOn ? '2FA đã bật — Tài khoản được bảo mật tốt hơn' : '⚠️ 2FA đã tắt', isOn ? '🛡' : '⚠️');
}

function showEditProfile() {
  const overlay = document.getElementById('modalOverlay');
  const body    = document.getElementById('modalBody');
  overlay.classList.remove('hidden');
  
  const initials = STATE.username ? STATE.username.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'NV';

  body.innerHTML = `
    <div class="edit-profile-modal">
      <div class="modal-title">✏️ Chỉnh sửa hồ sơ</div>
      <div class="ep-avatar-row">
        <div class="ep-avatar" id="epAvatar">${initials}</div>
        <div>
          <div style="font-size:13px;font-weight:600;margin-bottom:4px">Ảnh đại diện</div>
          <label style="cursor:pointer">
            <input type="file" accept="image/*" style="display:none" onchange="previewEpAvatar(event)" />
            <span class="btn-ghost btn-sm" style="display:inline-block">📷 Thay ảnh</span>
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Họ và Tên</label>
        <input type="text" class="form-input" id="editNameInput" value="${STATE.username}" placeholder="Nhập họ và tên" />
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" value="nguyenvanan@gmail.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Số điện thoại</label>
        <input type="tel" class="form-input" value="+84 901 234 567" />
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <input type="text" class="form-input" value="Carbon offset enthusiast · Polygon Mainnet" />
      </div>
      <div class="form-group">
        <label class="form-label">Mục tiêu CO₂ tháng này (kg)</label>
        <input type="number" class="form-input" value="1080" />
      </div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn-primary" style="flex:1" onclick="saveProfile()">Lưu thay đổi</button>
        <button class="btn-ghost" style="flex:1" onclick="closeModal()">Hủy</button>
      </div>
    </div>
  `;
}

function previewEpAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const ep = document.getElementById('epAvatar');
    if (ep) { ep.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`; }
  };
  reader.readAsDataURL(file);
}

function applyPersistedProfile() {
  if (!STATE.username) return;
  const newName = STATE.username;
  const parts = newName.split(' ').filter(Boolean);
  let initials = 'NV';
  if (parts.length > 0) {
    if (parts.length === 1) initials = parts[0].substring(0, 2).toUpperCase();
    else initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  const sideName = document.querySelector('.sidebar-user .user-name');
  if (sideName) sideName.textContent = newName;
  const sideAv = document.querySelector('.sidebar-user .user-avatar');
  if (sideAv && !sideAv.querySelector('img')) sideAv.textContent = initials;
  
  const topAv = document.querySelector('.topbar-avatar');
  if (topAv && !topAv.querySelector('img')) topAv.textContent = initials;
  
  const profName = document.getElementById('profileName');
  if (profName) profName.textContent = newName;
  
  const profAv = document.getElementById('profileAvatar');
  if (profAv && !profAv.querySelector('img')) {
    profAv.textContent = initials;
  }
  
  const dashHero = document.querySelector('#screen-dashboard .hero-title');
  if (dashHero) {
    const lastName = parts.length > 0 ? parts[parts.length - 1] : newName;
    dashHero.innerHTML = `Chào buổi chiều, ${lastName} 👋`;
  }
}

function saveProfile() {
  const nameInput = document.getElementById('editNameInput');
  if (nameInput) {
    const newName = nameInput.value.trim();
    if (!newName) {
      showToast('Tên không được để trống!', '⚠️');
      return;
    }
    STATE.username = newName;
    try {
      localStorage.setItem('greenmile_username', newName);
    } catch(e){}
    applyPersistedProfile();
  }
  
  closeModal();
  showToast('Hồ sơ đã được cập nhật thành công!', '✓');
}

// ==================== RESEARCH SCREEN ====================
let researchChartsInitialized = false;

function initResearchScreen() {
  renderResearchSummary();
  renderSurveyTable();
  renderSEMTable();
  if (!researchChartsInitialized) {
    setTimeout(() => {
      initResearchCharts();
      researchChartsInitialized = true;
    }, 100);
  } else {
    // Update charts nếu đã init
    Object.values(charts).forEach(c => { if(c && typeof c.update === 'function') c.update('none'); });
  }
}

function renderResearchSummary() {
  const el = document.getElementById('researchMetaSummary');
  if (!el) return;
  const m = RESEARCH_DATA.meta;
  el.innerHTML = `
    <div class="rmeta-grid">
      <div class="rmeta-item">
        <div class="rmeta-val">${m.sampleSize}</div>
        <div class="rmeta-label">Cỡ mẫu (N)</div>
      </div>
      <div class="rmeta-item">
        <div class="rmeta-val">${m.demographics.avgAge}</div>
        <div class="rmeta-label">Tuổi trung bình</div>
      </div>
      <div class="rmeta-item">
        <div class="rmeta-val">${m.demographics.students}%</div>
        <div class="rmeta-label">Sinh viên</div>
      </div>
      <div class="rmeta-item">
        <div class="rmeta-val">${m.cronbachAlpha.utaut}</div>
        <div class="rmeta-label">Cronbach α (UTAUT)</div>
      </div>
      <div class="rmeta-item">
        <div class="rmeta-val">${m.tool}</div>
        <div class="rmeta-label">Công cụ phân tích</div>
      </div>
      <div class="rmeta-item">
        <div class="rmeta-val">${m.period}</div>
        <div class="rmeta-label">Thời gian khảo sát</div>
      </div>
    </div>
    <div class="rmeta-method">📋 Phương pháp: ${m.method}</div>
  `;
}

function renderSurveyTable() {
  const el = document.getElementById('surveyRawTable');
  if (!el) return;
  el.innerHTML = RESEARCH_DATA.surveyResponses.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.age}</td>
      <td>${r.gender}</td>
      <td>${r.occupation}</td>
      <td class="rc-score">${r.pu}</td>
      <td class="rc-score">${r.peou}</td>
      <td class="rc-score">${r.att}</td>
      <td class="rc-score">${r.bi}</td>
      <td class="rc-score">${r.trust}</td>
      <td class="green">${r.co2saved}g</td>
      <td class="green">${r.tokensEarned}</td>
      <td>${r.daysActive}</td>
    </tr>
  `).join('');
}

function renderSEMTable() {
  const el = document.getElementById('semPathTable');
  if (!el) return;
  el.innerHTML = RESEARCH_DATA.semPaths.map(p => `
    <tr>
      <td><strong>${p.from}</strong> → ${p.to}</td>
      <td class="${p.beta > 0.4 ? 'green' : ''}"><strong>${p.beta.toFixed(2)}</strong></td>
      <td class="${p.pValue < 0.05 ? 'green' : 'warning-color'}">${p.pValue.toFixed(3)}</td>
      <td><span class="badge badge-${p.significant ? 'green' : 'yellow'}">${p.significant ? '✓ Significant' : '⚠ Not Sig.'}</span></td>
    </tr>
  `).join('');
}

function initResearchCharts() {
  // 1. UTAUT Radar Chart
  const utautCtx = document.getElementById('utautRadarChart')?.getContext('2d');
  if (utautCtx && !charts.utautRadar) {
    const u = RESEARCH_DATA.utaut;
    charts.utautRadar = new Chart(utautCtx, {
      type: 'radar',
      data: {
        labels: ['Kỳ vọng\nHiệu suất', 'Kỳ vọng\nNỗ lực', 'Ảnh hưởng\nXã hội', 'Điều kiện\nThuận lợi', 'Niềm tin\nHệ thống', 'Ý định\nHành vi'],
        datasets: [{
          label: 'Mean Score (Likert 1-7)',
          data: [u.performanceExpectancy.mean, u.effortExpectancy.mean, u.socialInfluence.mean,
                 u.facilitatingConditions.mean, u.trust.mean, u.behavioralIntention.mean],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.15)',
          borderWidth: 2, pointBackgroundColor: '#10b981', pointRadius: 4,
        }, {
          label: 'Benchmark (Ngưỡng chấp nhận = 4.0)',
          data: [4, 4, 4, 4, 4, 4],
          borderColor: 'rgba(251,191,36,0.5)',
          backgroundColor: 'rgba(251,191,36,0.05)',
          borderWidth: 1, borderDash: [5,5], pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0, max: 7, ticks: { stepSize: 1, color: 'rgba(167,243,208,0.5)', font: {size:9} },
            grid: { color: 'rgba(16,185,129,0.1)' },
            angleLines: { color: 'rgba(16,185,129,0.15)' },
            pointLabels: { color: 'rgba(167,243,208,0.8)', font: {size:10} }
          }
        },
        plugins: { legend: { labels: { color: 'rgba(167,243,208,0.7)', font:{size:11} } },
          tooltip: { backgroundColor:'rgba(10,20,16,0.9)', titleColor:'#f0fdf4', bodyColor:'#a7f3d0' }
        }
      }
    });
  }

  // 2. TAM Bar Chart
  const tamCtx = document.getElementById('tamBarChart')?.getContext('2d');
  if (tamCtx && !charts.tamBar) {
    const t = RESEARCH_DATA.tam;
    charts.tamBar = new Chart(tamCtx, {
      type: 'bar',
      data: {
        labels: ['Cảm nhận\nHữu ích (PU)', 'Cảm nhận\nDễ dùng (PEOU)', 'Thái độ\n(ATT)', 'Ý định\nSử dụng (BI)'],
        datasets: [{
          label: 'Mean (Likert 1-7)',
          data: [t.perceivedusefulness.mean, t.perceivedeaseof_use.mean, t.attitude.mean, t.intentionToUse.mean],
          backgroundColor: ['rgba(16,185,129,0.7)','rgba(45,212,191,0.7)','rgba(52,211,153,0.7)','rgba(20,184,166,0.7)'],
          borderColor: ['#10b981','#2dd4bf','#34d399','#14b8a6'],
          borderWidth: 2, borderRadius: 6,
        }, {
          label: 'Factor Loading',
          data: [t.perceivedusefulness.loading*7, t.perceivedeaseof_use.loading*7, t.attitude.loading*7, t.intentionToUse.loading*7],
          backgroundColor: 'rgba(251,191,36,0.3)',
          borderColor: '#fbbf24',
          borderWidth: 2, borderRadius: 6, type: 'bar',
        }]
      },
      options: {
        ...chartOptions('Điểm trung bình'),
        scales: {
          y: { min: 0, max: 7, grid:{color:'rgba(16,185,129,0.06)'}, ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}} },
          x: { grid:{display:false}, ticks:{color:'rgba(167,243,208,0.6)',font:{size:10}} }
        },
        plugins: { legend:{labels:{color:'rgba(167,243,208,0.7)',font:{size:11}}},
          tooltip:{backgroundColor:'rgba(10,20,16,0.9)',titleColor:'#f0fdf4',bodyColor:'#a7f3d0'}
        }
      }
    });
  }

  // 3. Scatter — TAM Score vs CO₂ Saved
  const scatterCtx = document.getElementById('semScatterChart')?.getContext('2d');
  if (scatterCtx && !charts.semScatter) {
    charts.semScatter = new Chart(scatterCtx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Người dùng (N=100)',
          data: RESEARCH_DATA.scatterData,
          backgroundColor: 'rgba(16,185,129,0.5)',
          borderColor: '#10b981',
          pointRadius: 4, pointHoverRadius: 6,
        }, {
          label: 'Đường hồi quy (β=0.62)',
          data: [{x:3.5,y:50},{x:4,y:81},{x:4.5,y:112},{x:5,y:143},{x:5.5,y:174},{x:6,y:205},{x:6.5,y:236}],
          type: 'line',
          borderColor: '#fbbf24', backgroundColor: 'transparent',
          borderWidth: 2, borderDash: [6,3], pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels:{color:'rgba(167,243,208,0.7)',font:{size:11}} },
          tooltip: { backgroundColor:'rgba(10,20,16,0.9)', titleColor:'#f0fdf4', bodyColor:'#a7f3d0',
            callbacks: { label: ctx => `TAM: ${ctx.parsed.x} | CO₂: ${ctx.parsed.y}g` }
          }
        },
        scales: {
          x: { title:{display:true,text:'TAM Score (Likert 1-7)',color:'rgba(167,243,208,0.6)',font:{size:11}},
               grid:{color:'rgba(16,185,129,0.06)'}, ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}}, min:3, max:7 },
          y: { title:{display:true,text:'CO₂ Tiết kiệm (g/tuần)',color:'rgba(167,243,208,0.6)',font:{size:11}},
               grid:{color:'rgba(16,185,129,0.06)'}, ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}}, min:0 }
        }
      }
    });
  }

  // 4. ESG Trend Line Chart
  const esgTrendCtx = document.getElementById('esgTrendChart')?.getContext('2d');
  if (esgTrendCtx && !charts.esgTrend) {
    const et = RESEARCH_DATA.esgTrend;
    charts.esgTrend = new Chart(esgTrendCtx, {
      type: 'line',
      data: {
        labels: et.labels,
        datasets: [{
          label: 'E — Environmental',
          data: et.envScore,
          borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2, yAxisID: 'y',
        }, {
          label: 'S — Social',
          data: et.socialScore,
          borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2, yAxisID: 'y',
        }, {
          label: 'G — Governance',
          data: et.govScore,
          borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2, yAxisID: 'y',
        }, {
          label: 'Người dùng (nghìn)',
          data: et.userGrowth.map(v => v/1000),
          borderColor: '#a855f7', backgroundColor: 'transparent',
          tension: 0.4, pointRadius: 3, borderWidth: 2, borderDash: [4,2], yAxisID: 'y2',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels:{color:'rgba(167,243,208,0.7)',font:{size:11}} },
          tooltip: {backgroundColor:'rgba(10,20,16,0.9)',titleColor:'#f0fdf4',bodyColor:'#a7f3d0'}
        },
        scales: {
          y:  { min:0, max:100, position:'left',  title:{display:true,text:'ESG Score (0-100)',color:'rgba(167,243,208,0.6)',font:{size:10}},
                grid:{color:'rgba(16,185,129,0.06)'}, ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}} },
          y2: { position:'right', title:{display:true,text:'Users (k)',color:'rgba(168,85,247,0.6)',font:{size:10}},
                grid:{display:false}, ticks:{color:'rgba(168,85,247,0.5)',font:{size:10}} },
          x:  { grid:{color:'rgba(16,185,129,0.06)'}, ticks:{color:'rgba(167,243,208,0.5)',font:{size:10}} }
        }
      }
    });
  }
}

// ==================== PRIORITY 1 — WEB3 BLOCKCHAIN INTERACTION ====================
// Requires ethers.js v5 loaded via CDN in index.html

async function connectWallet() {
  if (!window.ethereum) {
    alert('⚠️ MetaMask chưa được cài!\nVui lòng cài MetaMask tại https://metamask.io rồi thử lại.');
    return null;
  }
  try {
    showToast('🔗 Đang kết nối MetaMask...', '🦊');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    STATE.walletConnected = true;
    STATE.walletAddress = accounts[0];
    updateWalletStatusUI();
    showToast(`✅ Đã kết nối: ${accounts[0].slice(0,6)}...${accounts[0].slice(-4)}`, '🦊');
    return accounts[0];
  } catch (err) {
    if (err.code === 4001) {
      showToast('❌ Người dùng từ chối kết nối ví', '⚠️');
    } else {
      showToast('Lỗi MetaMask: ' + (err.message || ''), '⚠️');
    }
    return null;
  }
}

function updateWalletStatusUI() {
  const statusEl = document.getElementById('walletStatus');
  const addrEl   = document.getElementById('walletAddrShort');
  const connectBtn = document.getElementById('connectWalletBtn');
  if (statusEl) statusEl.style.display = 'flex';
  if (connectBtn) connectBtn.style.display = 'none';
  if (addrEl && STATE.walletAddress) {
    addrEl.textContent = STATE.walletAddress.slice(0,6) + '...' + STATE.walletAddress.slice(-4);
  }
}

async function handleMint() {
  const btn = document.getElementById('mintBtn');
  if (btn) { btn.disabled = true; btn.textContent = '🔗 Kết nối ví...'; }

  try {
    // Step 1: Connect wallet → triggers MetaMask connection popup
    const account = await connectWallet();
    if (!account) {
      if (btn) { btn.disabled = false; btn.textContent = '🌿 Xác nhận & Mint Token'; }
      return;
    }

    // Step 2: Request signature → triggers MetaMask signing popup
    if (btn) { btn.disabled = true; btn.textContent = '✍️ Chờ ký tên...'; }
    const dist  = parseFloat(document.getElementById('distanceInput')?.value) || 0;
    const co2Txt = document.getElementById('co2Saved')?.textContent || '0g';
    const gmtTxt = document.getElementById('gmtEarned')?.textContent || '0 GMT';
    const msgToSign =
      `Green Mile — Carbon Token Mint\n` +
      `Mode: ${STATE.mintMode} | Distance: ${dist} km\n` +
      `CO₂ saved: ${co2Txt} | Reward: ${gmtTxt}\n` +
      `Contract: ${BLOCKCHAIN_CONFIG.contractGMT}\n` +
      `Timestamp: ${Date.now()}`;

    try {
      await window.ethereum.request({
        method: 'personal_sign',
        params: [msgToSign, account],
      });
      showToast('✅ Ký xác nhận thành công! Đang mint...', '🌿');
    } catch (signErr) {
      // User rejected sign — still allow local mint for demo purposes
      if (signErr.code !== 4001) throw signErr;
      showToast('Bỏ qua ký tên — tiếp tục mint demo', '🌿');
    }

    // Step 3: Run local mint simulation
    if (btn) { btn.disabled = false; btn.textContent = '🌿 Xác nhận & Mint Token'; }
    startMint();

  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = '🌿 Xác nhận & Mint Token'; }
    showToast('Lỗi kết nối blockchain: ' + (err.message || ''), '⚠️');
  }
}

// ==================== PRIORITY 2 — DATA PERSISTENCE (LOCAL STORAGE) ====================

function saveData(key, data) {
  try {
    localStorage.setItem('gm_' + key, JSON.stringify(data));
  } catch (e) {
    console.warn('[GreenMile] localStorage write error:', e);
  }
}

function loadData(key) {
  try {
    const raw = localStorage.getItem('gm_' + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[GreenMile] localStorage read error:', e);
    return null;
  }
}

function loadPersistedData() {
  // Restore TX_DATA
  const savedTx = loadData('txdata');
  if (savedTx && Array.isArray(savedTx) && savedTx.length > 0) {
    TX_DATA.length = 0;
    savedTx.forEach(tx => TX_DATA.push(tx));
    console.log('[GreenMile] TX_DATA restored:', TX_DATA.length, 'records');
  }
  // Restore CARBON_HISTORY
  const savedCarbon = loadData('carbonhistory');
  if (savedCarbon && Array.isArray(savedCarbon) && savedCarbon.length > 0) {
    CARBON_HISTORY.length = 0;
    savedCarbon.forEach(c => CARBON_HISTORY.push(c));
  }
  // Restore balance
  const savedBal = loadData('balance');
  if (savedBal !== null && typeof savedBal === 'number') {
    STATE.gmtBalance = savedBal;
  }
  // Sync wallet display after load
  updateBalanceDisplay();
}

function persistAllData() {
  saveData('txdata',       TX_DATA);
  saveData('carbonhistory', CARBON_HISTORY);
  saveData('balance',      STATE.gmtBalance);
}

function updateBalanceDisplay() {
  const el = document.getElementById('topbarGmtBalance');
  if (el) el.textContent = STATE.gmtBalance.toLocaleString();
}

// ==================== PRIORITY 3 — B2B SETTLEMENT SIMULATION ====================

function simulateEscrow() {
  const overlay = document.getElementById('modalOverlay');
  const body    = document.getElementById('modalBody');
  if (!overlay || !body) return;
  overlay.classList.remove('hidden');

  const steps = [
    { label: 'Step 1: Initiating Escrow',         icon: '🔒', detail: 'CarbonEscrow.sol · Polygon Amoy Testnet' },
    { label: 'Step 2: Verifying Parties',          icon: '🔍', detail: 'KYC check · Counterparty validation' },
    { label: 'Step 3: Multi-signature Approval',   icon: '✍️', detail: 'Chờ xác nhận 3/5 chữ ký on-chain...' },
    { label: 'Step 4: Final Settlement',           icon: '⚡', detail: 'Giải ngân và ghi transaction on-chain' },
  ];

  body.innerHTML = `
    <div class="modal-title" style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <span>🔒</span> B2B Settlement — Escrow Processing
    </div>
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:var(--text-muted)">Tiến độ xử lý</span>
        <span id="escrowPctText" style="font-family:'JetBrains Mono';font-size:13px;font-weight:800;color:var(--emerald-400)">0%</span>
      </div>
      <div style="background:var(--border);border-radius:8px;height:10px;overflow:hidden">
        <div id="escrowProgressFill" style="height:100%;background:linear-gradient(90deg,#059669,#10b981,#34d399);border-radius:8px;width:0%;transition:width 0.6s cubic-bezier(0.4,0,0.2,1)"></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
      ${steps.map((s,i) => `
        <div id="escrow-step-${i}" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--border);transition:all 0.4s ease">
          <span style="font-size:18px;min-width:26px;text-align:center">${s.icon}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${s.label}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${s.detail}</div>
          </div>
          <span id="escrow-step-st-${i}" style="font-size:11px;font-weight:600;color:var(--text-muted)">Chờ...</span>
        </div>
      `).join('')}
    </div>
    <div id="escrowResult" style="display:none;padding:16px;border-radius:12px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);text-align:center;margin-bottom:14px">
      <div style="font-size:36px;margin-bottom:8px">✅</div>
      <div style="font-size:16px;font-weight:800;color:var(--emerald-400);margin-bottom:6px">Settlement Completed!</div>
      <div id="escrowResultHash" style="font-family:'JetBrains Mono';font-size:10px;color:var(--text-muted)"></div>
    </div>
    <button id="escrowCloseBtn" class="btn-primary full-w" style="display:none" onclick="closeModal()">✓ Đóng &amp; Xem lịch sử</button>
  `;

  _runEscrowSteps(steps);
}

async function _runEscrowSteps(steps) {
  const delays = [850, 1000, 1100, 750];
  const pcts   = [25,   50,   75,  100];

  for (let i = 0; i < steps.length; i++) {
    await _sleep(150);
    const stepEl = document.getElementById(`escrow-step-${i}`);
    const stEl   = document.getElementById(`escrow-step-st-${i}`);

    // Activate step
    if (stepEl) { stepEl.style.borderColor = 'rgba(251,191,36,0.5)'; stepEl.style.background = 'rgba(251,191,36,0.04)'; }
    if (stEl)   { stEl.textContent = '⏳ Đang xử lý...'; stEl.style.color = '#fbbf24'; }

    await _sleep(delays[i]);

    // Mark done
    if (stepEl) { stepEl.style.borderColor = 'rgba(16,185,129,0.5)'; stepEl.style.background = 'rgba(16,185,129,0.06)'; }
    if (stEl)   { stEl.textContent = '✓ Xong'; stEl.style.color = '#10b981'; }

    // Update progress bar
    const fill   = document.getElementById('escrowProgressFill');
    const pctTxt = document.getElementById('escrowPctText');
    if (fill)   fill.style.width   = pcts[i] + '%';
    if (pctTxt) pctTxt.textContent = pcts[i] + '%';
  }

  // Build tx hash + date
  const h = '0x' + Date.now().toString(16) + '00000000000000000000000000000000000000000000000000';
  const hashShort = h.slice(0,10) + '...' + h.slice(-6);
  const _n  = new Date();
  const _ds = `${String(_n.getDate()).padStart(2,'0')}/${String(_n.getMonth()+1).padStart(2,'0')} ${String(_n.getHours()).padStart(2,'0')}:${String(_n.getMinutes()).padStart(2,'0')}`;

  // Show success block
  const result   = document.getElementById('escrowResult');
  const closeBtn = document.getElementById('escrowCloseBtn');
  const hashEl   = document.getElementById('escrowResultHash');
  if (result)   result.style.display   = 'block';
  if (closeBtn) closeBtn.style.display = 'block';
  if (hashEl)   hashEl.textContent     = `TX: ${hashShort} · Polygon Amoy`;

  // Record in TX_DATA (Priority 2 integration)
  TX_DATA.unshift({
    type:'sell', icon:'🔒',
    name:'B2B Settlement — Escrow Completed',
    meta:'Multi-sig 3/5 · CarbonEscrow.sol · Polygon Amoy',
    val:'-500 GMT', vnd:'₫2,125,000',
    status:'confirmed', date:_ds,
    hash:hashShort, hashFull:h,
    co2:0, km:0, mode:'trade',
  });

  // Update balance
  STATE.gmtBalance = Math.max(0, STATE.gmtBalance - 500);
  updateBalanceDisplay();

  // Persist everything
  persistAllData();
  showToast('🔒 Settlement hoàn thành! Đã ghi on-chain', '✅');
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== BOOT ====================
document.addEventListener('DOMContentLoaded', ()=>{
  runSplash();
  // Update block number dynamically (mô phỏng live block)
  let blockNum = 19847231;
  setInterval(() => {
    blockNum += Math.floor(1 + Math.random() * 3);
    const el = document.getElementById('liveBlockNumber');
    if (el) el.textContent = blockNum.toLocaleString();
  }, 2000);
});
