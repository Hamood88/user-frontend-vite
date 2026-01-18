# Earn More Feature - User Flows & UI Guide

## User Journey

### Flow 1: User Sharing Referral Code
```
User logged in
    ↓
Click "💰 Earn More" in sidebar
    ↓
Navigate to /earn-more
    ↓
View referral statistics (People Invited, Total Earned)
    ↓
Choose tab: "Invite Users" or "Invite Shops"
    ↓
Options available:
├─ Copy Referral Code
├─ Download QR Code
├─ Copy Direct Link
└─ Share on Social Media (Facebook, Twitter, Email)
    ↓
Share code/link/QR with friends
```

### Flow 2: New User Following Referral Link (User Mode)
```
Friend receives link: moondala.com/refer/user/ABC123
    ↓
Click link
    ↓
Redirects to /login?mode=user&referral=ABC123
    ↓
Message shown: 
"🎁 Join our growing community! This referral link 
unlocks exclusive rewards. Sign up now and start earning!"
    ↓
Register or Login
    ↓
System associates account with referrer's code (ABC123)
    ↓
Referrer earns commission
```

### Flow 3: New Shop Following Referral Link (Shop Mode)
```
Shop owner receives link: moondala.com/refer/shop/ABC123
    ↓
Click link
    ↓
Redirects to /login?mode=shop&referral=ABC123
    ↓
Message shown:
"🏪 Start your shop on Moondala! This referral link 
gives you special bonuses. Register now and reach 
millions of customers!"
    ↓
Register shop
    ↓
System associates shop with referrer's code (ABC123)
    ↓
Referrer earns commission from shop sales
```

## UI Components Overview

### 1. Earn More Page Layout
```
┌─────────────────────────────────────────────────┐
│         💰 Earn More                            │
│  Share your referral code and start earning!    │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  People Invited: 15  │ Total Earned: $450.00 │ Referral Code: ABC123 │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  [Invite Users Tab] │ [Invite Shops Tab]     │
└──────────────────────────────────────────────┘

Tab Content:
┌──────────────────────────────────────────────────┐
│ Invite Users to Moondala                         │
│ Share your referral code with friends...         │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Scan or Share QR Code                        │ │
│ │  ┌────────────┐  Direct Link:               │ │
│ │  │    QR      │  moondala.com/refer/       │ │
│ │  │   CODE     │  user/ABC123               │ │
│ │  │    300x300 │  [Copy Link]               │ │
│ │  │  ┌──────────────────────────┐           │ │
│ │  │  │ [📥 Download QR Code]    │           │ │
│ │  │  └──────────────────────────┘           │ │
│ │  └────────────┘                            │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Referral Code                                │ │
│ │ [ABC123] [Copy]                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Share on Social Media                        │ │
│ │ [Facebook] [Twitter] [Email]                 │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 2. QR Code Details
- Size: 300x300 pixels
- Format: PNG with transparency
- Error Correction Level: H (high)
- Contains: Full referral URL with code embedded
- Different codes for:
  - User invites: `/refer/user/{code}`
  - Shop invites: `/refer/shop/{code}`

### 3. Copy Feedback
```
Normal state:
[Copy] → Click → "Copied!" (2 second toast) → [Copy]

Clipboard contains:
- Referral code: ABC123
- Direct link: https://moondala.com/refer/user/ABC123
```

### 4. Social Media Share Messages

#### User Invite Message:
```
Join me on Moondala! 
Use my referral code ABC123 to earn rewards 🎁

Link: https://moondala.com/refer/user/ABC123
```

#### Shop Invite Message:
```
Join my shop on Moondala! 
Use my referral code ABC123 🏪

Link: https://moondala.com/refer/shop/ABC123
```

### 5. Referral Statistics Display

```
┌─────────────────────┐
│  People Invited     │
│      15             │
│  (Unique count)     │
└─────────────────────┘

┌─────────────────────┐
│  Total Earned       │
│   $450.00           │
│  (Commission sum)   │
└─────────────────────┘

┌─────────────────────┐
│ Referral Code       │
│  ABC123             │
│  (Unique per user)  │
└─────────────────────┘
```

## Color Scheme

### Gradients
- **Page Background**: `from-slate-900 via-purple-900 to-slate-900`
- **Primary Button**: `from-yellow-400 to-purple-500`
- **Secondary Button**: `from-blue-500 to-cyan-500`
- **Download Button**: `from-blue-500 to-cyan-500`
- **Copy Button**: `from-green-500 to-emerald-500`

### Text
- **Primary**: White
- **Secondary**: Gray-300
- **Muted**: Gray-400

### Accents
- **Highlight**: Yellow-400
- **Success**: Green-400
- **Info**: Blue-400
- **Important**: Purple-500

## Responsive Breakpoints

### Mobile (< 768px)
- Full width layout
- Single column for stats
- QR code stacked vertically
- Touch-friendly button sizes
- Abbreviated labels on social buttons

### Tablet (768px - 1024px)
- 2-column grid for stats
- Side-by-side QR and link
- Full labels on buttons
- Optimized spacing

### Desktop (> 1024px)
- 3-column stat grid
- Comfortable spacing
- All features visible
- Full-featured layout

## Accessibility Features

1. **Button Labels**: Clear action text
2. **Hover States**: Visual feedback on all interactions
3. **Loading States**: Spinner while data fetches
4. **Error Handling**: Graceful fallbacks
5. **Keyboard Navigation**: All buttons focusable
6. **Color Contrast**: WCAG AA compliant

## Interactive Elements

### Buttons
- Copy Code/Link: Purple gradient, copy icon
- Download QR: Blue gradient, download icon
- Social Share: Platform colors (Facebook blue, Twitter light blue, Gmail red)
- Tab Switch: Yellow highlight when active

### Forms
- Input fields: Dark background, white text, copy button
- Read-only: No editing, only copy option

### Animations
- Tab transition: Smooth color change
- Copy feedback: 2-second toast notification
- Loading: Spinner during fetch

## Integration Points

### With Authentication
- Stores referral code in localStorage during signup
- Passes referral code through URL parameters
- Associates new account with referrer

### With Sidebar
- "💰 Earn More" link appears in main navigation
- Responsive on all screen sizes
- Collapsed view shows icon only

### With Profile
- Pulls referral code from logged-in user's profile
- Updates if user profile changes

## Error States

### API Fails to Load Stats
```
│ People Invited: 0   │ Total Earned: $0.00 │ (defaults shown) │
```

### QR Generation Fails
```
│ [Gray box] │
│ QR Code unavailable
└────────────┘
```

### Social Share Blocked
- Popup blocker prevents window.open()
- User can still manually copy and share link
- No error message, graceful degradation

## Performance Considerations

- QR generation happens once on component mount
- Stats fetch on component mount (cached)
- No polling/refresh unless user manually clicks
- Images lazy-loaded
- Minimal bundle size impact (qrcode library ~10KB)

## Browser Support

✅ Chrome/Edge: Full support
✅ Firefox: Full support
✅ Safari: Full support
⚠️ IE11: Not supported (uses modern APIs)

## Known Limitations

1. One referral code per user account
2. Referral links don't expire
3. QR code size is fixed at 300x300px
4. Social media share opens in new window
5. No custom referral messages per share
