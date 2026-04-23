// utils/dictionary_sidebar.ts

export type Dictionary = Record<string, string>;

export const dictionarySidebar: Dictionary = {
  // --- Roles ---
  "Manager_en": "Manager", "Manager_fr": "Gestionnaire", "Manager_es": "Gerente", "Manager_de": "Manager", "Manager_it": "Gestore", "Manager_pt": "Gerente", "Manager_ru": "Менеджер", "Manager_zh": "经理", "Manager_ja": "マネージャー", "Manager_ko": "관리자",
  "Member_en": "Member", "Member_fr": "Membre", "Member_es": "Miembro", "Member_de": "Mitglied", "Member_it": "Membro", "Member_pt": "Membro", "Member_ru": "Участник", "Member_zh": "成员", "Member_ja": "メンバー", "Member_ko": "회원",

  // --- Sections ---
  "MAIN_en": "MAIN", "MAIN_fr": "PRINCIPAL", "MAIN_es": "PRINCIPAL", "MAIN_de": "HAUPTMENÜ", "MAIN_it": "PRINCIPALE", "MAIN_pt": "PRINCIPAL", "MAIN_ru": "ГЛАВНОЕ", "MAIN_zh": "主菜单", "MAIN_ja": "メイン", "MAIN_ko": "메인",
  "SETTINGS_SECTION_en": "SETTINGS", "SETTINGS_SECTION_fr": "PARAMÈTRES", "SETTINGS_SECTION_es": "AJUSTES", "SETTINGS_SECTION_de": "EINSTELLUNGEN", "SETTINGS_SECTION_it": "IMPOSTAZIONI", "SETTINGS_SECTION_pt": "CONFIGURAÇÕES", "SETTINGS_SECTION_ru": "НАСТРОЙКИ", "SETTINGS_SECTION_zh": "设置", "SETTINGS_SECTION_ja": "設定", "SETTINGS_SECTION_ko": "설정",

  // --- Nav Items ---
  "Dashboard_en": "Dashboard", "Dashboard_fr": "Tableau de bord", "Dashboard_es": "Tablero", "Dashboard_de": "Dashboard", "Dashboard_it": "Bacheca", "Dashboard_pt": "Painel", "Dashboard_ru": "Панель", "Dashboard_zh": "仪表板", "Dashboard_ja": "ダッシュボード", "Dashboard_ko": "대시보드",
  "Projects_en": "Projects", "Projects_fr": "Projets", "Projects_es": "Proyectos", "Projects_de": "Projekte", "Projects_it": "Progetti", "Projects_pt": "Projetos", "Projects_ru": "Проекты", "Projects_zh": "项目", "Projects_ja": "プロジェクト", "Projects_ko": "프로젝트",
  "Tags_en": "Tags", "Tags_fr": "Étiquettes", "Tags_es": "Etiquetas", "Tags_de": "Tags", "Tags_it": "Tag", "Tags_pt": "Etiquetas", "Tags_ru": "Теги", "Tags_zh": "标签", "Tags_ja": "タグ", "Tags_ko": "태그",
  "Sprints_en": "Sprints", "Sprints_fr": "Sprints", "Sprints_es": "Sprints", "Sprints_de": "Sprints", "Sprints_it": "Sprint", "Sprints_pt": "Sprints", "Sprints_ru": "Спринты", "Sprints_zh": "冲刺", "Sprints_ja": "スプリント", "Sprints_ko": "스프린트",
  "Settings_en": "Settings", "Settings_fr": "Paramètres", "Settings_es": "Configuración", "Settings_de": "Einstellungen", "Settings_it": "Impostazioni", "Settings_pt": "Configurações", "Settings_ru": "Настройки", "Settings_zh": "设置", "Settings_ja": "設定", "Settings_ko": "설정",
  "Logout_en": "Logout", "Logout_fr": "Déconnexion", "Logout_es": "Cerrar sesión", "Logout_de": "Abmelden", "Logout_it": "Disconnetti", "Logout_pt": "Sair", "Logout_ru": "Выйти", "Logout_zh": "登出", "Logout_ja": "ログアウト", "Logout_ko": "로그아웃",
};

export const getSidebarTranslation = (key: string, lang: string): string => {
  const lookupKey = `${key}_${lang}`;
  return dictionarySidebar[lookupKey] || dictionarySidebar[`${key}_en`] || key;
};