# **Zomato Delivery Partner Lending / Embedded Finance Prototype**

## **1\) Project Summary**

We are building a **frontend-first prototype** for a **Zomato delivery-partner lending layer**. This is **not** a standalone consumer lending app. It is an **embedded financial system** for Zomato delivery partners that helps the platform and the rider solve a shared problem:

* riders face volatile income, fuel costs, and cash-flow gaps  
* fixed EMI / fixed-debit lending creates avoidable repayment failures  
* Zomato wants a financial product that improves rider stability, retention, and platform reliability

The prototype should look and behave like a real product, but it will use:

* **dummy users**  
* **dummy transaction data**  
* **dummy earnings data**  
* **dummy loan / EMI data**  
* **mock APIs**  
* **frontend calculations only**

The goal is to build a convincing product case study, not a production fintech system.

---

## **2\) Why this case exists**

The original idea was a generic gig-worker repayment orchestration engine. That was too broad and too noisy. The case has now been **rewritten around Zomato delivery partners** because that framing is stronger and more realistic.

### **Why the Zomato framing is better**

* It is clearly tied to a specific platform and business problem.  
* It creates a stronger product story than generic lending.  
* It allows richer data signals from rider behavior.  
* It connects lending to retention, engagement, fulfillment, and platform economics.  
* It feels like something a real company like Zomato could plausibly build as an embedded finance layer.

---

## **3\) Core business problem**

Zomato delivery partners often experience **volatile earnings, variable working hours, cash-out timing issues, and recurring work costs such as fuel**. This makes traditional fixed-date repayment products a poor fit.

### **The underlying issue**

This is not just a credit problem.  
It is a **cash-flow timing and financial stability problem**.

### **Platform-level consequence**

If riders are under financial stress:

* they may reduce active hours  
* they may become less reliable  
* retention may fall  
* fulfillment quality may drop  
* supply may weaken in peak periods

### **Product opportunity**

Zomato can build an embedded financial layer that:

* understands rider earnings and spending behavior  
* predicts repayment readiness  
* offers flexible repayment timing or amounts  
* reduces avoidable repayment failures  
* improves rider trust and platform stickiness

---

## **4\) Product thesis**

The main thesis is:

**Zomato can improve rider financial stability and platform reliability by embedding a cash-flow-aware lending and repayment system into the partner ecosystem.**

The lending layer is not the product by itself. It is one module inside a broader **Zomato Partner Financial OS**.

---

## **5\) What we are building**

We are building a platform concept with these layers:

### **A. Rider Financial Intelligence Layer**

This layer analyzes:

* Daily earnings  
* active hours  
* trip frequency  
* work consistency  
* spend patterns  
* fuel burden  
* liquidity  
* repayment readiness

### **B. Lending Layer**

This layer offers:

* credit eligibility  
* recommended limit  
* repayment planning  
* adaptive EMI suggestions  
* repayment reminders  
* fallback paths if repayment is not feasible

### **C. Experience Layer**

This is split into multiple portals:

* **Zomato Partner App**: rider-facing finance and repayment experience  
* **Lending / Risk Dashboard**: lender or platform operator view

---

## **6\) Main user groups**

### **Primary user**

**Zomato delivery partner**

* works on a platform-based income model  
* earnings are not fixed monthly salary  
* income depends on demand, hours, incentives, zones, and performance  
* needs flexible and low-friction financial support

### **Secondary user**

**Zomato / platform operator**

* wants better rider retention  
* wants lower rider attrition and better supply reliability  
* wants a platform-native financial product  
* wants visibility into rider financial stress and repayment behavior

### **Tertiary user**

**Risk / lending operations team**

* wants to understand rider repayment likelihood  
* wants reason codes and transparency  
* wants to manage credit risk and portfolio health

---

## **7\) Key research conclusions that should shape the build**

### **Rider / behavioral insights**

