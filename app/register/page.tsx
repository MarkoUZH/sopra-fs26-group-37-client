"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Checkbox, Form, Input, Select } from "antd";
import React from "react";

// mBART-large-50 supported languages (52 total)
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

interface RegisterFormValues {
  name: string;
  username: string;
  email: string;
  language: string;
  password: string;
  manager: boolean;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const { set: setToken } = useLocalStorage<string>("token", ""); 
  const { set: setUserId } = useLocalStorage<string>("id", "");

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const response = await apiService.post<User>("/users", values);

      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(response.id);
      }

      if (response.language) { 
        // Sync with the global language state used in Dashboard/Settings
        localStorage.setItem("language", JSON.stringify(response.language));
      }

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during registration:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="name" 
          label="Full Name"
          rules={[{ required: true, message: "Please input your full name!" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "The input is not a valid email address!" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="language"
          label="Preferred Language"
          rules={[{ required: true, message: "Please select your language!" }]}
        >
          <Select
            showSearch
            placeholder="Search for a language"
            options={mBartLanguages}
            getPopupContainer={(trigger) => trigger.parentElement!}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
      
        <Form.Item 
          name="manager" 
          valuePropName="checked"
          initialValue={false}
        > 
          <Checkbox>Register as a Manager</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Register
          </Button>
        </Form.Item>

        <Form.Item>
          <Button 
            type="link"
            block 
            onClick={() => router.push("/login")}
          >
            Have an Account? Login here
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;