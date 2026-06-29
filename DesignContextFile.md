# **Zomato Design Context.md**

# **Purpose**

This document defines the **design philosophy, UX principles, visual language, interaction patterns, navigation, and component guidelines** for this prototype.

The goal is **NOT** to redesign the Zomato Partner App.

Instead, the objective is:

**Embed a lending experience so naturally that it feels like an official Zomato feature.**

Every new screen should look like it belongs inside the existing Delivery Partner application.

---

# **Product Design Philosophy**

This project should feel like:

**"One additional feature inside the Zomato Delivery Partner App."**

NOT

* a fintech application  
* a banking application  
* a separate lending application  
* a dashboard application

Finance should be invisible until needed.

The rider should always feel that they are using

**Zomato Partner**

and **not**

**Zomato Finance**.

---

# **Core UX Principles**

## **1\. Earnings First**

The primary purpose of the app is

**Deliver → Earn → Go Home**

Everything financial is secondary.

Never allow lending to dominate the interface.

Priority should always be

1. Current Work  
2. Today's Earnings  
3. Incentives  
4. Performance  
5. Financial Recommendations  
6. Loan Progress

---

## **2\. Contextual Finance**

Never show finance everywhere.

Finance should appear only when relevant.

Examples

Good

"You earned ₹2,100 today."

"You can comfortably repay ₹300."

Bad

"EMI DUE"

Good

"You're eligible for ₹20,000."

Bad

"Take a Loan"

---

## **3\. Low Cognitive Load**

A rider should understand every screen in less than **3 seconds**.

Avoid

* large tables  
* complex graphs  
* financial jargon  
* unnecessary settings

Every page should answer

What should I do next?

---

# **Navigation**

The prototype should **reuse the existing Zomato Partner navigation structure** rather than introducing new global tabs.

Finance is **not** a primary navigation destination.

Instead, use contextual entry points.

Examples

### **No Loan**

Home

↓

Financial Card

↓

View Offer

---

### **Active Loan**

Home

↓

Loan Progress Card

↓

View Details

---

### **Due for Repayment**

Home

↓

Recommended Repayment Card

↓

Pay

The home dashboard becomes dynamic.

---

# **Home Screen Layout**

Structure

Top

Profile

↓

Online / Offline Toggle

↓

Current Zone

↓

Today's Earnings

↓

Current Incentive

↓

Orders Completed

↓

Dynamic Financial Card

↓

Daily Activity

↓

Past Earnings

↓

Support

Finance always appears below operational information.

---

# **Dynamic Financial Card**

This is the hero feature.

Instead of creating multiple menus,

one card changes based on rider state.

Examples

### **Eligible**

You're eligible for

₹20,000

\[View Offer\]

---

### **Approved**

Loan Approved

₹20,000

Repayment starts tomorrow

---

### **Active**

Outstanding

₹6,400

Suggested Payment

₹300

\[Pay\]

---

### **Low Liquidity**

High fuel expenses today.

We'll remind you tomorrow after payout.

---

### **Nearly Complete**

90% Complete

One more repayment unlocks higher credit.

---

The Decision Engine decides which version appears.

---

# **Lending Flow**

Keep the flow extremely short.

Discovery

↓

Offer

↓

Confirm

↓

Success

↓

Home Card Updates

Avoid unnecessary onboarding screens.

---

# **Loan Offer Screen**

Show

Available Credit

Recommended Amount

Interest

Tenure

Daily Repayment Estimate

Flexible Repayment Benefits

Primary CTA

Continue

---

# **Loan Approved Screen**

Simple success screen.

Loan Approved

₹20,000

Expected Disbursement

Repayment Starts

Continue Working

The next destination should always be

Home

---

# **Repayment Experience**

Repayment should feel like

**using today's earnings**

rather than

**paying debt**.

Example

Today's Earnings

₹2,350

Suggested Allocation

Fuel

₹500

Food

₹250

Loan

₹300

Savings

₹200

Remaining

₹1,100

CTA

Pay ₹300

This feels natural for gig workers.

---

# **Progress Screen**

The only dedicated finance screen.

Include

Outstanding Loan

Progress

Remaining

Next Suggested Payment

Upcoming EMI

Payment History

Benefits Unlocked

No more than one chart.

---

# **Notification Philosophy**

Never use fear.

Never say

EMI DUE

PAY NOW

FINAL WARNING

Instead

Today's payout received 🎉

You can comfortably repay ₹250 today.

Or

High fuel spending today.

We'll remind you tomorrow.

Tone

Helpful

Predictive

Positive

Supportive

Never threatening.

---

# **WhatsApp Experience**

Conversation style.

One insight.

One action.

One CTA.

Example

Today's payout is credited.

Recommended repayment

₹300

\[Repay\]

\[Later\]

Avoid long messages.

---

# **Color System**

The UI should closely resemble Zomato's modern design language while remaining an original implementation.

## **Primary**

Zomato Red

HEX

\#E23744

Use for

* Primary buttons  
* CTA  
* Active indicators  
* Progress highlights

---

## **Background**

Primary

\#FFFFFF

Secondary

\#F8F8F8

Cards

\#FFFFFF

---

## **Text**

Primary

\#1C1C1C

Secondary

\#696969

Muted

\#9E9E9E

---

## **Borders**

\#ECECEC

---

## **Success**

\#16A34A

---

## **Warning**

\#F59E0B

---

## **Error**

\#DC2626

---

## **Info**

\#2563EB

---

# **Typography**

Use

Inter

or

SF Pro Display

Font hierarchy

Hero

32

Section

24

Card Title

18

Body

16

Caption

14

Label

12

Use medium and semibold weights.

Avoid bold-heavy interfaces.

---

# **Components**

Every component should be reusable.

Examples

Financial Card

Metric Card

Status Chip

Risk Badge

Progress Bar

CTA Button

Reason Code Chip

Timeline

Recommendation Card

Loan Summary Card

Notification Card

Bottom Sheet

Confirmation Modal

All cards should use

16px radius

Soft shadow

Large spacing

Minimal borders

---

# **Icons**

Prefer

Lucide Icons

Simple

Rounded

Outlined

Avoid filled icons.

---

# **Animations**

Keep subtle.

Examples

Card expand

Fade

Slide

Progress animation

Count-up numbers

Never use flashy fintech animations.

---

# **Charts**

Maximum one chart per screen.

Recommended

Daily Earnings

Weekly Earnings

Repayment Progress

Cash Flow Trend

Avoid dashboards with many charts.

---

# **Spacing System**

4px base grid

Spacing

4

8

12

16

24

32

48

Generous whitespace.

---

# **Mobile First**

The prototype should be designed for

390px × 844px

(iPhone 15 / Pixel equivalent)

The desktop should simply preview the mobile screens.

---

# **Design Inspirations**

Take inspiration from

* Zomato Consumer App  
* Zomato Delivery Partner App  
* Uber Driver  
* DoorDash Dasher  
* Google Pay  
* PhonePe  
* Linear  
* Stripe Dashboard (Admin only)

copy layouts directly of Zomato.

Use them only as inspiration for spacing, hierarchy, simplicity, and interaction patterns.

---

# **Design Goal**

If a recruiter or PM at Zomato sees this prototype, the expected reaction should be:

"This looks like a feature our design team could realistically ship."

The product should feel **native, lightweight, contextual, and operational**, not like a standalone fintech application.

