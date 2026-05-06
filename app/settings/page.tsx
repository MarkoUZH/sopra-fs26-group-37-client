"use client";
import { GlobalOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState, useMemo } from "react";

// --- ACTUAL PROJECT IMPORTS ---
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
// ------------------------------

interface User { 
  token?: string; 
  id?: string; 
  language?: string; 
  name?: string; 
  username?: string; 
  manager?: boolean; 
  email?: string; 
}

const { Title, Text } = Typography;

const mBartLanguages = [
  { value: "af", label: "Afrikaans" }, { value: "ar", label: "Arabic" }, { value: "az", label: "Azerbaijani" },
  { value: "bn", label: "Bengali" }, { value: "cs", label: "Czech" }, { value: "de", label: "German" },
  { value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "et", label: "Estonian" },
  { value: "fa", label: "Persian" }, { value: "fi", label: "Finnish" }, { value: "fr", label: "French" },
  { value: "gl", label: "Galician" }, { value: "gu", label: "Gujarati" }, { value: "he", label: "Hebrew" },
  { value: "hi", label: "Hindi" }, { value: "hr", label: "Croatian" }, { value: "id", label: "Indonesian" },
  { value: "it", label: "Italian" }, { value: "ja", label: "Japanese" }, { value: "ka", label: "Georgian" },
  { value: "kk", label: "Kazakh" }, { value: "km", label: "Khmer" }, { value: "ko", label: "Korean" },
  { value: "lt", label: "Lithuanian" }, { value: "lv", label: "Latvian" }, { value: "mk", label: "Macedonian" },
  { value: "ml", label: "Malayalam" }, { value: "mn", label: "Mongolian" }, { value: "mr", label: "Marathi" },
  { value: "my", label: "Burmese" }, { value: "ne", label: "Nepali" }, { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" }, { value: "ps", label: "Pashto" }, { value: "pt", label: "Portuguese" },
  { value: "ro", label: "Romanian" }, { value: "ru", label: "Russian" }, { value: "si", label: "Sinhala" },
  { value: "sl", label: "Slovene" }, { value: "sv", label: "Swedish" }, { value: "sw", label: "Swahili" },
  { value: "ta", label: "Tamil" }, { value: "te", label: "Telugu" }, { value: "th", label: "Thai" },
  { value: "tl", label: "Tagalog" }, { value: "tr", label: "Turkish" }, { value: "uk", label: "Ukrainian" },
  { value: "ur", label: "Urdu" }, { value: "vi", label: "Vietnamese" }, { value: "xh", label: "Xhosa" },
  { value: "zh", label: "Chinese" }
];

const baseText = {
  profileTitle: "Profile",
  usernameLabel: "Username",
  fullNameLabel: "Full name",
  emailLabel: "Email",
  newPasswordLabel: "New Password",
  roleLabel: "Role",
  managerRole: "Manager",
  memberRole: "Member",
  languageTitle: "Language & Translation",
  preferredLanguageLabel: "Preferred Language",
  autoTranslateLabel: "Automatic Translation",
  cancelButton: "Cancel",
  saveButton: "Save Changes",
  successMessage: "Profile updated! Logging out to apply changes...",
  errorMessage: "Failed to save changes."
};

const Settings = (): React.JSX.Element => {
  const router = useRouter();
  const api = useApi();
  
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  
  // Storage Hooks
  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  // Initializing dropdownLanguage from storedLanguage to prevent immediate "English" diversion
  const { value: storedLanguage, set: setStoredLanguage } = useLocalStorage<string>("language", "en");

  const [autoTranslate, setAutoTranslate] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [uiText, setUiText] = useState(baseText);
  const [dropdownLanguage, setDropdownLanguage] = useState<string>(storedLanguage || "en");

  // 1. Fetch User Data and sync backend language if necessary
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const currentUser = await api.get<User>(`/users/${id}`);
        if (!isMounted) return;

        setUser(currentUser);
        setName(currentUser.name || "");
        setUsername(currentUser.username || "");
        
        // If the backend has a different language preference than what we have locally, 
        // and we haven't manually changed the dropdown yet this session, sync them.
        if (currentUser.language && currentUser.language !== dropdownLanguage) {
          // If the user's backend language is set, we prioritize it to fix the "divert to English" issue
          setDropdownLanguage(currentUser.language);
          setStoredLanguage(currentUser.language);
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    
    if (id) {
      fetchUser();
    }
    return () => { isMounted = false; };
  }, [id, api]);

  // 2. Initial Load: Sync dropdown with the stored preference when the hook provides it
  useEffect(() => {
    if (storedLanguage && storedLanguage !== dropdownLanguage) {
      setDropdownLanguage(storedLanguage);
    }
  }, [storedLanguage]);

  // 3. Translation logic: Translates UI whenever dropdownLanguage changes
  useEffect(() => {
    let isCancelled = false;
    let authErrorShown = false;

    const translatePage = async () => {
      // Revert to English instantly if English is selected
      if (!dropdownLanguage || dropdownLanguage === "en") {
        setUiText(baseText);
        return;
      }

        const translate = async (text: string): Promise<string> => {
            try {
                const result = await api.post<{ text?: () => Promise<string> } | string>("/translate", {
                    text: text,
                    sourceLanguage: "en",
                    language: dropdownLanguage,
                });

                const translated = (result && typeof result === 'object' && typeof result.text === 'function')
                    ? await result.text()
                    : result;

                return (typeof translated === 'string' && translated.trim() !== "") ? translated : text;
            } catch (err) {
                if (err instanceof Error && err.message.includes("401") && !authErrorShown) {
                    authErrorShown = true;
                    message.warning("Translation requires authorization.");
                }
                return text;
            }
        };

      const keys = Object.keys(baseText) as Array<keyof typeof baseText>;
      const translations = await Promise.all(keys.map(key => translate(baseText[key])));

      if (isCancelled) return;

      const newUiText = {} as typeof baseText;
      keys.forEach((key, index) => {
        newUiText[key] = translations[index] || baseText[key];
      });

      setUiText(newUiText);
    };

    translatePage();
    return () => { isCancelled = true; };
  }, [dropdownLanguage, api]);

  const handleSave = async () => {
    const hideLoading = message.loading("Saving changes and logging out...", 0);
    try {
      const updateData = {
        username: username,
        name: name, 
        password: password,
        language: dropdownLanguage 
      };

      // 1. Update Backend (Permanently change language to "hi" etc.)
      await api.put(`/users/${id}`, updateData);
      
      // 2. Clear Session Data
      clearToken();
      clearId();
      
      // 3. Update Language Preference in storage so it hits the login/dashboard correctly
      if (typeof window !== "undefined") {
        setStoredLanguage(dropdownLanguage);
        localStorage.setItem("language", JSON.stringify(dropdownLanguage));
      }

      hideLoading();
      message.success(uiText.successMessage);
      
      // 4. Redirect to login
      router.push("/login");
    } catch (e) {
      hideLoading();
      console.error("Failed to save changes:", e);
      message.error(uiText.errorMessage);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard"); 
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: "100vh", padding: "30px 16px", background: "#f0f2f5" }}
    >
      <Flex vertical gap={24} style={{ width: "100%", maxWidth: 854 }}>
        <Card title={<Flex align="center" gap={8}><UserOutlined />{uiText.profileTitle}</Flex>}>
          <Form layout="vertical">
            <Form.Item label={<Text strong>{uiText.usernameLabel}</Text>}>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={255} />
            </Form.Item>
            <Form.Item label={<Text strong>{uiText.fullNameLabel}</Text>}>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
            </Form.Item>
            <Form.Item label={<Text strong>{uiText.emailLabel}</Text>}>
              <Input value={user?.email || ""} disabled />
            </Form.Item>
            <Form.Item label={<Text strong>{uiText.newPasswordLabel}</Text>}>
              <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} maxLength={255} />
            </Form.Item>
            <Form.Item label={<Text strong>{uiText.roleLabel}</Text>}>
              <Input value={user?.manager ? uiText.managerRole : uiText.memberRole} disabled />
            </Form.Item>
          </Form>
        </Card>

        <Card title={<Flex align="center" gap={8}><GlobalOutlined />{uiText.languageTitle}</Flex>}>
          <Form layout="vertical">
            <Form.Item label={<Text strong>{uiText.preferredLanguageLabel}</Text>}>
              <Select 
                value={dropdownLanguage || undefined} 
                onChange={(val) => setDropdownLanguage(val)}
                options={mBartLanguages}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Flex justify="space-between" align="center">
                <Text>{uiText.autoTranslateLabel}</Text>
                <Switch checked={autoTranslate} onChange={setAutoTranslate} />
              </Flex>
            </Form.Item>
          </Form>
        </Card>

        <Flex justify="flex-end" gap={12}>
          <Button onClick={handleCancel}>{uiText.cancelButton}</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            {uiText.saveButton}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Settings;