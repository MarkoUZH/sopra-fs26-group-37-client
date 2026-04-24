// utils/dictionary_kanban.ts

export type Dictionary = Record<string, string>;

export const dictionaryKanban: Dictionary = {
  // --- TODO ---
  "TODO_af": "Te doen", "TODO_ar": "للقيام به", "TODO_az": "Edilməlidir", "TODO_bn": "করতে হবে",
  "TODO_cs": "K udělání", "TODO_de": "Zu tun", "TODO_en": "To Do", "TODO_es": "Por hacer",
  "TODO_et": "Tegemisel", "TODO_fa": "برای انجام", "TODO_fi": "Tehtävää", "TODO_fr": "À faire",
  "TODO_gl": "Por facer", "TODO_gu": "કરવા માટે", "TODO_he": "לביצוע", "TODO_hi": "करने के लिए",
  "TODO_hr": "Za napraviti", "TODO_id": "Tugas", "TODO_it": "Da fare", "TODO_ja": "未着手",
  "TODO_ka": "გასაკეთებელი", "TODO_kk": "Жасау керек", "TODO_km": "ត្រូវធ្វើ", "TODO_ko": "할 일",
  "TODO_lt": "Daryti", "TODO_lv": "Darāms", "TODO_mk": "За правење", "TODO_ml": "ചെയ്യാനുള്ളവ",
  "TODO_mn": "Хийх", "TODO_mr": "करायचे आहे", "TODO_my": "လုပ်ရန်", "TODO_ne": "गर्नु पर्ने",
  "TODO_nl": "Te doen", "TODO_pl": "Do zrobienia", "TODO_ps": "د کولو لپاره", "TODO_pt": "A fazer",
  "TODO_ro": "De făcut", "TODO_ru": "К исполнению", "TODO_si": "කිරීමට", "TODO_sl": "Za narediti",
  "TODO_sv": "Att göra", "TODO_sw": "Za kufanya", "TODO_ta": "செய்ய வேண்டியவை", "TODO_te": "చేయవలసినవి",
  "TODO_th": "ต้องทำ", "TODO_tl": "Gagawin", "TODO_tr": "Yapılacaklar", "TODO_uk": "Треба зробити",
  "TODO_ur": "کرنے کے لئے", "TODO_vi": "Cần làm", "TODO_xh": "Izinto zokwenza", "TODO_zh": "待办",

  // --- IN PROGRESS ---
  "IN_PROGRESS_af": "Besig", "IN_PROGRESS_ar": "قيد التنفيذ", "IN_PROGRESS_az": "İcra edilir", "IN_PROGRESS_bn": "চলমান",
  "IN_PROGRESS_cs": "V procesu", "IN_PROGRESS_de": "In Bearbeitung", "IN_PROGRESS_en": "In Progress", "IN_PROGRESS_es": "En progreso",
  "IN_PROGRESS_et": "Töös", "IN_PROGRESS_fa": "در حال انجام", "IN_PROGRESS_fi": "Keskeneräinen", "IN_PROGRESS_fr": "En cours",
  "IN_PROGRESS_gl": "En curso", "IN_PROGRESS_gu": "પ્રગતિમાં છે", "IN_PROGRESS_he": "בתהליך", "IN_PROGRESS_hi": "प्रगति पर है",
  "IN_PROGRESS_hr": "U tijeku", "IN_PROGRESS_id": "Sedang berjalan", "IN_PROGRESS_it": "In corso", "IN_PROGRESS_ja": "進行中",
  "IN_PROGRESS_ka": "მიმდინარე", "IN_PROGRESS_kk": "Орындалуда", "IN_PROGRESS_km": "កំពុងដំណើរការ", "IN_PROGRESS_ko": "진행 중",
  "IN_PROGRESS_lt": "Vykdoma", "IN_PROGRESS_lv": "Procesā", "IN_PROGRESS_mk": "Во тек", "IN_PROGRESS_ml": "പുരോഗമിക്കുന്നു",
  "IN_PROGRESS_mn": "Хийгдэж байна", "IN_PROGRESS_mr": "प्रगतीपथावर", "IN_PROGRESS_my": "လုပ်ဆောင်နေဆဲ", "IN_PROGRESS_ne": "प्रगतिमा",
  "IN_PROGRESS_nl": "In uitvoering", "IN_PROGRESS_pl": "W toku", "IN_PROGRESS_ps": "په کار کې", "IN_PROGRESS_pt": "Em curso",
  "IN_PROGRESS_ro": "În lucru", "IN_PROGRESS_ru": "В работе", "IN_PROGRESS_si": "සිදුවෙමින් පවතියි", "IN_PROGRESS_sl": "V teku",
  "IN_PROGRESS_sv": "Pågår", "IN_PROGRESS_sw": "Inaendelea", "IN_PROGRESS_ta": "செயலில் உள்ளது", "IN_PROGRESS_te": "పురోగతిలో ఉంది",
  "IN_PROGRESS_th": "กำลังดำเนินการ", "IN_PROGRESS_tl": "Kasalukuyang ginagawa", "IN_PROGRESS_tr": "Devam Ediyor", "IN_PROGRESS_uk": "У процесі",
  "IN_PROGRESS_ur": "جاری ہے", "IN_PROGRESS_vi": "Đang thực hiện", "IN_PROGRESS_xh": "Iyaqhuba", "IN_PROGRESS_zh": "进行中",

  // --- DONE ---
  "DONE_af": "Klaar", "DONE_ar": "مكتمل", "DONE_az": "Hazırdır", "DONE_bn": "সম্পন্ন",
  "DONE_cs": "Hotovo", "DONE_de": "Erledigt", "DONE_en": "Done", "DONE_es": "Hecho",
  "DONE_et": "Tehtud", "DONE_fa": "انجام شد", "DONE_fi": "Valmis", "DONE_fr": "Terminé",
  "DONE_gl": "Feito", "DONE_gu": "થઈ ગયું", "DONE_he": "בוצע", "DONE_hi": "हो गया",
  "DONE_hr": "Završeno", "DONE_id": "Selesai", "DONE_it": "Fatto", "DONE_ja": "完了",
  "DONE_ka": "დასრულდა", "DONE_kk": "Дайын", "DONE_km": "រួចរាល់", "DONE_ko": "완료",
  "DONE_lt": "Atlikta", "DONE_lv": "Pabeigts", "DONE_mk": "Готово", "DONE_ml": "കഴിഞ്ഞു",
  "DONE_mn": "Дууссан", "DONE_mr": "झाले", "DONE_my": "ပြီးပြီ", "DONE_ne": "सकियो",
  "DONE_nl": "Klaar", "DONE_pl": "Gotowe", "DONE_ps": "بشپړ شو", "DONE_pt": "Concluído",
  "DONE_ro": "Gata", "DONE_ru": "Готово", "DONE_si": "අහවරයි", "DONE_sl": "Opravljeno",
  "DONE_sv": "Klar", "DONE_sw": "Tayari", "DONE_ta": "முடிந்தது", "DONE_te": "అయింది",
  "DONE_th": "เสร็จสิ้น", "DONE_tl": "Tapos na", "DONE_tr": "Bitti", "DONE_uk": "Готово",
  "DONE_ur": "ہو گیا", "DONE_vi": "Xong", "DONE_xh": "Gqityiwe", "DONE_zh": "已完成",
};

export const getKanbanTranslation = (key: string, lang: string): string => {
  const lookupKey = `${key}_${lang}`;
  return dictionaryKanban[lookupKey] || dictionaryKanban[`${key}_en`] || key;
};