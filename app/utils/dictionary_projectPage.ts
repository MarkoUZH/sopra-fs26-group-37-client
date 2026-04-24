// utils/dictionary_pages.ts

export type Dictionary = Record<string, string>;

export const dictionaryPages: Dictionary = {
  // --- Back to dashboard ---
  "Back to dashboard_af": "Terug na paneel", "Back to dashboard_ar": "العودة إلى لوحة القيادة", "Back to dashboard_az": "İdarə panelinə qayıt",
  "Back to dashboard_bn": "ড্যাশবোর্ডে ফিরে যান", "Back to dashboard_cs": "Zpět na nástěnku", "Back to dashboard_de": "Zurück zum Dashboard",
  "Back to dashboard_en": "Back to dashboard", "Back to dashboard_es": "Volver al tablero", "Back to dashboard_et": "Tagasi töölauale",
  "Back to dashboard_fa": "بازگشت به داشبورد", "Back to dashboard_fi": "Takaisin hallintapaneeliin", "Back to dashboard_fr": "Retour au tableau de bord",
  "Back to dashboard_gl": "Volver ao taboleiro", "Back to dashboard_gu": "ડેશબોર્ડ પર પાછા જાઓ", "Back to dashboard_he": "חזור ללוח הבקרה",
  "Back to dashboard_hi": "डैशबोर्ड पर वापस जाएं", "Back to dashboard_hr": "Povratak na nadzornu ploču", "Back to dashboard_id": "Kembali ke dasbor",
  "Back to dashboard_it": "Torna alla bacheca", "Back to dashboard_ja": "ダッシュボードに戻る", "Back to dashboard_ka": "დაფაზე დაბრუნება",
  "Back to dashboard_kk": "Бақылау тақтасына оралу", "Back to dashboard_km": "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង", "Back to dashboard_ko": "대시보드로 돌아가기",
  "Back to dashboard_lt": "Grįžti į skydelį", "Back to dashboard_lv": "Atpakaļ uz mērinstrumentu paneli", "Back to dashboard_mk": "Назад до таблата",
  "Back to dashboard_ml": "ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക", "Back to dashboard_mn": "Хянахлах самбар руу буцах", "Back to dashboard_mr": "डॅशबोर्डवर परत जा",
  "Back to dashboard_my": "ဒိုင်ခွက်သို့ပြန်သွားရန်", "Back to dashboard_ne": "ड्यासबोर्डमा फर्कनुहोस्", "Back to dashboard_nl": "Terug naar dashboard",
  "Back to dashboard_pl": "Wróć do pulpitu", "Back to dashboard_ps": "ډشبورډ ته بیرته ستنیدل", "Back to dashboard_pt": "Voltar ao painel",
  "Back to dashboard_ro": "Înapoi la panou", "Back to dashboard_ru": "Назад в панель", "Back to dashboard_si": "පාලක පුවරුවට ආපසු යන්න",
  "Back to dashboard_sl": "Nazaj na nadzorno ploščo", "Back to dashboard_sv": "Tillbaka till instrumentpanelen", "Back to dashboard_sw": "Rudi kwenye dashibodi",
  "Back to dashboard_ta": "டாஷ்போர்டிற்குச் செல்க", "Back to dashboard_te": "డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", "Back to dashboard_th": "กลับไปที่แดชบอร์ด",
  "Back to dashboard_tl": "Bumalik sa dashboard", "Back to dashboard_tr": "Panele geri dön", "Back to dashboard_uk": "Назад до панелі",
  "Back to dashboard_ur": "ڈیش بورڈ پر واپس جائیں", "Back to dashboard_vi": "Quay lại bảng điều khiển", "Back to dashboard_xh": "Buyela kwideshibhodi",
  "Back to dashboard_zh": "回到仪表板",

  // --- Task board ---
  "Task board_af": "Taakbord", "Task board_ar": "لوحة المهام", "Task board_de": "Aufgabenbrett",
  "Task board_en": "Task board", "Task board_es": "Tablero de tareas", "Task board_fr": "Tableau des tâches",
  "Task board_it": "Bacheca attività", "Task board_ja": "タスクボード", "Task board_ko": "작업 보드",
  "Task board_ru": "Доска задач", "Task board_tr": "Görev panosu", "Task board_zh": "任务板",

  // --- Add Task ---
  "Add Task_af": "Voeg taak by", "Add Task_ar": "إضافة مهمة", "Add Task_de": "Aufgabe hinzufügen",
  "Add Task_en": "Add Task", "Add Task_es": "Añadir tarea", "Add Task_fr": "Ajouter une tâche",
  "Add Task_it": "Aggiungi attività", "Add Task_ja": "タスクを追加", "Add Task_ko": "작업 추가",
  "Add Task_ru": "Добавить задачу", "Add Task_tr": "Görev Ekle", "Add Task_zh": "添加任务",
};

export const getPageTranslation = (key: string, lang: string): string => {
  const lookupKey = `${key}_${lang}`;
  return dictionaryPages[lookupKey] || dictionaryPages[`${key}_en`] || key;
};