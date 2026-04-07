Design a professional, mobile-first PWA called "RoadSoS" — an emergency 
services locator for road accident victims. The app must feel urgent, 
trustworthy, and instantly usable under panic conditions.

BRAND IDENTITY:
- App name: RoadSoS
- Tagline: "Help is always nearby"
- Primary color: #D62828 (emergency red)
- Secondary color: #023E8A (trust blue)  
- Background: #0D0D0D (near black)
- Surface cards: #1A1A2E
- Accent/success: #06D6A0 (green — for "safe" indicators)
- Warning: #FFB703
- Text primary: #F0F0F0
- Text muted: #8888AA
- Font: "Syne" for headings, "DM Sans" for body
- Border radius: 16px cards, 50px buttons
- Design language: Dark emergency UI — think flight tracker 
  meets ambulance dispatch. Professional, not playful.

SCREENS TO DESIGN (6 screens, mobile 390x844px):

SCREEN 1 — SPLASH / ONBOARDING
- Full screen dark background
- RoadSoS logo center (shield icon with pulse/heartbeat line inside)
- Tagline: "Help is always nearby"
- Subtext: "Locate emergency services instantly, even without internet"
- Single CTA button: "Allow Location & Get Started" in red
- Small text below: "Works offline · No sign-up required"
- Subtle animated pulse ring behind the shield icon

SCREEN 2 — HOME / MAP VIEW (main screen)
- Top bar: RoadSoS logo left, offline indicator pill right 
  (green dot "Online" or red dot "Offline")
- Full screen Leaflet map taking 55% of screen height
- User location shown as pulsing blue dot
- Nearby service markers in different colors:
  Red pin = Hospital/Trauma
  Blue pin = Police Station  
  Orange pin = Ambulance
  Yellow pin = Towing Service
- Bottom sheet (scrollable, 45% height):
  - "Nearest Services" heading with distance subtitle 
    "Showing results within 10km"
  - Horizontal filter chips: All | Hospital | Police | 
    Ambulance | Towing | Puncture
  - Service cards (show 3 visible):
    Each card has: colored left border, service icon, 
    name, distance badge, trauma level badge (for hospitals),
    two action buttons — "Call" (red, filled) and 
    "Navigate" (blue, outlined)

SCREEN 3 — SERVICE DETAIL CARD (expanded)
- Bottom sheet expanded full screen
- Hospital name large, verified badge (green checkmark)
- Trauma Level 1 badge (prominent, red)
- Distance: "2.3 km away · ~6 min"
- Quick stats row: Beds icon, Emergency icon, 24/7 badge
- Phone number with large "Call Now" red button
- "Open in Maps" button (outlined)
- "Share Location" button (outlined)
- Map thumbnail showing route
- "Report outdated info" small link at bottom

SCREEN 4 — AI TRIAGE ASSISTANT
- Header: "AI First Aid Assistant" with small Claude-powered badge
- Subheader: "Describe the situation for immediate guidance"
- Chat interface:
  - User bubble (right, red): "Person unconscious, bleeding 
    from head after accident"
  - AI bubble (left, dark card): Structured response with:
    - "⚠️ Call 108 immediately" as first line (prominent)
    - Numbered first aid steps
    - "Nearest Trauma Centre: City Hospital — 2.3km" 
      as a tappable card at bottom of response
- Bottom input bar: text field + microphone icon + send button
- Above input: Quick prompt chips: 
  "Unconscious person" | "Heavy bleeding" | 
  "Broken bones" | "Not breathing"

SCREEN 5 — OFFLINE MODE
- Same layout as Screen 2 (Home/Map View)
- Top offline banner: amber/yellow strip — 
  "⚡ Offline Mode — Showing cached data from 2 hours ago"
- Map shows cached markers with slight desaturated overlay
- Bottom sheet same as Screen 2 but cards show 
  small "cached" grey pill badge
- All Call buttons still fully functional (tel: links work offline)
- Navigate button shows "Opens when online" if tapped

SCREEN 6 — SOS EMERGENCY BUTTON (panic mode)
- Activated by holding home screen SOS button for 2 seconds
- Full screen red overlay (#D62828 at 95% opacity)
- Center: large white SOS text with countdown ring animation
- Below: "Calling 112 in 3 seconds... Tap to cancel"
- Bottom cards (3 quick-dial):
  Ambulance 108 | Police 100 | Fire 101
- Each as large white pill buttons
- Small text: "Your location is being shared"

INTERACTION DETAILS:
- Bottom sheet on Screen 2 should be draggable (show drag handle)
- Filter chips should have active/inactive states
- Call button should have a pressed/ripple state
- Cards should have subtle hover/tap elevation change
- Offline indicator should be a real toggle-able component
- SOS button on home screen: floating red button bottom-right, 
  pulsing animation, "Hold for SOS" tooltip

COMPONENT LIBRARY TO CREATE:
- Service card component (hospital/police/ambulance/towing variants)
- Filter chip (active/inactive)
- Action button (primary red / secondary blue / outlined)
- Offline banner
- Trauma level badge (Level 1/2/3)
- Distance badge
- Verified badge
- Bottom navigation bar: 
  Map icon (Home) | Search | AI Assistant | Settings

ADDITIONAL NOTES:
- Every screen must have the bottom navigation bar
- Use realistic Indian location names (Chennai, Anna Nagar, etc.)
- Show real-looking data: "Government Stanley Hospital", 
  "Anna Nagar Police Station", distances like "1.2 km", "3.7 km"
- The overall feel: a doctor's precision meets a firefighter's urgency
- No gradients that look decorative — only purposeful ones
- Icons: use Lucide or Heroicons style (outlined, clean)