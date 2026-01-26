import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = [
  { code: 'am', name: 'Amharic (Ethiopia)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'en', name: 'English' },
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
    subtitle: "Moondala is the first social commerce that pays you back.",
    howItWorks: "How It Works",
    benefitsTitle: "Why Join Moondala?",
    benefit1: "Exclusive Deals & Discounts",
    benefit2: "Connect directly with Shops",
    benefit3: "Earn rewards by inviting friends",
    cta: "Register Now",
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
    // NEW SECTION TRANSLATIONS
    howItWorksNewTitle: "How Moondala Works",
    howItWorksNewDesc: "Big platforms profit from every order — you get nothing. Moondala changes that.\n\nInstead of keeping the transaction fees, Moondala shares them with users through the referral tree.\n\nLife is hard and expensive, so Moondala helps you turn your network into extra income."
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
    cta: "አሁን ይመዝገቡ",
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
    howItWorksNewDesc: "ትላልቅ መድረኮች ከእያንዳንዱ ትዕዛዝ ያተርፋሉ — እርስዎ ምንም አያገኙም። Moondala ይህንን ይለውጣል።\n\nየግብይት ክፍያዎችን ከመያዝ ይልቅ፣ Moondala በሪፈራል ዛፍ በኩል ለተጠቃሚዎች ያካፍላል።\n\nህይወት ከባድ እና ውድ ስለሆነች፣ Moondala አውታረ መረብዎን ወደ ተጨማሪ ገቢ እንዲቀይሩ ይረዳዎታል።"
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
    cta: "Magparehistro Na",
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
    howItWorksNewDesc: "Kumikita ang malalaking platform sa bawat order — wala kang nakukuha. Babaguhin iyan ng Moondala.\n\nSa halip na itago ang mga transaction fee, ibinabahagi ito ng Moondala sa mga user sa pamamagitan ng referral tree.\n\nMahirap at mahal ang buhay, kaya tinutulungan ka ng Moondala na gawing extra income ang iyong network."
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
    cta: "지금 가입하기",
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
    howItWorksNewDesc: "거대 플랫폼들은 모든 주문에서 수익을 챙기지만, 당신은 아무것도 얻지 못합니다. Moondala는 이를 바꿉니다.\n\n거래 수수료를 독차지하는 대신, Moondala는 추천 트리를 통해 이를 사용자들과 공유합니다.\n\n살기 팍팍하고 물가도 비싼 요즘, Moondala는 당신의 인맥을 추가 소득으로 바꿀 수 있도록 돕습니다."
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
    cta: "Daftar Sekarang",
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
    howItWorksNewDesc: "Platform besar mendapat untung dari setiap pesanan — Anda tidak mendapat apa-apa. Moondala mengubahnya.\n\nAlih-alih menyimpan biaya transaksi, Moondala membaginya dengan pengguna melalui pohon rujukan.\n\nHidup itu sulit dan mahal, jadi Moondala membantu Anda mengubah jaringan Anda menjadi penghasilan tambahan."
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
    cta: "Isdiiwaangeli Hadda",
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
    howItWorksNewDesc: "Madalalka waaweyn waxay ka faa'iidaan amar kasta — adigu waxba ma heshid. Moondala way beddeshaa taas.\n\nBedelkii ay hayn lahayd khidmadaha macaamilka, Moondala waxay la wadaagtaa isticmaalayaasha iyada oo loo marayo geedka tixraaca.\n\nNoloshu waa adag tahay oo qaali tahay, sidaa darteed Moondala waxay kaa caawineysaa inaad shabakaddaada u beddesho dakhli dheeraad ah."
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
    cta: "ابھی رجسٹر کریں",
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
    howItWorksNewDesc: "بڑے پلیٹ فارمز ہر آرڈر سے منافع کماتے ہیں — آپ کو کچھ نہیں ملتا۔ Moondala اسے بدلتا ہے۔\n\nٹرانزیکشن فیس رکھنے کے بجائے، Moondala انہیں ریفرل ٹری کے ذریعے صارفین کے ساتھ شیئر کرتا ہے۔\n\nزندگی مشکل اور مہنگی ہے، اس لیے Moondala آپ کو اپنے نیٹ ورک کو اضافی آمدنی میں تبدیل کرنے میں مدد کرتا ہے۔"
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
    cta: "Regístrate ahora",
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
    howItWorksNewDesc: "Las grandes plataformas se benefician de cada pedido, tú no obtienes nada. Moondala cambia eso.\n\nEn lugar de quedarse con las tarifas de transacción, Moondala las comparte con los usuarios a través del árbol de referencias.\n\nLa vida es dura y costosa, por lo que Moondala te ayuda a convertir tu red en ingresos extra."
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
    cta: "今すぐ登録",
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
    howItWorksNewDesc: "大手プラットフォームはすべての注文から利益を得ますが、あなたは何も得られません。Moondalaはそれを変えます。\n\n取引手数料を保持する代わりに、Moondalaは紹介ツリーを通じてユーザーと共有します。\n\n生活は大変でお金もかかるため、Moondalaはあなたのネットワークを副収入に変える手助けをします。"
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
    cta: "Registre-se agora",
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
    howItWorksNewDesc: "Grandes plataformas lucram com cada pedido — você não ganha nada. O Moondala muda isso.\n\nEm vez de ficar com as taxas de transação, o Moondala as compartilha com os usuários por meio da árvore de referências.\n\nA vida é difícil e cara, então o Moondala ajuda você a transformar sua rede em renda extra."
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
    cta: "Зарегистрироваться сейчас",
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
    howItWorksNewDesc: "Крупные платформы получают прибыль с каждого заказа — вы не получаете ничего. Moondala меняет это.\n\nВместо того чтобы оставлять себе комиссию за транзакции, Moondala делится ею с пользователями через реферальное дерево.\n\nЖизнь сложна и дорога, поэтому Moondala помогает вам превратить вашу сеть в дополнительный доход."
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
    cta: "Şimdi Kaydolun",
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
    howItWorksNewDesc: "Büyük platformlar her siparişten kâr eder — siz hiçbir şey almazsınız. Moondala bunu değiştiriyor.\n\nİşlem ücretlerini tutmak yerine, Moondala bunları referans ağacı aracılığıyla kullanıcılarla paylaşır.\n\nHayat zor ve pahalı, bu yüzden Moondala ağınızı ek gelire dönüştürmenize yardımcı olur."
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
    cta: "سجل الآن",
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
    // NEW SECTION TRANSLATIONS
    howItWorksNewTitle: "كيف تعمل موندالا",
    howItWorksNewDesc: "المنصات الكبرى تربح من كل طلب — وأنت لا تحصل على شيء. موندالا تغير ذلك.\n\nبدلاً من الاحتفاظ برسوم المعاملات، تشاركها موندالا مع المستخدمين من خلال شجرة الإحالة.\n\nالحياة صعبة ومكلفة، لذا تساعدك موندالا على تحويل شبكتك إلى دخل إضافي."
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
    cta: "Jetzt registrieren",
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
    howItWorksNewDesc: "Große Plattformen profitieren von jeder Bestellung – Sie bekommen nichts. Moondala ändert das.\n\nAnstatt die Transaktionsgebühren zu behalten, teilt Moondala sie über den Empfehlungsbaum mit den Benutzern.\n\nDas Leben ist hart und teuer, deshalb hilft Ihnen Moondala, Ihr Netzwerk in zusätzliches Einkommen zu verwandeln."
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
    cta: "S'inscrire maintenant",
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
    howItWorksNewDesc: "Les grandes plateformes profitent de chaque commande — vous n'obtenez rien. Moondala change cela.\n\nAu lieu de garder les frais de transaction, Moondala les partage avec les utilisateurs via l'arbre de parrainage.\n\nLa vie est dure et chère, alors Moondala vous aide à transformer votre réseau en revenu supplémentaire."
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
    cta: "अभी पंजीकरण करें",
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
    howItWorksNewDesc: "बड़े प्लेटफॉर्म हर ऑर्डर से मुनाफा कमाते हैं — आपको कुछ नहीं मिलता। Moondala इसे बदलता है।\n\nलेनदेन शुल्क रखने के बजाय, Moondala उन्हें रेफरल ट्री के माध्यम से उपयोगकर्ताओं के साथ साझा करता है।\n\nजीवन कठिन और महंगा है, इसलिए Moondala आपके नेटवर्क को अतिरिक्त आय में बदलने में आपकी मदद करता है।"
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
    cta: "Registrati ora",
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
    howItWorksNewDesc: "Le grandi piattaforme traggono profitto da ogni ordine — tu non ottieni nulla. Moondala cambia tutto questo.\n\nInvece di trattenere le commissioni di transazione, Moondala le condivide con gli utenti attraverso l'albero dei riferimenti.\n\nLa vita è dura e costosa, quindi Moondala ti aiuta a trasformare la tua rete in entrate extra."
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
    cta: "立即注册",
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
    howItWorksNewDesc: "大平台从每笔订单中获利——而你什么也得不到。Moondala 改变了这一点。\n\nMoondala 不保留交易费，而是通过推荐树与用户分享。\n\n生活艰难且昂贵，所以 Moondala 帮助你将人脉转化为额外收入。"
  }
};

