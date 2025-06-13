# PromptGenie - AI Prompt Generator Tool

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Shadcn/UI-Latest-000000?style=for-the-badge&logo=shadcnui" alt="Shadcn/UI" />
</div>

<div align="center">
  <h3>🧞‍♂️ Transform Your Ideas Into Perfect AI Prompts</h3>
  <p>PromptGenie uses advanced AI to analyze your ideas and generate optimized prompts through intelligent questioning. Get better results from any AI tool with professionally crafted prompts.</p>
</div>

## ✨ Features

### 🎯 Core Functionality
- **Smart Content Detection**: AI automatically detects your content type and generates specialized questions
- **Dynamic Question Generation**: Get 5-10 relevant questions based on complexity and context
- **Prompt Optimization**: Create comprehensive, well-structured AI prompts
- **Prompt Refactoring**: Refactor prompts based on AI model privacy policies and constraints
- **Auto-Expiring Library**: Prompts saved for 23 hours with automatic cleanup

### 🎨 User Experience
- **Modern Glassmorphic Design**: Beautiful, responsive interface with smooth animations
- **Dark/Light Mode**: Toggle between themes for comfortable usage
- **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Progress Tracking**: Visual progress indicators for question completion

### 🔧 Technical Features
- **Google Gemini API Integration**: Powered by Google's advanced AI models
- **Secure API Management**: Add multiple API keys with automatic testing
- **Local Storage**: All data stored locally for privacy and security
- **Smart Hashtag Suggestions**: AI-powered hashtag recommendations
- **User Authentication**: Secure signup and login system

### 🛡️ Privacy & Security
- **Local Data Storage**: All prompts and settings stored in browser
- **Secure API Keys**: Encrypted storage with validation
- **No External Tracking**: Complete privacy protection
- **Auto-Cleanup**: Expired data automatically removed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/promptgenie.git
   cd promptgenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### API Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free account if you don't have one
3. Generate a new API key
4. In PromptGenie, click "API Keys" and add your key
5. The key will be tested automatically and stored securely

## 📁 Project Structure

```
promptgenie/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and theme variables
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main page component
├── components/                   # React components
│   ├── ui/                      # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── slider.tsx
│   │   ├── checkbox.tsx
│   │   └── alert.tsx
│   ├── prompt-genie-website.tsx # Main application component
│   └── auth/                    # Authentication components
│       ├── login-form.tsx
│       └── signup-form.tsx
├── hooks/                       # Custom React hooks
│   ├── use-toast.ts            # Toast notification hook
│   └── use-mobile.tsx          # Mobile detection hook
├── lib/                        # Utility functions
│   └── utils.ts                # Common utilities
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## 🎯 How to Use

### Step 1: Setup
1. **Add API Key**: Click "API Keys" in the header and add your Google Gemini API key
2. **Create Account**: Sign up for a free account to save your progress
3. **Choose Theme**: Toggle between light and dark modes

### Step 2: Generate Questions
1. **Describe Your Idea**: Enter what you want to create with AI
2. **Add Hashtags**: Include relevant hashtags for your content
3. **Click Analyze**: AI will generate 5-10 specialized questions

### Step 3: Answer Questions
1. **Complete Questions**: Answer all generated questions
2. **Track Progress**: Monitor completion with the progress bar
3. **Generate Prompt**: Create your optimized prompt

### Step 4: Refine & Use
1. **Review Prompt**: Check the generated prompt
2. **Refactor if Needed**: Use the Refactor tab for privacy-compliant versions
3. **Save or Export**: Copy, download, or save to your library

## 🔧 Components Overview

### Core Components

#### `PromptGenieWebsite`
Main application component handling:
- Landing page and app navigation
- State management for all features
- API integration and error handling

#### `AuthForms`
Authentication system including:
- User registration and login
- Session management
- Protected routes

#### `UI Components`
Shadcn/UI based components:
- **Button**: Various button styles and states
- **Card**: Content containers with headers
- **Input/Textarea**: Form input elements
- **Dialog**: Modal dialogs for settings
- **Tabs**: Tabbed navigation interface
- **Badge**: Status and category indicators
- **Slider**: Range input controls
- **Checkbox**: Multi-select options
- **Alert**: Notification messages

### Feature Components

#### Question Generation
- Content type detection
- Dynamic question creation
- Priority-based organization
- Multiple input types support

#### Prompt Optimization
- AI-powered prompt enhancement
- Context-aware improvements
- Format standardization

#### Prompt Refactoring
- Privacy policy compliance
- Model-specific adaptations
- Reason-based modifications

#### Library Management
- Auto-expiring storage (23 hours)
- Search and filter functionality
- Export and sharing options

## 🎨 Styling & Theming

### Design System
- **Colors**: CSS custom properties for theme switching
- **Typography**: Inter font family with multiple weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Layered shadow system
- **Borders**: Rounded corners and border styles

### Theme Variables
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides */
}
```

### Responsive Design
- **Mobile First**: Designed for mobile, enhanced for desktop
- **Breakpoints**: Standard Tailwind CSS breakpoints
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Friendly**: Appropriate touch targets

## 🔌 API Integration

### Google Gemini API
- **Models**: gemini-1.5-flash for optimal performance
- **Rate Limiting**: Built-in error handling
- **Fallback**: Default questions when API fails
- **Validation**: API key format and functionality testing

### API Key Management
```typescript
interface APIKey {
  id: string
  name: string
  key: string
  isActive: boolean
  isWorking: boolean
  lastTested: string
}
```

## 📱 Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Environment Variables

Create a `.env.local` file:
```env
# Optional: Default API endpoint
NEXT_PUBLIC_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Test on multiple browsers
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: For providing the Gemini API
- **Vercel**: For hosting and deployment platform
- **Shadcn/UI**: For the beautiful component library
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For the icon library

## 📞 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Email**: rative.project.suve@gmail.com

## 🗺️ Roadmap

- [ ] **Multi-language Support**: Internationalization
- [ ] **Team Collaboration**: Shared workspaces
- [ ] **Advanced Analytics**: Usage statistics
- [ ] **Custom Models**: Support for other AI providers
- [ ] **Prompt Templates**: Pre-built prompt categories
- [ ] **Export Formats**: Multiple export options

---

<div align="center">
  <p>Developed by ❤️ by the Suvendu</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
