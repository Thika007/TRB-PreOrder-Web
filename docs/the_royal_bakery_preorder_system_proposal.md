# Project Proposal & Scope Agreement
## High-Performance Pre-Order Billing & Management System
**Client:** The Royal Bakery (TRB)  
**Current System:** `trbsys.net` (Legacy Web System by EzyCode)  
**Database Engine:** Microsoft SQL Server (MSSQL) — Integrated with DanuPOS  
**Delivery Model:** Agile Methodology (Minimum 3 Monthly Phases / 12 Weeks)  
**Commercial Model:** Zero Baseline Development Fee | LKR 100,000 Initial Non-Refundable Mobilization Advance  
**Monthly Retainer:** Consolidated LKR 30,000 / month (LKR 15,000 for 2 Existing POS + LKR 15,000 for Pre-Order)  
**Price Guarantee:** 2-Year Inflation Lock (Subject to inflation-indexed revision post-Year 2)  
**Maintenance:** 1-Year Operational Maintenance from Live Launch Date  
**Document Version:** 2.2 (Managed Retainer & Commercial Service Agreement)

---

## 1. Executive Summary

The Royal Bakery (TRB) currently uses a cloud website (`trbsys.net`) for pre-order billing. However, the system suffers from heavy delays: counter screens freeze, cashiers wait seconds for items to load, and if the showroom internet disconnects, billing stops completely.

This project delivers a **Local-First Pre-Order Billing System** built on **Microsoft SQL Server (MSSQL)**. It runs directly on TRB's counter computers, guaranteeing **zero-lag (sub-50ms) billing**, **100% offline reliability**, and direct compatibility with TRB's retail POS (**DanuPOS**).

To eliminate upfront capital friction for TRB, the engagement removes traditional large baseline development fees (**LKR 0 Baseline Development Fee**). Instead, it operates under an attractive operational managed model: an initial non-refundable mobilization advance of **LKR 100,000**, followed by a consolidated monthly retainer of **LKR 30,000 / month** covering all counter software (LKR 15,000 for existing Bakery POS + Restaurant POS, and LKR 15,000 for the new Pre-Order System), with a 2-year inflation lock and 1-year operational maintenance from Go-Live date.

### Core Commitments:
1. **Familiarity**: 100% exact menu names and page titles matching `trbsys.net` (21 production screens).
2. **Agile Delivery**: Minimum **3 months (12 calendar weeks)** structured into 3 Agile sprints.
3. **Commercial Model**: Zero baseline fee | LKR 100,000 non-refundable advance | Consolidated LKR 30,000/mo retainer.
4. **Price Guarantee**: 2-year price lock; inflation-indexed adjustment after 2 years.
5. **Database Standard**: Microsoft SQL Server shared natively with DanuPOS.
6. **Strict Scope Protection & 1-Year Maintenance**: 1-year operational maintenance covers bug fixes and tuning for the rebuilt `trbsys.net` screens only; all new features are billed separately via Change Requests (CR).

---

## 2. Strict Scope Boundary & Change Request (CR) Policy

> [!IMPORTANT]
> ### STRICT SCOPE BOUNDARY & ANTI-SCOPE CREEP POLICY
> To protect project delivery timelines and maintain high quality, the scope of this project is **strictly limited to rebuilding the exact functional pages and features from the current trbsys.net portal**, as documented across the 21 production system screenshots and counter booking workflows below.
> 
> - **In-Scope**: The exact operational screens and reports verified across the 21 screenshots in TRB's system PDF and counter intake screens detailed in Section 3.
> - **Out-of-Scope**: Any new capability not in the current system (such as customer online ordering apps, online payment gateways, bulk marketing automations, general accounting ledgers, or attendance clocks).
> - **Change Request (CR) Policy**: If TRB requests any new feature, extra screen, or workflow modification outside this agreement, it will be treated as a formal **Change Request (CR)**. Each CR will be quoted separately with an additional budget and timeline, and scheduled after the main system launch.

---

### Complete Audit of the 21 Production System Screenshots (from Client PDF)

