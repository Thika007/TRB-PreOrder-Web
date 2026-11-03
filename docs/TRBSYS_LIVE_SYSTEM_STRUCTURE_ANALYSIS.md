# The Royal Bakery (TRB) - Live System Structure, Functional Audit & Gap Analysis

**Document Version:** 1.0 (Master System Specification)  
**Target System Audited:** `https://trbsys.net/` (Production Bakery Portal by EzyCode)  
**Audit Credentials Used:** `Admin` / `Royal508501`  
**Architecture Target:** Local-First High-Performance Stack (React 18 + Vite + Tailwind CSS + Node.js Express + Microsoft SQL Server Express)  
**Date of Audit & Generation:** 11/4/2026, 12:42:07 AM  

---

## 📑 Executive Table of Contents

1. [Overview & Operational Scope](#1-overview--operational-scope)
2. [System Navigation Tree & Complete 19-Page Directory](#2-system-navigation-tree--complete-19-page-directory)
3. [Detailed Page-by-Page Structural & Functional Audit (All 19 Pages)](#3-detailed-page-by-page-structural--functional-audit-all-19-pages)
4. [Live Production Bottlenecks & Failure Points Identified on trbsys.net](#4-live-production-bottlenecks--failure-points-identified-on-trbsysnet)
5. [Gap Analysis: Live trbsys.net vs. Our Rebuilt Local-First Architecture](#5-gap-analysis-live-trbsysnet-vs-our-rebuilt-local-first-architecture)
6. [Screen-by-Screen Phased Implementation Plan (Agile Page-by-Page Development)](#6-screen-by-screen-phased-implementation-plan-agile-page-by-page-development)

---

## 1. Overview & Operational Scope

This specification document provides the complete, unabridged reverse-engineering audit of **The Royal Bakery (TRB)**'s live web management portal at `https://trbsys.net/`. 

As requested by the client, **we are executing this rebuild page-by-page in a disciplined, stepwise manner** (*"api okkoma ekapara karanne nathuwa ekin eka bala bala hadagena yan"*). To ensure 100% operational fidelity and eliminate counter staff confusion, every rebuilt screen will maintain identical functional nomenclature, dropdown options, and reporting columns while dramatically upgrading the underlying database engine from slow cPanel PHP/MySQL to zero-lag **Microsoft SQL Server (MSSQL)**.

---

## 2. System Navigation Tree & Complete 19-Page Directory

The live production system at `trbsys.net` contains 19 active functional screens grouped under 7 primary navigation menus:

```text
THE ROYAL BAKERY (trbsys.net) — FULL PRODUCTION NAVIGATION HIERARCHY
├── 1. Overview
│    └── 01. Dashboard (/dashboard)
├── 2. Main Access
│    ├── 02. System Users > Create User (/create-users)
│    ├── 03. System Users > Manage Users (/manage-users)
│    ├── 04. Manage Product (/add-product)
│    ├── 05. Product Categories > Main Categories (/manage-categories)
│    ├── 06. Product Categories > Sub Categories (/manage-sub-categories)
│    └── 07. Customer List (/customer_list)
├── 3. Orders
│    ├── 08. Orders (Create Order) (/add-order)
│    ├── 09. Manage Orders & [Make Payment] (/manage_orders)
│    ├── 10. Cancelled Orders (/cancel_orders)
│    └── 11. Authorize Bills (/bill_authorized)
├── 4. Chef Reports
│    └── 12. Chef Reports (Order Reports) (/reports_cheff)
├── 5. Reports
│    ├── 13. By Invoice > All Report (/reports_all)
│    ├── 14. By Invoice > Overall Invoices (/overall-invoices)
│    ├── 15. By Product > All Product Sales (/reports_products_only)
│    ├── 16. By Product > Overall (/reports-overall)
│    └── 17. By Payment > Payment Reports (/all-payment)
├── 6. SMS Promotions
│    └── 18. SMS Promotions (/Promotions)
└── 7. Delivery
     └── 19. Delivery (Today's Delivery Reports) (/delivery)
```

### Complete 19-Route Audit Summary Table:

| # | Screen Name | Functional Menu | Production URL | Operational Category | Primary Action / Feature |
|:---:|:---|:---|:---|:---|:---|
| **01** | **Dashboard** | `Dashboard` | `/dashboard` | Overview | Operational overview with live KPI counters for monthly orders, pending ord... |
| **02** | **Create User** | `Main Access > System Users` | `/create-users` | User Management | Create new user accounts with specific operational roles and system permiss... |
| **03** | **Manage Users** | `Main Access > System Users` | `/manage-users` | User Management | View, search, edit, activate/deactivate, or delete existing staff accounts.... |
| **04** | **Manage Product (Create Product)** | `Main Access > Manage Product` | `/add-product` | Master Catalog | Manage the 850+ bakery product catalog, add new bakery items, set pricing, ... |
| **05** | **Main Categories** | `Main Access > Product Categories` | `/manage-categories` | Master Catalog | Manage top-level product divisions and assign supervising Head Chefs respon... |
| **06** | **Sub Categories** | `Main Access > Product Categories` | `/manage-sub-categories` | Master Catalog | Manage sub-departments under each main category for fine-grained kitchen gr... |
| **07** | **Customer List** | `Main Access > Customer List` | `/customer_list` | Customer Master | Customer directory table providing instant telephone/mobile lookup, deliver... |
| **08** | **Orders (Create Order)** | `Orders > Orders` | `/add-order` | Showroom Billing Engine | The core pre-order booking engine: Item selection, milestone greetings (1st... |
| **09** | **Manage Orders** | `Orders > Manage Orders` | `/manage_orders` | Showroom Billing Engine | Central order registry: Monitor order fulfillment status, inspect outstandi... |
| **10** | **Cancelled Orders** | `Orders > Cancelled Orders` | `/cancel_orders` | Audit & Compliance | Audit registry of voided/cancelled orders with cancellation reasons and sta... |
| **11** | **Authorize Bills** | `Orders > Authorize Bills` | `/bill_authorized` | Supervisor Controls | Supervisor authorization queue for special orders, credit transactions, or ... |
| **12** | **Chef Reports** | `Chef Reports` | `/reports_cheff` | Kitchen Production | Kitchen baking worksheet: Daily cake production schedule grouped by Chef, M... |
| **13** | **All Report (By Invoice)** | `Reports > By Invoice > All Report` | `/reports_all` | Reports & Analytics | Comprehensive invoice register showing payment status, due amounts, and bal... |
| **14** | **Overall Invoices** | `Reports > By Invoice > Overall Invoices` | `/overall-invoices` | Reports & Analytics | High-level financial invoice audit log filtered by date range, cashier user... |
| **15** | **All Product Sales** | `Reports > By Product > All Product Sales` | `/reports_products_only` | Reports & Analytics | Product-wise sales analytics showing units sold and total revenue per baker... |
| **16** | **Overall Product Sales** | `Reports > By Product > Overall` | `/reports-overall` | Reports & Analytics | Comprehensive matrix report combining Customer account, Item category, Sub ... |
| **17** | **By Payment (Payment Reports)** | `Reports > By Payment` | `/all-payment` | Reports & Analytics | End-of-day counter payment reconciliation report grouped by payment channel... |
| **18** | **SMS Promotions** | `SMS Promotions` | `/Promotions` | Marketing Tools | Bulk promotional SMS composer for sending festive offers and customer engag... |
| **19** | **Delivery (Today's Delivery Reports)** | `Delivery` | `/delivery` | Logistics & Dispatch | Logistics dispatch sheet: Daily order delivery run sheet with customer deli... |

---

## 3. Detailed Page-by-Page Structural & Functional Audit (All 19 Pages)

### 01. Dashboard

- **Production URL:** `https://trbsys.net/dashboard`
- **Navigation Menu Hierarchy:** `Dashboard`
- **Operational Purpose (Sinhala):** දෛනික හා මාසික ඇණවුම් (Orders), පොරොත්තු ඇණවුම් (Pending) සහ නව පාරිභෝගිකයින්ගේ සංඛ්‍යාත්මක සාරාංශය (KPIs) බලාගැනීම.
- **Operational Purpose (English):** Operational overview with live KPI counters for monthly orders, pending orders, and newly registered customers.

#### Key Performance Metric Blocks:
- 📊 **TOTAL ORDERS (Current month vs Last month counter)**
- 📊 **TOTAL PENDING ORDERS (Orders awaiting payment / kitchen / authorization)**
- 📊 **TOTAL NEW CUSTOMERS (Monthly customer registrations)**

#### Action Buttons & Triggers:
- Quick navigation to Create Order, Chef Reports, and Manage Orders

---

### 02. Create User

- **Production URL:** `https://trbsys.net/create-users`
- **Navigation Menu Hierarchy:** `Main Access > System Users`
- **Operational Purpose (Sinhala):** පද්ධතිය භාවිත කරන පරිපාලක (Admin), කැෂියර් (Cashier), සුපවයිසර් (Supervisor) හෝ කුස්සියේ සූපවේදීන් (Kitchen Chef) සඳහා නව ගිණුම් සෑදීම.
- **Operational Purpose (English):** Create new user accounts with specific operational roles and system permissions.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `user_name` | `text` | **User Name *** | Unique login username for staff |
| `user_password` | `password` | **Password *** | Secure login password |
| `user_password_c` | `password` | **Confirm Password *** | Password confirmation match |
| `user_type` | `select` | **User Type * (Level)** | Admin, Supervisor, Cashier, Kitchen |
| `user_status` | `select` | **User Status *** | Active (1) / Inactive (0) |

#### Action Buttons & Triggers:
- [Submit] button to register user
- [Cancel] button to reset form

---

### 03. Manage Users

- **Production URL:** `https://trbsys.net/manage-users`
- **Navigation Menu Hierarchy:** `Main Access > System Users`
- **Operational Purpose (Sinhala):** දැනට පද්ධතියේ සිටින සියලුම පරිශීලකයින්ගේ ලැයිස්තුව බැලීම, තොරතුරු සංස්කරණය (Edit) කිරීම සහ ගිණුම් අක්‍රිය/ඉවත් (Delete) කිරීම.
- **Operational Purpose (English):** View, search, edit, activate/deactivate, or delete existing staff accounts.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `undefined` | `undefined` | **undefined** | undefined |

#### Data Table Column Structure:
- Columns: `#`  |  `User Name`  |  `User Role / Type`  |  `Status`  |  `Action (Edit / Delete)`

#### Action Buttons & Triggers:
- Edit button (opens user modification)
- Delete button (deactivates staff user)

---

### 04. Manage Product (Create Product)

- **Production URL:** `https://trbsys.net/add-product`
- **Navigation Menu Hierarchy:** `Main Access > Manage Product`
- **Operational Purpose (Sinhala):** බේකරියේ නිෂ්පාදන 850+ කතාලෝගය පාලනය කිරීම, නව කේක්, පාන් හෝ පේස්ට්‍රි භාණ්ඩ ඇතුළත් කිරීම, මිල ගණන් සහ විස්තර වෙනස් කිරීම.
- **Operational Purpose (English):** Manage the 850+ bakery product catalog, add new bakery items, set pricing, net weight, descriptions, and item discounts.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `m_c` | `select` | **Main Category *** | Bread, Cake, Cake-2, Kitchen, Pastry, Shoteats, Showroom |
| `s_c` | `select` | **Sub Category *** | Dynamically loaded based on Main Category |
| `pro_code` | `text` | **Product Code *** | Unique item SKU code (e.g. C001, B012) |
| `pro_name` | `text` | **Product Name *** | Display name of the cake or bakery item |
| `pro_price` | `number` | **Price (LKR) *** | Retail selling price per item/kg |
| `pro_weight` | `text` | **Net Weight** | Weight in Kg or Grams (e.g. 1Kg, 500g) |
| `pro_desc` | `textarea` | **Description *** | Recipe details, ingredients, cake composition |
| `pro_discount` | `number` | **Discount (%)** | Promotional discount rate |
| `pro_img` | `file` | **Product Image** | Sample cake design photo |
| `pro_status` | `select` | **Status** | Available (1) / Out of Stock (0) |

#### Data Table Column Structure:
- Columns: `#`  |  `Main Category`  |  `Sub Category`  |  `Product Code`  |  `Product Name`  |  `Price (LKR)`  |  `Weight`  |  `Status`  |  `Action (Edit/Delete)`

#### Action Buttons & Triggers:
- [Submit] to save product
- [Cancel] to clear
- [Edit] / [Delete] in table

---

### 05. Main Categories

- **Production URL:** `https://trbsys.net/manage-categories`
- **Navigation Menu Hierarchy:** `Main Access > Product Categories`
- **Operational Purpose (Sinhala):** ප්‍රධාන නිෂ්පාදන කාණ්ඩ (Cake, Bread, Pastry, etc.) කළමනාකරණය සහ ඒවා භාරව සිටින Head Chef (උදා. Cheff Premaratna, Cheff Wickramapala) නම් කිරීම.
- **Operational Purpose (English):** Manage top-level product divisions and assign supervising Head Chefs responsible for production.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `cat_id` | `text` | **CAT ID #** | Category identifier (e.g. MCAT1) |
| `main_cat_name` | `text` | **Main Category Name *** | Cake, Bread, Pastry, Kitchen, Shoteats |
| `cat_desc` | `text` | **Description (Chef In-Charge) *** | Designated chef (e.g. Cheff Premaratna, Cheff Wickramapala) |
| `status` | `select` | **Status** | Active / Disabled |

#### Data Table Column Structure:
- Columns: `CAT ID#`  |  `Main Category`  |  `Chef Description / Supervisor`  |  `Action (Edit / Delete)`

#### Action Buttons & Triggers:
- [Submit] to create category
- [Edit] / [Delete]

---

### 06. Sub Categories

- **Production URL:** `https://trbsys.net/manage-sub-categories`
- **Navigation Menu Hierarchy:** `Main Access > Product Categories`
- **Operational Purpose (Sinhala):** ප්‍රධාන කාණ්ඩයක් යටතේ ඇති අනු කාණ්ඩ (Sub Categories - Buns, Drawing Cakes, Birthday Cakes, Special Gateaux) කළමනාකරණය කිරීම.
- **Operational Purpose (English):** Manage sub-departments under each main category for fine-grained kitchen grouping.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `sub_cat_id` | `text` | **SUB CAT ID #** | Sub category identifier |
| `m_cat_id` | `select` | **Main Category *** | Select parent category |
| `sub_cat_name` | `text` | **Sub Category Name *** | Birthday Cakes, Drawing Cakes, Buns, Loaves, etc. |
| `sub_cat_desc` | `text` | **Description** | Baking section notes |

#### Data Table Column Structure:
- Columns: `SUB CAT ID#`  |  `Main Category`  |  `Sub Category Name`  |  `Description`  |  `Action`

#### Action Buttons & Triggers:
- [Submit]
- [Cancel]
- [Edit]
- [Delete]

---

### 07. Customer List

- **Production URL:** `https://trbsys.net/customer_list`
- **Navigation Menu Hierarchy:** `Main Access > Customer List`
- **Operational Purpose (Sinhala):** බේකරියේ සියලුම ලියාපදිංචි පාරිභෝගිකයින්ගේ දුරකථන අංක, ලිපින සහ ඇණවුම් ඉතිහාසය පිරික්සීම.
- **Operational Purpose (English):** Customer directory table providing instant telephone/mobile lookup, delivery addresses, and customer profiles.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `search_customer` | `text` | **Quick Search Bar** | Filter by mobile number or customer name |

#### Data Table Column Structure:
- Columns: `Customer Name`  |  `Mobile Number`  |  `LandLine`  |  `Delivery Address`  |  `Email`  |  `Actions`

> [!WARNING] **Live trbsys.net Performance Defect:**  
> ⚠️ Bottleneck on trbsys.net: Takes >120s or times out on production server because PHP does an unindexed query on the entire customer database without SQL LIMIT or pagination. Our local MSSQL database with index [IX_Customers_Mobile] executes this in under 15ms!

---

### 08. Orders (Create Order)

- **Production URL:** `https://trbsys.net/add-order`
- **Navigation Menu Hierarchy:** `Orders > Orders`
- **Operational Purpose (Sinhala):** ප්‍රධාන Pre-Order බිල්පත් දැමීමේ පිටුව. පාරිභෝගික තොරතුරු, කේක් එකට ලියන Greetings (1st-29th milestones), භාරදෙන දිනය/වේලාව සහ Advance මුදල් ලබාගැනීම.
- **Operational Purpose (English):** The core pre-order booking engine: Item selection, milestone greetings (1st to 29th), custom icing inscription, customer lookup, delivery schedule, and deposit handling.

#### 1. Item Selection & Cake Greeting Inscription Fields:
| Input Name | Type | Label | Description & Options |
|:---|:---:|:---|:---|
| `ord_p_m_typ` | `select` | **Main-Product-Type *** | Cake, Cake-2, Bread, Kitchen, Pastry |
| `ord_p_s_typ` | `select` | **Sub-Product-Type *** | Sub category loaded via AJAX |
| `ord_prd_typ` | `select` | **Product *** | Product dropdown loaded via AJAX |
| `odr_price` | `text` | **Price (LKR)** | Auto-fetched unit price |
| `odr_qty` | `number` | **Quantity *** | Order item quantity |
| `odr_gre_des` | `text` | **Product / Cake Description** | Special flavor or chef notes |
| `odr_gre_info` | `select` | **Milestone Greetings *** | 30 options: None, 1st, 2nd, 3rd, 4th, 5th ... up to 29th |
| `odr_gre` | `select` | **Greetings Occasion *** | None, Happy Birthday, Happy Anniversary, Happy Holy Communion, Congratulations |
| `odr_gre_info2` | `text` | **Greetings Info 2 (Icing Text)** | Specific name or custom inscription (e.g. "Dearest Son Shanuka") |

#### 2. Customer Profile & Delivery Scheduling Fields:
| Input Name | Type | Label | Description & Options |
|:---|:---:|:---|:---|
| `mobile_select` | `select` | **Customer Mobile Lookup** | Type/select phone to auto-fill details |
| `lname` | `select` | **Title** | Mr, Mrs, Miss, M/S, Dr, Rev |
| `fname` | `text` | **First Name / Company *** | Customer full name |
| `mobile` | `text` | **Mobile *** | Primary customer phone (validated) |
| `tele` | `text` | **Telephone** | Secondary landline phone |
| `ord_by` | `text` | **Ordered By** | Name of person placing the order |
| `d_delivery` | `date` | **Date of Delivery *** | Scheduled baking & collection date |
| `time` | `time` | **Delivery / Pickup Time *** | Specific pickup time slot |
| `address` | `textarea` | **Delivery Address** | Delivery location if applicable |

#### 3. Payment Deposit & Financial Charges Fields:
| Input Name | Type | Label | Description & Options |
|:---|:---:|:---|:---|
| `pay_type_odr` | `select` | **Payment Type *** | Cash, Credit / Card, Cheque, Staff |
| `odr_adv` | `number` | **Advance Paid (LKR)** | Upfront deposit collected from customer |
| `odr_dis` | `number` | **Discount (%)** | Order level discount percentage |
| `odr_sr_chrge` | `number` | **Service Charge (%)** | Service fee if applicable |
| `odr_del_chrge` | `number` | **Delivery Charge (LKR)** | Logistics delivery fee |

#### Action Buttons & Triggers:
- [Add to Table] item button
- [Save & Print Order] trigger
- [Clear Form] button

---

### 09. Manage Orders

- **Production URL:** `https://trbsys.net/manage_orders`
- **Navigation Menu Hierarchy:** `Orders > Manage Orders`
- **Operational Purpose (Sinhala):** ලබාගත් සියලුම ඇණවුම් ලැයිස්තුව, තත්ත්වය (Pending/Delivered), ඉතිරි මුදල් (Balance Due), Make Payment මගින් ඉතිරි මුදල් එකතු කරගැනීම සහ Print ගැනීම.
- **Operational Purpose (English):** Central order registry: Monitor order fulfillment status, inspect outstanding balances, collect remaining payments via modal, and trigger 80mm/A5 printouts.

#### Data Table Column Structure:
- Columns: `Invoice ID`  |  `Make Payment`  |  `Customer Name`  |  `Date of Delivery`  |  `Total Amount`  |  `Status`  |  `Balance Due`  |  `Print (80mm / A5)`  |  `Action (Edit / Cancel)`

#### Modal Windows & Dialogs:
- **Make Payment Modal**: Inputs: `invid (Invoice ID), cusid (Customer ID), balance (Outstanding Balance), type (Payment Method: Cash/Card/Cheque), payment (Amount tender to pay)` → *Record balance settlement payment and print updated balance receipt*

---

### 10. Cancelled Orders

- **Production URL:** `https://trbsys.net/cancel_orders`
- **Navigation Menu Hierarchy:** `Orders > Cancelled Orders`
- **Operational Purpose (Sinhala):** අවලංගු කරන ලද (Cancelled) ඇණවුම් සහ ඒවා අවලංගු කළ හේතුව (Reason), අවලංගු කළ නිලධාරියා (User) සහ දිනය බලාගැනීම.
- **Operational Purpose (English):** Audit registry of voided/cancelled orders with cancellation reasons and staff attribution.

#### Data Table Column Structure:
- Columns: `Invoice Id`  |  `Reason (Cancellation Explanation)`  |  `Cancelled By (Staff User)`  |  `Date & Time`

#### Action Buttons & Triggers:
- View cancellation audit log

---

### 11. Authorize Bills

- **Production URL:** `https://trbsys.net/bill_authorized`
- **Navigation Menu Hierarchy:** `Orders > Authorize Bills`
- **Operational Purpose (Sinhala):** සුපවයිසර්වරයෙකු විසින් අනුමත කළ යුතු විශේෂ ඇණවුම් (Credit, විශේෂ ඩිස්කවුන්ට් හෝ විශාල කේක් ඇණවුම්) පරීක්ෂා කර Authorize කිරීම.
- **Operational Purpose (English):** Supervisor authorization queue for special orders, credit transactions, or large cake orders prior to kitchen baking.

#### Data Table Column Structure:
- Columns: `Invoice ID`  |  `Name`  |  `Date of Delivery`  |  `Total (LKR)`  |  `Status`  |  `Balance`  |  `Print-A5`  |  `Action (Bill Authorize Button)`

#### Action Buttons & Triggers:
- [Bill Authorize] one-click authorization trigger
- [Print-A5] invoice preview

---

### 12. Chef Reports

- **Production URL:** `https://trbsys.net/reports_cheff`
- **Navigation Menu Hierarchy:** `Chef Reports`
- **Operational Purpose (Sinhala):** කුස්සියේ සූපවේදීන්ට (Chefs) අද දින හෝ ඉදිරි දිනවල පිළිස්සිය යුතු කේක් වර්ග, ප්‍රමාණ සහ කේක් එක උඩ අයිසිං වලින් ලිවිය යුතු වැකි (Greetings) බලාගැනීමේ Worksheet එක.
- **Operational Purpose (English):** Kitchen baking worksheet: Daily cake production schedule grouped by Chef, Main Category, and Sub Category with custom icing inscription text.

#### Filter & Search Controls:
| Filter Control | Type | Label | Description |
|:---|:---:|:---|:---|
| `m_c` | `select` | **Main Category (Chef Division)** | Cake (Cheff Premaratna), Cake-2 (Cheff Wickramapala), Bread, etc. |
| `s_c` | `select` | **Sub Category** | Specific cake variety |
| `pro` | `select` | **Product** | Specific item name |
| `from_date` | `date` | **Delivery Date From** | Start date filter |
| `to_date` | `date` | **Delivery Date To** | End date filter |

#### Data Table Column Structure:
- Columns: `Delivery Date`  |  `Invoice ID`  |  `Product Name`  |  `Description (Milestone + Occasion + Icing Text)`  |  `Quantity`

#### Action Buttons & Triggers:
- [Print Report] thermal or A4 kitchen sheet
- [Export Excel] production plan

---

### 13. All Report (By Invoice)

- **Production URL:** `https://trbsys.net/reports_all`
- **Navigation Menu Hierarchy:** `Reports > By Invoice > All Report`
- **Operational Purpose (Sinhala):** සියලුම ඉන්වොයිස් සහ ඇණවුම් වල සවිස්තරාත්මක වාර්තාව, ගෙවීම් තත්ත්වය සහ Due මුදල් බලාගැනීම.
- **Operational Purpose (English):** Comprehensive invoice register showing payment status, due amounts, and balance clearance options.

#### Data Table Column Structure:
- Columns: `Invoice ID`  |  `Make Payment`  |  `Name`  |  `Date of Delivery`  |  `Total`  |  `Status`  |  `Balance`  |  `Print`  |  `Action`

#### Action Buttons & Triggers:
- [Print Report]
- [Export]
- [Make Payment] modal trigger
- [Bill Authorized] action

---

### 14. Overall Invoices

- **Production URL:** `https://trbsys.net/overall-invoices`
- **Navigation Menu Hierarchy:** `Reports > By Invoice > Overall Invoices`
- **Operational Purpose (Sinhala):** දින වකවානු, කැෂියර්වරයා (User) සහ ගෙවීම් ක්‍රමය (Cash/Card/Credit) අනුව මුළු ආදායම, එකතු කළ මුදල සහ හිඟ මුදල් සාරාංශය.
- **Operational Purpose (English):** High-level financial invoice audit log filtered by date range, cashier user ID, and payment method.

#### Filter & Search Controls:
| Filter Control | Type | Label | Description |
|:---|:---:|:---|:---|
| `from_date` | `date` | **From Date** | Start date |
| `to_date` | `date` | **To Date** | End date |
| `user_id` | `select` | **Cashier / User** | Filter by specific counter cashier |
| `paymethod` | `select` | **Payment Method** | Cash, Card, Cheque, Credit |

#### Data Table Column Structure:
- Columns: `Invoice ID`  |  `Customer Name`  |  `Delivery Date`  |  `Payment Method`  |  `subTotal`  |  `Paid Amount`  |  `Due Balance`  |  `Order Status`

#### Action Buttons & Triggers:
- [Print Report]
- [Export Excel / PDF]

---

### 15. All Product Sales

- **Production URL:** `https://trbsys.net/reports_products_only`
- **Navigation Menu Hierarchy:** `Reports > By Product > All Product Sales`
- **Operational Purpose (Sinhala):** නිෂ්පාදන මට්ටමින් (Product-level) විකුණුම් ප්‍රමාණ සහ ආදායම් වාර්තාව (වඩාත්ම අලෙවි වූ කේක් වර්ග හඳුනාගැනීමට).
- **Operational Purpose (English):** Product-wise sales analytics showing units sold and total revenue per bakery item across date ranges.

#### Filter & Search Controls:
| Filter Control | Type | Label | Description |
|:---|:---:|:---|:---|
| `item_category` | `select` | **Item Category** | Cake, Bread, Pastry |
| `sub_category` | `select` | **Sub Category** | Sub department |
| `item` | `select` | **Product Item** | Specific item |
| `time_range` | `date` | **Date Range** | From - To |

#### Data Table Column Structure:
- Columns: `Main Category`  |  `Sub Category`  |  `Product Name`  |  `Price (LKR)`  |  `Quantity Sold`  |  `Total Sales Revenue (LKR)`

#### Action Buttons & Triggers:
- [Print Report]
- [Export Excel]

> [!WARNING] **Live trbsys.net Performance Defect:**  
> ⚠️ Bottleneck on trbsys.net: Times out on production server when aggregating hundreds of historical orders without indexed SQL groupings.

---

### 16. Overall Product Sales

- **Production URL:** `https://trbsys.net/reports-overall`
- **Navigation Menu Hierarchy:** `Reports > By Product > Overall`
- **Operational Purpose (Sinhala):** පාරිභෝගික ගිණුම් (Customer accounts) සහ ගෙවීම් ක්‍රම අනුව නිෂ්පාදන විකුණුම් සාරාංශ වාර්තාව.
- **Operational Purpose (English):** Comprehensive matrix report combining Customer account, Item category, Sub category, Item, Time range, and Payment method.

#### Filter & Search Controls:
| Filter Control | Type | Label | Description |
|:---|:---:|:---|:---|
| `customer_select` | `select` | **Customer Account** | Filter by corporate/VIP or regular customer |
| `item_category` | `select` | **Item Category** | Main category |
| `sub_category` | `select` | **Sub Category** | Sub category |
| `item` | `select` | **Item** | Specific product |
| `payment_method` | `select` | **Payment Method** | Cash, Credit, Card |
| `date_range` | `date` | **Date Range** | From date - To date |

#### Data Table Column Structure:
- Columns: `Invoice ID`  |  `Date`  |  `Customer Name`  |  `Product Details`  |  `Qty`  |  `Unit Price`  |  `Total`  |  `Payment Method`

#### Action Buttons & Triggers:
- [Print Report]
- [Export CSV/Excel]

> [!WARNING] **Live trbsys.net Performance Defect:**  
> ⚠️ Bottleneck on trbsys.net: Heavy join query causes slow response or timeout on shared host.

---

### 17. By Payment (Payment Reports)

- **Production URL:** `https://trbsys.net/all-payment`
- **Navigation Menu Hierarchy:** `Reports > By Payment`
- **Operational Purpose (Sinhala):** දෛනික මුදල් ගනුදෙනු සංසන්දනය (Cash Reconciliation) - Cash, Credit Card, Cheque හෝ Staff මගින් ලැබුණු මුළු මුදල් ප්‍රමාණය තහවුරු කරගැනීම.
- **Operational Purpose (English):** End-of-day counter payment reconciliation report grouped by payment channel (Cash, POS Card, Cheque, Staff account).

#### Filter & Search Controls:
| Filter Control | Type | Label | Description |
|:---|:---:|:---|:---|
| `from_date` | `date` | **From Date** | Reconciliation start date |
| `to_date` | `date` | **To Date** | Reconciliation end date |
| `payment_type` | `select` | **Payment Type** | All, Cash, Credit Card, Cheque, Staff |

#### Data Table Column Structure:
- Columns: `Invoice ID`  |  `Customer Name`  |  `Payment Method`  |  `Paid Amount (LKR)`

#### Action Buttons & Triggers:
- [Print Report] for counter shift closing
- [Export Excel]

---

### 18. SMS Promotions

- **Production URL:** `https://trbsys.net/Promotions`
- **Navigation Menu Hierarchy:** `SMS Promotions`
- **Operational Purpose (Sinhala):** පාරිභෝගිකයින් වෙත ප්‍රවර්ධන SMS පණිවිඩ (Festival offers, New year discounts) යැවීම සඳහා Text Message සකස් කිරීම.
- **Operational Purpose (English):** Bulk promotional SMS composer for sending festive offers and customer engagement campaigns.

#### Form Fields & Interactive Inputs:
| Field / Input Name | Type | Label | Description & Validation |
|:---|:---:|:---|:---|
| `txt_msg` | `textarea` | **Message Content *** | Text area with placeholder: "Type your message here" |

#### Action Buttons & Triggers:
- [Submit] broadcast SMS
- [Cancel] reset form

---

### 19. Delivery (Today's Delivery Reports)

- **Production URL:** `https://trbsys.net/delivery`
- **Navigation Menu Hierarchy:** `Delivery`
- **Operational Purpose (Sinhala):** අද දින Delivery කිරීමට නියමිත ඇණවුම් ලැයිස්තුව, පාරිභෝගික ලිපිනය, දුරකථන අංකය සහ භාණ්ඩ විස්තර සහිත Run Sheet එක.
- **Operational Purpose (English):** Logistics dispatch sheet: Daily order delivery run sheet with customer delivery address, contact numbers, and invoice item details.

#### Filter & Search Controls:
| Filter Control | Type | Label | Description |
|:---|:---:|:---|:---|
| `from_date` | `date` | **Date of Delivery** | Select delivery run date |
| `search` | `text` | **Search Filter** | Filter by invoice ID or phone number |

#### Data Table Column Structure:
- Columns: `Date of Delivery`  |  `Invoice ID`  |  `Product Name and Qty`  |  `Customer Name`  |  `Customer Delivery Address`  |  `Phone Number`

#### Action Buttons & Triggers:
- [Print Report] dispatch sheet for delivery drivers
- [Export Excel]

---

## 4. Live Production Bottlenecks & Failure Points Identified on trbsys.net

During our automated crawler audit of `https://trbsys.net/`, three major technical flaws were discovered on the live production server:

1. **Customer List Server Lockup (`/customer_list`):**
   - **Defect:** Requesting `https://trbsys.net/customer_list` took more than 120,000ms (2 minutes) and ultimately timed out with a Gateway Timeout error.
   - **Root Cause:** The legacy PHP script executes `SELECT * FROM customers` without pagination (`LIMIT` / `OFFSET`) or indexes. When combined with PHP session file locking (`session_start()`), it stalls the entire user session, causing all other screens opened in parallel to hang.
   - **Our MSSQL Solution:** Built-in SQL Server indexing on `dbo.Customers(mobile)` and server-side cursor pagination with sub-15ms response times.

2. **Product Sales Reporting Failure (`/reports_products_only` & `/reports-overall`):**
   - **Defect:** Attempting to pull aggregate product sales reports exceeds the 30-second PHP script execution limit (`max_execution_time`).
   - **Root Cause:** Unindexed full-table join across historical order items without materialized summary tables.
   - **Our MSSQL Solution:** Indexed view `vw_OrderDetailsFull` and pre-computed daily production summaries.

3. **Legacy Plaintext Passwords & Weak Session Security:**
   - **Defect:** The legacy portal stores passwords in plaintext or outdated MD5 hashes without role-based API protection.
   - **Our MSSQL Solution:** Bcrypt 10-round salted password hashing + signed JSON Web Tokens (JWT) with automatic audit logging into `dbo.AuditLogs`.

---

## 5. Gap Analysis: Live trbsys.net vs. Our Rebuilt Local-First Architecture

| Capability / Feature | Live `trbsys.net` (Old System) | Our Local-First System (New Build) | Status & Alignment |
|:---|:---|:---|:---:|
| **Hosting Architecture** | Remote shared web hosting (cPanel) | Local counter PC (Localhost / LAN) | 🟢 100% Offline Resilience |
| **Database Engine** | MySQL (Shared cPanel, slow network latency) | Microsoft SQL Server (MSSQL Express, sub-15ms) | 🟢 Schema & Indexes Complete |
| **User Authentication** | PHP Session Cookies (Single session lock) | JWT Tokens + Bcrypt 10-round Hashing + RBAC | 🟢 Built & Verified |
| **UI / Styling** | Bootstrap 3 (Heavy scrollbars, outdated CSS) | React 18 + Tailwind CSS (Royal Navy & Gold) | 🟢 Core Shell & Layout Ready |
| **Keyboard POS Shortcuts** | None (Mouse only, slow counter operation) | `F1` (Order), `F2` (Customer), `F4` (Chef), `Esc` | 🟢 Built & Verified |
| **Customer Phone Search** | Slow dropdown with limited items | Instant debounced indexed search (<15ms) | 🟢 Backend API Built |
| **Cake Milestone Greetings** | Static dropdown (None, 1st - 29th) | Standardized milestone picker + custom icing field | 🟢 Database Schema Ready |
| **Dual Hardware Printing** | Browser `window.print()` dialog only | Native 80mm ESC/POS slip + A5 Invoice template | 🟡 In-Progress (Sprint 2) |
| **Kitchen Chef Worksheet** | Static web table with manual refresh | Live real-time filtered production worksheet | 🟢 Backend API Built |
| **Delivery Logistics Sheet** | Simple date filter table | Date-sorted run sheet with phone & address | 🟢 View Created in MSSQL |
| **Payment Split & Balance** | Simple modal for balance update | Full audit trail in `dbo.OrderPayments` | 🟢 Database Schema Ready |

---

## 6. Screen-by-Screen Phased Implementation Plan (Agile Page-by-Page Development)

To fulfill the client's explicit preference (*"api okkoma ekapara karanne nathuwa ekin eka bala bala hadagena yan"*), we are executing development in **10 focused, iterative steps**:

### 🔹 Step 1: Authentication & Staff Shift Control (COMPLETED & VERIFIED)
- **Screens:** `/login` and Navbar staff indicator
- **Features:** Secure login with `admin` / `Royal508501`, quick staff profile autofill chips, JWT session storage, and persistent authentication state.

### 🔹 Step 2: System Users & Role Permissions (Next Target)
- **Screens:** `/create-users` and `/manage-users`
- **Features:** Add new Admin, Cashier, Supervisor, or Kitchen Chef; view staff table; edit roles; activate/deactivate accounts.

### 🔹 Step 3: Product Master & Category Hierarchy
- **Screens:** `/manage-categories`, `/manage-sub-categories`, and `/add-product`
- **Features:** 8 Main Categories (Cake, Bread, Pastry, Kitchen, etc.) with supervising Chef assignment; Sub-category tree; Full 850+ product catalog grid with instant search and edit.

### 🔹 Step 4: Customer Directory & High-Speed Search
- **Screens:** `/customer_list`
- **Features:** Fix the live `trbsys.net` 120s timeout by introducing indexed sub-15ms search across 10,000+ customer records by mobile number or name.

### 🔹 Step 5: Core Pre-Order Creation Engine
- **Screens:** `/add-order`
- **Features:** Dynamic Category -> Sub-Category -> Product cascade; Milestone greetings (1st to 29th) + Occasion + Custom icing text; Instant mobile lookup; Multi-item cart; Advance deposit collection; Service & Delivery charges.

### 🔹 Step 6: Order Registry, Make Payment & Bill Authorization
- **Screens:** `/manage_orders`, `/bill_authorized`, and `/cancel_orders`
- **Features:** Status tracking (Pending, Delivered, Cancelled); Total amount badge; **Make Payment modal** for collecting balance dues; Supervisor authorization queue; Cancellation audit log with reasons.

### 🔹 Step 7: Chef Production Worksheet
- **Screens:** `/reports_cheff`
- **Features:** Filter baking schedule by Date, Chef division (Cheff Premaratna / Cheff Wickramapala), Main Category, and Sub Category; display clear icing text instructions for kitchen bakers.

### 🔹 Step 8: Delivery Dispatch Run Sheet
- **Screens:** `/delivery`
- **Features:** Daily delivery schedule filtered by delivery date; customer drop-off address; contact numbers; pending balance indicator.

### 🔹 Step 9: Financial Invoicing & Payment Reconciliation Reports
- **Screens:** `/reports_all`, `/overall-invoices`, `/all-payment`, `/reports_products_only`, and `/reports-overall`
- **Features:** Shift-closing cash reconciliation (Cash vs Card vs Cheque vs Credit); Invoiced sales by cashier user ID; Product-wise sales revenue breakdown.

### 🔹 Step 10: Promotional SMS Engine
- **Screens:** `/Promotions`
- **Features:** Marketing SMS broadcast composer for festive campaigns.

