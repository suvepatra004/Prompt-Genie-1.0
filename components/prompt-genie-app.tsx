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
import {
  Moon,
  Sun,
  Bookmark,
  Key,
  Save,
  Search,
  Trash2,
  ArrowLeft,
  MagnetIcon as Magic,
  Copy,
  Download,
  Plus,
  Star,
  StarHalf,
  MailOpenIcon as Envelope,
  FileText,
  Book,
  Linkedin,
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
  createdAt: string
}

export function PromptGenieApp() {
  const [apiKey, setApiKey] = useState("")
  const [currentStep, setCurrentStep] = useState<"setup" | "input" | "questions" | "result">("setup")
  const [userInput, setUserInput] = useState("")
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { toast } = useToast()

  // Load saved data on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key") || ""
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light"
    const savedPromptsList = JSON.parse(localStorage.getItem("saved_prompts") || "[]")

    setApiKey(savedApiKey)
    setTheme(savedTheme)
    setSavedPrompts(savedPromptsList)

    if (savedApiKey) {
      setCurrentStep("input")
    }

    // Apply theme
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your API key",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("gemini_api_key", apiKey)
    setCurrentStep("input")
    toast({
      title: "Success",
      description: "API key saved successfully!",
    })
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const detectContentType = (input: string): string => {
    const inputLower = input.toLowerCase()

    if (inputLower.match(/\b(product|marketing|sales|email|campaign|advertisement|promotion|brand|customer)\b/)) {
      return "marketing_business"
    }
    if (inputLower.match(/\b(story|novel|character|plot|creative|fiction|narrative|poem|script)\b/)) {
      return "creative_storytelling"
    }
    if (inputLower.match(/\b(tutorial|guide|documentation|technical|code|programming|learning|course|lesson)\b/)) {
      return "technical_educational"
    }
    if (inputLower.match(/\b(professional|business|meeting|presentation|report|proposal|memo|corporate)\b/)) {
      return "professional_communication"
    }
    if (inputLower.match(/\b(social media|instagram|twitter|facebook|linkedin|post|content|digital|online)\b/)) {
      return "social_media_digital"
    }
    if (inputLower.match(/\b(research|analysis|study|data|survey|report|findings|methodology)\b/)) {
      return "research_analytical"
    }

    return "general"
  }

  const getSpecializedQuestions = (contentType: string): Question[] => {
    const questionSets: Record<string, Question[]> = {
      marketing_business: [
        {
          question: "What is your primary marketing objective?",
          type: "multiple_choice",
          category: "Marketing Strategy",
          priority: "high",
          options: [
            "Increase brand awareness",
            "Generate leads",
            "Drive sales",
            "Build customer loyalty",
            "Launch new product",
          ],
          description: "Understanding your goal helps tailor the messaging strategy",
        },
        {
          question: "Who is your target customer?",
          type: "multiple_choice",
          category: "Target Audience",
          priority: "high",
          options: [
            "B2B decision makers",
            "Young professionals",
            "Families",
            "Seniors",
            "Small business owners",
            "Enterprise clients",
          ],
          description: "Audience targeting is crucial for effective messaging",
        },
        {
          question: "What's your brand personality?",
          type: "multiple_choice",
          category: "Brand Voice",
          priority: "medium",
          options: [
            "Professional & trustworthy",
            "Fun & energetic",
            "Innovative & cutting-edge",
            "Warm & friendly",
            "Luxury & exclusive",
          ],
          description: "Brand personality shapes how your message is perceived",
        },
        {
          question: "What customer pain points does your solution address?",
          type: "text_input",
          category: "Value Proposition",
          priority: "high",
          placeholder: "e.g., saves time, reduces costs, improves efficiency...",
          description: "Highlighting pain points creates emotional connection",
        },
        {
          question: "What action do you want customers to take?",
          type: "multiple_choice",
          category: "Call-to-Action",
          priority: "medium",
          options: [
            "Visit website",
            "Schedule demo",
            "Make purchase",
            "Sign up for trial",
            "Contact sales",
            "Download resource",
          ],
          description: "Clear CTAs improve conversion rates",
        },
        {
          question: "How formal should the tone be?",
          type: "range_slider",
          category: "Communication Style",
          priority: "medium",
          min: 1,
          max: 10,
          default: 6,
          description: "Formality level affects audience perception",
        },
      ],
      creative_storytelling: [
        {
          question: "What genre best describes your story?",
          type: "multiple_choice",
          category: "Genre & Style",
          priority: "high",
          options: [
            "Fantasy",
            "Science Fiction",
            "Mystery/Thriller",
            "Romance",
            "Literary Fiction",
            "Historical Fiction",
            "Horror",
            "Adventure",
          ],
          description: "Genre determines reader expectations and narrative conventions",
        },
        {
          question: "From whose perspective should the story be told?",
          type: "multiple_choice",
          category: "Narrative Perspective",
          priority: "high",
          options: [
            "First person (I/me)",
            "Third person limited",
            "Third person omniscient",
            "Multiple perspectives",
            "Second person (you)",
          ],
          description: "Perspective affects reader connection and story intimacy",
        },
        {
          question: "What's the central conflict or tension?",
          type: "multiple_choice",
          category: "Plot Structure",
          priority: "high",
          options: [
            "Person vs. person",
            "Person vs. nature",
            "Person vs. society",
            "Person vs. self",
            "Person vs. technology",
            "Person vs. supernatural",
          ],
          description: "Conflict drives narrative tension and character development",
        },
        {
          question: "Describe the setting and time period",
          type: "text_input",
          category: "World-building",
          priority: "medium",
          placeholder: "e.g., modern-day New York, medieval fantasy realm, distant future...",
          description: "Setting creates atmosphere and influences plot possibilities",
        },
        {
          question: "What tone should the story have?",
          type: "multiple_choice",
          category: "Literary Style",
          priority: "medium",
          options: [
            "Dark & serious",
            "Light & humorous",
            "Mysterious & suspenseful",
            "Romantic & emotional",
            "Action-packed & thrilling",
            "Thoughtful & introspective",
          ],
          description: "Tone affects reader emotional experience",
        },
        {
          question: "How complex should the character development be?",
          type: "range_slider",
          category: "Character Development",
          priority: "medium",
          min: 1,
          max: 10,
          default: 5,
          description: "Character complexity affects story depth and reader engagement",
        },
      ],
      general: [
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
          question: "How long should the output be?",
          type: "multiple_choice",
          category: "Format",
          priority: "medium",
          options: ["Short (1-2 paragraphs)", "Medium (3-5 paragraphs)", "Long (6+ paragraphs)", "No preference"],
          description: "Length requirements help structure the response appropriately",
        },
        {
          question: "What format do you prefer?",
          type: "multiple_choice",
          category: "Structure",
          priority: "medium",
          options: ["Paragraph text", "Bullet points", "Numbered list", "Mixed format"],
          description: "Format affects readability and structure",
        },
        {
          question: "What specific details should be included?",
          type: "text_input",
          category: "Content",
          priority: "medium",
          placeholder: "Enter specific requirements...",
          description: "Additional context helps create more accurate content",
        },
        {
          question: "Are there any constraints or requirements?",
          type: "text_input",
          category: "Requirements",
          priority: "low",
          placeholder: "Enter any constraints...",
          description: "Constraints help ensure the output meets your needs",
        },
      ],
    }

    return questionSets[contentType] || questionSets.general
  }

  const analyzeInput = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Warning",
        description: "Please enter your idea first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadingText("Analyzing your input and generating questions...")

    try {
      const contentType = detectContentType(userInput)
      const questions = getSpecializedQuestions(contentType)
      setCurrentQuestions(questions)
      setCurrentAnswers({})
      setCurrentStep("questions")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateOptimizedPrompt = async () => {
    setIsLoading(true)
    setLoadingText("Generating your optimized prompt...")

    try {
      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const answersText = Object.entries(currentAnswers)
        .map(([index, answer]) => {
          const question = currentQuestions[Number.parseInt(index)]
          return `${question.category}: ${question.question} → ${answer}`
        })
        .join("\n")

      const optimizedPrompt = `Based on your input: "${userInput}"

Here's your optimized AI prompt:

Create ${userInput.toLowerCase()} with the following specifications:

${answersText}

Please ensure the output:
- Matches the specified tone and style
- Targets the identified audience
- Follows the preferred format and structure
- Incorporates all specified requirements
- Maintains consistency throughout

Generate comprehensive, high-quality content that meets all the above criteria.`

      setGeneratedPrompt(optimizedPrompt)
      setCurrentStep("result")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyPrompt = () => {
    navigator.clipboard
      .writeText(generatedPrompt)
      .then(() => {
        toast({
          title: "Success",
          description: "Prompt copied to clipboard!",
        })
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy prompt",
          variant: "destructive",
        })
      })
  }

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Success",
      description: "Prompt downloaded!",
    })
  }

  const savePromptToLibrary = () => {
    const promptData: SavedPrompt = {
      id: Date.now(),
      title: userInput.split(" ").slice(0, 6).join(" ") + (userInput.split(" ").length > 6 ? "..." : ""),
      content: generatedPrompt,
      originalInput: userInput,
      createdAt: new Date().toISOString(),
    }

    const updatedPrompts = [promptData, ...savedPrompts]
    setSavedPrompts(updatedPrompts)
    localStorage.setItem("saved_prompts", JSON.stringify(updatedPrompts))
    toast({
      title: "Success",
      description: "Prompt saved to library!",
    })
  }

  const deletePrompt = (id: number) => {
    const updatedPrompts = savedPrompts.filter((p) => p.id !== id)
    setSavedPrompts(updatedPrompts)
    localStorage.setItem("saved_prompts", JSON.stringify(updatedPrompts))
    toast({
      title: "Success",
      description: "Prompt deleted",
    })
  }

  const copyLibraryPrompt = (prompt: SavedPrompt) => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      toast({
        title: "Success",
        description: "Prompt copied to clipboard!",
      })
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
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const examplePrompts = [
    {
      text: "I want to write a compelling email to potential customers about our new software product",
      icon: <Envelope className="w-5 h-5" />,
    },
    {
      text: "I need to create a blog post about sustainable living tips for beginners",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      text: "I want to write a creative story about a time traveler who gets stuck in the past",
      icon: <Book className="w-5 h-5" />,
    },
    {
      text: "I need help writing a professional LinkedIn post about career growth",
      icon: <Linkedin className="w-5 h-5" />,
    },
  ]

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Star className="w-3 h-3" />
      case "medium":
        return <StarHalf className="w-3 h-3" />
      default:
        return <Star className="w-3 h-3 opacity-50" />
    }
  }

  const renderQuestionInput = (question: Question, index: number) => {
    switch (question.type) {
      case "multiple_choice":
        return (
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
        )

      case "range_slider":
        return (
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
        )

      case "checkbox_multiple":
        return (
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
        )

      default:
        return (
          <Input
            placeholder={question.placeholder || "Enter your answer..."}
            value={currentAnswers[index] || ""}
            onChange={(e) => updateAnswer(index, e.target.value)}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">{loadingText}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pb-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Magic className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">PromptGenie</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Library
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Prompt Library</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-4">
                  {filteredPrompts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No saved prompts yet. Generate and save your first prompt!</p>
                    </div>
                  ) : (
                    filteredPrompts.map((prompt) => (
                      <Card key={prompt.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{prompt.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {new Date(prompt.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => copyLibraryPrompt(prompt)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deletePrompt(prompt.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* API Setup Step */}
      {currentStep === "setup" && (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Setup Your API Key</CardTitle>
              <p className="text-muted-foreground">
                Enter your Google Gemini API key to get started. Your key is stored locally and never shared.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && saveApiKey()}
                />
                <Button onClick={saveApiKey}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an API key?{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get one free from Google AI Studio
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
                Tell us what you want to create with AI. Be as detailed or brief as you like.
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
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setUserInput("")}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={analyzeInput} disabled={!userInput.trim()}>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze & Generate Questions
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Need inspiration? Try these examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examplePrompts.map((example, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setUserInput(example.text)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-primary">{example.icon}</div>
                    <span className="text-sm">{example.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
                Help us understand your needs better by answering these questions.
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
                    {getPriorityIcon(question.priority)}
                    <Badge variant="secondary" className="text-xs">
                      {question.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                </CardHeader>
                <CardContent>{renderQuestionInput(question, index)}</CardContent>
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
                <Button variant="outline" size="sm" onClick={copyPrompt}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPrompt}>
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
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Prompt
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
