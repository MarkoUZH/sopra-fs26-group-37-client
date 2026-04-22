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
                    <Input placeholder="Enter username" />
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