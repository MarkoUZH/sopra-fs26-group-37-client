"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, Select } from "antd"; //added select for dropdown
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";
import ISO6391 from 'iso-639-1'; // for the languages

//fetching all the language options
export const getLanguageOptions = () => {
  // Get all language codes (en, es, fr, etc.)
  const codes = ISO6391.getAllCodes();

  return codes.map(code => ({
    // Use the Native name (e.g., "Español") for better UX
    label: ISO6391.getNativeName(code), 
    value: code,
  })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
};



interface RegisterFormValues {
  username: string;
  email: string;
  language: string;
  password: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const languageOptions = getLanguageOptions(); //using the helper function from above
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");





  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", values);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      // Navigate to the user overview
      router.push("/users");
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
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
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
          rules={[{ required: true, message: "Please input your email!" }]}
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
                options={languageOptions}
                // This line forces the dropdown to stay inside your styled div
                getPopupContainer={(trigger) => trigger.parentElement}
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



        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Register
          </Button>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="button"
            block 
            className="login-button"
            onClick={() => router.push("/login")} // Redirect logic here
          >
            Have an Account? Login here
          </Button>
        </Form.Item>

      </Form>
    </div>
  );
};

export default Register;
