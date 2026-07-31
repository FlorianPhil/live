/*
 * Go Boom Consulting Pitch Deck — Content (copy + chart data)
 * ============================================================
 *
 * THIS FILE IS THE ONLY PLACE TO EDIT COPY AND CHART NUMBERS.
 *
 * Do NOT edit deck.js or styles.css for text changes. Those files control
 * layout, rendering, and styling only. All visible wording lives here.
 *
 * STRUCTURE
 * ---------
 * window.GBC_CONTENT has three top-level keys:
 *   meta    — brand name, footer line, browser tab title (en + zh)
 *   charts  — bar chart labels and values for the partnership slide
 *   slides  — array of 22 slides, each with id, type, theme, and en/zh blocks
 *
 * BILINGUAL RULES
 * ---------------
 * Every slide block has "en" (English) and "zh" (Traditional Chinese, Taiwan 繁體).
 * Never use Simplified Chinese. Match tone: professional Taiwan B2B.
 *
 * HOW TO EDIT
 * -----------
 * Headline:  slides[i].en.headline  and  slides[i].zh.headline
 * Bullet:    slides[i].en.opportunity[0].body  (or .problems, .items, .feats, etc.)
 * Chart bar: charts.spend[3] = 310000   charts.units[4] = 22000
 * Chart max: charts.spendMax / charts.unitsMax (axis ceiling; raise if bars clip)
 *
 * SLIDE TYPES (see deck.js renderers for full field lists)
 * --------------------------------------------------------
 * title, statement, europe, problems, multi, positioning, team,
 * why-marketers, what-we-are, gtm, ops, case-timeline, case-examples,
 * partnership, process, needs, get, close
 *
 * CHART NUMBERS
 * -------------
 * charts.spend and charts.units are ILLUSTRATIVE until Bastien confirms final
 * figures. After changing numbers, refresh the browser.
 *
 * JS SYNTAX
 * ---------
 * Keep all strings double-quoted. Escape internal quotes: "He said \"hello\"."
 * No trailing commas after the last item in an object or array.
 *
 * PREVIEW
 * -------
 * Serve from this folder and open in a browser:
 *   python3 -m http.server 8799
 *   http://127.0.0.1:8799/
 * Refresh after every edit.
 */