Every single one of the 21 screenshots extracted from the client's PDF has been individually cataloged and verified:

| # | PDF Page | Menu & Submenu | Production URL | Exact Page / Screen Title | Key Elements & Fields Captured |
|:---:|:---|:---|:---|:---|:---|
| **01** | Page 1 (Top) | Dashboard | `/dashboard` | Dashboard ("This Month admin" & "Last Month") | Top navbar, KPI cards: TOTAL ORDERS, TOTAL PENDING ORDERS, TOTAL NEW CUSTOMERS |
| **02** | Page 1 (Bottom) | Main Access > System Users | `/create-users` | Create User | Main Access dropdown; User Name*, Password*, Confirm Password*, User Type* (Select Level), Submit, Cancel |
| **03** | Page 2 (Top) | Main Access > System Users | `/manage-users` | Manage Users | System Users submenu; Table: User Name, User Role, Action (Edit pen, Delete cross) |
| **04** | Page 2 (Bottom) | Main Access > Manage Product | `/add-product` | Create Product | FEED PRODUCT DATA form (Main Cat, Sub Cat, Name*, Price*, Net Weight*, Description*, Discount*); 850+ Product Table |
| **05** | Page 3 (Top) | Main Access > Product Categories | `/manage-categories` | Manage Main Categories | CAT ID#, Main Category, Main Category Description (Chef in charge, e.g. Cheff Premaratna); 8 Main Categories Table |
| **06** | Page 3 (Bottom) | Main Access > Product Categories | `/manage-sub-categories` | Manage Sub Categories | SUB CAT ID#, Main Category, Sub Category, Sub Category Description; Sub Categories Table (Buns, Drawing Cakes, etc.) |
| **07** | Page 4 (Top) | Main Access | `/customer_list` | Customer List | Customer Directory Table: Customer Name, Mobile, LandLine, Address, Email, Search bar |
| **08** | Page 4 (Bottom) | Orders | `/manage_orders` | Manage Orders (with menu dropdown) | Dropdown: Manage Orders, Cancelled, Authorize; Total Amount badge: 217550; Table with Pending, Delivered, Paid, Due |
| **09** | Page 5 (Top) | Orders | `/cancel_orders` | Cancelled Orders | Orders submenu open; Audit Table: Invoice Id, Reason (CXL), Cancelled By (Admin), Date |
| **10** | Page 5 (Bottom) | Orders | `/bill_authorized` | Authorize Bills (with menu dropdown) | Orders submenu open; Table: Invoice ID, Name, Delivery Date, Total, Status, Balance, Print-A5, Bill Authorize button |
| **11** | Page 6 (Top) | Orders | `/bill_authorized` | Authorize Bills (Full Screen) | Full screen view of Authorize Bills queue without dropdown overlay; Pagination controls |
| **12** | Page 6 (Bottom) | Orders | `/manage_orders` | Manage Orders (Full Screen) | Full screen view of Manage Orders table without dropdown overlay; Total Amount badge, Print 80mm & A5, Edit/Cancel |
| **13** | Page 7 (Top) | Chef Reports | `/reports_cheff` | Order Reports | Main-Product-Type*, Sub-Product-Type, Product, Date Range picker, Status, Print Reoprt, Export; Table: Delivery Date, Invoice ID, Product, Description (with cake greeting), Qty |
| **14** | Page 7 (Bottom) | Reports > By Invoice | `/reports_all` | All Report | By Invoice submenu open; Print Reoprt, Export, Bill Authorized button; Order list with Make Payment, Status, Due |
| **15** | Page 8 (Top) | Reports > By Invoice | `/overall-invoices` | Overall Invoices | By Invoice submenu open; Date picker: mm/dd/yyyy to mm/dd/yyyy |
| **16** | Page 8 (Bottom) | Reports > By Product | `/reports_products_only` | All Product Sales | By Product submenu open; Item Category, Sub Category, Item, Time range; Table: Main Cat, Sub Cat, Name, Price, Quantity, Total Sales |
| **17** | Page 9 (Top) | Reports > By Product | `/reports-overall` | Reports Overall (Customer select) | Customer dropdown selector |
| **18** | Page 9 (Bottom) | Reports > By Product | `/reports-overall` | Reports Overall (Full filters) | Full filters: Customer, Item Category, Sub Category, Item, Time range, Payment Method, Search; Print Reoprt, Export |
| **19** | Page 10 (Full) | Reports > By Payment | `/all-payment` | Payment Reports | By Payment submenu open; Date range, All Payment Type, Search, Print Reoprt, Export; Table: Invoice ID, Cus Name, Payment Method, Paid Amount |
| **20** | Page 11 (Top) | SMS Promotions | `/Promotions` | Promotion SMS | PROMOTION SMS form: Text area "Type your message here", Submit, Cancel |
| **21** | Page 11 (Bottom) | Delivery | `/delivery` | Today's Delivery Reports | Date of Delivery picker, Search, Print Reoprt; Table: Date of Delivery, Invoice ID, Name and Qty, Cus Name, Address, Phone |

