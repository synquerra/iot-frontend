import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "@/lib/toast";

import {
  Button,
  Checkbox,
  TextInput,
  PasswordInput,
  Alert,
  Text,
  Title,
  Box,
  Image,
  Group,
  Stack,
  Center,
  Paper,
} from "@mantine/core"

import { AlertCircle } from "lucide-react"

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
        <Box className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
            <Paper className="w-full max-w-7xl overflow-hidden rounded-3xl border border-border/60 shadow-2xl backdrop-blur" bg="var(--mantine-color-body)">
                <Group wrap="nowrap" align="stretch" gap={0}>
                    {/* LEFT PANEL */}
                    <Box className="w-full sm:w-1/3 p-4 lg:p-8 flex flex-col justify-center">
                        {/* Logo */}
                        <Center mb="xl" className="flex-col">
                            <Box className="mb-4 inline-flex items-center justify-center rounded-xl border border-border/60 bg-slate-900 p-2 backdrop-blur-lg shadow-sm">
                                <Image
                                    src="/images/logo.png"
                                    alt="Company Logo"
                                    w={144}
                                />
                            </Box>

                            <Title order={1} size="h3" className="mb-1 text-foreground tracking-tight">
                                Welcome Back
                            </Title>
                            <Text size="xs" fw={500} c="dimmed" tt="uppercase" className="tracking-widest opacity-60">
                                Sign in to your account
                            </Text>
                        </Center>

                        <form onSubmit={handleLogin} className="max-w-md mx-auto w-full">
                            <Stack gap="md">
                                {/* Error Alert */}
                                {error && (
                                    <Alert variant="light" color="red" icon={<AlertCircle size="1rem" />}>
                                        {error}
                                    </Alert>
                                )}

                                {/* Email */}
                                <TextInput
                                    label="Email Address"
                                    withAsterisk
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.currentTarget.value)
                                        setError(null)
                                    }}
                                    disabled={loading}
                                />

                                {/* Password */}
                                <PasswordInput
                                    label="Password"
                                    withAsterisk
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.currentTarget.value)
                                        setError(null)
                                    }}
                                    disabled={loading}
                                />

                                {/* Remember */}
                                <Checkbox
                                    label="Keep me signed in"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                                    disabled={loading}
                                    mt="xs"
                                />

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    loading={loading}
                                    fullWidth
                                    mt="md"
                                    size="md"
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </form>

                        {/* Footer */}
                        <Box className="mt-12 pt-8 border-t border-border text-center">
                            <Text size="sm" c="dimmed">
                                Powered by{" "}
                                <span className="font-semibold text-foreground">
                                    Synquerra
                                </span>
                            </Text>
                            <Text size="xs" c="dimmed" mt={4}>
                                © {new Date().getFullYear()} • Privacy • Terms
                            </Text>
                        </Box>
                    </Box>

                    {/* RIGHT PANEL */}
                    <Box className="hidden sm:flex sm:w-2/3 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 relative">
                        <img
                            src="/images/loginbg.png"
                            alt="Login Illustration"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Box>
                </Group>
            </Paper>
        </Box>
    )
}
