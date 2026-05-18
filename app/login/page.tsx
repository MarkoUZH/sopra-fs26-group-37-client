"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface FormFieldProps {
    label: string;
    value: string;
}

// Define an explicit structure for API errors to appease the Vercel compiler
interface ApiNetworkError {
    status?: number;
    statusCode?: number;
    message?: string;
}

const LoginErrorHandler: React.FC = () => {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    useEffect(() => {
        if (error === "unauthorized") {
            message.error("Please log in to access this page.");
        }
    }, [error]);

    return null;
};

const Login: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();

    const { set: setToken } = useLocalStorage<string>("token", "");
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
            if (response.language) {
                localStorage.setItem("language", JSON.stringify(response.language));
            }

            message.success("Welcome back!");
            router.push("/dashboard");
        } catch (rawError: unknown) {
            console.error("Login raw error:", rawError);
            
            // Cast unknown to our safe structural interface
            const error = rawError as ApiNetworkError;
            const httpStatus = error.status ?? error.statusCode;
            
            // 1. Check for network connection failures
            if (!httpStatus && error.message?.toLowerCase().includes("fetch")) {
                message.error("Unable to connect to the server. Please check your internet connection.");
            } 
            // 2. Handle missing or wrong credentials
            else if (httpStatus === 401 || httpStatus === 404) {
                message.error("The username or password you entered is incorrect.");
            } 
            // 3. Fallback for unhandled server issues
            else {
                message.error("Something went wrong during login. Please try again later.");
            }
        }
    };

    return (
        <div className="login-container">
            <Suspense fallback={null}>
                <LoginErrorHandler />
            </Suspense>
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
                    label="Username"
                    rules={[{ required: true, message: "Please input your username!" }]}
                >
                    <Input placeholder="Enter username" maxLength={255} />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: "Please input your password!" }]}
                >
                    <Input.Password placeholder="Enter password" maxLength={255} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-button">
                        Login
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        block
                        className="register-button"
                        onClick={() => router.push("/register")}
                    >
                        No account yet? Register here
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;