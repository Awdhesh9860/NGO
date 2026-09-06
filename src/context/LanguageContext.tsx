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
    'nav.programs': 'Programs & Impact',
    'nav.projects': 'Projects',
    'nav.campaigns': 'Campaigns',
    'nav.transparency': 'Transparency',
    'nav.getInvolved': 'Get Involved',
    'nav.volunteer': 'Volunteer',
    'nav.membership': 'Membership',
    'nav.csr': 'CSR Partners',
    'nav.events': 'Events',
    'nav.news': 'News & Media',
    'nav.verifyCertificate': 'Verify Certificate',
    'nav.contact': 'Contact Us',
    'nav.portals': 'Portals & Login',
    'nav.donate': 'Donate Now',
    
    // Hero & Home
    'hero.badge': 'Verified 501(c)(3) & 80G Tax Exempt Foundation',
    'hero.title': 'Transforming Vulnerable Lives Through Radical Compassion & Transparency',
    'hero.subtitle': 'Empowering marginalized communities worldwide with clean water, quality education, disaster relief, and sustainable livelihood ecosystems.',
    'hero.ctaDonate': 'Donate Now',
    'hero.ctaVolunteer': 'Become a Volunteer',
    'hero.impactMetric1': 'Beneficiaries Reached',
    'hero.impactMetric2': 'Potable Water Provided',
    'hero.impactMetric3': 'Direct Field Deployment',
    'hero.impactMetric4': 'Clean Audit Transparency',

    // Sections
    'section.urgentAppeal': 'Emergency Relief Appeal',
    'section.featuredProjects': 'Active Grassroots Projects',
    'section.corePrograms': 'Core Focus Programs',
    'section.upcomingEvents': 'Upcoming Events & Workshops',
    'section.transparency': 'Radical Transparency Hub',
    'section.partners': 'CSR & Institutional Partners',
    'section.stories': 'Stories of Transformation',
    
    // Common
    'btn.learnMore': 'Learn More',
    'btn.viewAll': 'View All',
    'btn.register': 'Register Now',
    'btn.supportCampaign': 'Support This Campaign',
    'btn.downloadReport': 'Download Audited Report',
    'btn.verify': 'Verify Authenticity',
    'btn.login': 'Sign In',
    'btn.switchRole': 'Switch Demo Persona'
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.programs': 'कार्यक्रम और प्रभाव',
    'nav.projects': 'परियोजनाएं',
    'nav.campaigns': 'अभियान',
    'nav.transparency': 'पारदर्शिता केंद्र',
    'nav.getInvolved': 'जुड़ें',
    'nav.volunteer': 'स्वयंसेवक बनें',
    'nav.membership': 'सदस्यता',
    'nav.csr': 'सीएसआर भागीदार',
    'nav.events': 'कार्यक्रम और कार्यशालाएं',
    'nav.news': 'समाचार और मीडिया',
    'nav.verifyCertificate': 'प्रमाणपत्र सत्यापन',
    'nav.contact': 'संपर्क करें',
    'nav.portals': 'लॉगिन / पोर्टल',
    'nav.donate': 'दान करें',
    
    // Hero & Home
    'hero.badge': 'प्रमाणित 80G एवं 12A कर-मुक्त सामाजिक संस्थान',
    'hero.title': 'करुणा, निष्ठा और पूर्ण पारदर्शिता से जीवन में सकारात्मक बदलाव',
    'hero.subtitle': 'शुद्ध पेयजल, गुणवत्तापूर्ण शिक्षा, आपदा राहत और आत्मनिर्भर आजीविका से वंचित समुदायों को सशक्त बनाना।',
    'hero.ctaDonate': 'अभी दान करें',
    'hero.ctaVolunteer': 'स्वयंसेवक बनें',
    'hero.impactMetric1': 'लाभान्वित नागरिक',
    'hero.impactMetric2': 'स्वच्छ पेयजल आपूर्ति',
    'hero.impactMetric3': 'प्रत्यक्ष परियोजना व्यय',
    'hero.impactMetric4': 'सत्यापित ऑडिट स्कोर',

    // Sections
    'section.urgentAppeal': 'आपातकालीन राहत अभियान',
    'section.featuredProjects': 'सक्रिय सामाजिक परियोजनाएं',
    'section.corePrograms': 'हमारे प्रमुख कार्यक्रम',
    'section.upcomingEvents': 'आगामी कार्यक्रम एवं संगोष्ठियां',
    'section.transparency': 'वित्तीय पारदर्शिता केंद्र',
    'section.partners': 'सीएसआर एवं संस्थागत सहयोगी',
    'section.stories': 'सफलता और प्रेरणा की कहानियां',
    
    // Common
    'btn.learnMore': 'और जानें',
    'btn.viewAll': 'सभी देखें',
    'btn.register': 'पंजीकरण करें',
    'btn.supportCampaign': 'इस अभियान में सहयोग दें',
    'btn.downloadReport': 'ऑडिट रिपोर्ट डाउनलोड करें',
    'btn.verify': 'सत्यापन करें',
    'btn.login': 'साइन इन करें',
    'btn.switchRole': 'डेमो रोल बदलें'
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.programs': 'কর্মসূচি ও প্রভাব',
    'nav.projects': 'প্রকল্পসমূহ',
    'nav.campaigns': 'অভিযান',
    'nav.transparency': 'স্বচ্ছতা হাব',
    'nav.getInvolved': 'যুক্ত হোন',
    'nav.volunteer': 'স্বেচ্ছাসেবক হোন',
    'nav.membership': 'সদস্যপদ',
    'nav.csr': 'সিএসআর পার্টনার',
    'nav.events': 'ইভেন্টস',
    'nav.news': 'সংবাদ ও মিডিয়া',
    'nav.verifyCertificate': 'সনদপত্র যাচাই',
    'nav.contact': 'যোগাযোগ',
    'nav.portals': 'লগইন / পোর্টাল',
    'nav.donate': 'দান করুন',
    
    // Hero & Home
    'hero.badge': 'অনুমোদিত কর-মুক্ত সমাজসেবামূলক প্রতিষ্ঠান',
    'hero.title': 'সহমর্মিতা ও স্বচ্ছতার মাধ্যমে প্রান্তিক জীবনের ইতিবাচক রূপান্তর',
    'hero.subtitle': 'বিশুদ্ধ পানীয় জল, গুণগত শিক্ষা, দুর্যোগকালীন সহায়তা ও স্বনির্ভর জীবিকায় সম্প্রদায়ের ক্ষমতায়ন।',
    'hero.ctaDonate': 'এখনই দান করুন',
    'hero.ctaVolunteer': 'স্বেচ্ছাসেবক হোন',
    'hero.impactMetric1': 'উপকৃত নাগরিক',
    'hero.impactMetric2': 'বিশুদ্ধ জল সরবরাহ',
    'hero.impactMetric3': 'মাঠপর্যায়ের প্রকল্প ব্যয়',
    'hero.impactMetric4': 'নিরীক্ষিত অডিট স্কোর',

    // Sections
    'section.urgentAppeal': 'জরুরি ত্রাণ সহায়তা আবেদন',
    'section.featuredProjects': 'মাঠপর্যায়ের সক্রিয় প্রকল্প',
    'section.corePrograms': 'আমাদের মূল কর্মসূচি',
    'section.upcomingEvents': 'আসন্ন কর্মশালা ও ইভেন্ট',
    'section.transparency': 'আর্থিক স্বচ্ছতা কেন্দ্র',
    'section.partners': 'প্রাতিষ্ঠানিক সহযোগীবৃন্দ',
    'section.stories': 'সাফল্যের বাস্তব গল্প',
    
    // Common
    'btn.learnMore': 'আরও জানুন',
    'btn.viewAll': 'সব দেখুন',
    'btn.register': 'নিবন্ধন করুন',
    'btn.supportCampaign': 'এই অভিযানে অনুদান দিন',
    'btn.downloadReport': 'অডিট রিপোর্ট ডাউনলোড',
    'btn.verify': 'যাচাই করুন',
    'btn.login': 'সাইন ইন',
    'btn.switchRole': 'ভূমিকা পরিবর্তন'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hh_ngo_language');
    return (saved === 'hi' || saved === 'en' || saved === 'bn') ? saved : 'en';
  });

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
