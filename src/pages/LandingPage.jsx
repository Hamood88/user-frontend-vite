import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'am', name: 'Amharic (Ethiopia)' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Mandarin' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'so', name: 'Somali (Somalia)' },
  { code: 'es', name: 'Spanish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ur', name: 'Urdu (Pakistan)' }
];

const CONTENT = {
  en: {
    enterBtn: "Enter Site",
    welcome: "Welcome to Moondala 🌙",
    subtitle: "The first network-driven marketplace that shares profits with users.",
    howItWorks: "How It Works",
    benefitsTitle: "Why Join Moondala?",
    benefit1: "Exclusive Deals & Discounts",
    benefit2: "Connect directly with Shops",
    benefit3: "Earn rewards by inviting friends",
    cta: "Sign In",
    introText: "Shop from real stores, share your invite code, and earn from purchases in your network.",
    networkTitle: "Build Your 5-Level Network",
    networkDesc: "Earn from your direct invites and their extended network.",
    level1: "Level 1: Direct Friends",
    level2_5: "Levels 2-5: Friends of Friends",
    dashboardTitle: "Track Your Success",
    dashboardDesc: "See your earnings and network growth in real-time.",
    shopTitle: "One App. Your Entire Social World.",
    shopSubtitle: "Earn, Share, Shop, and Engage—all in one place.",
    shopIntro: "Moondala brings your friends and your favorite shops together. It's the first platform where your social feed and your shopping cart live in perfect harmony. Follow friends to see what they're buying, discover trending products in the Mall, and grow your earnings by simply being social.",
    pillar1Title: "🛒 Shop the Mall",
    pillar1Desc: "Explore thousands of unique stores. From high-fashion to tech, everything you need is organized and ready for you.",
    pillar2Title: "📱 Engage in Feeds",
    pillar2Desc: "It’s a social network! Post updates, follow friends, and see a live feed of what’s trending in your community.",
    pillar3Title: "🤝 Connect with Friends",
    pillar3Desc: "Shopping is better together. Chat directly with sellers or get your friends' opinions on products before you buy.",
    pillar4Title: "💰 Share & Earn",
    pillar4Desc: "Every time you share a product you love or invite a new friend, you're building a network that pays you back.",
    howItWorksNewTitle: "How Moondala Works",
    howItWorksNewDesc: "Big platforms profit from every order — you get nothing. Moondala changes that.\n\nInstead of keeping the transaction fees, Moondala shares them with users through the referral tree.\n\nLife is hard and expensive, so Moondala helps you turn your network into extra income.",
    // New Feature Keys
    earnMonthlyBadge: "Earn Monthly",
    shareYour: "Share Your",
    referralCode: "REFERRAL CODE",
    step1: "Friends sign up using your code",
    step2_pre: "You earn commission from",
    step2_bold: "every purchase",
    welcomeBack: "Welcome back,",
    trackCommissions: "Track your commissions and network growth.",
    shareLink: "Share Link",
    totalEarnings: "Total Earnings",
    available: "Available",
    pending: "Pending",
    networkSize: "Network Size",
    readyWithdraw: "Ready to withdraw",
    clearsPeriod: "Clears after hold period",
    activeMembers: "Active members",
    smartDashboard: "Smart Dashboard",
    transparencyTitle: "Complete Transparency.\nZero Hidden Fees.",
    transparencyDesc: "Moondala tracks commissions from purchases made across your referral tree — not just direct friends.",
    transparencyList1: "View earnings by referral level",
    transparencyList2: "See when commissions are pending or ready to withdraw",
    transparencyList3: "Monitor your network growth over time",
    transparencyNote: "Everything is calculated automatically and displayed clearly in your dashboard."
  },
  am: {
    enterBtn: "Enter Site", 
    welcome: "እንኳን ወደ Moondala በደህና መጡ",
    subtitle: "አዲስ መንገድ ለግዢ እና ግንኙነት ይግለጡ",
    howItWorks: "እንዴት እንደሚሰራ",
    benefitsTitle: "ለምን Moondala ይቀላቀሉ?",
    benefit1: "ልዩ ቅናሾች እና ማበረታቻዎች",
    benefit2: "ከሱቆች ጋር በቀጥታ ይገናኙ",
    benefit3: "ጓደኞችን በመጋበዝ ሽልማቶችን ያግኙ",
    cta: "ይግቡ",
    introText: "Moondala ከልዩ ሱቆች ጋር በቀጥታ ያገናኝዎታል። ምርቶችን ያስሱ፣ ከሻጮች ጋር ይወያዩ፣ እና ለእርስዎ ፍላጎቶች በተዘጋጀ ደህንነቱ በተጠበቀ የግዢ ተሞክሮ ይደሰቱ።",
    networkTitle: "የ5-ደረጃ አውታረ መረብዎን ይገንቡ",
    networkDesc: "ከቀጥታ ግብዣዎችዎ እና ከሰፊ አውታረ መረባቸው ያግኙ።",
    level1: "ደረጃ 1: ቀጥተኛ ጓደኞች",
    level2_5: "ደረጃ 2-5: የጓደኞች ጓደኞች",
    dashboardTitle: "ስኬትዎን ይከታተሉ",
    dashboardDesc: "ገቢዎን እና የአውታረ መረብ እድገትዎን በተጨባጭ ጊዜ ይመልከቱ።",
    shopTitle: "አንድ መተግበሪያ። ሙሉ ማህበራዊ አለምዎ።",
    shopSubtitle: "ያግኙ፣ ያጋሩ፣ ይግዙ እና ይሳተፉ—ሁሉም በአንድ ቦታ።",
    shopIntro: "Moondala ጓደኞችዎን እና ተወዳጅ መደብሮችዎን አንድ ላይ ያመጣል። የማህበራዊ ምግቦችዎ እና የግዢ ጋሪዎ በፍጹም ስምምነት የሚኖሩበት የመጀመሪያው መድረክ ነው።",
    pillar1Title: "🛒 ከሞል ይግዙ",
    pillar1Desc: "በሺዎች የሚቆጠሩ ልዩ መደብሮችን ያስሱ። ከከፍተኛ ፋሽን እስከ ቴክኖሎጂ ድረስ የሚፈልጉት ሁሉ የተደራጀ እና ዝግጁ ነው።",
    pillar2Title: "📱 በፊድስ ውስጥ ይሳተፉ",
    pillar2Desc: "ማህበራዊ አውታረ መረብ ነው! ማሻሻያዎችን ያስነሱ፣ ጓደኞችን ይከተሉ እና በማህበረሰብዎ ውስጥ ምን እየታየ እንደሆነ ይመልከቱ።",
    pillar3Title: "🤝 ከጓደኞች ጋር ይገናኙ",
    pillar3Desc: "ግዢ አብረን ሲሆን የተሻለ ነው። ከሻጮች ጋር በቀጥታ ይወያዩ ወይም ከመግዛትዎ በፊት የጓደኞችዎን አስተያየት ያግኙ።",
    pillar4Title: "💰 ያጋሩ እና ያግኙ",
    pillar4Desc: "የሚወዱትን ምርት በሚያጋሩበት ጊዜ ወይም አዲስ ጓደኛ በሚጋብዙበት ጊዜ ሁሉ ለእርስዎ የሚከፍል አውታረ መረብ እየገነቡ ነው።",
    howItWorksNewTitle: "Moondala እንዴት እንደሚሰራ",
    howItWorksNewDesc: "ትላልቅ መድረኮች ከእያንዳንዱ ትዕዛዝ ያተርፋሉ — እርስዎ ምንም አያገኙም። Moondala ይህንን ይለውጣል።\n\nየግብይት ክፍያዎችን ከመያዝ ይልቅ፣ Moondala በሪፈራል ዛፍ በኩል ለተጠቃሚዎች ያካፍላል።\n\nህይወት ከባድ እና ውድ ስለሆነች፣ Moondala አውታረ መረብዎን ወደ ተጨማሪ ገቢ እንዲቀይሩ ይረዳዎታል።",
    earnMonthlyBadge: "በየወሩ ያግኙ",
    shareYour: "የእርስዎን ያጋሩ",
    referralCode: "ሪፈራል ኮድ",
    step1: "ጓደኞች በእርስዎ ኮድ ይመዘገባሉ",
    step2_pre: "ከእያንዳንዱ ግዢ",
    step2_bold: "ኮሚሽን ያገኛሉ",
    welcomeBack: "እንኳን በደህና መጡ፣",
    trackCommissions: "የእርስዎን ኮሚሽኖች እና የአውታረ መረብ እድገት ይከታተሉ።",
    shareLink: "ሊንክ ያጋሩ",
    totalEarnings: "ጠቅላላ ገቢ",
    available: "ይገኛል",
    pending: "በመጠባበቅ ላይ",
    networkSize: "የአውታረ መረብ መጠን",
    readyWithdraw: "ለመውጣት ዝግጁ",
    clearsPeriod: "ከቆይታ ጊዜ በኋላ ይለቀቃል",
    activeMembers: "ንቁ አባላት",
    smartDashboard: "ስማርት ዳሽቦርድ",
    transparencyTitle: "ሙሉ ግልጽነት።\nምንም ድብቅ ክፍያዎች የሉም።",
    transparencyDesc: "Moondala በሪፈራል ዛፍዎ ውስጥ ከተደረጉ ግዢዎች ኮሚሽኖችን ይከታተላል።",
    transparencyList1: "በሪፈራል ደረጃ ገቢን ይመልከቱ",
    transparencyList2: "ኮሚሽኖች መቼ ዝግጁ እንደሆኑ ይመልከቱ",
    transparencyList3: "የአውታረ መረብ እድገትን ይቆጣጠሩ",
    transparencyNote: "ሁሉም ነገር በራስ-ሰር ይሰላል እና በግልጽ ይታያል።"
  },
  fil: {
    enterBtn: "Enter Site",
    welcome: "Maligayang pagdating sa Moondala",
    subtitle: "Tuklasin ang bagong paraan ng pamimili at pakikipag-ugnayan",
    howItWorks: "Paano Ito Gumagana",
    benefitsTitle: "Bakit Sumali sa Moondala?",
    benefit1: "Eksklusibong Mga Deal at Diskwento",
    benefit2: "Direktang makipag-ugnayan sa mga Tindahan",
    benefit3: "Makakuha ng mga gantimpala sa pag-imbita ng mga kaibigan",
    cta: "Mag-sign In",
    introText: "Direktang ikinokonekta ka ng Moondala sa mga natatanging tindahan. Mag-browse ng mga produkto, makipag-chat sa mga nagbeventa, at mag-enjoy sa secure na karanasan sa pamimili na inangkop sa iyong mga interes.",
    networkTitle: "Buuin ang Iyong 5-Level Network",
    networkDesc: "Kumita mula sa iyong mga direktang imbitasyon at sa kanilang pinalawak na network.",
    level1: "Antas 1: Mga Direktang Kaibigan",
    level2_5: "Antas 2-5: Mga Kaibigan ng mga Kaibigan",
    dashboardTitle: "Subaybayan ang Iyong Tagumpay",
    dashboardDesc: "Makita ang iyong kita at paglago ng network sa real-time.",
    shopTitle: "Isang App. Ang Iyong Buong Social World.",
    shopSubtitle: "Kumita, Magbahagi, Mamili, at Makipag-ugnayan—lahat sa isang lugar.",
    shopIntro: "Pinagsasama ng Moondala ang iyong mga kaibigan at paboritong tindahan. Ito ang unang platform kung saan ang iyong social feed at shopping cart ay naninirahan sa perpektong harmonya.",
    pillar1Title: "🛒 Mamili sa Mall",
    pillar1Desc: "Tuklasin ang libu-libong natatanging tindahan. Mula sa high-fashion hanggang tech, ang lahat ng kailangan mo ay organisado at handa para sa iyo.",
    pillar2Title: "📱 Makiisa sa mga Feed",
    pillar2Desc: "Ito ay isang social network! Mag-post ng mga update, i-follow ang mga kaibigan, at tingnan ang live feed ng kung ano ang trending sa iyong komunidad.",
    pillar3Title: "🤝 Kumonekta sa mga Kaibigan",
    pillar3Desc: "Ang pamimili ay mas maganda kapag magkasama. Makipag-chat nang direkta sa mga nagbebenta o kumuha ng opinyon ng iyong mga kaibigan sa mga produkto bago bumili.",
    pillar4Title: "💰 Magbahagi at Kumita",
    pillar4Desc: "Sa bawat pagkakataon na nagbabahagi ka ng produktong mahal mo o nag-imbita ng bagong kaibigan, bumubuo ka ng network na nagbabayad sa iyo.",
    howItWorksNewTitle: "Paano Gumagana ang Moondala",
    howItWorksNewDesc: "Kumikita ang malalaking platform sa bawat order — wala kang nakukuha. Babaguhin iyan ng Moondala.\n\nSa halip na itago ang mga transaction fee, ibinabahagi ito ng Moondala sa mga user sa pamamagitan ng referral tree.\n\nMahirap at mahal ang buhay, kaya tinutulungan ka ng Moondala na gawing extra income ang iyong network.",
    earnMonthlyBadge: "Kumita Buwan-buwan",
    shareYour: "Ibahagi ang Iyong",
    referralCode: "REFERRAL CODE",
    step1: "Nag-sign up ang mga kaibigan gamit ang iyong code",
    step2_pre: "Kumikita ka ng komisyon mula sa",
    step2_bold: "bawat pagbili",
    welcomeBack: "Maligayang pagbabalik,",
    trackCommissions: "Subaybayan ang iyong mga komisyon at paglago ng network.",
    shareLink: "Ibahagi ang Link",
    totalEarnings: "Kabuuang Kita",
    available: "Magagamit",
    pending: "Nakabinbin",
    networkSize: "Laki ng Network",
    readyWithdraw: "Handa nang i-withdraw",
    clearsPeriod: "Maki-clear pagkatapos ng hold period",
    activeMembers: "Aktibong miyembro",
    smartDashboard: "Smart Dashboard",
    transparencyTitle: "Buong Transparency.\nWalang Nakatagong Bayarin.",
    transparencyDesc: "Sinusubaybayan ng Moondala ang mga komisyon mula sa mga pagbiling ginawa sa iyong buong referral tree.",
    transparencyList1: "Tingnan ang kita bawat antas",
    transparencyList2: "Tingnan ang status ng komisyon",
    transparencyList3: "Subaybayan ang paglago ng network",
    transparencyNote: "Awtomatikong kinakalkula ang lahat at malinaw na ipinapakita."
  },
  ko: {
    enterBtn: "Enter Site",
    welcome: "Moondala에 오신 것을 환영합니다",
    subtitle: "쇼핑하고 소통하는 새로운 방식을 발견하세요",
    howItWorks: "이용 방법",
    benefitsTitle: "왜 Moondala와 함께해야 할까요?",
    benefit1: "독점 거래 및 할인",
    benefit2: "상점과 직접 연결",
    benefit3: "친구 초대하고 보상 받기",
    cta: "로그인",
    introText: "Moondala는 독특한 상점들과 직접 연결해 드립니다. 상품을 둘러보고, 판매자와 채팅하며, 귀하의 관심사에 맞춘 안전한 쇼핑 경험을 즐기세요.",
    networkTitle: "5단계 네트워크 구축",
    networkDesc: "직접 초대한 친구들과 그들의 확장된 네트워크로부터 수익을 창출하세요.",
    level1: "레벨 1: 직접 친구",
    level2_5: "레벨 2-5: 친구의 친구",
    dashboardTitle: "성공 추적",
    dashboardDesc: "수익과 네트워크 성장을 실시간으로 확인하세요.",
    shopTitle: "하나의 앱. 당신의 전체 소셜 월드.",
    shopSubtitle: "수익 창출, 공유, 쇼핑 및 참여 - 이 모든 것을 한 곳에서.",
    shopIntro: "Moondala는 친구와 좋아하는 상점을 하나로 모았습니다. 소셜 피드와 쇼핑 카트가 완벽한 조화를 이루며 공존하는 최초의 플랫폼입니다. 친구들이 무엇을 사고 있는지 확인하고, 몰에서 트렌드 제품을 발견하고, 소셜 활동만으로 수익을 높이세요.",
    pillar1Title: "🛒 몰 쇼핑",
    pillar1Desc: "수천 개의 독특한 상점을 탐색하세요. 하이 패션부터 기술에 이르기까지 필요한 모든 것이 정리되어 준비되어 있습니다.",
    pillar2Title: "📱 피드 참여",
    pillar2Desc: "소셜 네트워크입니다! 업데이트를 게시하고, 친구를 팔로우하고, 커뮤니티에서 무엇이 트렌드인지 라이브 피드를 확인하세요.",
    pillar3Title: "🤝 친구와 연결",
    pillar3Desc: "쇼핑은 함께할 때 더 좋습니다. 판매자와 직접 채팅하거나 구매하기 전에 제품에 대한 친구의 의견을 들어보세요.",
    pillar4Title: "💰 공유 및 수익 창출",
    pillar4Desc: "좋아하는 제품을 공유하거나 새로운 친구를 초대할 때마다 보답을 받는 네트워크를 구축하게 됩니다.",
    howItWorksNewTitle: "Moondala 작동 방식",
    howItWorksNewDesc: "거대 플랫폼들은 모든 주문에서 수익을 챙기지만, 당신은 아무것도 얻지 못합니다. Moondala는 이를 바꿉니다.\n\n거래 수수료를 독차지하는 대신, Moondala는 추천 트리를 통해 이를 사용자들과 공유합니다.\n\n살기 팍팍하고 물가도 비싼 요즘, Moondala는 당신의 인맥을 추가 소득으로 바꿀 수 있도록 돕습니다.",
    earnMonthlyBadge: "매월 수익 창출",
    shareYour: "공유하기",
    referralCode: "추천 코드",
    step1: "친구가 코드로 가입",
    step2_pre: "수수료 수익 발생:",
    step2_bold: "모든 구매",
    welcomeBack: "환영합니다,",
    trackCommissions: "수수료 및 네트워크 성장을 추적하세요.",
    shareLink: "링크 공유",
    totalEarnings: "총 수익",
    available: "사용 가능",
    pending: "대기 중",
    networkSize: "네트워크 규모",
    readyWithdraw: "출금 가능",
    clearsPeriod: "보류 기간 후 지급",
    activeMembers: "활성 회원",
    smartDashboard: "스마트 대시보드",
    transparencyTitle: "완전한 투명성.\n숨겨진 수수료 없음.",
    transparencyDesc: "Moondala는 직접 친구뿐만 아니라 추천 트리 전체에서 이루어진 구매에 대한 수수료를 추적합니다.",
    transparencyList1: "추천 레벨별 수익 보기",
    transparencyList2: "수수료 상태 확인",
    transparencyList3: "시간 경과에 따른 네트워크 성장 모니터링",
    transparencyNote: "모든 것이 자동으로 계산되어 대시보드에 명확하게 표시됩니다."
  },
  id: {
    enterBtn: "Enter Site",
    welcome: "Selamat datang di Moondala",
    subtitle: "Temukan cara baru untuk berbelanja dan terhubung",
    howItWorks: "Cara Kerja",
    benefitsTitle: "Mengapa Bergabung dengan Moondala?",
    benefit1: "Promo & Diskon Eksklusif",
    benefit2: "Terhubung langsung dengan Toko",
    benefit3: "Dapatkan hadiah dengan mengundang teman",
    cta: "Masuk",
    introText: "Moondala menghubungkan Anda langsung dengan toko-toko unik. Jelajahi produk, mengobrol dengan penjual, dan nikmati pengalaman berbelanja aman yang disesuaikan dengan minat Anda.",
    networkTitle: "Bangun Jaringan 5 Tingkat Anda",
    networkDesc: "Dapatkan penghasilan dari undangan langsung Anda dan jaringan luas mereka.",
    level1: "Tingkat 1: Teman Langsung",
    level2_5: "Tingkat 2-5: Teman dari Teman",
    dashboardTitle: "Lacak Kesuksesan Anda",
    dashboardDesc: "Lihat penghasilan dan pertumbuhan jaringan Anda secara real-time.",
    shopTitle: "Satu Aplikasi. Seluruh Dunia Sosial Anda.",
    shopSubtitle: "Dapatkan, Bagikan, Belanja, dan Berinteraksi—semuanya di satu tempat.",
    shopIntro: "Moondala menyatukan teman-teman Anda dan toko favorit Anda. Ini adalah platform pertama di mana feed sosial Anda dan keranjang belanja Anda hidup dalam harmoni sempurna.",
    pillar1Title: "🛒 Belanja di Mall",
    pillar1Desc: "Jelajahi ribuan toko unik. Dari mode tinggi hingga teknologi, semua yang Anda butuhkan terorganisir dan siap untuk Anda.",
    pillar2Title: "📱 Terlibat dalam Feed",
    pillar2Desc: "Ini adalah jaringan sosial! Posting pembaruan, ikuti teman, dan lihat feed langsung tentang apa yang sedang tren di komunitas Anda.",
    pillar3Title: "🤝 Terhubung dengan Teman",
    pillar3Desc: "Belanja lebih baik saat bersama. Chat langsung dengan penjual atau dapatkan pendapat teman Anda tentang produk sebelum Anda membeli.",
    pillar4Title: "💰 Bagikan & Dapatkan",
    pillar4Desc: "Setiap kali Anda membagikan produk yang Anda sukai atau mengundang teman baru, Anda membangun jaringan yang memberi Anda kembali.",
    howItWorksNewTitle: "Cara Kerja Moondala",
    howItWorksNewDesc: "Platform besar mendapat untung dari setiap pesanan — Anda tidak mendapat apa-apa. Moondala mengubahnya.\n\nAlih-alih menyimpan biaya transaksi, Moondala membaginya dengan pengguna melalui pohon rujukan.\n\nHidup itu sulit dan mahal, jadi Moondala membantu Anda mengubah jaringan Anda menjadi penghasilan tambahan.",
    earnMonthlyBadge: "Hasilkan Bulanan",
    shareYour: "Bagikan",
    referralCode: "KODE REFERRAL",
    step1: "Teman mendaftar menggunakan kode Anda",
    step2_pre: "Anda mendapat komisi dari",
    step2_bold: "setiap pembelian",
    welcomeBack: "Selamat datang kembali,",
    trackCommissions: "Lacak komisi dan pertumbuhan jaringan Anda.",
    shareLink: "Bagikan Tautan",
    totalEarnings: "Total Pendapatan",
    available: "Tersedia",
    pending: "Tertunda",
    networkSize: "Ukuran Jaringan",
    readyWithdraw: "Siap ditarik",
    clearsPeriod: "Cair setelah masa tunggu",
    activeMembers: "Anggota aktif",
    smartDashboard: "Dasbor Cerdas",
    transparencyTitle: "Transparansi Penuh.\nTanpa Biaya Tersembunyi.",
    transparencyDesc: "Moondala melacak komisi dari pembelian yang dilakukan di seluruh pohon rujukan Anda.",
    transparencyList1: "Lihat pendapatan berdasarkan level",
    transparencyList2: "Lihat status komisi",
    transparencyList3: "Pantau pertumbuhan jaringan",
    transparencyNote: "Semuanya dihitung secara otomatis dan ditampilkan dengan jelas."
  },
  so: {
    enterBtn: "Enter Site",
    welcome: "Ku soo dhawaada Moondala",
    subtitle: "Soo hel qaab cusub oo wax looga iibsado oo lagu xiriiro",
    howItWorks: "Sida ay u shaqeyso",
    benefitsTitle: "Maxaa ugu biirayaa Moondala?",
    benefit1: "Heshiisyo Gaar ah & Qiimo-dhimis",
    benefit2: "Si toos ah ula xiriir Dukaamada",
    benefit3: "Kasbo abaal-marino adoo casuumaya asxaabta",
    cta: "Gal",
    introText: "Moondala waxay si toos ah kugu xireysaa dukaamada gaarka ah. Baadh alaabta, la sheekeysiga iibiyeyaasha, oo ku raaxayso khibrad wax iibsiga oo ammaan ah oo ku habboon danahaaga.",
    networkTitle: "Dhis Shabakaddaada 5-Heer",
    networkDesc: "Ka kasbo casuumaadaha tooska ah iyo shabakadooda fidsan.",
    level1: "Heerka 1: Asxaabta Tooska ah",
    level2_5: "Heerarka 2-5: Asxaabta Asxaabta",
    dashboardTitle: "La Soco Guushaada",
    dashboardDesc: "Arag dakhligaaga iyo koritaanka shabakadda waqtiga dhabta ah.",
    shopTitle: "Hal App. Dunidaada Bulshada oo Dhan.",
    shopSubtitle: "Kasbo, Wadaag, Iibso, oo Ku Qayb gal—dhammaantoodna hal meel.",
    shopIntro: "Moondala waxay isku dirtaa asxaabtaada iyo dukaamadaada jecel. Waa madal ugu horreeya oo ay wada noolaadaan feed-kaaga bulshada iyo gaadhi-iibsigaaga si wanaagsan.",
    pillar1Title: "🛒 Ka Iibso Mall-ka",
    pillar1Desc: "Baadh kumanyaal dukaan oo gaar ah. Moda sare ilaa teknoolajiyada, wax kasta oo aad u baahan tahay ayaa diyaar oo kuu sugaya.",
    pillar2Title: "📱 Ka Qayb qaado Feed-yada",
    pillar2Desc: "Waa shabakad bulsheed! Soo dhig cusboonaysiinta, raac asxaabta, oo arag feed toos ah oo sheegaya waxa trending ee bulshadaada.",
    pillar3Title: "🤝 Kula Xiriir Asxaabta",
    pillar3Desc: "Wax-iibsinta way fiicantahay marka la wada socdo. La sheekeyso iibiyaha tooska ah ama hel ra'yiga asxaabtaada alaabta ka hor inta aad iibsanayso.",
    pillar4Title: "💰 Wadaag oo Kasbo",
    pillar4Desc: "Mar kasta oo aad wadaajiso alaab aad jeceshahay ama aad casuurto saaxiib cusub, waxaad dhisaysaa shabakad kuu celisa lacag.",
    howItWorksNewTitle: "Sida Moondala u Shaqeeyo",
    howItWorksNewDesc: "Madalalka waaweyn waxay ka faa'iidaan amar kasta — adigu waxba ma heshid. Moondala way beddeshaa taas.\n\nBedelkii ay hayn lahayd khidmadaha macaamilka, Moondala waxay la wadaagtaa isticmaalayaasha iyada oo loo marayo geedka tixraaca.\n\nNoloshu waa adag tahay oo qaali tahay, sidaa darteed Moondala waxay kaa caawineysaa inaad shabakaddaada u beddesho dakhli dheeraad ah.",
    earnMonthlyBadge: "Kasbo Bil Kasta",
    shareYour: "La Wandaag",
    referralCode: "KOODHKA TIXRAACA",
    step1: "Saaxiibada waxay ku biiraan iyagoo isticmaalaya koodhkaaga",
    step2_pre: "Waxaad komishanka ka helaysaa",
    step2_bold: "iibsi kasta",
    welcomeBack: "Kusoo dhawaada,",
    trackCommissions: "La soco komishankaaga iyo koritaanka shabakadaada.",
    shareLink: "La Wadaag Linkiga",
    totalEarnings: "Dakhliga Guud",
    available: "La Heli Karo",
    pending: "La Sugayo",
    networkSize: "Cabbirka Shabakadda",
    readyWithdraw: "Diyaar u ah inala baxo",
    clearsPeriod: "Waa la fasaxaa kadib mudada haynta",
    activeMembers: "Xubnaha firfircoon",
    smartDashboard: "Dashboard Caqli badan",
    transparencyTitle: "Daahurnaan Buuxda.\nEber Khidmadaha Qarsoon.",
    transparencyDesc: "Moondala waxay la socotaa komishanka iibsiyada laga sameeyay geedkaaga tixraaca oo dhan.",
    transparencyList1: "Arag dakhliga heerka tixraaca",
    transparencyList2: "Arag xaaladda komishanka",
    transparencyList3: "La soco koritaanka shabakadda waqtiga",
    transparencyNote: "Wax walba si toos ah ayaa loo xisaabiyaa oo si cad ayaa loo soo bandhigaa."
  },
  ur: {
    enterBtn: "سائٹ میں داخل ہوں",
    welcome: "Moondala میں خوش آمدید",
    subtitle: "خریداری اور رابطے کا ایک نیا طریقہ دریافت کریں",
    howItWorks: "یہ کیسے کام کرتا ہے",
    benefitsTitle: "Moondala میں کیوں شامل ہوں؟",
    benefit1: "خصوصی ڈیلز اور چھوٹ",
    benefit2: "دکانوں سے براہ راست رابطہ کریں",
    benefit3: "دوستوں کو مدعو کرکے انعامات حاصل کریں",
    cta: "لاگ ان کریں",
    introText: "Moondala آپ کو براہ راست منفرد دکانوں سے جوڑتا ہے۔ مصنوعات براؤز کریں، بیچنے والوں سے بات کریں، اور اپنی دلچسپیوں کے مطابق محفوظ خریداری کے تجربے سے لطف اندوز ہوں۔",
    networkTitle: "اپنا 5 سطحی نیٹ ورک بنائیں",
    networkDesc: "اپنی براہ راست دعوتوں اور ان کے نیٹ ورک سے کمائیں۔",
    level1: "لیول 1: براہ راست دوست",
    level2_5: "لیول 2-5: دوستوں کے دوست",
    dashboardTitle: "اپنی کامیابی کو ٹریک کریں",
    dashboardDesc: "اپنی کمائی اور نیٹ ورک کی نشوونما کو حقیقی وقت میں دیکھیں۔",
    shopTitle: "ایک ایپ۔ آپ کی پوری سماجی دنیا۔",
    shopSubtitle: "کمائیں، شیئر کریں، خریداری کریں، اور جڑیں—سب ایک ہی جگہ پر۔",
    shopIntro: "Moondala آپ کے دوستوں اور آپ کے پسندیدہ اسٹورز کو ایک ساتھ لاتا ہے۔ یہ پہلا پلیٹ فارم ہے جہاں آپ کی سوشل فیڈ اور آپ کا شاپنگ کارٹ بہترین ہم آہنگی کے ساتھ رہتے ہیں۔ دوستوں کو فالو کریں کہ وہ کیا خرید رہے ہیں، مال میں ٹرینڈنگ پروڈکٹس دریافت کریں، اور صرف سماجی بن کر اپنی آمدنی بڑھائیں۔",
    pillar1Title: "🛒 مال سے خریداری کریں۔",
    pillar1Desc: "ہزاروں منفرد اسٹورز کو دریافت کریں۔ ہائی فیشن سے لے کر ٹیک تک، آپ کی ضرورت کی ہر چیز منظم اور آپ کے لیے تیار ہے۔",
    pillar2Title: "📱 فیڈز میں مشغول ہوں۔",
    pillar2Desc: "یہ ایک سوشل نیٹ ورک ہے! اپ ڈیٹس پوسٹ کریں، دوستوں کو فالو کریں، اور آپ کی کمیونٹی میں کیا ٹرینڈ کر رہا ہے اس کی لائیو فیڈ دیکھیں۔",
    pillar3Title: "🤝 دوستوں سے جڑیں۔",
    pillar3Desc: "اکٹھے خریداری بہتر ہوتی ہے۔ بیچنے والوں کے ساتھ براہ راست بات چیت کریں یا خریداری سے پہلے مصنوعات پر اپنے دوستوں کی رائے حاصل کریں۔",
    pillar4Title: "💰 شیئر کریں اور کمائیں۔",
    pillar4Desc: "جب بھی آپ اپنی پسند کی مصنوعات شیئر کرتے ہیں یا کسی نئے دوست کو مدعو کرتے ہیں، آپ ایک ایسا نیٹ ورک بنا رہے ہوتے ہیں جو آپ کو واپس ادائیگی کرتا ہے۔",
    howItWorksNewTitle: "Moondala کیسے کام کرتا ہے",
    howItWorksNewDesc: "بڑے پلیٹ فارمز ہر آرڈر سے منافع کماتے ہیں — آپ کو کچھ نہیں ملتا۔ Moondala اسے بدلتا ہے۔\n\nٹرانزیکشن فیس رکھنے کے بجائے، Moondala انہیں ریفرل ٹری کے ذریعے صارفین کے ساتھ شیئر کرتا ہے۔\n\nزندگی مشکل اور مہنگی ہے، اس لیے Moondala آپ کو اپنے نیٹ ورک کو اضافی آمدنی میں تبدیل کرنے میں مدد کرتا ہے۔",
    earnMonthlyBadge: "ماہانہ کمائیں",
    shareYour: "اپنا شیئر کریں",
    referralCode: "ریفرل کوڈ",
    step1: "دوست آپ کے کوڈ کا استعمال کرتے ہوئے سائن اپ کرتے ہیں",
    step2_pre: "آپ کمیشن کماتے ہیں",
    step2_bold: "ہر خریداری سے",
    welcomeBack: "خوش آمدید،",
    trackCommissions: "اپنے کمیشن اور نیٹ ورک کی نمو کو ٹریک کریں۔",
    shareLink: "لنک شیئر کریں",
    totalEarnings: "کل آمدنی",
    available: "دستیاب",
    pending: "زیر التواء",
    networkSize: "نیٹ ورک کا سائز",
    readyWithdraw: "نکالنے کے لیے تیار",
    clearsPeriod: "ہولڈ پیریڈ کے بعد صاف ہوجاتا ہے",
    activeMembers: "فعال ممبران",
    smartDashboard: "اسمارٹ ڈیش بورڈ",
    transparencyTitle: "مکمل شفافیت۔\nکوئی خفیہ فیس نہیں۔",
    transparencyDesc: "Moondala آپ کے پورے ریفرل ٹری میں کی گئی خریداریوں سے کمیشن ٹریک کرتا ہے۔",
    transparencyList1: "ریفرل لیول کے ذریعے آمدنی دیکھیں",
    transparencyList2: "کمیشن کی حالت دیکھیں",
    transparencyList3: "وقت کے ساتھ نیٹ ورک کی نمو کی نگرانی کریں",
    transparencyNote: "ہر چیز کا خود بخود حساب لگایا جاتا ہے اور واضح طور پر دکھایا جاتا ہے۔"
  },
  es: {
    enterBtn: "Entrar al sitio",
    welcome: "Bienvenido a Moondala",
    subtitle: "Descubre una nueva forma de comprar y conectar",
    howItWorks: "Cómo funciona",
    benefitsTitle: "¿Por qué unirse a Moondala?",
    benefit1: "Ofertas y descuentos exclusivos",
    benefit2: "Conecta directamente con las tiendas",
    benefit3: "Gana recompensas invitando a amigos",
    cta: "Iniciar sesión",
    introText: "Moondala te conecta directamente con tiendas únicas. Explora productos, chatea con vendedores y disfruta de una experiencia de compra segura adaptada a tus intereses.",
    networkTitle: "Construye tu red de 5 niveles",
    networkDesc: "Gana de tus invitados directos y su red.",
    level1: "Nivel 1: Amigos directos",
    level2_5: "Niveles 2-5: Amigos de amigos",
    dashboardTitle: "Sigue tu éxito",
    dashboardDesc: "Ve tus ganancias y el crecimiento de la red en tiempo real.",
    shopTitle: "Una App. Todo tu Mundo Social.",
    shopSubtitle: "Gana, Comparte, Compra y Participa — todo en un solo lugar.",
    shopIntro: "Moondala une a tus amigos y tus tiendas favoritas. Es la primera plataforma donde tu feed social y tu carrito de compras conviven en perfecta armonía. Sigue a tus amigos para ver qué están comprando, descubre productos tendencia en el Mall y aumenta tus ganancias simplemente siendo social.",
    pillar1Title: "🛒 Compra en el Mall",
    pillar1Desc: "Explora miles de tiendas únicas. Desde alta moda hasta tecnología, todo lo que necesitas está organizado y listo para ti.",
    pillar2Title: "📱 Participa en los Feeds",
    pillar2Desc: "¡Es una red social! Publica actualizaciones, sigue a amigos y mira un feed en vivo de lo que es tendencia en tu comunidad.",
    pillar3Title: "🤝 Conecta con Amigos",
    pillar3Desc: "Comprar es mejor cuando se hace juntos. Chatea directamente con los vendedores o pide la opinión de tus amigos sobre los productos antes de comprar.",
    pillar4Title: "💰 Comparte y Gana",
    pillar4Desc: "Cada vez que compartes un producto que te gusta o invitas a un nuevo amigo, estás construyendo una red que te recompensa.",
    howItWorksNewTitle: "Cómo funciona Moondala",
    howItWorksNewDesc: "Las grandes plataformas se benefician de cada pedido, tú no obtienes nada. Moondala cambia eso.\n\nEn lugar de quedarse con las tarifas de transacción, Moondala las comparte con los usuarios a través del árbol de referencias.\n\nLa vida es dura y costosa, por lo que Moondala te ayuda a convertir tu red en ingresos extra.",
    earnMonthlyBadge: "Gana Mensualmente",
    shareYour: "Comparte Tu",
    referralCode: "CÓDIGO DE REFERENCIA",
    step1: "Amigos se registran con tu código",
    step2_pre: "Ganas comisión de",
    step2_bold: "cada compra",
    welcomeBack: "Bienvenido de nuevo,",
    trackCommissions: "Sigue tus comisiones y red.",
    shareLink: "Compartir enlace",
    totalEarnings: "Ganancias Totales",
    available: "Disponible",
    pending: "Pendiente",
    networkSize: "Tamaño de Red",
    readyWithdraw: "Listo para retirar",
    clearsPeriod: "Se libera tras periodo de espera",
    activeMembers: "Miembros activos",
    smartDashboard: "Panel Inteligente",
    transparencyTitle: "Transparencia Total.\nCero Tarifas Ocultas.",
    transparencyDesc: "Moondala rastrea comisiones de compras en toda tu red de referencias, no solo amigos directos.",
    transparencyList1: "Ver ganancias por nivel de referencia",
    transparencyList2: "Ver cuándo las comisiones están pendientes o listas",
    transparencyList3: "Monitorear el crecimiento de tu red",
    transparencyNote: "Todo se calcula automáticamente y se muestra claramente."
  },
  ja: {
    enterBtn: "Enter Site",
    welcome: "Moondalaへようこそ",
    subtitle: "新しいショッピングとつながりの形を発見しましょう",
    howItWorks: "仕組み",
    benefitsTitle: "Moondalaに参加する理由は？",
    benefit1: "限定セールと割引",
    benefit2: "ショップと直接つながる",
    benefit3: "友達を招待して報酬を獲得",
    cta: "サインイン",
    introText: "Moondalaは、ユニークなショップとあなたを直接つなぎます。商品を見て回り、売り手とチャットし、興味に合わせた安全なショッピング体験をお楽しみください。",
    networkTitle: "5段階のネットワークを構築",
    networkDesc: "直接招待した友達やそのネットワークから報酬を獲得。",
    level1: "レベル1: 直接の友達",
    level2_5: "レベル2-5: 友達の友達",
    dashboardTitle: "成功を追跡",
    dashboardDesc: "収益とネットワークの成長をリアルタイムで確認。",
    shopTitle: "一つのアプリ。あなたのソーシャルワールドのすべて。",
    shopSubtitle: "稼ぐ、共有する、買い物する、繋がる — すべてを一つの場所で。",
    shopIntro: "Moondalaは、友達とお気に入りのショップを一つにまとめます。ソーシャルフィードとショッピングカート가完璧な調和の中で共存する、初めてのプラットフォームです。友達が何を買っているかフォローし、モールでトレンドの商品を発見し、ソーシャル活動をするだけで収益を上げましょう。",
    pillar1Title: "🛒 モールでショッピング",
    pillar1Desc: "数千のユニークなショップを探索しましょう。ハイファッションからテクノロジーまで、必要なものはすべて整理され、あなたを待っています。",
    pillar2Title: "📱 フィードに参加",
    pillar2Desc: "これはソーシャルネットワークです！アップデートを投稿し、友達をフォローし、コミュニティで何が流行っているかのライブフィードをチェックしましょう。",
    pillar3Title: "🤝 友達と繋がる",
    pillar3Desc: "ショッピングは一緒にする方が楽しいものです。売り手と直接チャットしたり、購入前に商品の感想を友達に聞いたりできます。",
    pillar4Title: "💰 共有して稼ぐ",
    pillar4Desc: "お気に入りの商品を共有したり、新しい友達を招待したりするたびに、あなたに還元されるネットワークを構築しています。",
    howItWorksNewTitle: "Moondalaの仕組み",
    howItWorksNewDesc: "大手プラットフォームはすべての注文から利益を得ますが、あなたは何も得られません。Moondalaはそれを変えます。\n\n取引手数料を保持する代わりに、Moondalaは紹介ツリーを通じてユーザーと共有します。\n\n生活は大変でお金もかかるため、Moondalaはあなたのネットワークを副収入に変える手助けをします。",
    earnMonthlyBadge: "毎月稼ぐ",
    shareYour: "共有する",
    referralCode: "紹介コード",
    step1: "友達があなたのコードで登録",
    step2_pre: "あなたは手数料を稼ぎます",
    step2_bold: "すべての購入から",
    welcomeBack: "お帰りなさい、",
    trackCommissions: "手数料とネットワークを追跡。",
    shareLink: "リンクを共有",
    totalEarnings: "総収益",
    available: "利用可能",
    pending: "保留中",
    networkSize: "ネットワーク規模",
    readyWithdraw: "引き出し準備完了",
    clearsPeriod: "待機期間後に利用可能",
    activeMembers: "アクティブメンバー",
    smartDashboard: "スマートダッシュボード",
    transparencyTitle: "完全な透明性。\n隠し手数料なし。",
    transparencyDesc: "Moondalaは、あなたの紹介ツリー全体での購入からの手数料を追跡します。",
    transparencyList1: "レベルごとの収益を表示",
    transparencyList2: "手数料がいつ利用可能になるか確認",
    transparencyList3: "ネットワークの成長を監視",
    transparencyNote: "すべて自動的に計算され、明確に表示されます。"
  },
  pt: {
    enterBtn: "Enter Site",
    welcome: "Bem-vindo ao Moondala",
    subtitle: "Descubra uma nova forma de comprar e conectar",
    howItWorks: "Como funciona",
    benefitsTitle: "Por que participar do Moondala?",
    benefit1: "Ofertas e descontos exclusivos",
    benefit2: "Conecte-se diretamente com as lojas",
    benefit3: "Ganhe recompensas convidando amigos",
    cta: "Entrar",
    introText: "O Moondala conecta você diretamente a lojas únicas. Navegue pelos produtos, converse com vendedores e desfrute de uma experiência de compra segura e personalizada aos seus interesses.",
    networkTitle: "Construa Sua Rede de 5 Níveis",
    networkDesc: "Ganhe com seus convites diretos e a rede estendida deles.",
    level1: "Nível 1: Amigos Diretos",
    level2_5: "Níveis 2-5: Amigos de Amigos",
    dashboardTitle: "Acompanhe Seu Sucesso",
    dashboardDesc: "Veja seus ganhos e o crescimento da rede em tempo real.",
    shopTitle: "Um App. Todo o Seu Mundo Social.",
    shopSubtitle: "Ganhe, Compartilhe, Compre e Participe — tudo em um só lugar.",
    shopIntro: "O Moondala une seus amigos e suas lojas favoritas. É a primeira plataforma onde seu feed social e seu carrinho de compras vivem em perfeita harmonia. Siga amigos para ver o que eles estão comprando, descubra produtos em alta no Mall e aumente seus ganhos apenas sendo social.",
    pillar1Title: "🛒 Compre no Mall",
    pillar1Desc: "Explore milhares de lojas únicas. De alta moda a tecnologia, tudo o que você precisa está organizado e pronto para você.",
    pillar2Title: "📱 Participe dos Feeds",
    pillar2Desc: "É uma rede social! Poste atualizações, siga amigos e veja um feed ao vivo do que é tendência na sua comunidade.",
    pillar3Title: "🤝 Conecte-se com Amigos",
    pillar3Desc: "Fazer compras é melhor quando estamos juntos. Converse diretamente com os vendedores ou peça a opinião de seus amigos sobre os produtos antes de comprar.",
    pillar4Title: "💰 Compartilhe e Ganhe",
    pillar4Desc: "Sempre que você compartilha um produto que ama ou convida um novo amigo, você está construindo uma rede que te recompensa.",
    howItWorksNewTitle: "Como o Moondala funciona",
    howItWorksNewDesc: "Grandes plataformas lucram com cada pedido — você não ganha nada. O Moondala muda isso.\n\nEm vez de ficar com as taxas de transação, o Moondala as compartilha com os usuários por meio da árvore de referências.\n\nA vida é difícil e cara, então o Moondala ajuda você a transformar sua rede em renda extra.",
    earnMonthlyBadge: "Ganhe Mensalmente",
    shareYour: "Compartilhe Seu",
    referralCode: "CÓDIGO DE INDICAÇÃO",
    step1: "Amigos se cadastram com seu código",
    step2_pre: "Você ganha comissão de",
    step2_bold: "cada compra",
    welcomeBack: "Bem-vindo de volta,",
    trackCommissions: "Acompanhe suas comissões e rede.",
    shareLink: "Compartilhar Link",
    totalEarnings: "Ganhos Totais",
    available: "Disponível",
    pending: "Pendente",
    networkSize: "Tamanho da Rede",
    readyWithdraw: "Pronto para sacar",
    clearsPeriod: "Liberado após período de espera",
    activeMembers: "Membros ativos",
    smartDashboard: "Painel Inteligente",
    transparencyTitle: "Transparência Total.\nZero Taxas Ocultas.",
    transparencyDesc: "Moondala rastreia comissões de compras em toda sua árvore de indicações.",
    transparencyList1: "Ver ganhos por nível de indicação",
    transparencyList2: "Ver quando comissões estão prontas",
    transparencyList3: "Monitorar crescimento da rede",
    transparencyNote: "Tudo calculado automaticamente e exibido claramente."
  },
  ru: {
    enterBtn: "Enter Site",
    welcome: "Добро пожаловать в Moondala",
    subtitle: "Откройте для себя новый способ покупок и общения",
    howItWorks: "Как это работает",
    benefitsTitle: "Почему стоит присоединиться к Moondala?",
    benefit1: "Эксклюзивные предложения и скидки",
    benefit2: "Связывайтесь напрямую с магазинами",
    benefit3: "Получайте награды, приглашая друзей",
    cta: "Войти",
    introText: "Moondala связывает вас напрямую с уникальными магазинами. Просматривайте товары, общайтесь с продавцами и наслаждайтесь безопасным шопингом, адаптированным к вашим интересам.",
    networkTitle: "Создайте свою 5-уровневую сеть",
    networkDesc: "Зарабатывайте на прямых приглашениях и их расширенной сети.",
    level1: "Уровень 1: Прямые друзья",
    level2_5: "Уровни 2-5: Друзья друзей",
    dashboardTitle: "Отслеживайте свой успех",
    dashboardDesc: "Следите за своими доходами и ростом сети в реальном времени.",
    shopTitle: "Одно приложение. Весь ваш социальный мир.",
    shopSubtitle: "Зарабатывайте, делитесь, покупайте и общайтесь — все в одном месте.",
    shopIntro: "Moondala объединяет ваших друзей и ваши любимые магазины. Это первая платформа, где ваша социальная лента и корзина для покупок живут в идеальной гармонии. Следите за покупками друзей, открывайте трендовые товары в Моллле и увеличивайте свои доходы, просто общаясь.",
    pillar1Title: "🛒 Покупайте в Моллле",
    pillar1Desc: "Исследуйте тысячи уникальных магазинов. От высокой моды до технологий — все, что вам нужно, организовано и готово для вас.",
    pillar2Title: "📱 Участвуйте в лентах",
    pillar2Desc: "Это социальная сеть! Публикуйте обновления, подписывайтесь на друзей и смотрите прямую ленту того, что популярно в вашем сообществе.",
    pillar3Title: "🤝 Общайтесь с друзьями",
    pillar3Desc: "Покупать вместе веселее. Чат напрямую с продавцами или узнайте мнение друзей о товарах перед покупкой.",
    pillar4Title: "💰 Делитесь и зарабатывайте",
    pillar4Desc: "Каждый раз, когда вы делитесь понравившимся товаром или приглашаете нового друга, вы строите сеть, которая приносит вам доход.",
    howItWorksNewTitle: "Как работает Moondala",
    howItWorksNewDesc: "Крупные платформы получают прибыль с каждого заказа — вы не получаете ничего. Moondala меняет это.\n\nВместо того чтобы оставлять себе комиссию за транзакции, Moondala делится ею с пользователями через реферальное дерево.\n\nЖизнь сложна и дорога, поэтому Moondala помогает вам превратить вашу сеть в дополнительный доход.",
    earnMonthlyBadge: "Зарабатывайте Ежемесячно",
    shareYour: "Поделитесь Своим",
    referralCode: "РЕФЕРАЛЬНЫЙ КОД",
    step1: "Друзья регистрируются с вашим кодом",
    step2_pre: "Вы получаете комиссию с",
    step2_bold: "каждой покупки",
    welcomeBack: "С возвращением,",
    trackCommissions: "Отслеживайте комиссии и сеть.",
    shareLink: "Поделиться ссылкой",
    totalEarnings: "Всего заработано",
    available: "Доступно",
    pending: "В ожидании",
    networkSize: "Размер сети",
    readyWithdraw: "Готово к выводу",
    clearsPeriod: "Доступно после периода ожидания",
    activeMembers: "Активные участники",
    smartDashboard: "Умная панель",
    transparencyTitle: "Полная прозрачность.\nБез скрытых комиссий.",
    transparencyDesc: "Moondala отслеживает комиссии с покупок по всему вашему реферальному дереву.",
    transparencyList1: "Видеть доходы по уровням рефералов",
    transparencyList2: "Видеть, когда комиссии доступны",
    transparencyList3: "Отслеживать рост сети",
    transparencyNote: "Всё рассчитывается автоматически и отображается наглядно."
  },
  tr: {
    enterBtn: "Enter Site",
    welcome: "Moondala'ya Hoş Geldiniz",
    subtitle: "Alışveriş yapmanın ve bağlantı kurmanın yeni bir yolunu keşfedin",
    howItWorks: "Nasıl Çalışır",
    benefitsTitle: "Neden Moondala'ya Katılmalısınız?",
    benefit1: "Özel Fırsatlar ve İndirimler",
    benefit2: "Mağazalarla doğrudan bağlantı kurun",
    benefit3: "Arkadaşlarınızı davet ederek ödüller kazanın",
    cta: "Giriş Yap",
    introText: "Moondala, sizi doğrudan benzersiz mağazalarla buluşturur. Ürünlere göz atın, satıcılarla sohbet edin ve ilgi alanlarınıza göre uyarlanmış güvenli bir alışverişç deneyiminin keyfini çıkarın.",
    networkTitle: "5 Seviyeli Ağınızı Kurun",
    networkDesc: "Doğrudan davetlerinizden ve onların genişletilmiş ağından kazanın.",
    level1: "Seviye 1: Doğrudan Arkadaşlar",
    level2_5: "Seviye 2-5: Arkadaşların Arkadaşları",
    dashboardTitle: "Başarınızı Takip Edin",
    dashboardDesc: "Kazançlarınızı ve ağ büyümenizi gerçek zamanlı olarak görün.",
    shopTitle: "Tek Uygulama. Tüm Sosyal Dünyanız.",
    shopSubtitle: "Kazanın, Paylaşın, Alışveriş Yapın ve Katılın—hepsi bir arada.",
    shopIntro: "Moondala arkadaşlarınızı ve favori mağazalarınızı bir araya getirir. Sosyal akışınızın ve alışveriş sepetinizin mükemmel bir uyum içinde yaşadığı ilk platformdur. Arkadaşlarınızın ne aldığını takip edin, Mall'daki trend ürünleri keşfedin ve sadece sosyal olarak kazancınızı artırın.",
    pillar1Title: "🛒 Mall'da Alışveriş Yapın",
    pillar1Desc: "Binlerce benzersiz mağazayı keşfedin. Yüksek modadan teknolojiye, ihtiyacınız olan her şey düzenli ve sizin için hazır.",
    pillar2Title: "📱 Akışlara Katılın",
    pillar2Desc: "Bu bir sosyal ağ! Güncellemeler paylaşın, arkadaşlarınızı takip edin ve topluluğunuzda nelerin trend olduğuna dair canlı bir akış görün.",
    pillar3Title: "🤝 Arkadaşlarla Bağlantı Kurun",
    pillar3Desc: "Alışveriş birlikteyken daha güzeldir. Satıcılarla doğrudan sohbet edin veya satın almadan önce ürünler hakkında arkadaşlarınızın fikirlerini alın.",
    pillar4Title: "💰 Paylaşın ve Kazanın",
    pillar4Desc: "Sevdiğiniz bir ürünü her paylaştığınızda veya yeni bir arkadaşınızı davet ettiğinizde, size geri ödeme yapan bir ağ kurmuş olursunuz.",
    howItWorksNewTitle: "Moondala Nasıl Çalışır",
    howItWorksNewDesc: "Büyük platformlar her siparişten kâr eder — siz hiçbir şey almazsınız. Moondala bunu değiştiriyor.\n\nİşlem ücretlerini tutmak yerine, Moondala bunları referans ağacı aracılığıyla kullanıcılarla paylaşır.\n\nHayat zor ve pahalı, bu yüzden Moondala ağınızı ek gelire dönüştürmenize yardımcı olur.",
    earnMonthlyBadge: "Aylık Kazan",
    shareYour: "Sizinkini Paylaşın",
    referralCode: "REFERANS KODU",
    step1: "Arkadaşlarınız sizin kodunuzla kaydolur",
    step2_pre: "Komisyon kazanırsınız:",
    step2_bold: "her satın alma işleminden",
    welcomeBack: "Tekrar hoş geldiniz,",
    trackCommissions: "Komisyonlarınızı ve ağınızı takip edin.",
    shareLink: "Bağlantıyı Paylaş",
    totalEarnings: "Toplam Kazanç",
    available: "Kullanılabilir",
    pending: "Beklemede",
    networkSize: "Ağ Boyutu",
    readyWithdraw: "Çekilmeye Hazır",
    clearsPeriod: "Bekleme süresinden sonra",
    activeMembers: "Aktif Üyeler",
    smartDashboard: "Akıllı Panel",
    transparencyTitle: "Tam Şeffaflık.\nGizli Ücret Yok.",
    transparencyDesc: "Moondala, tüm referans ağacınızdaki satın alımlardan gelen komisyonları takip eder.",
    transparencyList1: "Referans seviyesine göre kazançları gör",
    transparencyList2: "Komisyonların ne zaman hazır olduğunu gör",
    transparencyList3: "Ağ büyümesini izle",
    transparencyNote: "Her şey otomatik olarak hesaplanır ve net bir şekilde görüntülenir."
  },
  ar: {
    enterBtn: "الدخول للموقع",
    welcome: "أهلاً وسهلاً بك في موندالا",
    subtitle: "اكتشف طريقة جديدة للتسوق والتواصل",
    howItWorks: "كيف يعمل؟",
    benefitsTitle: "لماذا تنضم إلى موندالا؟",
    benefit1: "عروض وخصومات حصرية",
    benefit2: "تواصل مباشرة مع المتاجر",
    benefit3: "اكسب مكافآت عبر دعوة الأصدقاء",
    cta: "تسجيل الدخول",
    introText: "موندالا يوصلك مباشرة بالمتاجر الفريدة. تصفح المنتجات، وتحدث مع البائعين، واستمتع بتجربة تسوق آمنة مصممة خصيصًا لاهتماماتك.",
    networkTitle: "ابني شبكتك المكونة من 5 مستويات",
    networkDesc: "اربح من دعواتك المباشرة وشبكتهم.",
    level1: "المستوى 1: الأصدقاء المباشرين",
    level2_5: "المستويات 2-5: أصدقاء الأصدقاء",
    dashboardTitle: "تتبع نجاحك",
    dashboardDesc: "شاهد أرباحك ونمو شبكتك في الوقت الفعلي.",
    shopTitle: "تطبيق واحد. عالمك الاجتماعي بالكامل.",
    shopSubtitle: "اكسب، شارك، تسوق، وتفاعل—كل ذلك في مكان واحد.",
    shopIntro: "موندالا يجمع أصدقاءك ومتاجرك المفضلة معًا. إنها المنصة الأولى حيث يعيش موجز الأخبار الاجتماعي وعربة التسوق في تناغم تام. تابع أصدقاءك لترى ما يشترونه، واكتشف المنتجات الرائجة في المول، وقم بزيادة أرباحك ببساطة من خلال التفاعل الاجتماعي.",
    pillar1Title: "🛒 تسوق في المول",
    pillar1Desc: "استكشف آلاف المتاجر الفريدة. من الأزياء الراقية إلى التكنولوجيا، كل ما تحتاجه منظم وجاهز من أجلك.",
    pillar2Title: "📱 تفاعل مع الموجز",
    pillar2Desc: "إنها شبكة اجتماعية! انشر التحديثات، وتابع الأصدقاء، وشاهد موجزًا حيًا لما هو رائج في مجتمعك.",
    pillar3Title: "🤝 تواصل مع الأصدقاء",
    pillar3Desc: "التسوق يكون أفضل عندما نكون معًا. دردش مباشرة مع البائعين أو احصل على آراء أصدقائك حول المنتجات قبل الشراء.",
    pillar4Title: "💰 شارك واكسب",
    pillar4Desc: "في كل مرة تشارك فيها منتجًا تحبه أو تدعو صديقًا جديدًا، فإنك تبني شبكة تكافئك ماديًا.",
    howItWorksNewTitle: "كيف تعمل موندالا",
    howItWorksNewDesc: "المنصات الكبرى تربح من كل طلب — وأنت لا تحصل على شيء. موندالا تغير ذلك.\n\nبدلاً من الاحتفاظ برسوم المعاملات، تشاركها موندالا مع المستخدمين من خلال شجرة الإحالة.\n\nالحياة صعبة ومكلفة، لذا تساعدك موندالا على تحويل شبكتك إلى دخل إضافي.",
    earnMonthlyBadge: "اربح شهرياً",
    shareYour: "شارك",
    referralCode: "رمز الدعوة",
    step1: "يسجل الأصدقاء باستخدام رمزك",
    step2_pre: "تكسب عمولة من",
    step2_bold: "كل عملية شراء",
    welcomeBack: "مرحباً بعودتك،",
    trackCommissions: "تتبع عمولاتك ونمو شبكتك.",
    shareLink: "شارك الرابط",
    totalEarnings: "إجمالي الأرباح",
    available: "متاح",
    pending: "قيد الانتظار",
    networkSize: "حجم الشبكة",
    readyWithdraw: "جاهز للسحب",
    clearsPeriod: "يتحرر بعد فترة الحجز",
    activeMembers: "أعضاء نشطين",
    smartDashboard: "لوحة تحكم ذكية",
    transparencyTitle: "شفافية كاملة.\nصفر رسوم خفية.",
    transparencyDesc: "تتتبع Moondala العمولات من المشتريات التي تتم عبر شجرة الإحالة الخاصة بك - ليس فقط الأصدقاء المباشرين.",
    transparencyList1: "عرض الأرباح حسب مستوى الإحالة",
    transparencyList2: "معرفة متى تكون العمولات معلقة أو جاهزة للسحب",
    transparencyList3: "مراقبة نمو شبكتك بمرور الوقت",
    transparencyNote: "يتم احتساب كل شيء تلقائياً وعرضه بوضوح في لوحة التحكم الخاصة بك."
  },
  de: {
    enterBtn: "Enter Site",
    welcome: "Willkommen bei Moondala",
    subtitle: "Entdecken Sie eine neue Art des Einkaufens und Verbindens",
    howItWorks: "So funktioniert's",
    benefitsTitle: "Warum Moondala beitreten?",
    benefit1: "Exklusive Angebote & Rabatte",
    benefit2: "Verbinden Sie sich direkt mit Geschäften",
    benefit3: "Verdienen Sie Belohnungen, indem Sie Freunde einladen",
    cta: "Anmelden",
    introText: "Moondala verbindet Sie direkt mit einzigartigen Geschäften. Durchsuchen Sie Produkte, chatten Sie mit Verkäufern und genießen Sie ein sicheres Einkaufserlebnis, das auf Ihre Interessen zugeschnitten ist.",
    networkTitle: "Bauen Sie Ihr 5-Ebenen-Netzwerk auf",
    networkDesc: "Verdienen Sie an Ihren direkten Einladungen und deren erweitertem Netzwerk.",
    level1: "Ebene 1: Direkte Freunde",
    level2_5: "Ebenen 2-5: Freunde von Freunden",
    dashboardTitle: "Verfolgen Sie Ihren Erfolg",
    dashboardDesc: "Sehen Sie Ihre Einnahmen und das Netzwerkwachstum in Echtzeit.",
    shopTitle: "Eine App. Deine ganze soziale Welt.",
    shopSubtitle: "Verdienen, Teilen, Shoppen und Mitmachen – alles an einem Ort.",
    shopIntro: "Moondala bringt deine Freunde und deine Lieblingsshops zusammen. Es ist die erste Plattform, auf der dein sozialer Feed und dein Warenkorb in perfekter Harmonie zusammenleben. Folge Freunden, um zu sehen, was sie kaufen, entdecke Trendprodukte in der Mall und steigere deine Einnahmen, indem du einfach sozial bist.",
    pillar1Title: "🛒 Shoppe in der Mall",
    pillar1Desc: "Entdecke Tausende von einzigartigen Shops. Von High-Fashion bis Technik – alles, was du brauchst, ist organisiert und bereit für dich.",
    pillar2Title: "📱 Interagiere in Feeds",
    pillar2Desc: "Es ist ein soziales Netzwerk! Poste Updates, folge Freunden und sieh dir einen Live-Feed darüber an, was in deiner Community im Trend liegt.",
    pillar3Title: "🤝 Verbinde dich mit Freunden",
    pillar3Desc: "Gemeinsam shoppen ist besser. Chatte direkt mit Verkäufern oder hole dir die Meinung deiner Freunde zu Produkten ein, bevor du kaufst.",
    pillar4Title: "💰 Teilen und Verdienen",
    pillar4Desc: "Jedes Mal, wenn du ein Produkt teilst, das du liebst, oder einen neuen Freund einlädst, baust du ein Netzwerk auf, das sich für dich auszahlt.",
    howItWorksNewTitle: "Wie Moondala funktioniert",
    howItWorksNewDesc: "Große Plattformen profitieren von jeder Bestellung – Sie bekommen nichts. Moondala ändert das.\n\nAnstatt die Transaktionsgebühren zu behalten, teilt Moondala sie über den Empfehlungsbaum mit den Benutzern.\n\nDas Leben ist hart und teuer, deshalb hilft Ihnen Moondala, Ihr Netzwerk in zusätzliches Einkommen zu verwandeln.",
    earnMonthlyBadge: "Monatlich Verdienen",
    shareYour: "Teile Deinen",
    referralCode: "EMPFEHLUNGSCODE",
    step1: "Freunde melden sich mit deinem Code an",
    step2_pre: "Du verdienst Provision an",
    step2_bold: "jedem Kauf",
    welcomeBack: "Willkommen zurück,",
    trackCommissions: "Verfolge deine Provisionen und dein Netzwerk.",
    shareLink: "Link teilen",
    totalEarnings: "Gesamtverdienst",
    available: "Verfügbar",
    pending: "Ausstehend",
    networkSize: "Netzwerkgröße",
    readyWithdraw: "Bereit zur Auszahlung",
    clearsPeriod: "Verfügbar nach Haltefrist",
    activeMembers: "Aktive Mitglieder",
    smartDashboard: "Smartes Dashboard",
    transparencyTitle: "Vollständige Transparenz.\nNull versteckte Gebühren.",
    transparencyDesc: "Moondala verfolgt Provisionen von Käufen über deinen gesamten Empfehlungsbaum – nicht nur direkte Freunde.",
    transparencyList1: "Einnahmen nach Empfehlungsstufe anzeigen",
    transparencyList2: "Sehen, wann Provisionen verfügbar sind",
    transparencyList3: "Netzwerkwachstum im Zeitverlauf überwachen",
    transparencyNote: "Alles wird automatisch berechnet und klar im Dashboard angezeigt."
  },
  fr: {
    enterBtn: "Entrer sur le site",
    welcome: "Bienvenue sur Moondala",
    subtitle: "Découvrez une nouvelle façon d'acheter et de se connecter",
    howItWorks: "Comment ça marche",
    benefitsTitle: "Pourquoi rejoindre Moondala ?",
    benefit1: "Offres et réductions exclusives",
    benefit2: "Connectez-vous directement avec les boutiques",
    benefit3: "Gagnez des récompenses en invitant des amis",
    cta: "Se connecter",
    introText: "Moondala vous connecte directement avec des boutiques uniques. Parcourez les produits, discutez avec les vendeurs et profitez d'une expérience d'achat sécurisée et adaptée à vos intérêts.",
    networkTitle: "Construisez votre réseau à 5 niveaux",
    networkDesc: "Gagnez grâce à vos invitations directes et leur réseau.",
    level1: "Niveau 1 : Amis directs",
    level2_5: "Niveaux 2-5 : Amis d'amis",
    dashboardTitle: "Suivez votre succès",
    dashboardDesc: "Visualisez vos gains et la croissance de votre réseau en temps réel.",
    shopTitle: "Une seule application. Tout votre monde social.",
    shopSubtitle: "Gagnez, partagez, achetez et participez — le tout en un seul endroit.",
    shopIntro: "Moondala réunit vos amis et vos boutiques préférées. C'est la première plateforme où votre flux social et votre panier d'achat cohabitent en parfaite harmonie. Suivez vos amis pour voir ce qu'ils achètent, découvrez les produits tendance dans le Mall et augmentez vos revenus simplement en étant social.",
    pillar1Title: "🛒 Achetez dans le Mall",
    pillar1Desc: "Explorez des milliers de boutiques uniques. De la haute couture à la technologie, tout ce dont vous avez besoin est organisé et prêt pour vous.",
    pillar2Title: "📱 Participez aux flux",
    pillar2Desc: "C'est un réseau social ! Publiez des mises à jour, suivez des amis et voyez un flux en direct de ce qui est tendance dans votre communauté.",
    pillar3Title: "🤝 Connectez-vous avec des amis",
    pillar3Desc: "Faire du shopping est plus agréable quand on est ensemble. Discutez directement avec les vendeurs ou demandez l'avis de vos amis sur les produits avant d'acheter.",
    pillar4Title: "💰 Partagez et gagnez",
    pillar4Desc: "Chaque fois que vous partagez un produit que vous aimez ou que vous invitez un nouvel ami, vous construisez un réseau qui vous récompense.",
    howItWorksNewTitle: "Comment fonctionne Moondala",
    howItWorksNewDesc: "Les grandes plateformes profitent de chaque commande — vous n'obtenez rien. Moondala change cela.\n\nAu lieu de garder les frais de transaction, Moondala les partage avec les utilisateurs via l'arbre de parrainage.\n\nLa vie est dure et chère, alors Moondala vous aide à transformer votre réseau en revenu supplémentaire.",
    earnMonthlyBadge: "Gagnez Mensuellement",
    shareYour: "Partagez Votre",
    referralCode: "CODE DE PARRAINAGE",
    step1: "Les amis s'inscrivent avec votre code",
    step2_pre: "Vous gagnez de la commission sur",
    step2_bold: "chaque achat",
    welcomeBack: "Bon retour,",
    trackCommissions: "Suivez vos commissions et votre réseau.",
    shareLink: "Partager Lien",
    totalEarnings: "Gains Totaux",
    available: "Disponible",
    pending: "En attente",
    networkSize: "Taille du Réseau",
    readyWithdraw: "Prêt à retirer",
    clearsPeriod: "Disponible après période",
    activeMembers: "Membres actifs",
    smartDashboard: "Tableau de Bord",
    transparencyTitle: "Transparence Totale.\nZéro Frais Cachés.",
    transparencyDesc: "Moondala suit les commissions des achats effectués dans tout votre arbre de parrainage.",
    transparencyList1: "Voir les gains par niveau",
    transparencyList2: "Voir quand les fonds sont disponibles",
    transparencyList3: "Suivre la croissance du réseau",
    transparencyNote: "Tout est calculé automatiquement et affiché clairement."
  },
  hi: {
    enterBtn: "Enter Site",
    welcome: "Moondala में आपका स्वागत है",
    subtitle: "खरीदारी और जुड़ने का एक नया तरीका खोजें",
    howItWorks: "यह कैसे काम करता है",
    benefitsTitle: "Moondala में क्यों शामिल हों?",
    benefit1: "विशिष्ट सौदे और छूट",
    benefit2: "दुकानों से सीधे जुड़ें",
    benefit3: "दोस्तों को आमंत्रित करके पुरस्कार अर्जित करें",
    cta: "साइन इन करें",
    introText: "Moondala आपको सीधे अनूठी दुकानों से जोड़ता है। उत्पाद ब्राउज़ करें, विक्रेताओं के साथ चैट करें, और अपनी रुचियों के अनुरूप सुरक्षित खरीदारी अनुभव का आनंद लें.",
    networkTitle: "अपना 5-स्तरीय नेटवर्क बनाएं",
    networkDesc: "अपने सीधे आमंत्रणों और उनके विस्तारित नेटवर्क से कमाएं।",
    level1: "स्तर 1: सीधे मित्र",
    level2_5: "स्तर 2-5: मित्रों के मित्र",
    dashboardTitle: "अपनी सफलता को ट्रैक करें",
    dashboardDesc: "अपनी कमाई और नेटवर्क वृद्धि को वास्तविक समय में देखें।",
    shopTitle: "एक ऐप। आपकी पूरी सामाजिक दुनिया।",
    shopSubtitle: "कमाएं, साझा करें, खरीदारी करें और जुड़ें—सब कुछ एक ही स्थान पर।",
    shopIntro: "Moondala आपके दोस्तों और आपके पसंदीदा स्टोर को एक साथ लाता है। यह पहला मंच है जहां आपकी सोशल फीड और आपका शॉपिंग कार्ट पूर्ण सद्भाव में एक साथ रहते हैं। दोस्तों को फॉलो करें कि वे क्या खरीद रहे हैं, मॉल में ट्रेंडिंग उत्पादों की खोज करें, और बस सामाजिक बनकर अपनी कमाई बढ़ाएं।",
    pillar1Title: "🛒 मॉल में खरीदारी करें",
    pillar1Desc: "हजारों अनूठे स्टोरों का अन्वेषण करें। हाई-फैशन से लेकर तकनीक तक, आपकी ज़रूरत की हर चीज़ व्यवस्थित और आपके लिए तैयार है।",
    pillar2Title: "📱 फीड में शामिल हों",
    pillar2Desc: "यह एक सोशल नेटवर्क है! अपडेट पोस्ट करें, दोस्तों को फॉलो करें, और आपके समुदाय में क्या ट्रेंड कर रहा है, इसकी लाइव फीड देखें।",
    pillar3Title: "🤝 दोस्तों से जुड़ें",
    pillar3Desc: "साथ मिलकर खरीदारी करना बेहतर होता है। विक्रेताओं के साथ सीधे चैट करें या खरीदने से पहले उत्पादों पर अपने दोस्तों की राय लें।",
    pillar4Title: "💰 साझा करें और कमाएं",
    pillar4Desc: "जब भी आप अपनी पसंद का उत्पाद साझा करते हैं या किसी नए मित्र को आमंत्रित करते हैं, तो आप एक ऐसा नेटवर्क बना रहे होते हैं जो आपको भुगतान करता है।",
    howItWorksNewTitle: "Moondala कैसे काम करता है",
    howItWorksNewDesc: "बड़े प्लेटफॉर्म हर ऑर्डर से मुनाफा कमाते हैं — आपको कुछ नहीं मिलता। Moondala इसे बदलता है।\n\nलेनदेन शुल्क रखने के बजाय, Moondala उन्हें रेफरल ट्री के माध्यम से उपयोगकर्ताओं के साथ साझा करता है।\n\nजीवन कठिन और महंगा है, इसलिए Moondala आपके नेटवर्क को अतिरिक्त आय में बदलने में आपकी मदद करता है.",
    earnMonthlyBadge: "मासिक कमाएं",
    shareYour: "साझा करें",
    referralCode: "रेफरल कोड",
    step1: "मित्र आपके कोड का उपयोग करके साइन अप करते हैं",
    step2_pre: "आप कमीशन कमाते हैं",
    step2_bold: "हर खरीदारी से",
    welcomeBack: "वापसी पर स्वागत है,",
    trackCommissions: "अपने कमीशन और नेटवर्क को ट्रैक करें।",
    shareLink: "लिंक साझा करें",
    totalEarnings: "कुल कमाई",
    available: "उपलब्ध",
    pending: "लंबित",
    networkSize: "नेटवर्क आकार",
    readyWithdraw: "निकासी के लिए तैयार",
    clearsPeriod: "होल्ड अवधि के बाद मिलता है",
    activeMembers: "सक्रिय सदस्य",
    smartDashboard: "स्मार्ट डैशबोर्ड",
    transparencyTitle: "पूर्ण पारदर्शिता।\nशून्य छिपी हुई फीस।",
    transparencyDesc: "Moondala आपके पूरे रेफरल ट्री में की गई खरीदारी से कमीशन ट्रैक करता है।",
    transparencyList1: "स्तर द्वारा कमाई देखें",
    transparencyList2: "कमीशन की स्थिति देखें",
    transparencyList3: "नेटवर्क विकास की निगरानी करें",
    transparencyNote: "सब कुछ स्वचालित रूप से गणना और प्रदर्शित किया जाता है।"
  },
  it: {
    enterBtn: "Enter Site",
    welcome: "Benvenuto su Moondala",
    subtitle: "Scopri un nuovo modo di fare acquisti e connetterti",
    howItWorks: "Come funziona",
    benefitsTitle: "Perché unirsi a Moondala?",
    benefit1: "Offerte e sconti esclusivi",
    benefit2: "Connettiti direttamente con i negozi",
    benefit3: "Guadagna premi invitando amici",
    cta: "Accedi",
    introText: "Moondala ti connette direttamente con negozi unici. Sfoglia i prodotti, chatta con i venditori e goditi un'esperienza di acquisto sicura su misura per i tuoi interessi.",
    networkTitle: "Costruisci la tua rete a 5 livelli",
    networkDesc: "Guadagna dai tuoi inviti diretti e dalla loro rete estesa.",
    level1: "Livello 1: Amici diretti",
    level2_5: "Livelli 2-5: Amici di amici",
    dashboardTitle: "Monitora il tuo successo",
    dashboardDesc: "Visualizza i tuoi guadagni e la crescita della rete in tempo reale.",
    shopTitle: "Un'App. Tutto il tuo mondo social.",
    shopSubtitle: "Guadagna, condividi, acquista e partecipa: tutto in un unico posto.",
    shopIntro: "Moondala unisce i tuoi amici e i tuoi negozi preferiti. È la prima piattaforma in cui il tuo feed social e il tuo carrello convivono in perfetta armonia. Segui gli amici per vedere cosa acquistano, scopri i prodotti di tendenza nel Mall e aumenta i tuoi guadagni semplicemente essendo social.",
    pillar1Title: "🛒 Fai acquisti nel Mall",
    pillar1Desc: "Esplora migliaia di negozi unici. Dall'alta moda alla tecnologia, tutto ciò di cui hai bisogno è organizzato e pronto per te.",
    pillar2Title: "📱 Partecipa ai Feed",
    pillar2Desc: "È un social network! Pubblica aggiornamenti, segui gli amici e guarda un feed in diretta di ciò che è di tendenza nella tua comunità.",
    pillar3Title: "🤝 Connettiti con gli amici",
    pillar3Desc: "Fare acquisti è meglio quando si è insieme. Chatta direttamente con i venditori o chiedi il parere dei tuoi amici sui prodotti prima di acquistarli.",
    pillar4Title: "💰 Condividi e guadagna",
    pillar4Desc: "Ogni volta che condividi un prodotto che ami o inviti un nuovo amico, costruisci una rete che ti ripaga.",
    howItWorksNewTitle: "Come funziona Moondala",
    howItWorksNewDesc: "Le grandi piattaforme traggono profitto da ogni ordine — tu non ottieni nulla. Moondala cambia tutto questo.\n\nInvece di trattenere le commissioni di transazione, Moondala le condivide con gli utenti attraverso l'albero dei riferimenti.\n\nLa vita è dura e costosa, quindi Moondala ti aiuta a trasformare la tua rete in entrate extra.",
    earnMonthlyBadge: "Guadagna Mensilmente",
    shareYour: "Condividi Il Tuo",
    referralCode: "CODICE INVITO",
    step1: "Gli amici si iscrivono col tuo codice",
    step2_pre: "Guadagni commissioni su",
    step2_bold: "ogni acquisto",
    welcomeBack: "Bentornato,",
    trackCommissions: "Traccia le tue commissioni e la rete.",
    shareLink: "Condividi Link",
    totalEarnings: "Guadagni Totali",
    available: "Disponibile",
    pending: "In attesa",
    networkSize: "Dimensione Rete",
    readyWithdraw: "Pronto al prelievo",
    clearsPeriod: "Disponibile dopo il periodo",
    activeMembers: "Membri attivi",
    smartDashboard: "Dashboard Intelligente",
    transparencyTitle: "Trasparenza Totale.\nZero Commissioni Nascoste.",
    transparencyDesc: "Moondala traccia le commissioni dagli acquisti fatti nel tuo albero di riferimenti.",
    transparencyList1: "Vedi guadagni per livello",
    transparencyList2: "Vedi quando le commissioni sono pronte",
    transparencyList3: "Monitora la crescita della rete",
    transparencyNote: "Tutto calcolato automaticamente e mostrato chiaramente."
  },
  zh: {
    enterBtn: "Enter Site",
    welcome: "欢迎来到 Moondala",
    subtitle: "发现全新的购物和社交方式",
    howItWorks: "运作方式",
    benefitsTitle: "为何加入 Moondala？",
    benefit1: "独家优惠和折扣",
    benefit2: "直接与商店联系",
    benefit3: "邀请好友赚取奖励",
    cta: "登录",
    introText: "Moondala 将您与独特的商店直接联系起来。浏览产品，与卖家聊天，享受为您量身定制的安全购物体验。",
    networkTitle: "建立您的5级网络",
    networkDesc: "通过您的直接邀请及其扩展网络赚取收益。",
    level1: "第1级：直接好友",
    level2_5: "第2-5级：好友的好友",
    dashboardTitle: "追踪您的成功",
    dashboardDesc: "实时查看您的收入和网络增长。",
    shopTitle: "一个应用。您的整个社交世界。",
    shopSubtitle: "赚取、分享、购物、参与——尽在一处。",
    shopIntro: "Moondala 将您的朋友和您最喜爱的商店汇集在一起。这是第一个社交动态和购物车完美融合的平台。关注朋友看他们在买什么，发现商城里的趋势产品，只需社交即可增加收入。",
    pillar1Title: "🛒 在商城购物",
    pillar1Desc: "探索成千上万家独特的商店。从高端时尚到科技产品，您需要的一切都已为您准备就绪。",
    pillar2Title: "📱 参与动态",
    pillar2Desc: "这是一个社交网络！发布动态，关注朋友，并实时查看社区中的热门趋势。",
    pillar3Title: "🤝 与朋友联系",
    pillar3Desc: "一起购物更快乐。直接与卖家沟通，或者在购买前听取朋友对产品的意见。",
    pillar4Title: "💰 分享并赚取",
    pillar4Desc: "每当您分享自己喜欢的产品或邀请新朋友时，您都在构建一个为您带来回报的网络。",
    howItWorksNewTitle: "Moondala 如何运作",
    howItWorksNewDesc: "大平台从每笔订单中获利——而你什么也得不到。Moondala 改变了这一点。\n\nMoondala 不保留交易费，而是通过推荐树与用户分享。\n\n生活艰难且昂贵，所以 Moondala 帮助你将人脉转化为额外收入。",
    earnMonthlyBadge: "每月赚取",
    shareYour: "分享您的",
    referralCode: "推荐代码",
    step1: "朋友使用您的代码注册",
    step2_pre: "您将赚取佣金，来自",
    step2_bold: "每一笔购买",
    welcomeBack: "欢迎回来，",
    trackCommissions: "追踪您的佣金和网络。",
    shareLink: "分享链接",
    totalEarnings: "总收入",
    available: "可用",
    pending: "待处理",
    networkSize: "网络规模",
    readyWithdraw: "可提现",
    clearsPeriod: "持有期后可用",
    activeMembers: "活跃成员",
    smartDashboard: "智能仪表盘",
    transparencyTitle: "完全透明。\n零隐藏费用。",
    transparencyDesc: "Moondala 追踪您整个推荐树中购买产生的佣金。",
    transparencyList1: "查看按推荐层级的收入",
    transparencyList2: "查看佣金何时可用",
    transparencyList3: "监控网络增长",
    transparencyNote: "一切都会自动计算并清楚显示。"
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });

  // Theme handler
  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
      const html = document.documentElement;
      html.setAttribute("data-theme", newTheme);
      html.style.colorScheme = newTheme;
      if (newTheme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    } catch {}
  }

  // Apply theme on mount
  useEffect(() => {
    handleThemeChange(theme);
  }, []);

  // Persist language choice and handle direction
  useEffect(() => {
    try {
      localStorage.setItem('userLanguage', selectedLang);
      i18n.changeLanguage(selectedLang);
      document.documentElement.dir = ['ar', 'ur'].includes(selectedLang) ? 'rtl' : 'ltr';
      document.documentElement.lang = selectedLang;
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }, [selectedLang, i18n]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY || 0);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRegister = () => {
    navigate(`/login?lang=${selectedLang}`);
  };

  const currentLangCode = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) ? selectedLang : 'en';
  // Merge selected language with English to ensure all keys exist (fallback)
  const t = { ...CONTENT['en'], ...(CONTENT[currentLangCode] || {}) };

  // MAIN CONTENT (Direct Landing)
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* Sticky Header with Language Selector */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top relative overflow-hidden">
        <img
          src="/moondala-logo.png"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 w-40 md:w-52 opacity-[0.08] pointer-events-none select-none"
          style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.04}px)` }}
        />
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-tight text-2xl">Moondala</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="#how-it-works"
              className="hidden md:inline-flex text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.howItWorksNewTitle || t.howItWorks}
            </a>
            {/* Theme Toggle */}
            <button
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground/80" />
              ) : (
                <Sun className="w-5 h-5 text-foreground/80" />
              )}
            </button>
            {/* Language Dropdown */}
            <div className="relative group hidden sm:block">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-sm font-medium text-muted-foreground border border-border/50 rounded-lg px-2 py-1 focus:ring-1 focus:ring-purple-500 cursor-pointer hover:bg-secondary/20 transition-colors appearance-none pr-8"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
               <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[10px]">▼</span>
            </div>

            <button
               onClick={handleRegister}
               className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all"
            >
               {t.cta}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="w-full relative overflow-hidden py-16 md:py-24 px-6">
          {/* Background Glows */}
          <div className="absolute -top-24 left-1/3 w-[32rem] h-[32rem] bg-purple-500/15 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-24 right-1/3 w-[32rem] h-[32rem] bg-indigo-500/15 rounded-full blur-3xl -z-10"></div>
          {/* Hero Background Logo (near headline) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10">
             <img
               src="/moondala-logo.png"
               alt=""
               aria-hidden="true"
               className="w-[40rem] sm:w-[50rem] md:w-[60rem] opacity-[0.03] dark:opacity-[0.05] select-none mt-8 md:mt-12"
               style={{ transform: `translateY(${scrollY * 0.05}px)` }}
             />
          </div>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
            
            <div className="space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Moondala
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight tracking-tight">
                {t.welcome}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-bold leading-snug">
                {t.subtitle}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                {t.introText}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <button
                  onClick={handleRegister}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all"
                >
                  {t.cta}
                </button>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center lg:items-end z-10 w-full perspective-1000">
               {/* Glow effect behind the card */}
               <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 blur-3xl rounded-full transform scale-90 -z-10 translate-y-4"></div>
               
               <div className="bg-card/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md transform transition-all hover:translate-y-[-4px] hover:shadow-purple-500/30 overflow-hidden relative">
                  
                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50 z-0 pointer-events-none"></div>

                  <div className="relative z-10 flex items-start justify-between mb-8">
                     <div className="p-3 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                     </div>
                     <span className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 text-yellow-300 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.3)] backdrop-blur-md animate-pulse">
                        {t.earnMonthlyBadge}
                     </span>
                  </div>
                  
                  <div className="relative z-10 space-y-2 mb-8">
                     <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                        {t.shareYour}
                     </h3>
                     <h2 className="text-4xl font-black text-foreground leading-none pb-1 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">{t.referralCode}</span>
                     </h2>
                  </div>

                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-5 group">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center font-bold text-sm text-foreground group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 transition-all duration-300 shadow-sm">1</div>
                        <p className="font-medium text-muted-foreground text-sm md:text-base leading-snug group-hover:text-foreground transition-colors">
                           {t.step1}
                        </p>
                     </div>
                     <div className="flex items-center gap-5 group">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center font-bold text-sm text-foreground group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-500 transition-all duration-300 shadow-sm">2</div>
                        <p className="font-medium text-muted-foreground text-sm md:text-base leading-snug group-hover:text-foreground transition-colors">
                           {t.step2_pre} <span className="text-foreground font-bold underline decoration-purple-500 decoration-2 underline-offset-2">{t.step2_bold}</span>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        {/* FEATURE: HOW MOONDALA WORKS */}
        <section id="how-it-works" className="w-full bg-secondary/10 py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
             <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                <img 
                  src="/images/moondala-network-levels.png" 
                  alt="Network Levels" 
                  className="relative w-full h-auto object-contain rounded-xl shadow-2xl border border-border/50 bg-card cursor-pointer"
                  onClick={() => setLightboxImg('/images/moondala-network-levels.png')}
                />
             </div>
             <div>
                <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-bold text-xs uppercase tracking-widest">
                  Revolutionary Model
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6 tracking-tight">
                   {t.howItWorksNewTitle || t.howItWorks}
                </h2>
                <div className="prose dark:prose-invert">
                  <p className="text-base sm:text-lg text-muted-foreground whitespace-pre-line leading-relaxed font-normal">
                    {t.howItWorksNewDesc || "Big platforms profit from every order — you get nothing. Moondala changes that.\n\nInstead of keeping the transaction fees, Moondala shares them with users through the referral tree.\n\nLife is hard and expensive, so Moondala helps you turn your network into extra income."}
                  </p>
                </div>
             </div>
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>

        {/* FEATURE: REFERRAL TREE */}
        <section className="w-full py-20 px-6 bg-background/80">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest">
                {t.howItWorks}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {t.networkTitle}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground font-normal">
                {t.networkDesc}
              </p>
              
              <div className="grid gap-4 pt-4">
                <div className="flex items-center gap-5 bg-card p-5 rounded-2xl shadow-sm border border-border hover:border-purple-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-600 text-xl font-bold">1</div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">{t.level1}</h3>
                    <p className="text-sm text-muted-foreground">Direct Invite Earnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 bg-card p-5 rounded-2xl shadow-sm border border-border hover:border-indigo-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-xl font-bold">5</div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">{t.level2_5}</h3>
                    <p className="text-sm text-muted-foreground">Extended Network Earnings</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2 flex md:justify-end">
              <div className="bg-gradient-to-br from-card to-secondary/30 p-4 rounded-3xl shadow-2xl border border-border/40 w-full max-w-xl ml-auto">
                <img 
                  src="/images/referral-tree.png" 
                  alt="Referral Tree Structure" 
                  className="w-full rounded-2xl cursor-pointer"
                  onClick={() => setLightboxImg('/images/referral-tree.png')}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>

        {/* FEATURE: TRACK COMMISSIONS (DASHBOARD) */}
        <section className="w-full py-24 px-6 bg-background relative overflow-hidden">
           {/* Background decorative elements */}
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

           <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                 {/* Dashboard UI Mockup */}
                 <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-xl mx-auto lg:ml-0 transform transition-transform hover:scale-[1.01] duration-500 relative z-10">
                    <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
                       <div>
                          <h3 className="text-xl sm:text-2xl font-black text-foreground">{t.welcomeBack}</h3>
                          <p className="text-sm text-muted-foreground">{t.trackCommissions}</p>
                       </div>
                       <div className="bg-secondary/50 px-3 py-1.5 rounded-lg border border-border flex items-center gap-2 text-xs font-mono text-muted-foreground hidden sm:flex">
                          <span>{t.shareLink}</span>
                          <span className="font-bold text-foreground">NTB8N478XD</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {/* Card 1: Total Earnings */}
                       <div className="bg-[#E9D5FF] dark:bg-purple-900/30 p-4 rounded-xl hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-white dark:bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-sm mb-3">
                             <span className="font-bold text-lg">$</span>
                          </div>
                          <div className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">{t.totalEarnings}</div>
                          <div className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-white">$20.84</div>
                       </div>

                       {/* Card 2: Available */}
                       <div className="bg-[#bbf7d0] dark:bg-green-900/30 p-4 rounded-xl hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-white dark:bg-green-500/20 rounded-lg flex items-center justify-center text-green-700 dark:text-green-300 shadow-sm mb-3">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          </div>
                          <div className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">{t.available}</div>
                          <div className="text-2xl sm:text-3xl font-black text-green-950 dark:text-white mb-1">$0.00</div>
                          <div className="text-[10px] font-medium text-green-800/80 dark:text-green-200/70">{t.readyWithdraw}</div>
                       </div>

                       {/* Card 3: Pending */}
                       <div className="bg-[#fef08a] dark:bg-yellow-900/30 p-4 rounded-xl hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-white dark:bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-700 dark:text-yellow-300 shadow-sm mb-3">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          </div>
                          <div className="text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide mb-1">{t.pending}</div>
                          <div className="text-2xl sm:text-3xl font-black text-yellow-950 dark:text-white mb-1">$0.00</div>
                          <div className="text-[10px] font-medium text-yellow-800/80 dark:text-yellow-200/70">{t.clearsPeriod}</div>
                       </div>

                       {/* Card 4: Network Size */}
                       <div className="bg-[#a5f3fc] dark:bg-cyan-900/30 p-4 rounded-xl hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-white dark:bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-700 dark:text-cyan-300 shadow-sm mb-3">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                          <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-1">{t.networkSize}</div>
                          <div className="text-2xl sm:text-3xl font-black text-cyan-950 dark:text-white mb-1">13</div>
                          <div className="text-[10px] font-medium text-cyan-800/80 dark:text-cyan-200/70">{t.activeMembers}</div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Decorative blob behind mock */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl rounded-full -z-10"></div>
              </div>

              <div className="order-1 lg:order-2 space-y-8 text-center lg:text-left">
                  <div>
                     <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        {t.smartDashboard}
                     </span>
                     <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                        {t.transparencyTitle ? t.transparencyTitle.split('\n')[0] : "Complete Transparency."}<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t.transparencyTitle ? t.transparencyTitle.split('\n')[1] : "Zero Hidden Fees."}</span>
                     </h2>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                     {t.transparencyDesc}
                  </p>

                  <ul className="space-y-4 inline-block text-left">
                     {[
                        t.transparencyList1,
                        t.transparencyList2,
                        t.transparencyList3
                     ].filter(Boolean).map((item, i) => (
                        <li key={i} className="flex items-center gap-4">
                           <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                 <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                           </div>
                           <span className="text-foreground/90 font-medium">{item}</span>
                        </li>
                     ))}
                  </ul>

                  <div className="pt-2">
                     <p className="text-sm font-medium text-muted-foreground border-l-4 border-blue-500/30 pl-4">
                        {t.transparencyNote}
                     </p>
                  </div>
              </div>
           </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>

        {/* FEED & SHOP SECTION */}
          <section className="w-full bg-secondary/10 py-24 px-6 overflow-hidden relative">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16 space-y-4">
               <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-widest">
                  {t.shopSubtitle}
               </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
                  {t.shopTitle}
               </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal">
                  {t.shopIntro}
               </p>
            </div>

            <div className="flex flex-col items-center gap-10 mb-16">
              <div className="relative mx-auto max-w-2xl w-full">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 rounded-full blur-3xl -z-10"></div>
                  <img 
                      src="/images/shop-preview.png.png" 
                      alt="App UI" 
                      className="w-full h-auto rounded-[2.5rem] shadow-2xl border-4 border-background"
                      onClick={() => setLightboxImg('/images/shop-preview.png.png')}
                    />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 w-full max-w-3xl">
                {[
                  { title: t.pillar1Title, desc: t.pillar1Desc, icon: "🛒", color: "bg-blue-500" },
                  { title: t.pillar2Title, desc: t.pillar2Desc, icon: "📱", color: "bg-purple-500" },
                  { title: t.pillar3Title, desc: t.pillar3Desc, icon: "🤝", color: "bg-indigo-500" },
                  { title: t.pillar4Title, desc: t.pillar4Desc, icon: "💰", color: "bg-green-500" }
                ].map((pillar, idx) => (
                  <div key={idx} className="bg-card hover:bg-card/80 p-4 rounded-xl border border-border hover:shadow-lg transition-all group flex gap-4 items-start">
                     <div className={`flex-shrink-0 w-10 h-10 ${pillar.color}/10 rounded-lg flex items-center justify-center text-lg group-hover:scale-105 transition-transform`}>{pillar.icon}</div>
                     <div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{pillar.title.replace(/[^\w\s]/gi, '').trim()}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleRegister}
                className="bg-foreground text-background px-10 py-3.5 rounded-full text-base sm:text-lg font-bold hover:opacity-90 transition-all shadow-xl active:scale-95 ring-2 ring-foreground/10"
              >
                {t.cta}
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <span className="font-bold text-sm">Moondala Corp.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-xs text-muted-foreground/50">
                © {new Date().getFullYear()} All Rights Reserved.
            </p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxImg && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
            onClick={() => setLightboxImg(null)}
        >
            <img 
                src={lightboxImg} 
                alt="Full View" 
                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            />
            <button 
                className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                onClick={() => setLightboxImg(null)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
