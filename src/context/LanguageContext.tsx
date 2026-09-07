import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.programs': 'Our Causes',
    'nav.projects': 'Projects',
    'nav.campaigns': 'Urgent Appeals',
    'nav.transparency': 'Where Money Goes',
    'nav.getInvolved': 'Join Us',
    'nav.volunteer': 'Be a Volunteer',
    'nav.membership': 'Monthly Giving',
    'nav.csr': 'Company Partners',
    'nav.events': 'Events & Drives',
    'nav.news': 'News & Updates',
    'nav.verifyCertificate': 'Verify Certificate',
    'nav.contact': 'Contact Us',
    'nav.portals': 'Sign In',
    'nav.donate': 'Donate Now',
    
    // Hero & Home
    'hero.badge': 'Verified NGO • 100% Honest • Instant 80G Tax Exemption',
    'hero.title': 'Helping Children. Feeding Families. Bringing Real Hope.',
    'hero.subtitle': 'We work directly on the ground to provide school books, clean drinking water, daily meals, and doctor care to families in need — with 100% honesty and zero middlemen.',
    'hero.ctaDonate': 'Donate Now (Save Tax)',
    'hero.ctaVolunteer': 'Join as Volunteer',
    'hero.ctaExplore': 'See How We Help',
    'hero.impactMetric1': 'People Helped',
    'hero.impactMetric2': 'Clean Water Provided',
    'hero.impactMetric3': 'Direct Help to Families',
    'hero.impactMetric4': 'Clean Audit Score',

    // Sections
    'section.urgentAppeal': 'Urgent Help Needed',
    'section.featuredProjects': 'Our Current Field Work',
    'section.corePrograms': 'How We Help Communities',
    'section.upcomingEvents': 'Upcoming Community Drives',
    'section.transparency': 'Where Every Rupee Goes',
    'section.partners': 'Our Caring Partners',
    'section.stories': 'Real Stories of Hope',
    
    // Common
    'btn.learnMore': 'Read More',
    'btn.viewAll': 'View All',
    'btn.register': 'Join Now',
    'btn.supportCampaign': 'Donate to This Cause',
    'btn.downloadReport': 'Download Audit Report',
    'btn.verify': 'Check Certificate',
    'btn.login': 'Sign In',
    'btn.switchRole': 'Switch Demo Account'
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.programs': 'हमारी सेवाएं',
    'nav.projects': 'प्रोजेक्ट्स',
    'nav.campaigns': 'जरूरी मदद',
    'nav.transparency': 'हिसाब-किताब',
    'nav.getInvolved': 'साथ जुड़ें',
    'nav.volunteer': 'स्वयंसेवक बनें',
    'nav.membership': 'मासिक सहयोग',
    'nav.csr': 'कंपनी पार्टनर',
    'nav.events': 'कार्यक्रम और शिविर',
    'nav.news': 'ताज़ा खबरें',
    'nav.verifyCertificate': 'सर्टिफिकेट जांचें',
    'nav.contact': 'संपर्क करें',
    'nav.portals': 'लॉगिन',
    'nav.donate': 'दान करें',
    
    // Hero & Home
    'hero.badge': 'सत्यापित सामाजिक संस्था • 80G टैक्स छूट रसीद उपलब्ध',
    'hero.title': 'बच्चों की पढ़ाई, भूखों को भोजन और परिवारों को नई उम्मीद',
    'hero.subtitle': 'हम गरीब बच्चों को स्कूल, जरूरतमंद परिवारों को साफ पानी, खाना और इलाज पहुंचाने का काम पूरी ईमानदारी और बिना किसी बिचौलिए के करते हैं।',
    'hero.ctaDonate': 'अभी दान करें (टैक्स बचाएं)',
    'hero.ctaVolunteer': 'स्वयंसेवक बनें',
    'hero.ctaExplore': 'हमारी सेवाएं देखें',
    'hero.impactMetric1': 'मदद पाए लोग',
    'hero.impactMetric2': 'साफ पीने का पानी',
    'hero.impactMetric3': 'सीधे परिवारों पर खर्च',
    'hero.impactMetric4': '100% पारदर्शी हिसाब',

    // Sections
    'section.urgentAppeal': 'तुरंत मदद की जरूरत',
    'section.featuredProjects': 'हमारे चालू प्रोजेक्ट्स',
    'section.corePrograms': 'हम किस तरह मदद करते हैं',
    'section.upcomingEvents': 'आने वाले शिविर एवं कार्यक्रम',
    'section.transparency': 'आपका एक-एक रुपया कहां जाता है',
    'section.partners': 'हमारे सहयोगी संस्थान',
    'section.stories': 'बदलाव की सच्ची कहानियां',
    
    // Common
    'btn.learnMore': 'और पढ़ें',
    'btn.viewAll': 'सभी देखें',
    'btn.register': 'रजिस्टर करें',
    'btn.supportCampaign': 'इस अभियान में दान दें',
    'btn.downloadReport': 'ऑडिट रिपोर्ट डाउनलोड करें',
    'btn.verify': 'जांचें',
    'btn.login': 'लॉगिन करें',
    'btn.switchRole': 'रोल बदलें'
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.about': 'আমাদের কথা',
    'nav.programs': 'আমাদের কাজ',
    'nav.projects': 'প্রকল্পসমূহ',
    'nav.campaigns': 'জরুরি আবেদন',
    'nav.transparency': 'হিসাব-নিকাশ',
    'nav.getInvolved': 'যুক্ত হোন',
    'nav.volunteer': 'স্বেচ্ছাসেবক হোন',
    'nav.membership': 'মাসিক দান',
    'nav.csr': 'কর্পোরেট পার্টনার',
    'nav.events': 'আসন্ন কার্যক্রম',
    'nav.news': 'সংবাদ ও আপডেট',
    'nav.verifyCertificate': 'সনদপত্র যাচাই',
    'nav.contact': 'যোগাযোগ',
    'nav.portals': 'লগইন',
    'nav.donate': 'দান করুন',
    
    // Hero & Home
    'hero.badge': 'অনুমোদিত সংস্থা • ১০০% স্বচ্ছ • কর-ছাড় সুবিধা',
    'hero.title': 'শিশুর শিক্ষা, খাদ্য ও অসহায় মানুষের মুখে হাসি',
    'hero.subtitle': 'আমরা সরাসরি অসহায় মানুষের কাছে পৌঁছে দিই পড়ার বই, খাবার, বিশুদ্ধ পানি ও চিকিৎসার সেবা — কোনো মধ্যস্বত্বভোগী ছাড়া।',
    'hero.ctaDonate': 'দান করুন',
    'hero.ctaVolunteer': 'স্বেচ্ছাসেবক হোন',
    'hero.ctaExplore': 'আমাদের কাজ দেখুন',
    'hero.impactMetric1': 'উপকৃত মানুষ',
    'hero.impactMetric2': 'বিশুদ্ধ খাবার পানি',
    'hero.impactMetric3': 'সরাসরি মানুষের সাহায্যে ব্যয়',
    'hero.impactMetric4': 'স্বচ্ছ অডিট স্কোর',

    // Sections
    'section.urgentAppeal': 'জরুরি সাহায্য প্রয়োজন',
    'section.featuredProjects': 'বর্তমান মাঠপর্যায়ের কাজ',
    'section.corePrograms': 'আমরা কীভাবে সাহায্য করি',
    'section.upcomingEvents': 'আসন্ন ত্রাণ ও সেবা শিবির',
    'section.transparency': 'প্রতিটি টাকার হিসাব',
    'section.partners': 'আমাদের সহযোগীবৃন্দ',
    'section.stories': 'আশার বাস্তব গল্প',
    
    // Common
    'btn.learnMore': 'আরও জানুন',
    'btn.viewAll': 'সব দেখুন',
    'btn.register': 'যোগ দিন',
    'btn.supportCampaign': 'সাহায্য পাঠান',
    'btn.downloadReport': 'অডিট রিপোর্ট ডাউনলোড',
    'btn.verify': 'যাচাই করুন',
    'btn.login': 'লগইন',
    'btn.switchRole': 'অ্যাকাউন্ট পরিবর্তন'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Starts at the deterministic default so SSR output matches the client's
  // first render; the persisted preference is applied after mount.
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('hh_ngo_language');
    if (saved === 'hi' || saved === 'en' || saved === 'bn') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hh_ngo_language', lang);
  };

  const t = (key: string, defaultText?: string): string => {
    return DICTIONARY[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
