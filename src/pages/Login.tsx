import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types';
import { useNavigate } from 'react-router-dom'; // Đảm bảo bạn đã import
import { useContext } from 'react'; // Import nếu bạn dùng context trực tiếp
import { AuthContext } from '../contexts/AuthProvider'; // Import context

export default function Login() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = '#/';
    }
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    console.log('1. [Login Page] - Bắt đầu quá trình đăng nhập...');

    const result = await auth.login(formData); // Giả sử formData chứa username/password

    console.log('2. [Login Page] - Kết quả từ hàm login:', result);

    if (result.success) {
      console.log('3. [Login Page] - Đăng nhập thành công! Chuẩn bị chuyển hướng đến /');
      navigate('/'); // Sử dụng navigate để chuyển hướng
    } else {
      // Xử lý lỗi
      console.error('Login failed on UI:', result.message);
    }
  };

  const goToRegister = () => {
    window.location.hash = '#/register';
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your expense tracker account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Demo credentials:</strong><br />
                  Username: testuser<br />
                  Password: Password123!
                </AlertDescription>
              </Alert>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
              >
                {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
              </Button>

              <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
              </span>
                <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={goToRegister}
                >
                  Sign up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