---

## 3. Exact Page-by-Page Feature Mapping (Using TRB's Exact System Page Names)

Below is the complete, page-by-page mapping using the **exact menu labels and page titles from `trbsys.net`** (cross-referenced with each of the 21 screenshots):

```
THE ROYAL BAKERY SYSTEM — EXACT MENU NAVIGATION & SCREENS
├── 1. Dashboard (/dashboard)
├── 2. Main Access
│    ├── 2.1 System Users > Create User (/create-users)
│    ├── 2.2 System Users > Manage Users (/manage-users)
│    ├── 2.3 Manage Product / Create Product (/add-product)
│    ├── 2.4 Product Categories > Main Categories (/manage-categories)
│    ├── 2.5 Product Categories > Sub Categories (/manage-sub-categories)
│    └── 2.6 Customer List (/customer_list)
├── 3. Orders
│    ├── 3.1 Create Orders (/add-order)
│    ├── 3.2 Manage Orders (/manage_orders) & [Make Payment] Modal
│    ├── 3.3 Cancelled Orders (/cancel_orders)
│    └── 3.4 Authorize / Authorize Bills (/bill_authorized)
├── 4. Chef Reports (/reports_cheff) — "Order Reports"
├── 5. Delivery (/delivery) — "Today's Delivery Reports"
├── 6. Reports
│    ├── 6.1 By Invoice > All Report (/reports_all)
│    ├── 6.2 By Invoice > Overall Invoices (/overall-invoices)
│    ├── 6.3 By Product > All Product Sales (/reports_products_only)
│    ├── 6.4 By Product > Overall (/reports-overall)
│    └── 6.5 By Payment > Payment Reports (/all-payment)
├── 7. SMS Promotions (/Promotions) — "Promotion SMS"
└── Hardware Printing Engine (80mm POS Receipt & Formal A5 Cake Invoice)
```

---

### Menu 1: Dashboard (`/dashboard`)
*Page Heading: "This Month admin" & "Last Month"*
- **KPI Summary Cards**:
  - `TOTAL ORDERS` (Current month & Last month counters)
  - `TOTAL PENDING ORDERS` (Live counter of orders awaiting authorization or payment)
  - `TOTAL NEW CUSTOMERS` (Monthly customer acquisition counter)
- **Top Bar**: Notification alerts for new orders and status updates.
- **Navigation Bar**: Quick links to all functional menus.

---

### Menu 2: Main Access

#### 2.1 System Users > Create User (`/create-users`)
*Page Heading: "Create User"*
- **Form Fields**: `User Name*`, `Password*`, `Confirm Password*`, `User Type*` (Select Level: `Admin`, `Accountant`, `Cashier`, `Kitchen`).
- **Actions**: `Submit`, `Cancel`.

#### 2.2 System Users > Manage Users (`/manage-users`)
*Page Heading: "Manage Users"*
- **User Table Columns**: `User Name`, `User Role`, `Action` (Edit, Delete).

