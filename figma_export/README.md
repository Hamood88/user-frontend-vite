# Moondala Authentication System

A luxury, professional split-authentication React application for Moondala's social commerce platform.

## Features

### 🎨 **Premium Design**
- Luxury dark mode with sophisticated gold and purple accents
- Glassmorphism panels with subtle animations
- Fully responsive layout (desktop-optimized)
- Animated floating particles background
- Smooth transitions and micro-interactions

### 👥 **Dual Authentication Flow**
- **User Panel**: For buyers/shoppers
- **Shop Panel**: For sellers/merchants
- Separate login and sign-up forms for each user type
- Default landing on login forms

### 📝 **Complete Form Fields**

**User Sign Up:**
- First Name, Last Name
- Email & Password
- Phone Number (with validation)
- Gender (dropdown)
- Date of Birth (day/month/year selectors)
- Country (searchable, 195+ countries)
- Favorite Sport
- Interests (multi-select with search)
- Inviter Code (auto-locked from URL parameter)

**Shop Sign Up:**
- Shop Name
- Owner First Name, Last Name
- Email & Password
- Phone Number
- Date of Birth
- Country (searchable)
- Inviter Code (auto-locked from URL parameter)

### ✅ **Form Validation**
- Email format validation
- Password strength requirements (8+ chars, uppercase, lowercase, number)
- Phone number validation
- Age verification (13+ years)
- Real-time field validation
- Clear error messages

### 🔐 **Security Features**
- Password show/hide toggle
- Input sanitization
- HTTPS-ready
- Token-based authentication
- Secure localStorage management

### ♿ **Accessibility**
- ARIA labels and roles
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader friendly
- High contrast text

### 🎭 **UX Features**
- Loading states with spinners
- Success/error notifications
- Animated form transitions
- Hover effects and tooltips
- Auto-focus on inputs
- Remember me functionality

## File Structure

```
/
├── components/
│   └── moondala-premium/
│       ├── MoondalaSplitAuth.tsx      # Main container
│       ├── UserAuthPanel.tsx          # User authentication panel
│       ├── ShopAuthPanel.tsx          # Shop authentication panel
│       ├── UserLoginForm.tsx          # User login form
│       ├── UserSignUpForm.tsx         # User registration form
│       ├── ShopLoginForm.tsx          # Shop login form
│       ├── ShopSignUpForm.tsx         # Shop registration form
│       ├── PremiumInput.tsx           # Reusable input component
│       ├── PremiumButton.tsx          # Reusable button component
│       ├── PremiumDropdown.tsx        # Searchable dropdown
│       ├── MultiSelectChips.tsx       # Multi-select interests
│       ├── DOBSelector.tsx            # Date of birth selector
│       ├── LockedInput.tsx            # Inviter code field
│       ├── TabSwitcher.tsx            # Login/SignUp tabs
│       ├── Tooltip.tsx                # Info tooltips
│       ├── FloatingParticles.tsx      # Background animation
│       ├── ErrorMessage.tsx           # Error/success alerts
│       ├── LoadingSpinner.tsx         # Loading indicators
│       └── FormValidation.ts          # Validation utilities
├── services/
│   └── authService.ts                 # API service layer
├── hooks/
│   └── useForm.ts                     # Form management hook
├── utils/
│   └── countries.ts                   # 195+ countries list
├── styles/
│   └── globals.css                    # Global styles
└── App.tsx                            # Entry point
```

## Setup & Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
Create a `.env` file:
```env
VITE_API_URL=https://your-api-url.com/api
```

Or for development:
```env
VITE_API_URL=http://localhost:3000/api
```

**Note:** If no environment variable is set, the app defaults to `/api` (relative path).

3. **Run Development Server**
```bash
npm run dev
```

## API Integration

### Endpoints Required

**User Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

**Shop Authentication:**
- `POST /api/shop/auth/login` - Shop login (with fallbacks)
- `POST /api/shop/auth/register` - Shop registration (with fallbacks)

### Request Payloads

**User Login:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**User Sign Up:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "country": "United States",
  "favoriteSport": "Football",
  "interests": ["Fashion", "Electronics"],
  "inviterCode": "ABC123XYZ"
}
```

**Shop Sign Up:**
```json
{
  "shopName": "My Shop",
  "name": "My Shop",
  "email": "shop@example.com",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1985-05-20",
  "country": "Canada",
  "inviterCode": "DEF456UVW"
}
```

### Response Format
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "123",
    "email": "user@example.com",
    ...
  }
}
```

## Inviter Code Flow

The application supports referral codes via URL parameters:

```
https://yourapp.com?inviterCode=ABC123
https://yourapp.com?inviter=ABC123
```

When an inviter code is present in the URL:
- The "Inviter Code" field is pre-filled
- Field is locked (read-only)
- Shows "Applied ✓" badge
- Displays lock icon and helper text

## Color Palette

**Primary Colors:**
- Deep Navy: `#0A0D1C`, `#12141F`
- Luxury Purple: `#6B46C1`, `#8B5CF6`
- Champagne Gold: `#D4AF37`, `#C4A962`

**UI Colors:**
- White overlay: `rgba(255,255,255,0.03-0.1)`
- Border: `rgba(255,255,255,0.1)`
- Text: White with varying opacity

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized animations with Motion (Framer Motion)
- Lazy loading for heavy components
- Debounced search in dropdowns
- Minimal re-renders with proper state management

## Customization

### Change Colors
Edit color values in component files:
- Primary gradient: Update hex values in gradients
- Accent color: Change `#D4AF37` references

### Add/Remove Fields
Edit form components:
- `UserSignUpForm.tsx` for user fields
- `ShopSignUpForm.tsx` for shop fields

### Modify Validation
Edit `FormValidation.ts`:
- Add custom validators
- Adjust password requirements
- Change age limits

## Production Checklist

- [ ] Set up environment variables
- [ ] Configure API endpoints
- [ ] Test all form validations
- [ ] Test authentication flow
- [ ] Add error tracking (Sentry, etc.)
- [ ] Set up analytics
- [ ] Test on all target browsers
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Test mobile responsiveness

## License

Proprietary - Moondala Inc.

## Support

For issues or questions, contact: support@moondala.com