const ReferralLanding = ({ type: propType }) => {
  // Extract params first
  const params = useParams();
  // 'code' comes from URL params in both cases /refer/user/:code or /refer/landing/:type/:code
  const code = params.code;
  
  // Determine type: either passed as prop (for legacy routes) or from URL param (for new universal route)
  const type = propType || params.type;

  const navigate = useNavigate();
  const { i18n, t: tGlobal } = useTranslation();
  
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [step, setStep] = useState(1);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Video URL mapping for each language (Cloudinary public IDs)
  const VIDEO_URLS = {
    en: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276231/intro-en.mp4_pyxi0j.mp4',
    ar: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276218/intro-ar.mp4_k7cash.mp4',
    es: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276212/intro-es.mp4_el1224.mp4',
    pt: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276213/intro-pt.mp4_gq30hi.mp4',
    ja: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276213/intro-ja.mp4_ufxihc.mp4',
    ko: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276211/intro-ko.mp4_twmqeh.mp4',
    hi: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276219/intro-hi.mp4_rtdwzh.mp4',
    fr: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276219/intro-fr.mp4_srtiij.mp4',
    de: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276219/intro-de.mp4_ki9skn.mp4',
    ru: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276217/intro-ru.mp4_dnl65j.mp4',
    id: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769282254/intro-id_ra5qyz.mp4',
    tr: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276217/intro-tr.mp4_fdoot5.mp4',
    fil: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769282051/intro-fil_upg01h.mp4',
    am: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769282054/intro-am_rjm8qh.mp4',
    ur: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276211/intro-ur.mp4_sbsw47.mp4',
    so: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769282052/intro-so_fr68md.mp4',
    it: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769276221/intro-it.mp4_yqq4my.mp4',
    zh: 'https://res.cloudinary.com/dohetomaw/video/upload/v1769278377/intro-zh.mp4_b4hlge.mp4'
  };

  const [videoSrc, setVideoSrc] = useState(VIDEO_URLS.en);

  // Persist language choice and handle direction/video
  useEffect(() => {
    try {
      localStorage.setItem('userLanguage', selectedLang);
      i18n.changeLanguage(selectedLang);
      document.documentElement.dir = ['ar', 'ur'].includes(selectedLang) ? 'rtl' : 'ltr';
      document.documentElement.lang = selectedLang;
      
      // Update video source when language changes - use mapped URLs
      setVideoSrc(VIDEO_URLS[selectedLang] || VIDEO_URLS.en);
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }, [selectedLang, i18n]);

  const handleVideoError = (e) => {
    console.error('Video error:', e, 'Current src:', videoSrc);
    // If the language-specific video fails to load, fallback to English
    if (videoSrc !== VIDEO_URLS.en) {
      console.log(`Video for ${selectedLang} missing, falling back to English.`);
      setVideoSrc(VIDEO_URLS.en);
    }
  };

  const handleRegister = () => {
    // Store referral intent before redirect
    if (code) {
      if (type === 'shop') {
        localStorage.setItem('shopReferralCode', code);
      } else {
        localStorage.setItem('referralCode', code);
      }
    }
    
    // Redirect to login/register with the language query param AND the referral code
    const roleParam = type === 'shop' ? '&role=shop' : '&role=user';
    const inviterParam = code ? `&inviter=${code}` : '';
    navigate(`/login?lang=${selectedLang}${roleParam}${inviterParam}`);
  };

  const currentLangCode = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) ? selectedLang : 'en';
  const t = CONTENT[currentLangCode] || CONTENT['en'];

  // STEP 1: SPLASH SCREEN (PWA Optimized)
  if (step === 1) {
    return (
      <div className="fixed inset-0 min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground overflow-hidden">
        <div className="bg-card/50 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm w-full border border-border animate-in fade-in zoom-in duration-700">
          {/* Logo with Glow */}
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full"></div>
            <img 
              src="/moondala-logo.png" 
              alt="Moondala" 
              className="relative w-32 h-32 object-contain drop-shadow-2xl"
            />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-center text-foreground">Moondala</h2>
          <p className="text-muted-foreground mb-10 text-center text-sm leading-relaxed">{t.subtitle}</p>

          {/* Large Language Selector */}
          <div className="w-full mb-8 space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block text-center">Language / 言語 / لغة</label>
            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full bg-input/80 border border-border text-foreground py-4 px-6 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-center appearance-none cursor-pointer hover:bg-input font-medium"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Enter Button (Primary PWA Action) */}
          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-900/40 transform transition-all active:scale-95 text-xl"
          >
            {t.enterBtn}
          </button>
        </div>
        
        {/* Footer info for PWA */}
        <div className="mt-12 text-slate-600 text-[10px] uppercase tracking-[0.2em]">
          Powered by Moondala 🌙
        </div>
      </div>
    );
  }

  // STEP 2: MAIN CONTENT
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      
      {/* PWA Friendly Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/moondala-logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold tracking-tight hidden xs:block">Moondala</span>
          </div>
          <button
            onClick={handleRegister}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-500 active:scale-95 transition-all shadow-lg shadow-purple-900/30"
          >
            {t.cta}
          </button>
        </div>
      </div>

      <main className="flex-1 w-full flex flex-col items-center">
        
        {/* HERO SECTION (Video + Welcome) */}
        <section className="w-full max-w-4xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
          <div className="mb-12 space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
              {t.welcome}
            </h1>
            <div className="space-y-4">
              <p className="text-xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold leading-tight">
                {t.subtitle}
              </p>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t.introText}
              </p>
            </div>
          </div>

          {/* Video Container - App Like Frame */}
          <div className="relative group mb-12 w-full max-w-[320px] md:max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-b from-purple-600 to-transparent rounded-[2rem] blur-xl opacity-20 transition-opacity group-hover:opacity-40"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-muted bg-black aspect-[9/16]">
              <video
                key={videoSrc}
                src={videoSrc}
                controls
                className="w-full h-full object-cover"
                onError={handleVideoError}
                playsInline
                preload="metadata"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* FEATURE: HOW MOONDALA WORKS (New) */}
        <section className="w-full bg-secondary/10 py-16 px-4 border-b border-border">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1">
                <img 
                  src="/images/moondala-network-levels.png" 
                  alt="Network Levels" 
                  className="w-full h-auto object-contain rounded-xl shadow-2xl border border-border"
                  onClick={() => setLightboxImg('/images/moondala-network-levels.png')}
                />
             </div>
             <div className="order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                   {t.howItWorksNewTitle || t.howItWorks}
                </h2>
                <p className="text-lg text-muted-foreground whitespace-pre-line leading-relaxed">
                   {t.howItWorksNewDesc || "Big platforms profit from every order — you get nothing. Moondala changes that.\n\nInstead of keeping the transaction fees, Moondala shares them with users through the referral tree.\n\nLife is hard and expensive, so Moondala helps you turn your network into extra income."}
                </p>
             </div>
          </div>
        </section>

        {/* FEATURE: REFERRAL TREE (Restored) */}
        <section className="w-full bg-secondary/5 py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-card p-2 rounded-2xl shadow-xl transform rotate-1 transition-transform hover:rotate-0">
                <img 
                  src="/images/referral-tree.png" 
                  alt="Referral Tree Structure" 
                  className="w-full rounded-xl cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => setLightboxImg('/images/referral-tree.png')}
                />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-2">
                {t.howItWorks}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t.networkTitle}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t.networkDesc}
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm border border-border">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-600 font-bold">1</div>
                  <div>
                    <h3 className="font-bold text-foreground">{t.level1}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm border border-border">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-600 font-bold">5</div>
                  <div>
                    <h3 className="font-bold text-foreground">{t.level2_5}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE: DASHBOARD */}
        <section className="w-full bg-background py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t.dashboardTitle}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.dashboardDesc}
              </p>
              <ul className="space-y-3 pt-2">
                {[t.benefit1, t.benefit2, t.benefit3].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="pt-6">
                 <button
                  onClick={handleRegister}
                  className="bg-foreground text-background px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl w-full md:w-auto"
                >
                  {t.cta}
                </button>
              </div>
            </div>
            <div className="relative">
               <div className="absolute -inset-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-full blur-2xl opacity-30"></div>
               <img 
                  src="/images/dashboard-preview.png" 
                  alt="Dashboard Preview" 
                  className="relative w-full rounded-xl shadow-2xl border border-border cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => setLightboxImg('/images/dashboard-preview.png')}
                />
            </div>
          </div>
        </section>

        {/* FEATURE: SHOP EXPERIENCE (PWA Split Layout) */}
        <section className="w-full py-24 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
              <div className="text-left order-2 lg:order-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.shopSubtitle}
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-foreground leading-tight tracking-tighter">
                  {t.shopTitle}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  {t.shopIntro}
                </p>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative group max-w-[320px] md:max-w-sm mx-auto">
                  <div className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                  <div className="relative bg-card p-2.5 rounded-[3rem] shadow-3xl border border-border overflow-hidden transform lg:rotate-3 hover:rotate-0 transition-all duration-700">
                    <img 
                      src="/images/shop-preview.png.png" 
                      alt="App UI" 
                      className="w-full h-auto rounded-[2.5rem] shadow-inner font-bold"
                      onClick={() => setLightboxImg('/images/shop-preview.png.png')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: t.pillar1Title, desc: t.pillar1Desc, icon: "🛒" },
                { title: t.pillar2Title, desc: t.pillar2Desc, icon: "📱" },
                { title: t.pillar3Title, desc: t.pillar3Desc, icon: "🤝" },
                { title: t.pillar4Title, desc: t.pillar4Desc, icon: "💰" }
              ].map((pillar, idx) => (
                <div key={idx} className="bg-card/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-border hover:border-foreground/30 transition-all group">
                   <div className="text-3xl mb-4 group-hover:scale-125 transition-transform origin-left">{pillar.icon}</div>
                   <h3 className="text-base md:text-lg font-black text-foreground mb-2 leading-tight">{pillar.title.replace(/[^\w\s]/gi, '').trim()}</h3>
                   <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">{pillar.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <button
                onClick={handleRegister}
                className="w-full md:w-auto bg-foreground text-background px-12 py-5 rounded-2xl text-xl font-black hover:opacity-90 transition-all shadow-2xl active:scale-95"
              >
                {t.cta}
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER (PWA Optimized) */}
      <footer className="bg-background text-muted-foreground w-full py-16 px-6 text-center text-xs border-t border-border pb-safe">
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-wrap justify-center gap-8 font-bold uppercase tracking-widest text-muted-foreground/70">
                <span>App Status: Online</span>
                <span>Region: Global</span>
                <span>Security: SSL Encrypted</span>
            </div>
            <div className="h-px w-20 bg-border mx-auto"></div>
            <p className="font-medium tracking-tight">© {new Date().getFullYear()} MOONDALA ECOSYSTEM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Lightbox Overlay */}
      {lightboxImg && (
        <div 
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setLightboxImg(null)}
        >
            <img 
                src={lightboxImg} 
                alt="Full View" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button 
                onClick={() => setLightboxImg(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 rounded-full p-2"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      )}
    </div>
  );
};

export default ReferralLanding;