#### 2.3 Manage Product / Create Product (`/add-product`)
*Page Heading: "Create Product"*
- **Product Entry Form**:
  - `Product Main Category` (Select from Main Categories: Bread, Cake, Pastry, etc.)
  - `Product Sub Category` (Select from Sub Categories: Buns, Cake Pieces, etc.)
  - `Product Name*`
  - `Product Price*`
  - `Net Weight*` (e.g. 450g, 1kg)
  - `Description*`
  - `Discount*` (Select `Discount` or `Non Discount`)
  - Buttons: `Save Product`, `Cancel`
- **Product Table Columns**:
  - `Product ID`, `Product Name`, `Main Category`, `Sub Category`, `Net Weight`, `Price`, `Discount Status`, `Actions` (Edit, Delete).
  - Status filter dropdown (`Show all`, `Available`, `Out of Stock`) and instant search bar.

#### 2.4 Product Categories > Main Categories (`/manage-categories`)
*Page Heading: "Manage Main Categories"*
- **Form Fields**: `CAT ID#` (e.g. MCAT1), `Main Category` (e.g. Bread, Cake, Pastry), `Main Category Description` (Chef in charge, e.g. Cheff Premaratna, Cheff Wickramapala).
- **Actions**: `Submit`, `Cancel`.
- **Table Columns**: `ID`, `Main Category`, `Main Category Description`, `Actions` (Edit, Delete).

#### 2.5 Product Categories > Sub Categories (`/manage-sub-categories`)
*Page Heading: "Manage Sub Categories"*
- **Form Fields**: `SUB CAT ID#` (e.g. SCAT1), `Main Category` dropdown, `Sub Category` (e.g. Buns, Cake Pieces, Drawing Cakes), `Sub Category Description`.
- **Actions**: `Submit`, `Cancel`.
- **Table Columns**: `ID`, `Main Category`, `Sub Category`, `Sub Category Description`, `Actions` (Edit, Delete).

#### 2.6 Customer List (`/customer_list`)
*Page Heading: "Customer List"*
- **Table Columns**: `Customer Name`, `Mobile`, `LandLine`, `Address`, `Email`.
- Fast pagination and search bar (resolves the 60-second timeout of the old web system).

---

### Menu 3: Orders

#### 3.1 Create Orders (`/add-order`)
*This is the main showroom counter screen used to enter pre-orders for cakes and bakery bakes.*
- **Customer Lookup & Profile**:
  - Search by mobile number or customer name with instant auto-fill.
  - Auto-fills: Title (Mr, Mrs, Miss, M/S, Dr, Rev), First Name, Mobile, Telephone, and Delivery Address.
  - One-click registration for new walk-in customers.
- **Product Selection**:
  - `Main-Product-Type*` (Bread, Cake, Cake-2, Kitchen, Pastry, Restaurant, Shoteats, Showroom).
  - `Sub-Product-Type` (filtered by main category).
  - `Product` (850+ items).
  - Unit Price and Net Weight populate automatically.
  - Quantity (`odr_qty`) and Item Notes (`odr_gre_des`).
- **Cake Customization (Exact trbsys.net fields)**:
  - `Greetings*` (Milestone indicator: `None`, `1st`, `2nd`, `3rd`, up to `29th`).
  - `Greetings*` (Occasion: `None`, `Happy Birthday`, `Happy Anniversary`, `Happy Holy Communion`, `Congratulations`, `Happy Valentine's Day`).
  - `Greetings info2` (Recipient Name / Custom icing text on cake).
- **Delivery & Billing**:
  - `Date of Delivery` (`d_delivery`), `Time` (`time`), `Delivery Address` (`d_address`), `Ordered By`.
  - Line-item table: `Product Name`, `Description`, `Qty`, `Unit Price`, `Total`, `Actions`.
  - Discount % (`odr_dis`), Service Charge % (`odr_sr_chrge`), Delivery Charge (`odr_del_chrge`).
  - Gross Total (`tot`), Advance Paid (`odr_adv`), Balance Due.
  - Payment Type: `Cash`, `Credit`, `Cheque`, `Staff`.
- **Actions**: `Add Product`, `Submit`, `Reset`. Automatically prints 80mm receipt and A5 invoice.

