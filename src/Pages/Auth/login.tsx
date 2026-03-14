import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Eye, EyeOff, AlertCircle } from "lucide-react"

import { useUserContext } from "@/contexts/UserContext"

import { persistUserContext } from "@/helpers/authResponseParser"
import { authenticateUser } from "./authService"

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setUserContext } = useUserContext()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Handle success message from signup
    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message)

            if (location.state.email) {
                setEmail(location.state.email)
            }

            window.history.replaceState({}, document.title)
        }

        // Remember Me restore
        const savedEmail = localStorage.getItem("rememberedEmail")
        const rememberEnabled = localStorage.getItem("rememberMe") === "true"

        if (savedEmail && rememberEnabled) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [location.state])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null) // Clear previous errors

        // Basic validation
        if (!email) {
            const errorMsg = "Email is required"
            setError(errorMsg)
            toast.error(errorMsg)
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            const errorMsg = "Please enter a valid email address"
            setError(errorMsg)
            toast.error(errorMsg)
            return
        }

        if (!password) {
            const errorMsg = "Password is required"
            setError(errorMsg)
            toast.error(errorMsg)
            return
        }

        try {
            setLoading(true)

            const parsedContext = await authenticateUser(email, password)

            setUserContext(parsedContext)

            // Remember Me logic
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", email)
                localStorage.setItem("rememberMe", "true")

                const expiry = new Date()
                expiry.setDate(expiry.getDate() + 30)
                localStorage.setItem("sessionExpiry", expiry.toISOString())
            } else {
                localStorage.removeItem("rememberedEmail")
                localStorage.removeItem("rememberMe")

                const expiry = new Date()
                expiry.setDate(expiry.getDate() + 1)
                localStorage.setItem("sessionExpiry", expiry.toISOString())
            }

            toast.success("Login successful 🎉")

            // Persist in background
            setTimeout(() => {
                persistUserContext(parsedContext)
            }, 0)

            navigate("/", { replace: true })

        } catch (err: any) {
            const errorMessage = err?.message || "Login failed. Please check your credentials."
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">


            <Card className="w-full flex flex-row max-w-7xl overflow-hidden rounded-3xl border-border/60 bg-card/90 shadow-2xl backdrop-blur">

                {/* LEFT PANEL */}
                <CardContent className="w-full sm:w-1/3 p-4 lg:p-6">

                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="mb-6 inline-flex items-center justify-center rounded-xl border border-border/60 bg-card/80 p-2 backdrop-blur-lg shadow-sm">
                            <img
                                src="/images/logo.png"
                                alt="Company Logo"
                                className="w-48"
                            />
                        </div>

                        <h1 className="mb-1 text-3xl font-bold text-foreground">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account
                        </p>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-6 max-w-md mx-auto"
                    >
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setError(null) // Clear error on input change
                                }}
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        setError(null) // Clear error on input change
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(v) => setRememberMe(Boolean(v))}
                                disabled={loading}
                            />
                            <Label htmlFor="remember" className="text-sm">
                                Keep me signed in
                            </Label>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                        Powered by{" "}
                        <span className="font-semibold text-foreground">
                            Synquerra
                        </span>
                        <div className="text-xs mt-1">
                            © {new Date().getFullYear()} • Privacy • Terms
                        </div>
                    </div>
                </CardContent>

                {/* RIGHT PANEL */}
                <div className="hidden sm:block sm:w-2/3 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                    <img
                        src="/images/loginbg.png"
                        alt="Login Illustration"
                        className="h-full object-fill"
                    />
                </div>

            </Card>
        </div>
    )
}
