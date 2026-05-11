# KPI Details - Apple-Inspired UI/UX Redesign
**Angular 19 Material Design 3 | Modern Enterprise Dashboard**

## 🎨 Design Philosophy (Apple-Inspired)
- **Clarity**: Information hierarchy is crystal clear
- **Deference**: UI defers to content, minimal chrome
- **Depth**: Layered cards create visual depth
- **Minimalism**: Remove unnecessary elements
- **Animation**: Smooth, purposeful transitions
-breathing room

## ✨ Key Improvements

### 1. **Card-Based Expandable Layout**
- Replace flat table with expandable Material cards
- Each goal is a top-level card
- Click to expand and see KPI details
- Smooth expand/collapse animations

### 2. **Modern Status Indicators**
- Replace dots with Material chips
- Color-coded with labels (Met, Not Met, Exceeded, N/A)
- Larger, more accessible

### 3. **Floating Action Buttons**
- Edit actions appear on hover
- Smooth fade-in transitions
- Icon-only for cleaner look

### 4. **Improved Typography**
- SF Pro Text font stack (Apple's font)
- Clear hierarchy: Title → Subtitle → Body → Caption
- Proper line heights and letter spacing

### 5. **Better Filters**
- Sticky filter bar at top
- Floating design with shadow
- Quick month/year navigation

### 6. **Status Color System**
```
🔴 Not Met (Red): #ff3b30
🟠 Below Target (Orange): #ff9500
🟢 Met (Green): #34c759
🔵 Exceeded (Blue): #007aff
⚪ N/A (Gray): #8e8e93
```

### 7. **Micro-interactions**
- Hover states on all interactive elements
- Ripple effects on clicks
- Smooth color transitions
- Loading skeletons instead of spinners

### 8. **Mobile Responsive**
- Stack cards vertically on mobile
- Bottom sheet for filters
- Touch-friendly action buttons (48px minimum)

## 📊 Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ 🎯 KPI Performance Dashboard         [Month] [Year] │ <- Sticky Header
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📝 Note: Reporting Guidelines                   │ │ <- Info Banner
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ High-Performance Infrastructure         [︙]  │ │ <- Goal Card
│ ├─────────────────────────────────────────────────┤ │
│ │  🔹 Uptime │ P2 Incidents                       │ │
│ │     Target: >=90% | Actual: 100 | Status: 🟢   │ │
│ │     [✏️ Edit]  [📋 CAPA]                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▶ Reliable & Predictable Service          [︙]  │ │ <- Collapsed Card
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 🎯 Implementation Steps
1. ✅ Create new component templates
2. ✅ Add expansion panel animations
3. ✅ Implement Material chips for status
4. ✅ Add hover states and transitions
5. ✅ Mobile breakpoint handling
6. ✅ Accessibility improvements (ARIA labels, keyboard navigation)
