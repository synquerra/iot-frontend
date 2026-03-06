import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Eye } from "lucide-react"



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

        // Basic validation
        if (!email) {
            toast.error("Email is required")
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address")
            return
        }

        if (!password) {
            toast.error("Password is required")
            return
        }

        try {
            setLoading(true)

            const parsedContext = await authenticateUser(email, password)
            console.log(parsedContext);

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

            navigate("/")

            // Persist in background
            setTimeout(() => {
                persistUserContext(parsedContext)
            }, 0)

        } catch (err: any) {
            toast.error(
                err?.message || "Login failed. Please check your credentials."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">


            <Card className="w-full flex flex-row max-w-7xl overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur border border-white/20">

                {/* LEFT PANEL */}
                <CardContent className="w-full sm:w-1/3 p-4 lg:p-6">

                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center bg-slate-900/40 backdrop-blur-lg rounded-xl p-2 mb-6">
                            <img
                                src="/images/logo.png"
                                alt="Company Logo"
                                className="w-48"
                            />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Sign in to your account
                        </p>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-6 max-w-md mx-auto"
                    >
                        {/* Email */}
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Eye className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground cursor-pointer" />
                            </div>
                        </div>

                        {/* Remember */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(v) => setRememberMe(Boolean(v))}
                            />
                            <Label htmlFor="remember" className="text-sm">
                                Keep me signed in
                            </Label>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e3c6e] hover:bg-[#1e3b6edf]"
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
                <div className="hidden sm:block sm:w-2/3 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
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