#### 3.2 Manage Orders (`/manage_orders`)
*Page Heading: "Manage Orders"*
- **Total Amount Badge**: Displays cumulative total (e.g. LKR 217,550).
- **Status Filter Tabs**: `Show all`, `Pending`, `Paid`, `Un Paid`, `Delivered`.
- **Table Columns**:
  - `Invoice ID` (e.g. RB-0178099)
  - `Make Payment` (triggers balance settlement modal)
  - `Name` (Product items & quantities)
  - `Date of Delivery`
  - `Total`
  - `Status` (Pending, Paid, Delivered)
  - `Balance` (e.g. 24,500.00 Due)
  - `Print` (`Print 80mm`, `Print-A5`)
  - `Action` (`Edit Order`, `Cancel Order`)

#### 3.3 Make Payment Modal (Inside `/manage_orders`)
- Opens when clicking `Make Payment` on an order.
- Displays: `Invoice ID`, `Customer Name`, `Balance Due`.
- Cashier selects `Cash` or `Card` and enters the payment amount.
- Updates order to `Paid / Delivered` immediately and prints settlement slip.

#### 3.4 Cancelled Orders (`/cancel_orders`)
*Page Heading: "Cancelled Orders"*
- **Table Columns**: `Invoice Id`, `Reason` (e.g. CXL), `Cancelled By` (Username), `Date`.

#### 3.5 Authorize Bills (`/bill_authorized`)
*Page Heading: "Authorize Bills"*
- Special queue for high-value orders, custom cakes, and credit bookings.
- **Table Columns**: `Invoice ID`, `Name`, `Date of Delivery`, `Total`, `Status`, `Balance`, `Print` (`Print-A5`), `Action` (`Bill Authorize` button).

---

### Menu 4: Chef Reports (`/reports_cheff`)
*Page Heading: "Order Reports"*
- Used by baking chefs in the kitchen to schedule production.
- **Filters**: `Main-Product-Type*`, `Sub-Product-Type`, `Product`, `Search`, Date Range (`Select two dates`), `Status` filter.
- **Table Columns**: `Delivery Date`, `Invoice ID`, `Product Name`, `Description` (contains custom cake greeting & icing text), `Qty`.
- **Actions**: `Print Reoprt`, `Export`.

---

### Menu 5: Delivery (`/delivery`)
*Page Heading: "Today's Delivery Reports"*
- Used by delivery dispatchers and drivers.
- **Filters**: `Date of Delivery`, `Status` filter, Search bar.
- **Table Columns**: `Date of Delivery`, `Invoice ID`, `Name and Qty`, `Cus Name`, `Cus Delivery Address`, `Phone`.
- **Actions**: `Print Reoprt`.

---

### Menu 6: Reports

#### 6.1 By Invoice > All Report (`/reports_all`)
- **Filters**: `From Date`, `To Date`, `Select User`, `Status` filter, Search bar.
- **Table Columns**: `Invoice ID`, `Make Payment`, `Name`, `Date of Delivery`, `Total`, `Status`, `Balance`, `Print`, `Action`.
- **Actions**: `Print Reoprt`, `Export`, `Bill Authorized`.

#### 6.2 By Invoice > Overall Invoices (`/overall-invoices`)
- **Filters**: Date Range (`mm/dd/yyyy` to `mm/dd/yyyy`), Cashier User, Payment Method, Status.
- **Table Columns**: `Invoice ID`, `Cus Name`, `Delivery Date`, `Payment Method`, `subTotal`, `Paid Amount`, `Due`, `Order Status`.
- **Actions**: `Print Reoprt`, `Export`.

#### 6.3 By Product > All Product Sales (`/reports_products_only`)
- **Filters**: `Item Category`, `Item Sub Category`, `Item`, `Time Range`, `Search`.
- **Table Columns**: `Main Cat`, `Sub Cat`, `Name`, `Price`, `Quantity`, `Total Sales`.

#### 6.4 By Product > Overall (`/reports-overall`)
- **Filters**: `Customer`, `Item Category`, `Item Sub Category`, `Item`, `Time Range`, `Payment Method`, `Search`.
- Summary export of product-level sales by customer account.