* Rider income is volatile and not salary-like.  
* Work hours, incentives, order volume, and platform activity affect cash flow.  
* Fuel and work costs reduce net disposable cash.  
* Balance and payout timing matter more than static monthly income.  
* Repayment failure often comes from timing mismatch rather than lack of willingness.

### **Financial / collections insights**

* Failed debits are costly.  
* Repeated failed collection attempts worsen trust and can create penalty spirals.  
* Early intervention is cheaper than late-stage collections.  
* Collections should be decision-driven, not blind or calendar-only.

### **Regulatory / feasibility insights**

* India’s AA and UPI Autopay rails support consent-based, user-visible, flexible financial products.  
* The prototype should respect consent, transparency, and user control.  
* The product should **not** simulate stealth sweeps or hidden withdrawals.

### **Benchmark insights**

* The transferable idea from advanced fintech benchmarks is **cash-flow-aware repayment orchestration**.  
* The transferable behavior is:  
  * collect when feasible  
  * defer when not  
  * use thresholds and fallback logic  
  * avoid unnecessary failed debits

---

## **8\) Product positioning**

This should be framed as:

**FlowOS for Zomato delivery partners**

Or, more explicitly:

**An embedded financial infrastructure layer for Zomato delivery partners that combines financial health, lending, repayment planning, and adaptive collections.**

The name can be refined later, but the concept is important: this is an **operating layer**, not a single feature.

---

## **9\) Core product modules**

The product should be split into reusable modules.

### **1\. Financial Health Engine**

Purpose:

* measure rider financial stability  
* convert raw transaction and work data into meaningful scores

Outputs:

* cash flow score  
* work reliability score  
* liquidity score  
* repayment readiness score

### **2\. Lending / Eligibility Engine**

Purpose:

* determine if the rider is eligible for a credit product  
* estimate limit or recommended borrowing amount

Outputs:

* eligible / not eligible  
* recommended limit  
* risk tier  
* reason codes

### **3\. Repayment Decision Engine**

Purpose:

* decide whether repayment should happen now  
* decide the amount and timing  
* reduce avoidable repayment failure

Outputs:

* should repay now?  
* repayment probability now  
* probability at next payout  
* best repayment window  
* recommended amount  
* recommended action  
* confidence score

### **4\. Collections Orchestration Layer**

Purpose:

* choose the best channel and touchpoint  
* communicate the recommendation  
* execute reminders / repayment prompts / fallback paths

Outputs:

* notification  
* WhatsApp message  
* in-app repayment card  
* payment prompt  
* defer / retry / manual follow-up

---

## **10\) The three scoring layers**

The engine should be built around three analytical layers.

### **A. High-level Cash Flow Layer**

This is the base layer.

#### **Inputs**

* transactions  
* balance  
* earnings  
* spending

#### **Derived metrics**

* 7 / 14 / 30-day inflow trend  
* spend velocity  
* balance decay rate after payout  
* income concentration by source  
* payout regularity  
* buffer days until next inflow

#### **Meaning**

This tells us whether the rider actually has usable cash movement.

---

### **B. Behavior / Work Reliability Layer**

The word “attitude” should **not** be used. It is vague and subjective.  
Use observable work-behavior signals instead.

#### **Better signals**

* work intensity  
* work consistency  
* platform dependency  
* execution discipline  
* volatility tolerance

#### **Meaning**

This tells us how stable and reliable the rider’s earning behavior is.

---

### **C. Liquidity Layer**

This is the most important short-term repayment layer.

#### **Inputs / signals**

* daily earnings  
* average peak balance  
* balance spread / variance  
* days from payout to zero balance  
* fuel / work-related cost load  
* fixed obligation load  
* next inflow date confidence  
* cash buffer over EMI amount

#### **Meaning**

This answers the core question:

Can the rider repay now without causing another failure?

---

## **11\) What the engine should output**

The model should not output only a single score. It should output a **repayment decision object**.

### **Desired outputs**

