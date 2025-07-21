import { useState } from "react";
import { Redirect } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "../../../shared/schema";
import { z } from "zod";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema
// const registerSchema = insertUserSchema.omit({ id: true });


type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in (after hooks to avoid rules of hooks violation)
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Sign in to access your calendar" 
                : "Get started with your personal calendar"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      className="pl-10"
                      placeholder="Enter your username"
                      {...loginForm.register("username")}
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      placeholder="Enter your password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      className="pl-10"
                      placeholder="Choose a username"
                      {...registerForm.register("username")}
                    />
                  </div>
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="Enter your email"
                      {...registerForm.register("email")}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      placeholder="Create a password"
                      {...registerForm.register("password")}
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  loginForm.reset();
                  registerForm.reset();
                }}
                className="text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="h-full flex flex-col justify-center px-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6">
              Organize Your Life with Smart Scheduling
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Keep track of your events, appointments, and tasks with our intuitive calendar application.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Daily, weekly, and monthly views</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Multiple events per day support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Event categorization and color coding</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Responsive design for all devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}