#### 6.5 By Payment > Payment Reports (`/all-payment`)
*Page Heading: "Payment Reports"*
- **Filters**: Date Range (`mm/dd/yyyy` to `mm/dd/yyyy`), `All Payment Type` (`Cash`, `Card`, `Cheque`, `Staff`).
- **Table Columns**: `Invoice ID`, `Cus Name`, `Payment Method`, `Paid Amount`.
- **Actions**: `Print Reoprt`, `Export`.

---

### Menu 7: SMS Promotions (`/Promotions`)
*Page Heading: "Promotion SMS"*
- **Form**: Text area `Type your message here` + `Submit`, `Cancel`.
- Prepares promotional text templates for customer campaigns.

---

### Dual Printing Engine (Integrated)
- **80mm Thermal Receipt**: Direct ESC/POS printing for customer advance receipt and pickup slip with barcode.
- **Formal A5 Invoice**: Complete cake invoice with greeting inscriptions, delivery terms, and customer copy.

---

## 4. Agile 3-Phase Delivery Framework (Minimum 3 Months / 12 Weeks)

```
AGILE DELIVERY SCHEDULE (MINIMUM 3 MONTHS / 12 WEEKS)
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 (Month 1): Foundation, Master Data & Migration                 │
│ ├── Setup Master PC with Microsoft SQL Server (MSSQL Instance)         │
│ ├── Ingest all 850+ Products, Categories & Customer Database           │
│ ├── Menu 1: User Login Screen (/index)                                 │
│ ├── Menu 2.1 & 2.2: Create User & Manage Users (/create-users, etc.)   │
│ ├── Menu 2.3: Create Product & Product Table (/add-product)            │
│ ├── Menu 2.4 & 2.5: Main Categories & Sub Categories                   │
│ └── Milestone 1 Demo: Live MSSQL Database & Instant Product Search     │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 2 (Month 2): Pre-Order Billing, Cake Customization & Printing    │
│ ├── Menu 3.1: Create Orders Screen with Cake Greetings (/add-order)    │
│ ├── Menu 2.6: Customer List & Instant Mobile Lookup (/customer_list)   │
│ ├── Menu 3.2: Manage Orders Grid (/manage_orders)                      │
│ ├── Menu 3.3: Make Payment Balance Settlement Modal                    │
│ ├── Dual Hardware Printing Engine (80mm Thermal Slip & A5 Invoice)     │
│ └── Milestone 2 Demo: Live Pre-Order Billing & Real Thermal Receipts   │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 3 (Month 3): Kitchen, Delivery, Reports, DanuPOS & Launch        │
│ ├── Menu 3.5: Authorize Bills Screen (/bill_authorized)                │
│ ├── Menu 4: Chef Reports Kitchen Worksheet (/reports_cheff)            │
│ ├── Menu 5: Delivery Dispatch Run Sheet (/delivery)                    │
│ ├── Menu 3.4: Cancelled Orders Audit Log (/cancel_orders)              │
│ ├── Menu 6: Reports (All Report, Overall Invoices, All Payment)        │
│ ├── Menu 7: Promotion SMS Screen (/Promotions)                         │
│ ├── Menu 1: Operational Dashboard Cards (/dashboard)                   │
│ ├── DanuPOS Shared MSSQL Integration Testing & Stock Reservation       │
│ ├── Staff Training (Cashiers, Chefs, Supervisors) & On-Site Deployment │
│ └── Milestone 3 Demo: Final UAT Sign-off & Live Production Cutover     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Architecture: Microsoft SQL Server & DanuPOS Integration

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MAIN COUNTER PC (MASTER STATION)                     │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              MICROSOFT SQL SERVER (MSSQL INSTANCE)             │   │
│   │   ├── DanuPOS_DB (Retail POS, Inventory, Stock, Barcodes)      │   │
│   │   └── TRB_PreOrder_DB (Custom Cakes, Advance, Kitchen, Dispatch│   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│             ┌─────────────────────┴──────────────────────┐             │
│             ▼                                            ▼             │
│    ┌───────────────────┐                        ┌──────────────────┐   │
│    │  DanuPOS Desktop  │                        │ Pre-Order Node/C#│   │
│    │  (ADO.NET Direct) │                        │ Local Web API    │   │
│    └───────────────────┘                        └────────┬─────────┘   │
└──────────────────────────────────────────────────────────┼─────────────┘
                                                           │ (LAN Wi-Fi)
                                   ┌───────────────────────┴─────────────┐
                                   ▼                                     ▼
                        Counter 2 / Tablets (Browser)     Kitchen Chef Display
```