* Should Repay Now? (Y/N)  
* Repayment probability now  
* Repayment probability at next payout  
* Repayment probability on scheduled due date  
* EMI failure risk  
* Best repayment amount  
* Best time window for repayment  
* Benefit of repaying now vs waiting  
* Recommended action  
* Confidence score  
* Reason codes  
* Fallback path

### **Why this matters**

A single probability is not enough.  
The orchestration layer needs an action, not just a prediction.

---

## **12\) Recommended action types**

The system should support multiple actions, not only “collect now”.

Possible actions:

* collect full amount now  
* collect partial amount now  
* delay repayment until next payout  
* retry later  
* send reminder only  
* show repayment planner  
* manual follow-up  
* suppress debit attempt  
* offer alternate repayment path

This makes the product feel adaptive instead of rigid.

---

## **13\) Touchpoint strategy**

The product should be organized around user moments, not channels.

### **Key moments**

* before payout  
* immediately after payout  
* during working hours  
* near EMI due date  
* after successful repayment  
* after failed repayment

### **Channels**

* Zomato Partner App  
* WhatsApp  
* lending dashboard  
* SMS fallback

The channel is secondary. The **decision and timing** are primary.

---

## **14\) UX direction**

The prototype should feel like a real product, but should remain frontend-first.

### **UX principles**

* clean and highly visual  
* strong use of cards, timelines, chips, and progress bars  
* clear explanation of why a recommendation was made  
* simple borrower-friendly wording  
* no jargon in the end-user UI  
* show progress, benefit, and next step clearly  
* repayment should feel like a plan, not punishment

### **Important UI patterns**

* repayment progress bar  
* earnings allocation widget  
* risk / readiness badge  
* next best action card  
* explainability drawer or panel  
* reason codes with icons  
* timeline of payout / EMI / reminders

---

## **15\) Dummy-data principle**

The build should use dummy data, but calculations must be real.

### **Data can be fake**

* users  
* transactions  
* earnings  
* loan balance  
* repayment history  
* scores  
* alerts  
* payment states

### **Logic must work**

* formulas  
* thresholds  
* condition checks  
* score aggregation  
* recommendation logic  
* routing logic  
* status transitions

This means the prototype should behave like a real system even if the data is synthetic.

---

## **16\) Architecture principle**

This should be built as a **modular frontend system** with shared logic.

### **Expected structure**

* shared design system  
* dummy data files  
* calculation engine  
* decision engine  
* Zomato Partner App  
* WhatsApp simulator  
* lending dashboard  
* admin dashboard

### **Important build principle**

Do not build isolated screens first.  
Build the engine and shared data model first, then reuse the outputs across portals.

---

## **17\) Non-goals**

Do **not** build:

* a real backend  
* real authentication  
* real AA integration  
* real payments  
* real UPI Autopay connection  
* actual lending operations  
* stealth collection logic  
* hidden balance sweeps  
* silent wallet drains

This is a **prototype and case study**, not a production fintech system.

---

## **18\) What should be simulated**

The prototype should simulate:

* rider earnings patterns  
* work consistency  
* financial stress  
* repayment readiness  
* repayment recommendations  
* repayment progress  
* notification events  
* collection fallbacks  
* lender reasoning

The system should feel operational, not static.

---

## **19\) Final product story**

The story should be:

Zomato can improve rider stability and platform reliability by embedding a financial intelligence and lending layer into the partner ecosystem. This layer can assess rider cash flow, predict repayment readiness, recommend the right repayment action, and create a more resilient financial experience for delivery partners.

The outcome is not just lower repayment failure.  
The broader outcome is:

* better rider trust  
* better retention  
* more stable supply  
* better fulfillment  
* a more defensible embedded-finance product

---

## **20\) How Claude should think about this file**

Claude should treat this file as the **product truth** for the build.

When implementing, Claude should:

* understand the Zomato context first  
* challenge weak assumptions  
* keep the system modular  
* use frontend-first logic  
* preserve dummy-data realism  
* make every score explainable  
* make every UI state connected to the engine  
* prefer simple, testable logic over overengineering

The prototype must feel like a coherent product system, not a random set of pages.

