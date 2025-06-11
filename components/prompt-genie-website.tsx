"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import {
  Moon,
  Sun,
  Bookmark,
  Key,
  Search,
  Trash2,
  ArrowLeft,
  MagnetIcon as Magic,
  Copy,
  Download,
  Plus,
  Star,
  StarHalf,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Hash,
  Sparkles,
  Users,
  Target,
  Zap,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Quote,
  RefreshCw,
  LogIn,
  UserPlus,
  LogOut,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  question: string
  type: "multiple_choice" | "text_input" | "range_slider" | "checkbox_multiple"
  category: string
  priority: "high" | "medium" | "low"
  options?: string[]
  description: string
  placeholder?: string
  min?: number
  max?: number
  default?: number
  checkboxOptions?: string[]
}

interface SavedPrompt {
  id: number
  title: string
  content: string
  originalInput: string
  hashtags: string[]
  createdAt: string
  expiresAt: string
}

interface APIKey {
  id: string
  name: string
  key: string
  isActive: boolean
  isWorking: boolean
  lastTested: string
}

interface UserType {
  id: string
  name: string
  email: string
  createdAt: string
}

export function PromptGenieWebsite() {
  const [currentView, setCurrentView] = useState<"landing" | "app">("landing")
  const [currentStep, setCurrentStep] = useState<"input" | "questions" | "result">("input")
  const [currentTab, setCurrentTab] = useState<"generate" | "refactor">("generate")
  const [user, setUser] = useState<UserType | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [authOpen, setAuthOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [activeApiKey, setActiveApiKey] = useState<string>("")
  const [userInput, setUserInput] = useState("")
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [refactorPrompt, setRefactorPrompt] = useState("")
  const [refactorReason, setRefactorReason] = useState("")
  const [refactoredPrompt, setRefactoredPrompt] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [customHashtag, setCustomHashtag] = useState("")
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Add this state to track if user has an account
  const [hasAccount, setHasAccount] = useState(false)

  const { toast } = useToast()

  // Load saved data and clean expired prompts
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("promptgenie_user") || "null")
    const savedApiKeys = JSON.parse(localStorage.getItem("gemini_api_keys") || "[]")
    const savedActiveKey = localStorage.getItem("active_api_key") || ""
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light"
    const savedPromptsList = JSON.parse(localStorage.getItem("saved_prompts") || "[]")

    // Clean expired prompts (older than 23 hours)
    const now = new Date()
    const validPrompts = savedPromptsList.filter((prompt: SavedPrompt) => {
      const expiresAt = new Date(prompt.expiresAt)
      return expiresAt > now
    })

    setUser(savedUser)
    setApiKeys(savedApiKeys)
    setActiveApiKey(savedActiveKey)
    setTheme(savedTheme)
    setSavedPrompts(validPrompts)

    // Save cleaned prompts back
    localStorage.setItem("saved_prompts", JSON.stringify(validPrompts))

    // Apply theme
    document.documentElement.setAttribute("data-theme", savedTheme)

    // Auto-cleanup expired prompts every hour
    const cleanupInterval = setInterval(() => {
      const currentPrompts = JSON.parse(localStorage.getItem("saved_prompts") || "[]")
      const currentTime = new Date()
      const stillValidPrompts = currentPrompts.filter((prompt: SavedPrompt) => {
        const expiresAt = new Date(prompt.expiresAt)
        return expiresAt > currentTime
      })
      setSavedPrompts(stillValidPrompts)
      localStorage.setItem("saved_prompts", JSON.stringify(stillValidPrompts))
    }, 3600000) // 1 hour

    return () => clearInterval(cleanupInterval)
  }, [])

  // Add this useEffect to check if user has previously created an account
  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem("promptgenie_users") || "[]")
    setHasAccount(existingUsers.length > 0)
  }, [])

  // Update the handleSignup function to track new users
  const handleSignup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation for demo
    if (name && email && password.length >= 8) {
      const newUser: UserType = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString(),
      }

      // Store user in users list
      const existingUsers = JSON.parse(localStorage.getItem("promptgenie_users") || "[]")
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem("promptgenie_users", JSON.stringify(updatedUsers))

      setUser(newUser)
      localStorage.setItem("promptgenie_user", JSON.stringify(newUser))
      setHasAccount(true)
      setAuthOpen(false)
      toast({
        title: "Account created!",
        description: "Welcome to PromptGenie! You can now start creating prompts.",
      })
      return true
    }
    return false
  }

  // Update the handleLogin function to check against stored users
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check against stored users
    const existingUsers = JSON.parse(localStorage.getItem("promptgenie_users") || "[]")
    const foundUser = existingUsers.find((u: UserType) => u.email === email)

    if (foundUser && password.length >= 6) {
      setUser(foundUser)
      localStorage.setItem("promptgenie_user", JSON.stringify(foundUser))
      setAuthOpen(false)
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
      return true
    }
    return false
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("promptgenie_user")
    setCurrentView("landing")
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
  }

  const addApiKey = async (name: string, key: string) => {
    if (!name.trim() || !key.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and API key",
        variant: "destructive",
      })
      return
    }

    // Basic API key format validation
    if (!key.startsWith("AIza") || key.length < 30) {
      toast({
        title: "Error",
        description:
          "Invalid API key format. Gemini API keys should start with 'AIza' and be at least 30 characters long.",
        variant: "destructive",
      })
      return
    }

    // Check if key already exists
    if (apiKeys.some((existingKey) => existingKey.key === key)) {
      toast({
        title: "Error",
        description: "This API key has already been added",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadingText("Testing API key...")

    try {
      console.log("Testing API key:", key.slice(-4))
      const isWorking = await testApiKey(key)
      console.log("API key test result:", isWorking)

      const newApiKey: APIKey = {
        id: Date.now().toString(),
        name,
        key,
        isActive: apiKeys.length === 0, // First key becomes active
        isWorking,
        lastTested: new Date().toISOString(),
      }

      const updatedKeys = [...apiKeys, newApiKey]
      setApiKeys(updatedKeys)
      localStorage.setItem("gemini_api_keys", JSON.stringify(updatedKeys))

      if (apiKeys.length === 0) {
        setActiveApiKey(newApiKey.id)
        localStorage.setItem("active_api_key", newApiKey.id)
      }

      toast({
        title: isWorking ? "Success" : "Warning",
        description: isWorking
          ? "API key added and tested successfully!"
          : "API key added but failed testing. Please verify the key is correct and has proper permissions.",
        variant: isWorking ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing API key:", error)
      toast({
        title: "Error",
        description: "Failed to test API key. Please check your internet connection and API key validity.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testApiKey = async (key: string): Promise<boolean> => {
    try {
      console.log("Testing API key with simple request...")
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
          }),
        },
      )

      console.log("Test API response status:", response.status)
      return response.ok
    } catch (error) {
      console.error("API key test error:", error)
      return false
    }
  }

  const setActiveKey = (keyId: string) => {
    setActiveApiKey(keyId)
    localStorage.setItem("active_api_key", keyId)

    const updatedKeys = apiKeys.map((key) => ({
      ...key,
      isActive: key.id === keyId,
    }))
    setApiKeys(updatedKeys)
    localStorage.setItem("gemini_api_keys", JSON.stringify(updatedKeys))
  }

  const deleteApiKey = (keyId: string) => {
    const updatedKeys = apiKeys.filter((key) => key.id !== keyId)
    setApiKeys(updatedKeys)
    localStorage.setItem("gemini_api_keys", JSON.stringify(updatedKeys))

    if (activeApiKey === keyId) {
      const newActiveKey = updatedKeys.length > 0 ? updatedKeys[0].id : ""
      setActiveApiKey(newActiveKey)
      localStorage.setItem("active_api_key", newActiveKey)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const generateHashtagSuggestions = (input: string) => {
    const suggestions = []
    const inputLower = input.toLowerCase()

    // Content type based suggestions
    if (inputLower.includes("marketing") || inputLower.includes("business")) {
      suggestions.push("#marketing", "#business", "#growth", "#strategy", "#branding")
    }
    if (inputLower.includes("creative") || inputLower.includes("story")) {
      suggestions.push("#creative", "#storytelling", "#writing", "#inspiration", "#fiction")
    }
    if (inputLower.includes("technical") || inputLower.includes("code")) {
      suggestions.push("#tech", "#coding", "#programming", "#development", "#tutorial")
    }
    if (inputLower.includes("social") || inputLower.includes("media")) {
      suggestions.push("#socialmedia", "#content", "#engagement", "#digital", "#online")
    }

    // General suggestions
    suggestions.push("#AI", "#prompt", "#productivity", "#innovation", "#automation")

    return [...new Set(suggestions)].slice(0, 8)
  }

  const addHashtag = (tag: string) => {
    const cleanTag = tag.startsWith("#") ? tag : `#${tag}`
    if (!hashtags.includes(cleanTag) && hashtags.length < 10) {
      setHashtags([...hashtags, cleanTag])
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const analyzeInput = async () => {
    console.log("Analyze button clicked")
    console.log("User input:", userInput.trim())
    console.log("Active API key:", activeApiKey)
    console.log("API keys:", apiKeys)

    if (!userInput.trim()) {
      toast({
        title: "Warning",
        description: "Please enter your idea first",
        variant: "destructive",
      })
      return
    }

    if (!activeApiKey) {
      toast({
        title: "Error",
        description: "Please add and activate an API key first",
        variant: "destructive",
      })
      return
    }

    const activeKey = apiKeys.find((key) => key.id === activeApiKey)
    if (!activeKey) {
      toast({
        title: "Error",
        description: "Active API key not found. Please select a valid API key.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadingText("Analyzing your input and generating questions...")

    try {
      console.log("Starting API call with key:", activeKey.key.slice(-4))
      const questions = await generateQuestionsFromAI(userInput)
      console.log("Generated questions:", questions)

      setCurrentQuestions(questions)
      setCurrentAnswers({})

      // Generate hashtag suggestions
      const suggestions = generateHashtagSuggestions(userInput)
      setSuggestedHashtags(suggestions)

      setCurrentStep("questions")

      toast({
        title: "Success",
        description: `Generated ${questions.length} questions based on your input!`,
      })
    } catch (error) {
      console.error("Error in analyzeInput:", error)
      toast({
        title: "Error",
        description: `Failed to generate questions: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateQuestionsFromAI = async (input: string): Promise<Question[]> => {
    const activeKey = apiKeys.find((key) => key.id === activeApiKey)
    if (!activeKey) {
      throw new Error("No active API key found")
    }

    console.log("Making API request to Gemini...")

    const prompt = `
  Analyze this user input and generate 5-10 highly relevant questions to help create an optimized AI prompt.
  
  User Input: "${input}"
  
  Generate questions that will help understand:
  1. Target audience and context
  2. Desired tone and style
  3. Content length and format
  4. Specific requirements
  5. Goals and objectives
  6. Additional context needed
  
  Return ONLY a valid JSON array where each question has:
  - "question": the question text
  - "type": "multiple_choice", "text_input", "range_slider", or "checkbox_multiple"
  - "category": category name
  - "priority": "high", "medium", or "low"
  - "options": array of options (for multiple_choice only)
  - "description": brief explanation
  - "placeholder": hint text (for text_input only)
  - "min": 1, "max": 10, "default": 5 (for range_slider only)
  - "checkboxOptions": array (for checkbox_multiple only)
  
  Make the number of questions vary based on complexity (5-10 questions).
  Ensure the JSON is valid and properly formatted.
  `

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey.key}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      console.log("API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error response:", errorText)

        if (response.status === 400) {
          throw new Error("Invalid API key or request format")
        } else if (response.status === 403) {
          throw new Error("API key access denied or quota exceeded")
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later")
        } else {
          throw new Error(`API request failed with status ${response.status}`)
        }
      }

      const data = await response.json()
      console.log("API Response data:", data)

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Invalid API response structure:", data)
        throw new Error("Invalid response from AI service")
      }

      const responseText = data.candidates[0].content.parts[0].text
      console.log("Raw AI response:", responseText)

      // Clean and parse JSON
      let jsonStr = responseText.trim()

      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "")
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/, "").replace(/\n?```$/, "")
      }

      console.log("Cleaned JSON string:", jsonStr)

      try {
        const questions = JSON.parse(jsonStr)
        console.log("Parsed questions:", questions)

        if (!Array.isArray(questions)) {
          throw new Error("Response is not an array")
        }

        // Validate and clean questions
        const validQuestions = questions
          .filter((q) => q.question && q.type && q.category && q.priority && q.description)
          .map((q) => ({
            ...q,
            priority: ["high", "medium", "low"].includes(q.priority) ? q.priority : "medium",
          }))

        if (validQuestions.length === 0) {
          throw new Error("No valid questions generated")
        }

        return validQuestions
      } catch (parseError) {
        console.error("JSON parsing error:", parseError)
        console.log("Falling back to default questions")
        return getFallbackQuestions()
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      throw fetchError
    }
  }

  const getFallbackQuestions = (): Question[] => [
    {
      question: "Who is your target audience?",
      type: "multiple_choice",
      category: "Audience",
      priority: "high",
      options: ["Beginners", "Intermediate users", "Advanced users", "General audience"],
      description: "Understanding your audience helps tailor the content appropriately",
    },
    {
      question: "What tone should the AI use?",
      type: "multiple_choice",
      category: "Style",
      priority: "high",
      options: ["Professional", "Casual", "Friendly", "Formal", "Creative"],
      description: "The tone affects how your content will be perceived",
    },
    {
      question: "How detailed should the output be?",
      type: "range_slider",
      category: "Detail Level",
      priority: "medium",
      min: 1,
      max: 10,
      default: 5,
      description: "Detail level affects content depth and comprehensiveness",
    },
    {
      question: "What specific requirements do you have?",
      type: "text_input",
      category: "Requirements",
      priority: "medium",
      placeholder: "Enter specific requirements...",
      description: "Additional requirements help create more targeted content",
    },
  ]

  const generateOptimizedPrompt = async () => {
    setIsLoading(true)
    setLoadingText("Generating your optimized prompt...")

    try {
      const activeKey = apiKeys.find((key) => key.id === activeApiKey)
      if (!activeKey) throw new Error("No active API key")

      const answersText = Object.entries(currentAnswers)
        .map(([index, answer]) => {
          const question = currentQuestions[Number.parseInt(index)]
          return `${question.category}: ${question.question} → ${answer}`
        })
        .join("\n")

      const hashtagText = hashtags.length > 0 ? `\nHashtags to include: ${hashtags.join(" ")}` : ""

      const prompt = `
      Create a highly optimized AI prompt based on the user's original idea and their detailed answers.

      Original User Input: "${userInput}"

      User's Detailed Responses:
      ${answersText}
      ${hashtagText}

      Create a comprehensive, well-structured prompt that:
      1. Incorporates ALL the user's specific requirements and preferences
      2. Uses clear, actionable language that AI models can follow precisely
      3. Includes relevant context, constraints, and success criteria
      4. Specifies the desired output format and structure
      5. Is optimized for getting the best results from modern AI models
      ${hashtags.length > 0 ? "6. Includes the specified hashtags appropriately" : ""}

      Return only the optimized prompt, without any explanations or additional text.
      `

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const optimizedPrompt = data.candidates[0].content.parts[0].text

      setGeneratedPrompt(optimizedPrompt)
      setCurrentStep("result")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please check your API key.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refactorPromptWithAI = async () => {
    if (!refactorPrompt.trim() || !refactorReason.trim()) {
      toast({
        title: "Warning",
        description: "Please enter both the prompt to refactor and the reason",
        variant: "destructive",
      })
      return
    }

    if (!activeApiKey) {
      toast({
        title: "Error",
        description: "Please add and activate an API key first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadingText("Refactoring your prompt...")

    try {
      const activeKey = apiKeys.find((key) => key.id === activeApiKey)
      if (!activeKey) throw new Error("No active API key")

      const prompt = `
      Refactor the following AI prompt based on the specified reason and requirements.

      Original Prompt:
      "${refactorPrompt}"

      Refactoring Reason:
      "${refactorReason}"

      Please refactor the prompt to:
      1. Address the specific concerns mentioned in the reason
      2. Maintain the core intent and functionality of the original prompt
      3. Ensure compliance with AI model privacy policies and content guidelines
      4. Make the prompt more effective and appropriate for the intended use case
      5. Keep the same level of detail and specificity where appropriate

      Return only the refactored prompt, without any explanations or additional text.
      `

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const refactored = data.candidates[0].content.parts[0].text

      setRefactoredPrompt(refactored)

      toast({
        title: "Success",
        description: "Prompt refactored successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refactor prompt. Please check your API key.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const savePromptToLibrary = () => {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 23 * 60 * 60 * 1000) // 23 hours from now

    const promptData: SavedPrompt = {
      id: Date.now(),
      title: userInput.split(" ").slice(0, 6).join(" ") + (userInput.split(" ").length > 6 ? "..." : ""),
      content: generatedPrompt,
      originalInput: userInput,
      hashtags: hashtags,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    const updatedPrompts = [promptData, ...savedPrompts]
    setSavedPrompts(updatedPrompts)
    localStorage.setItem("saved_prompts", JSON.stringify(updatedPrompts))

    toast({
      title: "Success",
      description: "Prompt saved to library! (Expires in 23 hours)",
    })
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      toast({
        title: "Success",
        description: "Prompt copied to clipboard!",
      })
    })
  }

  const downloadPrompt = (prompt: string, filename = "prompt") => {
    const content = `${prompt}\n\nHashtags: ${hashtags.join(" ")}\n\nGenerated: ${new Date().toLocaleString()}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Prompt downloaded!",
    })
  }

  const updateAnswer = (questionIndex: number, value: string) => {
    setCurrentAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }))
  }

  const answeredCount = Object.keys(currentAnswers).length
  const totalQuestions = currentQuestions.length
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  const filteredPrompts = savedPrompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.hashtags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      content:
        "PromptGenie has revolutionized my content creation process. The AI-generated questions help me think of aspects I never considered before!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Marketing Manager",
      content:
        "The specialized question categories are incredible. It's like having a prompt engineering expert right at my fingertips.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Technical Writer",
      content:
        "I love how the tool adapts to different content types. The hashtag suggestions are spot-on for social media content.",
      rating: 5,
    },
  ]

  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-background">
        {/* Enhanced Glassmorphic Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/10 backdrop-blur-xl border-b border-border/20">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Magic className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">PromptGenie</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                  Testimonials
                </a>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentView("app")}>
                      <User className="w-4 h-4 mr-2" />
                      {user.name}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : hasAccount ? (
                  // Show only Sign In if user has an account
                  <Button
                    size="sm"
                    onClick={() => {
                      setAuthMode("login")
                      setAuthOpen(true)
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                ) : (
                  // Show only Sign Up if no account exists
                  <Button
                    size="sm"
                    onClick={() => {
                      setAuthMode("signup")
                      setAuthOpen(true)
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-border/20 bg-background/90 backdrop-blur-md">
                <div className="flex flex-col gap-4">
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                  <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                    Testimonials
                  </a>
                  <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                  <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleTheme}>
                      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>
                    {user ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setCurrentView("app")}>
                          <User className="w-4 h-4 mr-2" />
                          {user.name}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </>
                    ) : hasAccount ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setAuthMode("login")
                          setAuthOpen(true)
                        }}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setAuthMode("signup")
                          setAuthOpen(true)
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Auth Dialog */}
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="max-w-md" aria-describedby="auth-description">
            <DialogHeader>
              <DialogTitle>{authMode === "login" ? "Sign In" : "Create Account"}</DialogTitle>
              <p id="auth-description" className="text-sm text-muted-foreground">
                {authMode === "login"
                  ? "Welcome back! Please sign in to your account."
                  : "Join PromptGenie and start creating amazing prompts."}
              </p>
            </DialogHeader>
            {authMode === "login" ? (
              <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setAuthMode("signup")} isLoading={isLoading} />
            ) : (
              <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setAuthMode("login")} isLoading={isLoading} />
            )}
          </DialogContent>
        </Dialog>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Prompt Generation
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Transform Your Ideas Into Perfect AI Prompts
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                PromptGenie uses advanced AI to analyze your ideas and generate optimized prompts through intelligent
                questioning. Get better results from any AI tool with professionally crafted prompts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    if (user) {
                      setCurrentView("app")
                    } else {
                      setAuthMode("signup")
                      setAuthOpen(true)
                    }
                  }}
                  className="text-lg px-8"
                >
                  {user ? "Go to App" : "Start Creating Prompts"}
                  <Magic className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create professional-grade AI prompts
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <Target className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Content Detection</h3>
                <p className="text-muted-foreground">
                  AI automatically detects your content type and generates specialized questions for optimal results.
                </p>
              </Card>

              <Card className="p-6">
                <Zap className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dynamic Question Generation</h3>
                <p className="text-muted-foreground">
                  Questions adapt to your input - get 5-10 relevant questions based on complexity and context.
                </p>
              </Card>

              <Card className="p-6">
                <Hash className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Hashtag Suggestions</h3>
                <p className="text-muted-foreground">
                  Get AI-powered hashtag recommendations based on your content and requirements.
                </p>
              </Card>

              <Card className="p-6">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure API Management</h3>
                <p className="text-muted-foreground">
                  Add multiple API keys securely with automatic testing and confidential storage.
                </p>
              </Card>

              <Card className="p-6">
                <Clock className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Auto-Expiring Library</h3>
                <p className="text-muted-foreground">
                  Prompts are automatically saved for 23 hours, keeping your library fresh and organized.
                </p>
              </Card>

              <Card className="p-6">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Multiple Content Types</h3>
                <p className="text-muted-foreground">
                  Specialized support for marketing, creative writing, technical docs, and more.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of creators who've transformed their AI workflow
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About PromptGenie</h2>
            <p className="text-lg text-muted-foreground mb-8">
              PromptGenie was created to bridge the gap between human creativity and AI capability. We believe that the
              quality of AI output is directly proportional to the quality of the input prompt. Our mission is to
              democratize prompt engineering, making it accessible to everyone regardless of their technical background.
            </p>
            <p className="text-lg text-muted-foreground">
              By analyzing your ideas and asking the right questions, we help you create prompts that unlock the full
              potential of AI tools, saving you time and delivering better results every time.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-xl text-muted-foreground">Have questions or feedback? We'd love to hear from you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">hello@promptgenie.ai</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-muted-foreground">San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <Card className="p-6">
                <form className="space-y-4">
                  <div>
                    <Input placeholder="Your Name" />
                  </div>
                  <div>
                    <Input type="email" placeholder="Your Email" />
                  </div>
                  <div>
                    <Textarea placeholder="Your Message" rows={4} />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Magic className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">PromptGenie</span>
              </div>
              <p className="text-muted-foreground text-center md:text-right">
                © 2024 PromptGenie. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // App View (existing functionality)
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced App Header */}
      <header className="border-b border-border/20 bg-background/10 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setCurrentView("landing")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Magic className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PromptGenie</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Dialog open={apiKeysOpen} onOpenChange={setApiKeysOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    API Keys
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl" aria-describedby="api-keys-description">
                  <DialogHeader>
                    <DialogTitle>API Key Management</DialogTitle>
                    <p id="api-keys-description" className="text-sm text-muted-foreground">
                      Manage your Google Gemini API keys securely. Keys are stored locally and tested automatically.
                    </p>
                  </DialogHeader>
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">My API Keys</TabsTrigger>
                      <TabsTrigger value="add">Add New Key</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                      {apiKeys.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No API keys added yet. Add your first key to get started.</p>
                        </div>
                      ) : (
                        apiKeys.map((key) => (
                          <Card key={key.id} className={`p-4 ${key.isActive ? "ring-2 ring-primary" : ""}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{key.name}</h3>
                                  {key.isActive && <Badge>Active</Badge>}
                                  {key.isWorking ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">Key: ****{key.key.slice(-4)}</p>
                                <p className="text-xs text-muted-foreground">
                                  Last tested: {new Date(key.lastTested).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {!key.isActive && (
                                  <Button size="sm" variant="outline" onClick={() => setActiveKey(key.id)}>
                                    Activate
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => deleteApiKey(key.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.target as HTMLFormElement)
                          const name = formData.get("name") as string
                          const key = formData.get("key") as string
                          addApiKey(name, key)
                        }}
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">API Key Name</label>
                            <Input name="name" placeholder="e.g., My Gemini Key" required />
                          </div>
                          <div>
                            <label className="text-sm font-medium">API Key</label>
                            <Input
                              name="key"
                              type="password"
                              placeholder="Enter your Gemini API key (starts with AIza...)"
                              required
                            />
                          </div>
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Get your free API key from{" "}
                              <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Google AI Studio
                              </a>
                              . Your key is stored locally and never shared.
                            </AlertDescription>
                          </Alert>
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Testing..." : "Add API Key"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Library ({savedPrompts.length})
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-4xl max-h-[80vh] overflow-y-auto"
                  aria-describedby="library-description"
                >
                  <DialogHeader>
                    <DialogTitle>Prompt Library</DialogTitle>
                    <p id="library-description" className="text-sm text-muted-foreground">
                      Prompts are automatically deleted after 23 hours
                    </p>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prompts, hashtags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-4">
                      {filteredPrompts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No saved prompts found.</p>
                        </div>
                      ) : (
                        filteredPrompts.map((prompt) => {
                          const timeLeft = new Date(prompt.expiresAt).getTime() - new Date().getTime()
                          const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

                          return (
                            <Card key={prompt.id}>
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(prompt.createdAt).toLocaleString()}
                                      </p>
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {hoursLeft}h left
                                      </Badge>
                                    </div>
                                    {prompt.hashtags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {prompt.hashtags.map((tag, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        copyPrompt(prompt.content)
                                      }}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const updatedPrompts = savedPrompts.filter((p) => p.id !== prompt.id)
                                        setSavedPrompts(updatedPrompts)
                                        localStorage.setItem("saved_prompts", JSON.stringify(updatedPrompts))
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {user && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium">{loadingText}</p>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "generate" | "refactor")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="generate">Generate Prompt</TabsTrigger>
            <TabsTrigger value="refactor">Refactor Prompt</TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            {/* Input Step */}
            {currentStep === "input" && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Describe Your Idea</h2>
                    <p className="text-muted-foreground text-lg">
                      Tell us what you want to create with AI. Our AI will generate relevant questions based on your
                      input.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Example: I want to write a product description for my new eco-friendly water bottle..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                        {userInput.length} characters
                      </div>
                    </div>

                    {/* Hashtag Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Hashtags</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hashtags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeHashtag(tag)}
                          >
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom hashtag..."
                          value={customHashtag}
                          onChange={(e) => setCustomHashtag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && customHashtag.trim()) {
                              addHashtag(customHashtag.trim())
                              setCustomHashtag("")
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (customHashtag.trim()) {
                              addHashtag(customHashtag.trim())
                              setCustomHashtag("")
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      {suggestedHashtags.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Suggested hashtags:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedHashtags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => addHashtag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUserInput("")
                          setHashtags([])
                          setSuggestedHashtags([])
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                      <Button onClick={analyzeInput} disabled={!userInput.trim() || !activeApiKey}>
                        <Search className="w-4 h-4 mr-2" />
                        Analyze & Generate Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {!activeApiKey && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please add and activate an API key to continue. Click "API Keys" in the header to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Questions Step */}
            {currentStep === "questions" && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Answer Questions</h2>
                    <p className="text-muted-foreground text-lg">
                      AI generated {totalQuestions} questions based on your input. Answer them to create the perfect
                      prompt.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {answeredCount} of {totalQuestions} questions answered
                  </p>
                </div>

                <div className="grid gap-6">
                  {currentQuestions.map((question, index) => (
                    <Card
                      key={index}
                      className={`border-l-4 ${
                        question.priority === "high"
                          ? "border-l-primary"
                          : question.priority === "medium"
                            ? "border-l-yellow-500"
                            : "border-l-gray-400"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          {question.priority === "high" ? (
                            <Star className="w-4 h-4 text-primary" />
                          ) : question.priority === "medium" ? (
                            <StarHalf className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Star className="w-4 h-4 text-gray-400" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {question.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{question.question}</CardTitle>
                        <p className="text-sm text-muted-foreground">{question.description}</p>
                      </CardHeader>
                      <CardContent>
                        {question.type === "multiple_choice" && (
                          <div className="space-y-2">
                            {question.options?.map((option) => (
                              <Button
                                key={option}
                                variant={currentAnswers[index] === option ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => updateAnswer(index, option)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}

                        {question.type === "range_slider" && (
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Low ({question.min || 1})</span>
                              <span>High ({question.max || 10})</span>
                            </div>
                            <Slider
                              value={[Number.parseInt(currentAnswers[index]) || question.default || 5]}
                              onValueChange={(value) => updateAnswer(index, value[0].toString())}
                              min={question.min || 1}
                              max={question.max || 10}
                              step={1}
                              className="w-full"
                            />
                            <div className="text-center">
                              <Badge variant="secondary" className="text-lg px-4 py-2">
                                {currentAnswers[index] || question.default || 5}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {question.type === "checkbox_multiple" && (
                          <div className="space-y-3">
                            {question.checkboxOptions?.map((option) => {
                              const currentValues = currentAnswers[index]?.split(", ") || []
                              const isChecked = currentValues.includes(option)

                              return (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${index}-${option}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      let newValues = [...currentValues]
                                      if (checked) {
                                        newValues.push(option)
                                      } else {
                                        newValues = newValues.filter((v) => v !== option)
                                      }
                                      updateAnswer(index, newValues.join(", "))
                                    }}
                                  />
                                  <label
                                    htmlFor={`${index}-${option}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {question.type === "text_input" && (
                          <Input
                            placeholder={question.placeholder || "Enter your answer..."}
                            value={currentAnswers[index] || ""}
                            onChange={(e) => updateAnswer(index, e.target.value)}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("input")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Input
                  </Button>
                  <Button onClick={generateOptimizedPrompt} disabled={answeredCount < totalQuestions}>
                    <Magic className="w-4 h-4 mr-2" />
                    Generate Optimized Prompt
                  </Button>
                </div>
              </div>
            )}

            {/* Result Step */}
            {currentStep === "result" && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Your Optimized Prompt</h2>
                    <p className="text-muted-foreground text-lg">
                      Here's your AI-optimized prompt ready to use in any AI tool.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Prompt</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyPrompt(generatedPrompt)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadPrompt(generatedPrompt, "prompt")}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={savePromptToLibrary}>
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
                    </div>
                    {hashtags.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Included Hashtags:</p>
                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("questions")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Questions
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStep("input")
                      setUserInput("")
                      setCurrentAnswers({})
                      setGeneratedPrompt("")
                      setHashtags([])
                      setSuggestedHashtags([])
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New Prompt
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Refactor Tab */}
          <TabsContent value="refactor">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Refactor Prompt</h2>
                  <p className="text-muted-foreground text-lg">
                    Refactor existing prompts to comply with AI model policies and improve effectiveness.
                  </p>
                </div>
              </div>

              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="refactor-prompt" className="text-sm font-medium">
                      Prompt to Refactor
                    </label>
                    <Textarea
                      id="refactor-prompt"
                      placeholder="Paste the prompt you want to refactor here..."
                      value={refactorPrompt}
                      onChange={(e) => setRefactorPrompt(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="refactor-reason" className="text-sm font-medium">
                      Reason for Refactoring
                    </label>
                    <Textarea
                      id="refactor-reason"
                      placeholder="Explain why you want to refactor this prompt (e.g., privacy concerns, content policy compliance, clarity improvement, etc.)"
                      value={refactorReason}
                      onChange={(e) => setRefactorReason(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRefactorPrompt("")
                        setRefactorReason("")
                        setRefactoredPrompt("")
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      onClick={refactorPromptWithAI}
                      disabled={!refactorPrompt.trim() || !refactorReason.trim() || !activeApiKey}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refactor Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {refactoredPrompt && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Refactored Prompt</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyPrompt(refactoredPrompt)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPrompt(refactoredPrompt, "refactored-prompt")}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{refactoredPrompt}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!activeApiKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please add and activate an API key to use the refactor feature. Click "API Keys" in the header to
                    get started.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
