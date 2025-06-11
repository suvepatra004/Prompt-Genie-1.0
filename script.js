class PromptGenie {
  constructor() {
    this.apiKey = localStorage.getItem("gemini_api_key") || ""
    this.currentQuestions = []
    this.currentAnswers = {}
    this.generatedPrompt = ""
    this.savedPrompts = JSON.parse(localStorage.getItem("saved_prompts") || "[]")

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupTheme()
    this.checkApiKey()
    this.updateCharCount()
  }

  setupEventListeners() {
    // API Key setup
    document.getElementById("saveApiKey").addEventListener("click", () => this.saveApiKey())
    document.getElementById("apiKeyInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.saveApiKey()
    })

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => this.toggleTheme())

    // Library
    document.getElementById("libraryBtn").addEventListener("click", () => this.openLibrary())
    document.getElementById("closeLibrary").addEventListener("click", () => this.closeLibrary())
    document.getElementById("librarySearch").addEventListener("input", (e) => this.searchLibrary(e.target.value))

    // Input step
    document.getElementById("userInput").addEventListener("input", () => this.updateCharCount())
    document.getElementById("clearInput").addEventListener("click", () => this.clearInput())
    document.getElementById("analyzeBtn").addEventListener("click", () => this.analyzeInput())

    // Example cards
    document.querySelectorAll(".example-card").forEach((card) => {
      card.addEventListener("click", () => {
        const example = card.getAttribute("data-example")
        document.getElementById("userInput").value = example
        this.updateCharCount()
      })
    })

    // Questions step
    document.getElementById("backToInput").addEventListener("click", () => this.showStep("inputStep"))
    document.getElementById("generatePrompt").addEventListener("click", () => this.generateOptimizedPrompt())

    // Result step
    document.getElementById("copyPrompt").addEventListener("click", () => this.copyPrompt())
    document.getElementById("downloadPrompt").addEventListener("click", () => this.downloadPrompt())
    document.getElementById("savePrompt").addEventListener("click", () => this.savePromptToLibrary())
    document.getElementById("backToQuestions").addEventListener("click", () => this.showStep("questionsStep"))
    document.getElementById("startOver").addEventListener("click", () => this.startOver())

    // Modal close on backdrop click
    document.getElementById("libraryModal").addEventListener("click", (e) => {
      if (e.target.id === "libraryModal") this.closeLibrary()
    })
  }

  setupTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)
    this.updateThemeIcon(savedTheme)
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    this.updateThemeIcon(newTheme)
  }

  updateThemeIcon(theme) {
    const icon = document.querySelector("#themeToggle i")
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }

  checkApiKey() {
    if (this.apiKey) {
      document.getElementById("apiSetup").style.display = "none"
      document.getElementById("mainContent").style.display = "block"
    } else {
      document.getElementById("apiSetup").style.display = "flex"
      document.getElementById("mainContent").style.display = "none"
    }
  }

  saveApiKey() {
    const apiKeyInput = document.getElementById("apiKeyInput")
    const apiKey = apiKeyInput.value.trim()

    if (!apiKey) {
      this.showToast("Please enter your API key", "error")
      return
    }

    this.apiKey = apiKey
    localStorage.setItem("gemini_api_key", apiKey)
    this.checkApiKey()
    this.showToast("API key saved successfully!", "success")
    apiKeyInput.value = ""
  }

  updateCharCount() {
    const input = document.getElementById("userInput")
    const charCount = document.getElementById("charCount")
    charCount.textContent = input.value.length
  }

  clearInput() {
    document.getElementById("userInput").value = ""
    this.updateCharCount()
  }

  async analyzeInput() {
    const userInput = document.getElementById("userInput").value.trim()

    if (!userInput) {
      this.showToast("Please enter your idea first", "warning")
      return
    }

    this.showLoading("Analyzing your input and generating questions...")

    try {
      const questions = await this.generateQuestions(userInput)
      this.currentQuestions = questions
      this.currentAnswers = {}
      this.displayQuestions()
      this.showStep("questionsStep")
      this.hideLoading()
    } catch (error) {
      this.hideLoading()
      this.showToast("Failed to generate questions. Please try again.", "error")
      console.error("Error generating questions:", error)
    }
  }

  async generateQuestions(userInput) {
    // Detect content type and context
    const contentType = this.detectContentType(userInput)
    const context = this.analyzeContext(userInput)

    const prompt = `
    Analyze this user input and generate 7-9 highly relevant questions to help create an optimized AI prompt.
    
    User Input: "${userInput}"
    Detected Content Type: ${contentType}
    Context Analysis: ${context}
    
    Based on the content type and context, generate specialized questions from these categories:
    
    CORE CATEGORIES (always include 2-3):
    - Target Audience & Context
    - Tone & Style Preferences  
    - Content Structure & Format
    
    SPECIALIZED CATEGORIES (choose 4-6 based on content type):
    
    For MARKETING/BUSINESS content:
    - Brand Voice & Messaging
    - Call-to-Action & Conversion Goals
    - Competitive Positioning
    - Customer Pain Points & Benefits
    
    For CREATIVE/STORYTELLING content:
    - Genre & Literary Style
    - Character Development & Perspective
    - Setting & World-building
    - Narrative Structure & Pacing
    
    For TECHNICAL/EDUCATIONAL content:
    - Technical Complexity Level
    - Learning Objectives & Outcomes
    - Prerequisites & Background Knowledge
    - Examples & Practical Applications
    
    For PROFESSIONAL/COMMUNICATION content:
    - Professional Context & Hierarchy
    - Communication Objectives
    - Formality Level & Protocol
    - Action Items & Next Steps
    
    For SOCIAL MEDIA/DIGITAL content:
    - Platform-Specific Requirements
    - Engagement & Interaction Goals
    - Visual Elements & Media
    - Hashtags & SEO Considerations
    
    For RESEARCH/ANALYTICAL content:
    - Research Methodology & Sources
    - Data Analysis & Interpretation
    - Scope & Limitations
    - Conclusions & Recommendations
    
    Return as JSON array with enhanced question objects:
    [
        {
            "question": "question text",
            "type": "multiple_choice" or "text_input" or "range_slider" or "checkbox_multiple",
            "category": "category name",
            "priority": "high" or "medium" or "low",
            "options": [...] (for multiple_choice),
            "description": "why this question matters",
            "placeholder": "hint text" (for text_input),
            "min": 1, "max": 10, "default": 5 (for range_slider),
            "checkboxOptions": [...] (for checkbox_multiple)
        }
    ]
    
    Ensure questions are:
    1. Highly specific to the detected content type
    2. Progressive (building on each other)
    3. Actionable (leading to concrete prompt improvements)
    4. Varied in question types for better UX
    `

    const response = await this.callGeminiAPI(prompt)

    // Clean and parse response
    let jsonStr = response.trim()
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "")
    }

    try {
      const questions = JSON.parse(jsonStr)
      return this.validateAndEnhanceQuestions(questions, contentType)
    } catch (parseError) {
      return this.getSpecializedFallbackQuestions(contentType)
    }
  }

  detectContentType(input) {
    const inputLower = input.toLowerCase()

    // Marketing & Business
    if (inputLower.match(/\b(product|marketing|sales|email|campaign|advertisement|promotion|brand|customer)\b/)) {
      return "marketing_business"
    }

    // Creative & Storytelling
    if (inputLower.match(/\b(story|novel|character|plot|creative|fiction|narrative|poem|script)\b/)) {
      return "creative_storytelling"
    }

    // Technical & Educational
    if (inputLower.match(/\b(tutorial|guide|documentation|technical|code|programming|learning|course|lesson)\b/)) {
      return "technical_educational"
    }

    // Professional & Communication
    if (inputLower.match(/\b(professional|business|meeting|presentation|report|proposal|memo|corporate)\b/)) {
      return "professional_communication"
    }

    // Social Media & Digital
    if (inputLower.match(/\b(social media|instagram|twitter|facebook|linkedin|post|content|digital|online)\b/)) {
      return "social_media_digital"
    }

    // Research & Analytical
    if (inputLower.match(/\b(research|analysis|study|data|survey|report|findings|methodology)\b/)) {
      return "research_analytical"
    }

    return "general"
  }

  analyzeContext(input) {
    const contexts = []
    const inputLower = input.toLowerCase()

    if (inputLower.match(/\b(beginner|new|start|basic|simple)\b/)) contexts.push("beginner-friendly")
    if (inputLower.match(/\b(advanced|expert|complex|detailed|comprehensive)\b/)) contexts.push("advanced")
    if (inputLower.match(/\b(quick|fast|brief|short|summary)\b/)) contexts.push("concise")
    if (inputLower.match(/\b(detailed|thorough|complete|extensive|in-depth)\b/)) contexts.push("comprehensive")
    if (inputLower.match(/\b(urgent|asap|quickly|immediate|deadline)\b/)) contexts.push("time-sensitive")
    if (inputLower.match(/\b(creative|innovative|unique|original|artistic)\b/)) contexts.push("creative")
    if (inputLower.match(/\b(professional|formal|business|corporate)\b/)) contexts.push("professional")
    if (inputLower.match(/\b(casual|informal|friendly|conversational)\b/)) contexts.push("casual")

    return contexts.length > 0 ? contexts.join(", ") : "general purpose"
  }

  validateAndEnhanceQuestions(questions, contentType) {
    // Ensure we have the right number of questions
    if (questions.length < 6) {
      const fallbackQuestions = this.getSpecializedFallbackQuestions(contentType)
      questions = [...questions, ...fallbackQuestions.slice(0, 8 - questions.length)]
    }

    // Add priority if missing
    questions.forEach((q) => {
      if (!q.priority) {
        q.priority = q.category?.includes("Core") ? "high" : "medium"
      }
      if (!q.category) {
        q.category = "General"
      }
    })

    // Sort by priority
    return questions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  getSpecializedFallbackQuestions(contentType) {
    const questionSets = {
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
          question: "How do you differentiate from competitors?",
          type: "text_input",
          category: "Competitive Advantage",
          priority: "medium",
          placeholder: "e.g., unique features, better pricing, superior service...",
          description: "Differentiation helps you stand out in the market",
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

      technical_educational: [
        {
          question: "What's the technical skill level of your audience?",
          type: "multiple_choice",
          category: "Audience Level",
          priority: "high",
          options: ["Complete beginner", "Some experience", "Intermediate", "Advanced", "Expert level"],
          description: "Skill level determines appropriate complexity and terminology",
        },
        {
          question: "What's the primary learning objective?",
          type: "multiple_choice",
          category: "Learning Goals",
          priority: "high",
          options: [
            "Understand concepts",
            "Learn practical skills",
            "Solve specific problems",
            "Pass certification",
            "Build projects",
            "Troubleshoot issues",
          ],
          description: "Clear objectives help structure effective learning content",
        },
        {
          question: "How should the content be structured?",
          type: "multiple_choice",
          category: "Content Structure",
          priority: "medium",
          options: [
            "Step-by-step tutorial",
            "Conceptual explanation",
            "Problem-solution format",
            "FAQ style",
            "Case study approach",
            "Reference guide",
          ],
          description: "Structure affects learning effectiveness and user experience",
        },
        {
          question: "What prerequisites should learners have?",
          type: "text_input",
          category: "Prerequisites",
          priority: "medium",
          placeholder: "e.g., basic programming knowledge, familiarity with tools...",
          description: "Prerequisites help set appropriate expectations",
        },
        {
          question: "Should practical examples be included?",
          type: "checkbox_multiple",
          category: "Examples & Practice",
          priority: "medium",
          checkboxOptions: [
            "Code examples",
            "Real-world scenarios",
            "Hands-on exercises",
            "Common mistakes",
            "Best practices",
            "Troubleshooting tips",
          ],
          description: "Examples make abstract concepts concrete and actionable",
        },
        {
          question: "What tools or technologies are involved?",
          type: "text_input",
          category: "Technical Context",
          priority: "low",
          placeholder: "e.g., Python, React, AWS, specific software...",
          description: "Tool-specific guidance improves practical applicability",
        },
      ],

      professional_communication: [
        {
          question: "What's the professional context?",
          type: "multiple_choice",
          category: "Professional Context",
          priority: "high",
          options: [
            "Internal team communication",
            "Client communication",
            "Executive presentation",
            "Vendor negotiation",
            "Performance review",
            "Project update",
          ],
          description: "Context determines appropriate tone and content focus",
        },
        {
          question: "What's your relationship to the audience?",
          type: "multiple_choice",
          category: "Professional Hierarchy",
          priority: "high",
          options: [
            "Reporting to superior",
            "Communicating with peers",
            "Leading subordinates",
            "External stakeholders",
            "Cross-functional teams",
          ],
          description: "Relationship affects communication style and approach",
        },
        {
          question: "What's the desired outcome?",
          type: "multiple_choice",
          category: "Communication Objectives",
          priority: "high",
          options: [
            "Get approval/buy-in",
            "Provide status update",
            "Request resources",
            "Resolve conflict",
            "Share information",
            "Make recommendation",
          ],
          description: "Clear outcomes help structure persuasive communication",
        },
        {
          question: "How formal should the communication be?",
          type: "range_slider",
          category: "Formality Level",
          priority: "medium",
          min: 1,
          max: 10,
          default: 6,
          description: "Formality level should match organizational culture and context",
        },
        {
          question: "What supporting information should be included?",
          type: "checkbox_multiple",
          category: "Supporting Elements",
          priority: "medium",
          checkboxOptions: [
            "Data and metrics",
            "Timeline/deadlines",
            "Budget information",
            "Risk assessment",
            "Next steps",
            "Background context",
          ],
          description: "Supporting information strengthens your message",
        },
      ],

      social_media_digital: [
        {
          question: "Which platform is this content for?",
          type: "multiple_choice",
          category: "Platform Targeting",
          priority: "high",
          options: [
            "Instagram",
            "Twitter/X",
            "LinkedIn",
            "Facebook",
            "TikTok",
            "YouTube",
            "Pinterest",
            "Multiple platforms",
          ],
          description: "Each platform has unique audience expectations and formats",
        },
        {
          question: "What's your primary engagement goal?",
          type: "multiple_choice",
          category: "Engagement Strategy",
          priority: "high",
          options: [
            "Increase followers",
            "Drive website traffic",
            "Generate comments/discussion",
            "Boost shares/retweets",
            "Build brand awareness",
            "Drive sales",
          ],
          description: "Engagement goals shape content strategy and messaging",
        },
        {
          question: "What content format works best?",
          type: "checkbox_multiple",
          category: "Content Format",
          priority: "medium",
          checkboxOptions: [
            "Short-form text",
            "Long-form caption",
            "Visual storytelling",
            "Video content",
            "User-generated content",
            "Behind-the-scenes",
          ],
          description: "Format affects audience engagement and platform algorithm performance",
        },
        {
          question: "Should hashtags and SEO be optimized?",
          type: "multiple_choice",
          category: "Discoverability",
          priority: "medium",
          options: [
            "Yes, include trending hashtags",
            "Yes, use niche-specific tags",
            "Minimal hashtag use",
            "Focus on SEO keywords",
            "No optimization needed",
          ],
          description: "Optimization improves content discoverability",
        },
        {
          question: "What's your brand voice on social media?",
          type: "multiple_choice",
          category: "Social Media Voice",
          priority: "medium",
          options: [
            "Professional & informative",
            "Casual & conversational",
            "Humorous & entertaining",
            "Inspirational & motivational",
            "Trendy & current",
          ],
          description: "Consistent voice builds brand recognition and audience connection",
        },
      ],

      research_analytical: [
        {
          question: "What type of research approach is needed?",
          type: "multiple_choice",
          category: "Research Methodology",
          priority: "high",
          options: [
            "Quantitative analysis",
            "Qualitative research",
            "Mixed methods",
            "Literature review",
            "Case study",
            "Experimental design",
          ],
          description: "Research approach determines data collection and analysis methods",
        },
        {
          question: "What's the scope of your research?",
          type: "multiple_choice",
          category: "Research Scope",
          priority: "high",
          options: [
            "Exploratory study",
            "Descriptive analysis",
            "Comparative study",
            "Longitudinal research",
            "Cross-sectional analysis",
            "Meta-analysis",
          ],
          description: "Scope defines the breadth and depth of investigation",
        },
        {
          question: "Who is the target audience for findings?",
          type: "multiple_choice",
          category: "Audience & Application",
          priority: "medium",
          options: [
            "Academic community",
            "Business stakeholders",
            "Policy makers",
            "General public",
            "Industry professionals",
            "Research peers",
          ],
          description: "Audience determines presentation style and technical depth",
        },
        {
          question: "What data sources should be considered?",
          type: "checkbox_multiple",
          category: "Data Sources",
          priority: "medium",
          checkboxOptions: [
            "Primary data collection",
            "Secondary data analysis",
            "Published research",
            "Industry reports",
            "Survey data",
            "Interview data",
          ],
          description: "Data sources affect research credibility and comprehensiveness",
        },
        {
          question: "What are the key limitations to acknowledge?",
          type: "text_input",
          category: "Research Limitations",
          priority: "low",
          placeholder: "e.g., sample size, time constraints, access to data...",
          description: "Acknowledging limitations demonstrates research integrity",
        },
      ],
    }

    return questionSets[contentType] || questionSets.marketing_business
  }

  displayQuestions() {
    const container = document.getElementById("questionsContainer")
    container.innerHTML = ""

    this.currentQuestions.forEach((question, index) => {
      const questionCard = this.createQuestionCard(question, index)
      container.appendChild(questionCard)
    })

    this.updateProgress()
  }

  createQuestionCard(question, index) {
    const priorityIcon = {
      high: "fas fa-star",
      medium: "fas fa-star-half-alt",
      low: "far fa-star",
    }

    const card = document.createElement("div")
    card.className = `question-card priority-${question.priority || "medium"}`
    card.innerHTML = `
    <div class="question-header">
      <div class="question-meta">
        <span class="question-category">
          <i class="${priorityIcon[question.priority] || "fas fa-star-half-alt"}"></i>
          ${question.category || "General"}
        </span>
      </div>
      <div class="question-title">${question.question}</div>
      <div class="question-description">${question.description}</div>
    </div>
    <div class="question-content" id="question-${index}">
      ${this.createQuestionInput(question, index)}
    </div>
  `
    return card
  }

  createQuestionInput(question, index) {
    if (question.type === "multiple_choice") {
      return `
      <div class="question-options">
        ${question.options
          .map(
            (option) => `
            <button class="option-button" data-question="${index}" data-value="${option}">
              ${option}
            </button>
          `,
          )
          .join("")}
      </div>
    `
    } else if (question.type === "range_slider") {
      return `
      <div class="range-container">
        <div class="range-labels">
          <span>Low (${question.min || 1})</span>
          <span>High (${question.max || 10})</span>
        </div>
        <input type="range" class="question-range" data-question="${index}" 
               min="${question.min || 1}" max="${question.max || 10}" 
               value="${question.default || 5}">
        <div class="range-value" id="range-value-${index}">${question.default || 5}</div>
      </div>
    `
    } else if (question.type === "checkbox_multiple") {
      return `
      <div class="checkbox-options">
        ${question.checkboxOptions
          .map(
            (option, optIndex) => `
            <label class="checkbox-option">
              <input type="checkbox" data-question="${index}" data-value="${option}" value="${option}">
              <span class="checkbox-label">${option}</span>
            </label>
          `,
          )
          .join("")}
      </div>
    `
    } else {
      return `
      <input type="text" class="question-input" data-question="${index}" 
             placeholder="${question.placeholder || "Enter your answer..."}">
    `
    }
  }

  setupQuestionListeners() {
    // Option buttons
    document.querySelectorAll(".option-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const questionIndex = e.target.getAttribute("data-question")
        const value = e.target.getAttribute("data-value")

        // Remove selected class from siblings
        e.target.parentNode.querySelectorAll(".option-button").forEach((btn) => {
          btn.classList.remove("selected")
        })

        // Add selected class to clicked button
        e.target.classList.add("selected")

        // Store answer
        this.currentAnswers[questionIndex] = value
        this.updateProgress()
      })
    })

    // Range sliders
    document.querySelectorAll(".question-range").forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const questionIndex = e.target.getAttribute("data-question")
        const value = e.target.value

        // Update display value
        document.getElementById(`range-value-${questionIndex}`).textContent = value

        // Store answer
        this.currentAnswers[questionIndex] = value
        this.updateProgress()
      })
    })

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"][data-question]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const questionIndex = e.target.getAttribute("data-question")

        // Get all checked values for this question
        const checkedBoxes = document.querySelectorAll(
          `input[type="checkbox"][data-question="${questionIndex}"]:checked`,
        )
        const values = Array.from(checkedBoxes).map((cb) => cb.value)

        if (values.length > 0) {
          this.currentAnswers[questionIndex] = values.join(", ")
        } else {
          delete this.currentAnswers[questionIndex]
        }
        this.updateProgress()
      })
    })

    // Text inputs
    document.querySelectorAll(".question-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const questionIndex = e.target.getAttribute("data-question")
        const value = e.target.value.trim()

        if (value) {
          this.currentAnswers[questionIndex] = value
        } else {
          delete this.currentAnswers[questionIndex]
        }
        this.updateProgress()
      })
    })
  }

  updateProgress() {
    const totalQuestions = this.currentQuestions.length
    const answeredQuestions = Object.keys(this.currentAnswers).length
    const progress = (answeredQuestions / totalQuestions) * 100

    document.getElementById("progressFill").style.width = `${progress}%`
    document.getElementById("progressText").textContent = `${answeredQuestions} of ${totalQuestions} questions answered`

    const generateBtn = document.getElementById("generatePrompt")
    generateBtn.disabled = answeredQuestions < totalQuestions

    // Setup listeners after DOM update
    setTimeout(() => this.setupQuestionListeners(), 0)
  }

  async generateOptimizedPrompt() {
    this.showLoading("Generating your optimized prompt...")

    try {
      const userInput = document.getElementById("userInput").value.trim()
      const optimizedPrompt = await this.createOptimizedPrompt(userInput, this.currentAnswers)
      this.generatedPrompt = optimizedPrompt
      this.displayGeneratedPrompt()
      this.showStep("resultStep")
      this.hideLoading()
    } catch (error) {
      this.hideLoading()
      this.showToast("Failed to generate prompt. Please try again.", "error")
      console.error("Error generating prompt:", error)
    }
  }

  async createOptimizedPrompt(userInput, answers) {
    const contentType = this.detectContentType(userInput)
    const answersText = Object.entries(answers)
      .map(([index, answer]) => {
        const question = this.currentQuestions[index]
        return `${question.category}: ${question.question} → ${answer}`
      })
      .join("\n")

    const specializationPrompts = {
      marketing_business: `
      Focus on creating a marketing-optimized prompt that:
      - Clearly defines the target audience and their pain points
      - Incorporates brand voice and messaging strategy
      - Includes specific call-to-action elements
      - Addresses competitive positioning
      - Optimizes for conversion goals
    `,
      creative_storytelling: `
      Focus on creating a creative writing prompt that:
      - Establishes clear genre conventions and expectations
      - Defines narrative perspective and voice
      - Incorporates world-building and setting details
      - Addresses character development and conflict
      - Considers pacing and story structure
    `,
      technical_educational: `
      Focus on creating an educational prompt that:
      - Matches the appropriate technical complexity level
      - Includes clear learning objectives
      - Incorporates practical examples and applications
      - Addresses prerequisites and background knowledge
      - Structures content for effective learning
    `,
      professional_communication: `
      Focus on creating a professional communication prompt that:
      - Matches appropriate formality and hierarchy levels
      - Clearly states communication objectives
      - Includes relevant supporting information
      - Addresses professional context and protocols
      - Optimizes for desired outcomes
    `,
      social_media_digital: `
      Focus on creating a social media optimized prompt that:
      - Tailors content for specific platform requirements
      - Incorporates engagement and interaction goals
      - Addresses hashtag and SEO optimization
      - Matches platform-appropriate voice and tone
      - Considers visual and multimedia elements
    `,
      research_analytical: `
      Focus on creating a research-focused prompt that:
      - Defines appropriate research methodology
      - Addresses scope and limitations
      - Incorporates relevant data sources
      - Matches audience expertise level
      - Structures for analytical rigor
    `,
    }

    const prompt = `
    Create a highly optimized AI prompt based on the user's original idea and their detailed answers to specialized questions.

    Original User Input: "${userInput}"
    Detected Content Type: ${contentType}

    Detailed User Responses:
    ${answersText}

    ${specializationPrompts[contentType] || specializationPrompts.marketing_business}

    Create a comprehensive, well-structured prompt that:
    1. Incorporates ALL the user's specific requirements and preferences
    2. Uses clear, actionable language that AI models can follow precisely
    3. Includes relevant context, constraints, and success criteria
    4. Specifies the desired output format and structure
    5. Is optimized for getting the best results from modern AI models
    6. Addresses the specific needs of the ${contentType.replace("_", " ")} content type

    The final prompt should be detailed enough to produce consistent, high-quality results while being clear and easy to understand.

    Return only the optimized prompt, without any explanations or additional text.
  `

    return await this.callGeminiAPI(prompt)
  }

  displayGeneratedPrompt() {
    document.getElementById("generatedPrompt").textContent = this.generatedPrompt
  }

  async callGeminiAPI(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid API response format")
    }

    return data.candidates[0].content.parts[0].text
  }

  copyPrompt() {
    navigator.clipboard
      .writeText(this.generatedPrompt)
      .then(() => {
        this.showToast("Prompt copied to clipboard!", "success")
      })
      .catch(() => {
        this.showToast("Failed to copy prompt", "error")
      })
  }

  downloadPrompt() {
    const blob = new Blob([this.generatedPrompt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    this.showToast("Prompt downloaded!", "success")
  }

  savePromptToLibrary() {
    const userInput = document.getElementById("userInput").value.trim()
    const promptData = {
      id: Date.now(),
      title: this.generatePromptTitle(userInput),
      content: this.generatedPrompt,
      originalInput: userInput,
      createdAt: new Date().toISOString(),
    }

    this.savedPrompts.unshift(promptData)
    localStorage.setItem("saved_prompts", JSON.stringify(this.savedPrompts))
    this.showToast("Prompt saved to library!", "success")
  }

  generatePromptTitle(input) {
    const words = input.split(" ").slice(0, 6)
    return words.join(" ") + (input.split(" ").length > 6 ? "..." : "")
  }

  openLibrary() {
    this.displayLibrary()
    document.getElementById("libraryModal").classList.add("active")
  }

  closeLibrary() {
    document.getElementById("libraryModal").classList.remove("active")
  }

  displayLibrary() {
    const container = document.getElementById("libraryContent")

    if (this.savedPrompts.length === 0) {
      container.innerHTML = `
                <div class="library-empty">
                    <i class="fas fa-bookmark"></i>
                    <p>No saved prompts yet. Generate and save your first prompt!</p>
                </div>
            `
      return
    }

    container.innerHTML = this.savedPrompts
      .map(
        (prompt) => `
            <div class="library-item">
                <div class="library-item-header">
                    <div>
                        <div class="library-item-title">${prompt.title}</div>
                        <div class="library-item-date">${new Date(prompt.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div class="library-item-actions">
                        <button class="btn btn-icon" onclick="promptGenie.copyLibraryPrompt('${prompt.id}')" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-icon" onclick="promptGenie.deleteLibraryPrompt('${prompt.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="library-item-content">${prompt.content}</div>
            </div>
        `,
      )
      .join("")
  }

  copyLibraryPrompt(id) {
    const prompt = this.savedPrompts.find((p) => p.id == id)
    if (prompt) {
      navigator.clipboard
        .writeText(prompt.content)
        .then(() => {
          this.showToast("Prompt copied to clipboard!", "success")
        })
        .catch(() => {
          this.showToast("Failed to copy prompt", "error")
        })
    }
  }

  deleteLibraryPrompt(id) {
    if (confirm("Are you sure you want to delete this prompt?")) {
      this.savedPrompts = this.savedPrompts.filter((p) => p.id != id)
      localStorage.setItem("saved_prompts", JSON.stringify(this.savedPrompts))
      this.displayLibrary()
      this.showToast("Prompt deleted", "success")
    }
  }

  searchLibrary(query) {
    const filteredPrompts = this.savedPrompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(query.toLowerCase()) ||
        prompt.content.toLowerCase().includes(query.toLowerCase()),
    )

    const container = document.getElementById("libraryContent")

    if (filteredPrompts.length === 0) {
      container.innerHTML = `
                <div class="library-empty">
                    <i class="fas fa-search"></i>
                    <p>No prompts found matching "${query}"</p>
                </div>
            `
      return
    }

    container.innerHTML = filteredPrompts
      .map(
        (prompt) => `
            <div class="library-item">
                <div class="library-item-header">
                    <div>
                        <div class="library-item-title">${prompt.title}</div>
                        <div class="library-item-date">${new Date(prompt.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div class="library-item-actions">
                        <button class="btn btn-icon" onclick="promptGenie.copyLibraryPrompt('${prompt.id}')" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-icon" onclick="promptGenie.deleteLibraryPrompt('${prompt.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="library-item-content">${prompt.content}</div>
            </div>
        `,
      )
      .join("")
  }

  startOver() {
    this.currentQuestions = []
    this.currentAnswers = {}
    this.generatedPrompt = ""
    document.getElementById("userInput").value = ""
    this.updateCharCount()
    this.showStep("inputStep")
  }

  showStep(stepId) {
    document.querySelectorAll(".step-section").forEach((section) => {
      section.classList.remove("active")
    })
    document.getElementById(stepId).classList.add("active")
  }

  showLoading(message) {
    document.getElementById("loadingText").textContent = message
    document.getElementById("loadingOverlay").classList.add("active")
  }

  hideLoading() {
    document.getElementById("loadingOverlay").classList.remove("active")
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const icon =
      type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-exclamation-triangle"

    toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="toast-message">${message}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `

    document.getElementById("toastContainer").appendChild(toast)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 5000)

    // Manual close
    toast.querySelector(".toast-close").addEventListener("click", () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    })
  }
}

// Initialize the app
const promptGenie = new PromptGenie()