### Strategic Benefits for TRB:
1. **Zero Internet Lag**: Runs 100% on the local counter PC. All queries respond in under 15ms.
2. **100% Offline Resilience**: Showroom billing never halts during internet outages.
3. **Shared Master Data**: DanuPOS retail items and customer profiles share the exact same SQL Server instance without duplicate entry.
4. **Single Daily Backup**: One automated `.bak` file protects both retail POS and pre-orders together.
5. **No Software License Costs**: Free Microsoft SQL Server Express (10GB capacity = 10+ years of bakery records).

---

## 6. Commercial Agreement: Mobilization Advance, Retainer & Inflation Terms

### Commercial Structure & Fees:
- **Baseline Development Investment Fee**: **LKR 0 (Fully Waived)** under strategic operational managed partnership model.
- **Initial Non-Refundable Mobilization Advance**: **LKR 100,000** payable upon contract signing (covers PC setup, SQL Server configuration, migration of 850+ items and customer history, printer drivers, and Sprint 1 kickoff).
- **Consolidated Monthly Service Retainer**: **LKR 30,000 / month** single invoice covering all 3 counter software systems:
  - **TRB Existing POS Systems** (Bakery Counter POS + Restaurant POS): **LKR 15,000 / month**.
  - **New Pre-Order, Cake Customization & Kitchen Production System**: **LKR 15,000 / month**.
- **Minimum Development Timeline**: **Minimum of 3 Months (12 Calendar Weeks)** for full development, data migration, dual printer driver setup, and kitchen workflow deployment.

### Inflation Adjustment & 2-Year Price Protection Clause:
- **Guaranteed 24-Month Price Freeze**: The consolidated monthly fee of **LKR 30,000** is strictly locked for two (2) full years (24 calendar months) from contract signing.
- **Inflation Indexing (Post-Year 2)**: After the completion of the 2-year period, the monthly retainer fee is subject to annual revision and adjustment indexed to the official prevailing national inflation rate published by the Central Bank of Sri Lanka (CBSL / Colombo Consumer Price Index - CCPI).

---

## 7. 1-Year Operational Maintenance & Strict Scope Boundaries

### 7.1 1-Year Operational Maintenance Period:
- System maintenance is provided for a period of **exactly one (1) year (12 calendar months)** starting directly from the official **Go-Live / Production Cutover date**.
- Covers defect rectification, query optimization, database backup verification, and hardware printer spooler stability across the 21 rebuilt screens.

### 7.2 Critical Scope Boundary: Free Maintenance vs. New Features:
- **Included**: Maintenance, bug fixes, database tuning, and counter printer support for the exact rebuilt features matching `trbsys.net` (21 production screens).
- **Strictly Excluded**: Adding new features, extra screens, new modules, or novel business logic that did not exist in the original `trbsys.net` platform.
- **Paid Change Request (CR) Process**: Any request for new features (e.g., customer mobile apps, online payment gateways, automated SMS marketing campaigns, loyalty points engines, or external accounting modules) will be formally quoted as an independent Change Request (CR) and charged separately.

---

## 8. Next Steps & Mobilization

1. **Review & Sign Scope & Commercial Agreement**: Sign the proposal confirming the 21-screen scope, LKR 100,000 non-refundable advance, LKR 30,000 monthly retainer, 2-year inflation lock, and 1-year maintenance rules.
2. **Counter Hardware Check**: Confirm PC specs and thermal printer model at TRB counters.
3. **Project Kickoff**: Receive advance payment and commence Phase 1 database provisioning and 850+ product migration immediately.
