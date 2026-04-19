"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { Button, Form, Input, message, Select } from "antd"; // Added Select for language dropdown
import { useEffect, useState } from "react"; // Added useState

// --- INLINE DEPENDENCIES FOR PREVIEW ENVIRONMENT ---
// These replace the Next.js and custom hooks so the code compiles in the browser,
// while STILL making real network requests to your local Spring Boot backend 
const useRouter = () => ({ push: (url: string) => console.log("Navigating to:", url) });
const useSearchParams = () => ({ get: (param: string) => null });

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const setValue = (value: T) => {
    setStoredValue(value);
    if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
  };
  return { set: setValue, value: storedValue };
}

const useApi = () => {
  return {
    post: async <T = any>(endpoint: string, data: any): Promise<T> => {
      // Pointing to the typical local Spring Boot port for real translation tests
      const baseUrl = "http://localhost:8080";
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': localStorage.getItem('token') || '' 
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return response.json() as Promise<T>;
      }
      return response.text() as unknown as Promise<T>;
    }
  };
};

interface User { token?: string; id?: string; language?: string; }
// --------------------------------------------------

interface FormFieldProps {
  label: string;
  value: string;
}

// 1. Define your base English text outside the component to avoid recreation
const baseText = {
  usernameLabel: "Username",
  usernamePlaceholder: "Enter username",
  usernameError: "Please input your username!",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter password",
  passwordError: "Please input your password!",
  loginButton: "Login",
  registerButton: "No account yet? Register here"
};

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // 2. State for the UI text and the selected language
  const [uiText, setUiText] = useState(baseText);
  const [targetLanguage, setTargetLanguage] = useState('en');

  // 3. Translation Effect
  useEffect(() => {
    const translatePage = async () => {
      // If English, just use the base text
      if (targetLanguage === 'en') {
        setUiText(baseText);
        return;
      }

      // Helper function to call your API Service for a single string
      const translate = async (text: string) => {
        try {
          return await apiService.post<string>('/translate', {
            text: text,
            sourceLanguage: 'en',
            language: targetLanguage
          });
        } catch (err) {
          console.error("Translation failed for text:", text, err);
          return text; // Fallback to English if the translation fails
        }
      };

      // 4. Use Promise.all to fetch all translations simultaneously! 
      // Doing this one by one with await would make the page incredibly slow.
      const [
        usernameLabel, usernamePlaceholder, usernameError,
        passwordLabel, passwordPlaceholder, passwordError,
        loginButton, registerButton
      ] = await Promise.all([
        translate(baseText.usernameLabel),
        translate(baseText.usernamePlaceholder),
        translate(baseText.usernameError),
        translate(baseText.passwordLabel),
        translate(baseText.passwordPlaceholder),
        translate(baseText.passwordError),
        translate(baseText.loginButton),
        translate(baseText.registerButton)
      ]);

      // Update the UI state with the translated strings
      setUiText({
        usernameLabel, usernamePlaceholder, usernameError,
        passwordLabel, passwordPlaceholder, passwordError,
        loginButton, registerButton
      });
    };

    translatePage();
  }, [targetLanguage, apiService]); // Re-run whenever targetLanguage changes

  useEffect(() => {
    if (error === "unauthorized") {
      message.error("Please log in to access this page.");
    }
  }, [error]);

  const {
    set: setToken, 
  } = useLocalStorage<string>("token", ""); 
  const { set: setUserId } = useLocalStorage<string>("id", "");
  
  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/login", values);

      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(response.id);
      }

      if(response.language) { 
        // Important: If your user object returns their preferred language, 
        // you might want to use this to set `targetLanguage` globally later!
        localStorage.setItem("language", JSON.stringify(response.language));
      }

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container">
      {/* Language Dropdown Selector aligned to the right */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <Select
          value={targetLanguage}
          onChange={(value) => setTargetLanguage(value)}
          style={{ width: 120 }}
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
            { value: 'it', label: 'Italiano' },
            // Add more languages as needed
          ]}
        />
      </div>

      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label={uiText.usernameLabel}
          rules={[{ required: true, message: uiText.usernameError }]}
        >
          <Input placeholder={uiText.usernamePlaceholder} />
        </Form.Item>
        
        <Form.Item
          name="password"
          label={uiText.passwordLabel}
          rules={[{ required: true, message: uiText.passwordError }]}
        >
          <Input.Password placeholder={uiText.passwordPlaceholder} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            {uiText.loginButton}
          </Button>
        </Form.Item>
      
        <Form.Item>
          <Button 
            type="primary" 
            block 
            className="register-button"
            onClick={() => router.push("/register")} 
          >
            {uiText.registerButton}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;