import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

function RegistrationForm() {
  const { t, i18n } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await addDoc(collection(db, 'applications'), {
        ...data,
        formType: 'registration',
        languageUsed: i18n.language,
        submittedAt: new Date()
      });
      setSubmitStatus('success');
      reset();
    } catch (e) {
      console.error("Error adding document: ", e);
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isRtl = i18n.language === 'ar' || i18n.language === 'fa';

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' },
    { code: 'ti', label: 'Tigrinya' },
    { code: 'am', label: 'Amharic' },
    { code: 'fa', label: 'Farsi' },
  ];

  const countries = [
    { code: "AF", name: "Afghanistan" },
    { code: "AL", name: "Albania" },
    { code: "DZ", name: "Algeria" },
    { code: "AS", name: "American Samoa" },
    { code: "AD", name: "Andorra" },
    { code: "AO", name: "Angola" },
    { code: "AI", name: "Anguilla" },
    { code: "AQ", name: "Antarctica" },
    { code: "AG", name: "Antigua and Barbuda" },
    { code: "AR", name: "Argentina" },
    { code: "AM", name: "Armenia" },
    { code: "AW", name: "Aruba" },
    { code: "AU", name: "Australia" },
    { code: "AT", name: "Austria" },
    { code: "AZ", name: "Azerbaijan" },
    { code: "BS", name: "Bahamas" },
    { code: "BH", name: "Bahrain" },
    { code: "BD", name: "Bangladesh" },
    { code: "BB", name: "Barbados" },
    { code: "BY", name: "Belarus" },
    { code: "BE", name: "Belgium" },
    { code: "BZ", name: "Belize" },
    { code: "BJ", name: "Benin" },
    { code: "BM", name: "Bermuda" },
    { code: "BT", name: "Bhutan" },
    { code: "BO", name: "Bolivia" },
    { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BW", name: "Botswana" },
    { code: "BR", name: "Brazil" },
    { code: "IO", name: "British Indian Ocean Territory" },
    { code: "BN", name: "Brunei Darussalam" },
    { code: "BG", name: "Bulgaria" },
    { code: "BF", name: "Burkina Faso" },
    { code: "BI", name: "Burundi" },
    { code: "KH", name: "Cambodia" },
    { code: "CM", name: "Cameroon" },
    { code: "CA", name: "Canada" },
    { code: "CV", name: "Cape Verde" },
    { code: "KY", name: "Cayman Islands" },
    { code: "CF", name: "Central African Republic" },
    { code: "TD", name: "Chad" },
    { code: "CL", name: "Chile" },
    { code: "CN", name: "China" },
    { code: "CX", name: "Christmas Island" },
    { code: "CC", name: "Cocos (Keeling) Islands" },
    { code: "CO", name: "Colombia" },
    { code: "KM", name: "Comoros" },
    { code: "CG", name: "Congo" },
    { code: "CD", name: "Congo, The Democratic Republic of the" },
    { code: "CK", name: "Cook Islands" },
    { code: "CR", name: "Costa Rica" },
    { code: "CI", name: "Cote D'Ivoire" },
    { code: "HR", name: "Croatia" },
    { code: "CU", name: "Cuba" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czech Republic" },
    { code: "DK", name: "Denmark" },
    { code: "DJ", name: "Djibouti" },
    { code: "DM", name: "Dominica" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" },
    { code: "SV", name: "El Salvador" },
    { code: "GQ", name: "Equatorial Guinea" },
    { code: "ER", name: "Eritrea" },
    { code: "EE", name: "Estonia" },
    { code: "ET", name: "Ethiopia" },
    { code: "FK", name: "Falkland Islands (Malvinas)" },
    { code: "FO", name: "Faroe Islands" },
    { code: "FJ", name: "Fiji" },
    { code: "FI", name: "Finland" },
    { code: "FR", name: "France" },
    { code: "GF", name: "French Guiana" },
    { code: "PF", name: "French Polynesia" },
    { code: "TF", name: "French Southern Territories" },
    { code: "GA", name: "Gabon" },
    { code: "GM", name: "Gambia" },
    { code: "GE", name: "Georgia" },
    { code: "DE", name: "Germany" },
    { code: "GH", name: "Ghana" },
    { code: "GI", name: "Gibraltar" },
    { code: "GR", name: "Greece" },
    { code: "GL", name: "Greenland" },
    { code: "GD", name: "Grenada" },
    { code: "GP", name: "Guadeloupe" },
    { code: "GU", name: "Guam" },
    { code: "GT", name: "Guatemala" },
    { code: "GG", name: "Guernsey" },
    { code: "GN", name: "Guinea" },
    { code: "GW", name: "Guinea-Bissau" },
    { code: "GY", name: "Guyana" },
    { code: "HT", name: "Haiti" },
    { code: "HM", name: "Heard Island and Mcdonald Islands" },
    { code: "VA", name: "Holy See (Vatican City State)" },
    { code: "HN", name: "Honduras" },
    { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" },
    { code: "IS", name: "Iceland" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "IR", name: "Iran, Islamic Republic Of" },
    { code: "IQ", name: "Iraq" },
    { code: "IE", name: "Ireland" },
    { code: "IM", name: "Isle of Man" },
    { code: "IL", name: "Israel" },
    { code: "IT", name: "Italy" },
    { code: "JM", name: "Jamaica" },
    { code: "JP", name: "Japan" },
    { code: "JE", name: "Jersey" },
    { code: "JO", name: "Jordan" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "KE", name: "Kenya" },
    { code: "KI", name: "Kiribati" },
    { code: "KP", name: "Korea, Democratic People'S Republic of" },
    { code: "KR", name: "Korea, Republic of" },
    { code: "KW", name: "Kuwait" },
    { code: "KG", name: "Kyrgyzstan" },
    { code: "LA", name: "Lao People'S Democratic Republic" },
    { code: "LV", name: "Latvia" },
    { code: "LB", name: "Lebanon" },
    { code: "LS", name: "Lesotho" },
    { code: "LR", name: "Liberia" },
    { code: "LY", name: "Libyan Arab Jamahiriya" },
    { code: "LI", name: "Liechtenstein" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "MO", name: "Macao" },
    { code: "MK", name: "Macedonia, The Former Yugoslav Republic of" },
    { code: "MG", name: "Madagascar" },
    { code: "MW", name: "Malawi" },
    { code: "MY", name: "Malaysia" },
    { code: "MV", name: "Maldives" },
    { code: "ML", name: "Mali" },
    { code: "MT", name: "Malta" },
    { code: "MH", name: "Marshall Islands" },
    { code: "MQ", name: "Martinique" },
    { code: "MR", name: "Mauritania" },
    { code: "MU", name: "Mauritius" },
    { code: "YT", name: "Mayotte" },
    { code: "MX", name: "Mexico" },
    { code: "FM", name: "Micronesia, Federated States of" },
    { code: "MD", name: "Moldova, Republic of" },
    { code: "MC", name: "Monaco" },
    { code: "MN", name: "Mongolia" },
    { code: "ME", name: "Montenegro" },
    { code: "MS", name: "Montserrat" },
    { code: "MA", name: "Morocco" },
    { code: "MZ", name: "Mozambique" },
    { code: "MM", name: "Myanmar" },
    { code: "NA", name: "Namibia" },
    { code: "NR", name: "Nauru" },
    { code: "NP", name: "Nepal" },
    { code: "NL", name: "Netherlands" },
    { code: "AN", name: "Netherlands Antilles" },
    { code: "NC", name: "New Caledonia" },
    { code: "NZ", name: "New Zealand" },
    { code: "NI", name: "Nicaragua" },
    { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigeria" },
    { code: "NU", name: "Niue" },
    { code: "NF", name: "Norfolk Island" },
    { code: "MP", name: "Northern Mariana Islands" },
    { code: "NO", name: "Norway" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PW", name: "Palau" },
    { code: "PS", name: "Palestinian Territory, Occupied" },
    { code: "PA", name: "Panama" },
    { code: "PG", name: "Papua New Guinea" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PN", name: "Pitcairn" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "PR", name: "Puerto Rico" },
    { code: "QA", name: "Qatar" },
    { code: "RE", name: "Reunion" },
    { code: "RO", name: "Romania" },
    { code: "RU", name: "Russian Federation" },
    { code: "RW", name: "Rwanda" },
    { code: "SH", name: "Saint Helena" },
    { code: "KN", name: "Saint Kitts and Nevis" },
    { code: "LC", name: "Saint Lucia" },
    { code: "PM", name: "Saint Pierre and Miquelon" },
    { code: "VC", name: "Saint Vincent and the Grenadines" },
    { code: "WS", name: "Samoa" },
    { code: "SM", name: "San Marino" },
    { code: "ST", name: "Sao Tome and Principe" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SN", name: "Senegal" },
    { code: "RS", name: "Serbia" },
    { code: "SC", name: "Seychelles" },
    { code: "SL", name: "Sierra Leone" },
    { code: "SG", name: "Singapore" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "SB", name: "Solomon Islands" },
    { code: "SO", name: "Somalia" },
    { code: "ZA", name: "South Africa" },
    { code: "GS", name: "South Georgia and the South Sandwich Islands" },
    { code: "ES", name: "Spain" },
    { code: "LK", name: "Sri Lanka" },
    { code: "SD", name: "Sudan" },
    { code: "SR", name: "Suriname" },
    { code: "SJ", name: "Svalbard and Jan Mayen" },
    { code: "SZ", name: "Swaziland" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "SY", name: "Syrian Arab Republic" },
    { code: "TW", name: "Taiwan, Province of China" },
    { code: "TJ", name: "Tajikistan" },
    { code: "TZ", name: "Tanzania, United Republic of" },
    { code: "TH", name: "Thailand" },
    { code: "TL", name: "Timor-Leste" },
    { code: "TG", name: "Togo" },
    { code: "TK", name: "Tokelau" },
    { code: "TO", name: "Tonga" },
    { code: "TT", name: "Trinidad and Tobago" },
    { code: "TN", name: "Tunisia" },
    { code: "TR", name: "Turkey" },
    { code: "TM", name: "Turkmenistan" },
    { code: "TC", name: "Turks and Caicos Islands" },
    { code: "TV", name: "Tuvalu" },
    { code: "UG", name: "Uganda" },
    { code: "UA", name: "Ukraine" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
    { code: "UM", name: "United States Minor Outlying Islands" },
    { code: "UY", name: "Uruguay" },
    { code: "UZ", name: "Uzbekistan" },
    { code: "VU", name: "Vanuatu" },
    { code: "VE", name: "Venezuela" },
    { code: "VN", name: "Viet Nam" },
    { code: "VG", name: "Virgin Islands, British" },
    { code: "VI", name: "Virgin Islands, U.S." },
    { code: "WF", name: "Wallis and Futuna" },
    { code: "EH", name: "Western Sahara" },
    { code: "YE", name: "Yemen" },
    { code: "ZM", name: "Zambia" },
    { code: "ZW", name: "Zimbabwe" },
    { code: "OTHER", name: "Other" }
  ];

  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark shadow-2xl overflow-x-hidden ltr`}>

      {/* Header */}
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mx-auto">
          <img src="/Sovereign-House-Logo.png" alt="Sovereign House GH Logo" className="h-10 object-contain" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight mb-2">{t('registration_app_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          {submitStatus === 'success' && <span className="text-green-600 font-bold block mb-4">{t('success_message')}</span>}
          {submitStatus === 'error' && <span className="text-red-600 font-bold block mb-4">{t('error_message')}</span>}
        </p>

        {/* Language Selector */}
        <section className="mb-8 mt-4">
          <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-3">{t('select_language')}</p>
          <div className="flex flex-wrap gap-2 pb-2">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-colors border ${i18n.language === lang.code
                  ? 'bg-primary text-white border-primary'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Form Fields - RTL applied here instead of global */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('refugee_number')}</label>
              <input
                {...register("refugeeNumber", { required: true })}
                className={`form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                type="text"
              />
              {errors.refugeeNumber && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('sovereign_reference')}</label>
              <input
                {...register("sovereignReference", { required: true })}
                className={`form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                type="text"
              />
              {errors.sovereignReference && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('name')}</label>
            <input
              {...register("name", { required: true })}
              className={`form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              type="text"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1">This field is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('nationality')}</label>
              <select
                {...register("nationality", { required: true })}
                className="form-select w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
              >
                <option value="">-- Select Country --</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.nationality && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('postcode')}</label>
              <input
                {...register("postcode", {
                  required: true,
                  pattern: {
                    value: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
                    message: "Enter a valid UK postcode (e.g. M1 1AA)"
                  }
                })}
                className="form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                type="text"
                placeholder="M7 2HW"
              />
              {errors.postcode?.type === 'required' && <span className="text-red-500 text-xs mt-1">This field is required</span>}
              {errors.postcode?.message && <span className="text-red-500 text-xs mt-1">{errors.postcode.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('dob')}</label>
            <input
              {...register("dob", { required: true })}
              className={`form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              type="date"
            />
            {errors.dob && <span className="text-red-500 text-xs mt-1">This field is required</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
            <input
              {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
              className={`form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              type="email"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1">A valid email is required</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('mobile')}</label>
            <input
              {...register("mobile", {
                required: true,
                pattern: {
                  value: /^(?:\+44|0)7\d{9}$/,
                  message: "Enter a valid UK mobile number"
                }
              })}
              className={`form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              type="tel"
              placeholder="07..."
            />
            {errors.mobile?.type === 'required' && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            {errors.mobile?.message && <span className="text-red-500 text-xs mt-1">{errors.mobile.message}</span>}
          </div>

          {/* IT Level Selector */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('it_level')}</label>
            <div className="grid grid-cols-3 gap-3">

              <label className="relative cursor-pointer">
                <input {...register("itLevel", { required: true })} className="peer sr-only" type="radio" value="beginner" />
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center h-14">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 peer-checked:text-primary">{t('it_beginner')}</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input {...register("itLevel", { required: true })} className="peer sr-only" type="radio" value="intermediate" />
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center h-14">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 peer-checked:text-primary">{t('it_intermediate')}</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input {...register("itLevel", { required: true })} className="peer sr-only" type="radio" value="advanced" />
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center h-14">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 peer-checked:text-primary">{t('it_advanced')}</span>
                </div>
              </label>

            </div>
            {errors.itLevel && <span className="text-red-500 text-xs mt-2 block">This field is required</span>}
          </div>

          <div className="mt-8"></div>

          {/* Footer Button - Added inside the form to trigger submit */}
          <footer className="p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-20">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : t('submit_registration')}</span>
              <span className="material-symbols-outlined">send</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest">Sovereign House GH • Secure Data Entry</p>
          </footer>

        </form>
      </main>

    </div>
  );
}

export default RegistrationForm;
