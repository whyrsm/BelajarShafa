## 10. Design Principles & Device Strategy

### Core Principles
- **Clean & Minimal:** Fokus pada content, hindari clutter.
- **Consistent:** Uniform spacing, typography, color palette.
- **Accessible:** High contrast, clear labels, keyboard navigable.
- **Feedback:** Clear loading states (skeleton screens), success/error toast.

### Device Usage Strategy

The design adapts to the specific needs of each user role based on their primary device usage:

#### 1. Mobile-First: Mentee & Mentor
* **Primary Device:** Mobile (Smartphone/Tablet).
* **Usage Context:** On-the-go access, quick check-ins, reading materials, communication.
* **Design Requirements:**
    - **Touch-Friendly:** Minimum touch target size of 44x44px.
    - **Vertical Layout:** Content stacks naturally; avoid horizontal scrolling for text.
    - **Simplified Navigation:** Bottom navigation bars or hamburger menus for easy thumb access.
    - **Performance:** Optimized for potentially unstable mobile networks.

#### 2. Desktop-Optimized: Manager
* **Primary Device:** Desktop/Laptop.
* **Usage Context:** Heavy administration, LMS management, statistical analysis, reporting.
* **Design Requirements:**
    - **Information Density:** Utilize screen real estate to display comprehensive data tables and dashboards.
    - **Advanced Controls:** Support for complex interactions like drag-and-drop (for course building) and multi-column layouts.
    - **Data Visualization:** Rich charts and graphs for statistics that require precise mouse interaction.
    - **Multitasking:** Persistent sidebars and breadcrumbs for deep navigation.