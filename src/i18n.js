import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
    en: {
        translation: {
            "app_title": "Sovereign House GH Application Form",
            "select_language": "Select Language",
            "name": "Full Name",
            "nationality": "Nationality",
            "postcode": "Postcode",
            "dob": "Date of Birth",
            "email": "Email Address",
            "mobile": "Mobile Number",
            "it_level": "IT Level",
            "it_beginner": "Beginner",
            "it_intermediate": "Intermediate",
            "it_advanced": "Advanced",
            "submit": "Submit Application",
            "success_message": "Application submitted successfully! Thank you.",
            "error_message": "There was an error submitting your application. Please try again.",
            "registration_app_title": "Registration form",
            "submit_registration": "Submit",
            "refugee_number": "Refugee Number",
            "sovereign_reference": "Sovereign House GH Reference Number"
        }
    },
    ar: {
        translation: {
            "app_title": "نموذج طلب Sovereign House GH",
            "select_language": "اختر اللغة",
            "name": "الاسم الكامل",
            "nationality": "الجنسية",
            "postcode": "الرمز البريدي",
            "dob": "تاريخ الميلاد",
            "email": "عنوان البريد الإلكتروني",
            "mobile": "رقم الهاتف المحمول",
            "it_level": "مستوى تكنولوجيا المعلومات",
            "it_beginner": "مبتدئ",
            "it_intermediate": "متوسط",
            "it_advanced": "متقدم",
            "submit": "إرسال الطلب",
            "success_message": "تم تقديم الطلب بنجاح! شكراً لك.",
            "error_message": "حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.",
            "registration_app_title": "Registration form",
            "submit_registration": "Submit",
            "refugee_number": "Refugee Number",
            "sovereign_reference": "Sovereign House GH Reference Number"
        }
    },
    ti: {
        translation: {
            "app_title": "ናይ Sovereign House GH መመልከቲ ፎርም",
            "select_language": "ቋንቋ ምረጹ",
            "name": "ምሉእ ስም",
            "nationality": "ዜግነት",
            "postcode": "ፖስታ ኮድ",
            "dob": "ዕለት ልደት",
            "email": "ኢሜይል",
            "mobile": "ቁጽሪ ሞባይል",
            "it_level": "ደረጃ ኣይቲ (IT)",
            "it_beginner": "ጀማሪ",
            "it_intermediate": "ማእከላይ",
            "it_advanced": "ላዕለዋይ",
            "submit": "መመልከቲ ስደድ",
            "success_message": "መመልከቲ ብዓወት ተላኢኹ! የቐንየልና።",
            "error_message": "መመልከቲ ክለኣኽ ጸገም ኣጋጢሙ። በጃኹም ዳግማይ ፈትኑ።",
            "registration_app_title": "Registration form",
            "submit_registration": "Submit",
            "refugee_number": "Refugee Number",
            "sovereign_reference": "Sovereign House GH Reference Number"
        }
    },
    am: {
        translation: {
            "app_title": "የ Sovereign House GH ማመልከቻ ቅጽ",
            "select_language": "ቋንቋ ይምረጡ",
            "name": "ሙሉ ስም",
            "nationality": "ዜግነት",
            "postcode": "ፖስታ ኮድ",
            "dob": "የትውልድ ቀን",
            "email": "ኢሜይል አድራሻ",
            "mobile": "የሞባይል ቁጥር",
            "it_level": "የአይቲ (IT) ደረጃ",
            "it_beginner": "ጀማሪ",
            "it_intermediate": "መካከለኛ",
            "it_advanced": "ከፍተኛ",
            "submit": "ማመልከቻ አስገባ",
            "success_message": "ማመልከቻው በተሳካ ሁኔታ ገብቷል! እናመሰግናለን።",
            "error_message": "ማመልከቻዎን በማስገባት ላይ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
            "registration_app_title": "Registration form",
            "submit_registration": "Submit",
            "refugee_number": "Refugee Number",
            "sovereign_reference": "Sovereign House GH Reference Number"
        }
    },
    fa: {
        translation: {
            "app_title": "فرم درخواست Sovereign House GH",
            "select_language": "انتخاب زبان",
            "name": "نام و نام خانوادگی",
            "nationality": "ملیت",
            "postcode": "کد پستی",
            "dob": "تاریخ تولد",
            "email": "آدرس ایمیل",
            "mobile": "شماره موبایل",
            "it_level": "سطح فناوری اطلاعات (IT)",
            "it_beginner": "مبتدی",
            "it_intermediate": "متوسط",
            "it_advanced": "پیشرفته",
            "submit": "ارسال درخواست",
            "success_message": "درخواست با موفقیت ثبت شد! با تشکر.",
            "error_message": "در ارسال درخواست شما خطایی رخ داد. لطفاً دوباره تلاش کنید.",
            "registration_app_title": "Registration form",
            "submit_registration": "Submit",
            "refugee_number": "Refugee Number",
            "sovereign_reference": "Sovereign House GH Reference Number"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