window.GBC_CONTENT = {
  meta: {
    brand: "Go Boom Consulting",
    foot: { en: "Go Boom · EU Distributor 2.0", zh: "Go Boom · 歐盟經銷 2.0" },
    title: {
      en: "EU Distributor 2.0 for Taiwanese D2C brands",
      zh: "專為台灣 D2C 品牌打造的歐盟經銷 2.0"
    }
  },

  charts: {
    labels: ["Dec '22", "2023", "2024", "2025", "'26 F"],
    spend: [18000, 95000, 185000, 310000, 420000],
    units: [900, 4500, 9800, 15500, 22000],
    spendMax: 500000,
    unitsMax: 25000
  },

  slides: [
    {
      id: "title",
      type: "title",
      theme: "dark",
      symbol: 1,
      en: {
        subtitle: "EU Distributor 2.0",
        line: "for Taiwanese D2C brands"
      },
      zh: {
        subtitle: "歐盟經銷 2.0",
        line: "專為台灣 D2C 品牌"
      }
    },

    {
      id: "europe",
      type: "europe",
      theme: "light",
      symbol: 2,
      en: {
        eyebrow: "Market context",
        headline: "Why Europe, and why it's hard",
        oppTitle: "Opportunity",
        barTitle: "Why brands stay away",
        opportunity: [
          { title: "450M consumers", body: "One of the world's largest unified markets. High purchasing power and strong demand for quality brands." },
          { title: "Diversify beyond US / APAC", body: "Reduce single-region risk. Europe adds geographic and channel balance for growing D2C brands." },
          { title: "Brand reputation market", body: "European buyers reward craftsmanship, sustainability, and design. A strong fit for premium Taiwanese products." },
          { title: "Untapped for Taiwanese brands", body: "Few Taiwan-born brands have real EU presence. First movers can own categories early." }
        ],
        barriers: [
          { title: "Language", body: "27 countries, 24 official languages. Messaging, support, and compliance need local-language execution." },
          { title: "Logistics, VAT, customs", body: "Cross-border warehousing, IOSS, duties, and returns add overhead most brands underestimate." },
          { title: "Regulatory compliance", body: "CE, WEEE, packaging rules, and country-specific labeling can delay launches for months." },
          { title: "No local market knowledge", body: "Channels, seasonality, pricing, and culture differ sharply from Taiwan or US playbooks." }
        ]
      },
      zh: {
        eyebrow: "市場背景",
        headline: "為什麼是歐洲？為什麼這麼難？",
        oppTitle: "機會",
        barTitle: "為什麼品牌卻步",
        opportunity: [
          { title: "4.5 億消費者", body: "全球最大、最整合的消費市場之一。購買力強，對優質品牌需求旺盛。" },
          { title: "分散美國／亞太風險", body: "降低對單一市場的依賴。歐洲為成長中的 D2C 品牌提供地理與通路平衡。" },
          { title: "重視品牌聲譽", body: "歐洲消費者重視工藝、永續與設計，非常適合台灣優質產品。" },
          { title: "台灣品牌尚未充分開發", body: "真正在歐盟建立品牌的台灣品牌仍屬少數。先行者能在競爭者進入前搶佔品類。" }
        ],
        barriers: [
          { title: "語言", body: "27 個國家、24 種官方語言。訊息、客服與合規都需要在地語言執行。" },
          { title: "物流、VAT、報關", body: "跨境倉儲、IOSS、關稅與退貨流程，帶來多數品牌低估的營運負擔。" },
          { title: "法規合規", body: "CE、WEEE、包裝指令及各國標示規定，可能讓上市延宕數月。" },
          { title: "缺乏當地市場知識", body: "通路偏好、季節性、定價與文化差異，與台灣或美國的打法截然不同。" }
        ]
      }
    },

    {
      id: "stmt-distributor",
      type: "statement",
      theme: "orange",
      symbol: 3,
      en: { headline: "So… what if you just find a distributor there?" },
      zh: { headline: "那⋯直接找個當地經銷商不就好了？" }
    },

    {
      id: "classic-problems",
      type: "problems",
      theme: "light",
      en: {
        headline: "The Classic Distributor Problems",
        problems: [
          { n: "01", title: "Your stock, their shelf", body: "They control placement and priority. Your products compete on their terms." },
          { n: "02", title: "Your brand, buried", body: "Marketing is generic or absent. Your story gets lost in a crowded catalog." },
          { n: "03", title: "All the risk is on you", body: "Minimum orders, payment terms, and unsold stock sit on your balance sheet." },
          { n: "04", title: "Little visibility", body: "Sales data arrives late, if at all. No real-time insight for pricing or ads." }
        ],
        callout: "Finding a partner you can trust, without speaking the language, from 10,000 km away: that's the real challenge."
      },
      zh: {
        headline: "傳統經銷模式的四大問題",
        problems: [
          { n: "01", title: "你的庫存，他們的貨架", body: "對方掌控陳列與優先順序。你的產品必須在對方的條件下競爭。" },
          { n: "02", title: "你的品牌，被淹沒", body: "行銷千篇一律或根本沒有。品牌故事淹沒在型錄裡。" },
          { n: "03", title: "風險全在你身上", body: "最低訂量、付款條件與滯銷庫存都壓在你的資產負債表上。" },
          { n: "04", title: "幾乎沒有能見度", body: "銷售數據延遲交付，甚至根本沒有。無法即時優化定價或廣告。" }
        ],
        callout: "在 1 萬公里外、語言不通的情況下，找到值得信賴的夥伴，這才是真正的挑戰。"
      }
    },

    {
      id: "stmt-multi",
      type: "statement",
      theme: "dark",
      symbol: 4,
      en: { headline: "And what if you add a distributor in every country?" },
      zh: { headline: "那如果在每個國家都要再找一家經銷商呢？" }
    },

    {
      id: "multi-problems",
      type: "multi",
      theme: "light",
      en: {
        headline: "The Multiple Distributors Problems",
        sub: "Operational drain and brand damage",
        items: [
          { title: "Fragmented operations", body: "Different contracts, pricing, logistics, and reporting in every country. Your team becomes a project manager for distributors." },
          { title: "Inconsistent brand experience", body: "Packaging, messaging, and support vary by market. The brand feels different depending on where you buy." },
          { title: "Channel conflict", body: "D2C, Amazon, and retail partners compete against each other, eroding margin and trust." }
        ],
        damage: "Loss of control, scattered message, incoherent image: your team spends time managing distributors instead of growing the brand."
      },
      zh: {
        headline: "多國經銷模式的問題",
        sub: "營運消耗與品牌傷害",
        items: [
          { title: "營運碎片化", body: "各國合約、定價、物流與報表各有一套。你的團隊變成經銷商專案經理。" },
          { title: "品牌體驗不一致", body: "包裝、訊息與客服因市場而異。消費者在哪裡買，感受到的品牌就不一樣。" },
          { title: "通路衝突", body: "D2C、Amazon 與零售夥伴互相競爭，侵蝕利潤並損害信任。" }
        ],
        damage: "失去掌控、訊息分散、形象混亂：團隊把時間花在管理經銷商，而非壯大品牌。"
      }
    },

    {
      id: "stmt-different",
      type: "statement",
      theme: "orange",
      symbol: 5,
      en: { headline: "That's why we built something different." },
      zh: { headline: "這就是為什麼我們打造了不同的模式。" }
    },

    {
      id: "positioning",
      type: "positioning",
      theme: "dark",
      symbol: 6,
      en: {
        line1: "Brand Marketers First.",
        line2: "Distributor Second.",
        lead: "10+ years in digital marketing and e-commerce. Now turning that expertise into distribution.",
        platforms: ["Google", "Meta", "TikTok", "YouTube", "Shopify", "Amazon", "Allegro", "BOL", "KOLs", "PR"]
      },
      zh: {
        line1: "品牌行銷人優先。",
        line2: "經銷商其次。",
        lead: "超過 10 年數位行銷與電商經驗。現在將這份專業轉化為經銷能力。",
        platforms: ["Google", "Meta", "TikTok", "YouTube", "Shopify", "Amazon", "Allegro", "BOL", "KOL", "公關"]
      }
    },

    {
      id: "team",
      type: "team",
      theme: "light",
      en: {
        headline: "A team like no other",
        members: [
          { name: "Bastien", role: "Co-Founder", langs: "FR / 中文 / EN", flag: "🇫🇷" },
          { name: "Guillaume", role: "Co-Founder", langs: "FR / 中文 / EN", flag: "🇫🇷" },
          { name: "Ludovic", role: "Growth Marketing Lead", langs: "FR / 中文 / EN", flag: "🇫🇷" },
          { name: "Marco", role: "Brand & Marketing", langs: "IT / EN", flag: "🇮🇹" },
          { name: "Hadrien", role: "Business Development", langs: "FR / 中文 / EN", flag: "🇫🇷" }
        ],
        networkTitle: "Extended network",
        network: [
          "DACH marketing specialists",
          "Polish copywriter",
          "Dutch copywriter",
          "Professional video and content creator (Taiwan-based)"
        ],
        alumni: ["Ex RhinoShield", "Ex Transbiz", "Ex BQool"],
        current: ["Novium", "Paper Shoot"],
        languages: "FR · EN · 中文 · IT · DE · PL · NL"
      },
      zh: {
        headline: "與眾不同的團隊",
        members: [
          { name: "Bastien", role: "共同創辦人", langs: "法 / 中文 / 英", flag: "🇫🇷" },
          { name: "Guillaume", role: "共同創辦人", langs: "法 / 中文 / 英", flag: "🇫🇷" },
          { name: "Ludovic", role: "成長行銷負責人", langs: "法 / 中文 / 英", flag: "🇫🇷" },
          { name: "Marco", role: "品牌與行銷", langs: "義 / 英", flag: "🇮🇹" },
          { name: "Hadrien", role: "業務開發", langs: "法 / 中文 / 英", flag: "🇫🇷" }
        ],
        networkTitle: "延伸網絡",
        network: [
          "DACH 區行銷專家",
          "波蘭文案",
          "荷蘭文案",
          "專業影音與內容創作者（台灣基地）"
        ],
        alumni: ["前 RhinoShield", "前 Transbiz", "前 BQool"],
        current: ["Novium", "Paper Shoot"],
        languages: "法 · 英 · 中文 · 義 · 德 · 波 · 荷"
      }
    },

    {
      id: "why-marketers",
      type: "why-marketers",
      theme: "light",
      en: {
        headline: "Why online marketers make better distributors",
        feats: [
          { title: "Go where customers are", body: "We build demand on Google, Meta, TikTok, and Amazon. We do not wait for shelf space." },
          { title: "Image and brand control", body: "Ads, site, packaging, and KOL: every touchpoint follows one brand playbook we co-own with you." },
          { title: "Lower fixed cost, more margin for marketing", body: "Lean ops and D2C-first economics put more budget into growth, not distributor overhead." },
          { title: "Direct access to EU customers", body: "First-party data, reviews, and community feedback flow back to your product teams." },
          { title: "Online traction opens offline doors", body: "Proven D2C performance is the proof retailers and B2B buyers need before listing your products." }
        ]
      },
      zh: {
        headline: "為什麼線上行銷人更適合做經銷",
        feats: [
          { title: "到客戶所在之處", body: "我們在 Google、Meta、TikTok 與 Amazon 創造需求，而非被動等待貨架空間。" },
          { title: "掌控形象與品牌", body: "廣告、官網、包裝、KOL：每個接觸點都遵循與您共同擁有的品牌手冊。" },
          { title: "固定成本更低，行銷預算更多", body: "精簡營運與 D2C 優先的經濟模式，讓更多預算投入成長，而非經銷商開銷。" },
          { title: "直接觸及歐盟消費者", body: "第一方數據、評論與社群回饋，直接回流至您的產品與研發團隊。" },
          { title: "線上動能開啟線下大門", body: "經驗證的 D2C 表現，是零售商與 B2B 買家上架前最需要的證明。" }
        ]
      }
    },

    {
      id: "what-we-are",
      type: "what-we-are",
      theme: "light",
      en: {
        headline: "What We ARE",
        items: [
          { n: "01", title: "Local Market Experts", body: "Deep knowledge of EU channels, culture, and compliance, executed in local language." },
          { n: "02", title: "Long-Term Growth Partner", body: "We invest years, not quarters. Your EU success is our business model." },
          { n: "03", title: "We invest in your brand", body: "Marketing spend, content, and retail development come from us, aligned with your growth." },
          { n: "04", title: "Online D2C first", body: "Shopify and Amazon are the engine. Retail and B2B follow proven demand." },
          { n: "05", title: "We choose few, we give everything", body: "Selective partnerships mean full team attention, not a catalog slot." }
        ]
      },
      zh: {
        headline: "我們是什麼",
        items: [
          { n: "01", title: "當地市場專家", body: "深度掌握歐盟通路、文化與合規，以當地語言執行。" },
          { n: "02", title: "長期成長夥伴", body: "我們投資的是年，不是季。您的歐盟成功就是我們的商業模式。" },
          { n: "03", title: "我們投資您的品牌", body: "行銷預算、內容與零售拓展由我們投入，與您的成長目標一致。" },
          { n: "04", title: "線上 D2C 優先", body: "Shopify 與 Amazon 是引擎。零售與 B2B 在需求被驗證後跟進。" },
          { n: "05", title: "精選少數，全力以赴", body: "精挑細選的合作夥伴，代表全團隊的專注，不是型錄裡的一個格子。" }
        ]
      }
    },

    {
      id: "gtm",
      type: "gtm",
      theme: "light",
      en: {
        headline: "What We Do · Go To Market",
        cards: [
          { title: "Shopify D2C", body: "Localized storefronts, payment, and fulfillment. Your brand owned, EU-ready from day one." },
          { title: "360 Digital Marketing", body: "Paid social, search, KOL, and content in FR, DE, IT, and beyond. Full-funnel acquisition." },
          { title: "Amazon Multi-country", body: "Pan-EU listings, ads, and review strategy across Amazon.fr, .de, .it, and expanding markets." },
          { title: "B2B / Retail", body: "Curated retail and trade channels once D2C traction proves product-market fit." }
        ]
      },
      zh: {
        headline: "我們做什麼 · 上市策略",
        cards: [
          { title: "Shopify D2C", body: "在地化官網、金流與履約。品牌由您擁有，第一天起即符合歐盟標準。" },
          { title: "360 數位行銷", body: "付費社群、搜尋、KOL 與內容，涵蓋法、德、義及更多市場，完整漏斗獲客。" },
          { title: "Amazon 多國", body: "Pan-EU 上架、廣告與評論策略，橫跨 Amazon.fr、.de、.it 及持續拓展的市場。" },
          { title: "B2B／零售", body: "D2C 動能驗證產品市場契合後，精選零售夥伴與貿易通路。" }
        ]
      }
    },

    {
      id: "ops",
      type: "ops",
      theme: "light",
      en: {
        headline: "What We Do · Operations",
        steps: [
          { title: "Import TW → FR", body: "Freight, customs clearance, and inbound logistics from Taiwan to our EU hub." },
          { title: "VAT and Logistics Ops", body: "IOSS, local VAT registration, warehousing, pick-pack-ship, and returns handled end-to-end." },
          { title: "Customer Service", body: "Native-language support via email, chat, and social. We represent your brand, not a call center." },
          { title: "Start focused, then expand", body: "Launch in 1-2 core markets, prove unit economics, then roll out across the EU systematically." }
        ]
      },
      zh: {
        headline: "我們做什麼 · 營運",
        steps: [
          { title: "進口 台灣 → 法國", body: "從台灣至歐盟樞紐的貨運、報關與入庫物流。" },
          { title: "VAT 與物流營運", body: "IOSS、當地 VAT 登記、倉儲、揀貨出貨與退貨，端到端處理。" },
          { title: "客戶服務", body: "以母語提供 Email、聊天與社群支援，代表您的品牌，而非外包客服中心。" },
          { title: "先聚焦，再擴張", body: "在 1-2 個核心市場啟動，驗證單位經濟，再系統性拓展至整個歐盟。" }
        ]
      }
    },

    {
      id: "stmt-practice",
      type: "statement",
      theme: "dark",
      symbol: 7,
      en: { headline: "Here's what it looks like in practice." },
      zh: { headline: "實際上是什麼樣子。" }
    },

    {
      id: "case-timeline",
      type: "case-timeline",
      theme: "light",
      en: {
        brand: "Novium",
        challenge: "Premium Taiwanese stationery with zero EU presence. Build a D2C engine in France, then scale across Europe without losing brand control.",
        markets: [
          { date: "Dec 2022", label: "France launch", detail: "First market: Shopify D2C + Amazon.fr" },
          { date: "2023", label: "DACH + Italy", detail: "DE, AT, CH, IT: localized stores and Amazon" },
          { date: "2024", label: "Benelux + Poland", detail: "NL, BE, PL entry with local ads" },
          { date: "2025", label: "Romania + retail", detail: "RO D2C + first 100+ retail POS across EU" },
          { date: "2026 F", label: "Full EU expansion", detail: "Remaining EU markets on roadmap" }
        ],
        brandTimeline: [
          { date: "Dec 2022", label: "Brand foundation", detail: "French site, packaging localization, CE compliance" },
          { date: "2023", label: "KOL and content", detail: "FR, DE, IT influencer campaigns (Epenser, JOCR, Volare)" },
          { date: "2024", label: "Paid scale", detail: "Meta + Google ads across 6 markets; CRO optimization" },
          { date: "2025", label: "Omnichannel", detail: "100+ POS in 11 countries; B2B pipeline active" },
          { date: "2026 F", label: "Category leadership", detail: "Target: top-3 premium stationery in core EU markets" }
        ]
      },
      zh: {
        brand: "Novium",
        challenge: "台灣高端文具品牌，在歐盟零能見度。目標：在法國建立 D2C 引擎，再拓展至整個歐洲，同時不失去品牌掌控。",
        markets: [
          { date: "2022.12", label: "法國上市", detail: "首發市場：Shopify D2C + Amazon.fr" },
          { date: "2023", label: "DACH + 義大利", detail: "德、奧、瑞、義，在地化官網與 Amazon" },
          { date: "2024", label: "比荷盧 + 波蘭", detail: "荷、比、波市場進入，搭配當地廣告" },
          { date: "2025", label: "羅馬尼亞 + 零售", detail: "羅 D2C + 歐盟首批 100+ 零售據點" },
          { date: "2026 預估", label: "全面歐盟拓展", detail: "其餘歐盟市場列入路線圖" }
        ],
        brandTimeline: [
          { date: "2022.12", label: "品牌基礎建設", detail: "法語官網、包裝在地化、CE 合規" },
          { date: "2023", label: "KOL 與內容", detail: "法、德、義網紅活動（Epenser、JOCR、Volare）" },
          { date: "2024", label: "付費規模化", detail: "6 國 Meta + Google 廣告；CRO 優化" },
          { date: "2025", label: "全通路", detail: "11 國 100+ 零售據點；B2B 管道活躍" },
          { date: "2026 預估", label: "品類領導", detail: "目標：核心歐盟市場高端文具前三" }
        ]
      }
    },

    {
      id: "case-examples",
      type: "case-examples",
      theme: "light",
      en: {
        brand: "Novium",
        slots: [
          {
            key: "kol",
            title: "KOL Campaigns",
            items: [
              { market: "FR", name: "Epenser" },
              { market: "DE", name: "JOCR" },
              { market: "IT", name: "Volare" },
              { market: "RO", name: "Cristian" }
            ]
          },
          {
            key: "cro",
            title: "Website CRO",
            placeholder: "Conversion rate optimization across localized Shopify stores"
          },
          {
            key: "ads",
            title: "Paid Media",
            placeholder: "Meta, Google, and Amazon ads scaling across EU markets"
          },
          {
            key: "retail",
            title: "B2B / Retail",
            placeholder: "100+ POS in 11 countries",
            note: "Map visualization"
          }
        ]
      },
      zh: {
        brand: "Novium",
        slots: [
          {
            key: "kol",
            title: "KOL 活動",
            items: [
              { market: "法", name: "Epenser" },
              { market: "德", name: "JOCR" },
              { market: "義", name: "Volare" },
              { market: "羅", name: "Cristian" }
            ]
          },
          {
            key: "cro",
            title: "官網 CRO",
            placeholder: "在地化 Shopify 官網的轉換率優化"
          },
          {
            key: "ads",
            title: "付費媒體",
            placeholder: "Meta、Google 與 Amazon 廣告，橫跨歐盟市場規模化"
          },
          {
            key: "retail",
            title: "B2B／零售",
            placeholder: "11 國 100+ 零售據點",
            note: "地圖視覺化"
          }
        ]
      }
    },

    {
      id: "partnership",
      type: "partnership",
      theme: "light",
      en: {
        headline: "Novium × Go Boom: Exclusive Strategic Partnership",
        brand: "Novium",
        points: [
          "Exclusive EU partnership (excluding Spain, UK, and Ireland)",
          "Shopify + Amazon + local marketplaces under one operator",
          "Reporting and communication in Chinese for your HQ team",
          "Aligned incentives: we grow when you grow"
        ],
        chartNote: "Illustrative · confirm with Bastien",
        result: {
          label: "Partnership period",
          from: "Dec 2022",
          to: "May 2026",
          note: "Ongoing long-term engagement"
        }
      },
      zh: {
        headline: "Novium × Go Boom：獨家策略夥伴關係",
        brand: "Novium",
        points: [
          "歐盟獨家合作（西班牙、英國、愛爾蘭除外）",
          "Shopify + Amazon + 當地平台，由單一營運方統籌",
          "報告與溝通以中文對接您的總部團隊",
          "利益一致：您成長，我們才成長"
        ],
        chartNote: "示意數據 · 請 Bastien 確認",
        result: {
          label: "合作期間",
          from: "2022.12",
          to: "2026.05",
          note: "持續長期合作"
        }
      }
    },

    {
      id: "stmt-how",
      type: "statement",
      theme: "orange",
      symbol: 8,
      en: { headline: "How would this work with you?" },
      zh: { headline: "與您合作會是什麼流程？" }
    },

    {
      id: "process",
      type: "process",
      theme: "light",
      en: {
        headline: "Getting Started",
        steps: [
          { n: "01", title: "Due Diligence", duration: "2-4 weeks", body: "Product review, market fit assessment, financial modeling, and mutual fit evaluation." },
          { n: "02", title: "Negotiation", duration: "Varies", body: "Terms, exclusivity scope, pricing, margin structure, and launch roadmap." },
          { n: "03", title: "Setup and Launch", duration: "2-3 months", body: "Compliance, import, storefront, ads, and first-market go-live." }
        ],
        ongoing: "Long-term partnership with quarterly reviews, shared KPIs, and continuous market expansion."
      },
      zh: {
        headline: "如何開始",
        steps: [
          { n: "01", title: "盡職調查", duration: "2-4 週", body: "產品審查、市場契合評估、財務模型與雙方適配評估。" },
          { n: "02", title: "協商談判", duration: "視情況", body: "條款、獨家範圍、定價、利潤結構與上市路線圖。" },
          { n: "03", title: "建置與上市", duration: "2-3 個月", body: "合規、進口、官網、廣告與首發市場上線。" }
        ],
        ongoing: "長期夥伴關係，含季度檢討、共享 KPI 與持續市場拓展。"
      }
    },

    {
      id: "needs",
      type: "needs",
      theme: "light",
      en: {
        headline: "What We Need From You",
        intro: "We commit fully to a select number of brands. Here is what a successful partnership requires:",
        items: [
          { title: "Product", body: "A product with proven demand in Taiwan or APAC, and quality to compete in premium EU segments.", why: "We invest marketing dollars upfront. Product-market fit must exist before we scale spend." },
          { title: "Exclusivity", body: "EU-wide exclusive distribution rights (with agreed exceptions).", why: "Exclusivity aligns incentives and protects the investment we make in your brand." },
          { title: "Price and Margin", body: "Wholesale pricing that supports EU logistics, marketing, and healthy margins for both sides.", why: "Sustainable unit economics are the foundation of long-term growth, not short-term volume." }
        ],
        footer: "We choose brands we can commit to fully, not add to a catalog."
      },
      zh: {
        headline: "我們需要什麼",
        intro: "我們全力投入少數精選品牌。成功合作需要以下條件：",
        items: [
          { title: "產品", body: "在台灣或亞太已驗證需求的產品，且品質足以在歐盟高端市場競爭。", why: "我們預先投入行銷預算。在放大支出前，產品市場契合必須已存在。" },
          { title: "獨家授權", body: "歐盟全區獨家經銷權（依約定例外）。", why: "獨家授權使利益一致，並保護我們對您品牌的投資。" },
          { title: "價格與利潤", body: "批發定價需支撐歐盟物流、行銷，並讓雙方維持健康利潤。", why: "可持續的單位經濟是長期成長的基礎，而非短期衝量。" }
        ],
        footer: "我們選擇能全力投入的品牌，不是加入型錄的一個品項。"
      }
    },

    {
      id: "get",
      type: "get",
      theme: "dark",
      en: {
        headline: "What you'll get partnering with Go Boom",
        items: [
          { before: "One ", accent: "exclusive EU partner", after: ". Not a network of disconnected distributors." },
          { before: "A ", accent: "marketer-led", after: " go-to-market engine built for D2C growth." },
          { before: "Full ", accent: "transparency", after: ". Reporting in Chinese, real-time data, shared KPIs." }
        ]
      },
      zh: {
        headline: "與 Go Boom 合作，您將獲得",
        items: [
          { before: "一個", accent: "歐盟獨家夥伴", after: "，而非分散各國、互不相連的經銷網。" },
          { before: "以", accent: "行銷人為核心", after: "、專為 D2C 成長打造的上市引擎。" },
          { before: "完整", accent: "透明度", after: "：中文報告、即時數據、共享 KPI。" }
        ]
      }
    },

    {
      id: "close",
      type: "close",
      theme: "dark",
      en: {
        thanks: "Thank you for listening!",
        cta: "Let's talk next steps",
        web: "www.goboom.agency",
        emails: ["bastien@goboom.agency", "guillaume@goboom.agency"],
        phone: "+886 989 161 156"
      },
      zh: {
        thanks: "感謝您的聆聽！",
        cta: "讓我們談談下一步",
        web: "www.goboom.agency",
        emails: ["bastien@goboom.agency", "guillaume@goboom.agency"],
        phone: "+886 989 161 156"
      }
    }
  ]
};
