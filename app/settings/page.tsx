"use client";
import { GlobalOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Form, Input, Select, Switch, Typography, message } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { getSettingsTranslation } from "@/utils/dictionary_settings";
import {User} from "@/types/user";

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

const Settings = (): React.JSX.Element => {
  const router = useRouter();
  const api = useApi();
  
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: storedLanguage, set: setStoredLanguage } = useLocalStorage<string>("language", "en");

  const [autoTranslate, setAutoTranslate] = useState(true);
  const [dropdownLanguage, setDropdownLanguage] = useState<string>("en");

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.get<User>(`/users/${id}`);
        setUser(currentUser);
        setName(currentUser.name || "");
        setUsername(currentUser.username || "");
        
        // Sync the dropdown with the database preference
        if (currentUser.language) {
          setDropdownLanguage(currentUser.language);
        }
      } catch (e) { console.error("Failed to fetch user", e); }
    };
    if (id) fetchUser();
  }, [id, api]);

  // 2. DICTIONARY HOOK
  // Watches storedLanguage so the UI reflects the current session's language
  const ui = useMemo(() => {
    return getSettingsTranslation(storedLanguage || "en");
  }, [storedLanguage]);

  const handleSave = async () => {
    const hideLoading = message.loading(ui.successMessage, 0);
    try {
      await api.put(`/users/${id}`, {
        username,
        name, 
        password: password || undefined,
        language: dropdownLanguage // Save the new choice to the DB
      });
      
      // Update local storage so the next session uses the new language
      setStoredLanguage(dropdownLanguage);
      localStorage.setItem("language", JSON.stringify(dropdownLanguage));
      
      clearToken();
      clearId();
      
      hideLoading();
      message.success(ui.successMessage);
      router.push("/login");
    } catch (e) {
      hideLoading();
      message.error(ui.errorMessage);
    }
  };

  return (
    <Flex vertical align="center" justify="center" style={{ minHeight: "100vh", padding: "30px 16px", background: "#f0f2f5" }}>
      <Flex vertical gap={24} style={{ width: "100%", maxWidth: 854 }}>
        
        <Card title={<Flex align="center" gap={8}><UserOutlined />{ui.profileTitle}</Flex>}>
          <Form layout="vertical">
            <Form.Item label={<Text strong>{ui.usernameLabel}</Text>}>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Item>
            <Form.Item label={<Text strong>{ui.fullNameLabel}</Text>}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item label={<Text strong>{ui.emailLabel}</Text>}>
              <Input value={user?.email || ""} disabled />
            </Form.Item>
            <Form.Item label={<Text strong>{ui.newPasswordLabel}</Text>}>
              <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Form.Item>
            <Form.Item label={<Text strong>{ui.roleLabel}</Text>}>
              <Input value={user?.manager ? ui.managerRole : ui.memberRole} disabled />
            </Form.Item>
          </Form>
        </Card>

        <Card title={<Flex align="center" gap={8}><GlobalOutlined />{ui.languageTitle}</Flex>}>
          <Form layout="vertical">
            <Form.Item label={<Text strong>{ui.preferredLanguageLabel}</Text>}>
              <Select 
                value={dropdownLanguage} 
                onChange={(val) => setDropdownLanguage(val)}
                options={mBartLanguages}
                showSearch
              />
            </Form.Item>
          </Form>
        </Card>

        <Flex justify="flex-end" gap={12}>
          <Button onClick={() => router.push("/dashboard")}>{ui.cancelButton}</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ background: "#4f46e5", border: "none" }}>
            {ui.saveButton}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Settings;