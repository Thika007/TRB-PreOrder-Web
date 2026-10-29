import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const OUT_DIR = path.resolve('output', 'proposal_figures');
mkdirSync(OUT_DIR, { recursive: true });

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: #ffffff;
      color: #1a202c;
    }
    .diagram-container {
      background: #ffffff;
      padding: 30px;
      margin-bottom: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    h2 {
      color: #1A365D;
      font-size: 20px;
      margin-bottom: 20px;
      text-align: center;
      border-bottom: 2px solid #C59B27;
      padding-bottom: 10px;
    }
    .mermaid {
      display: flex;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="diagram-container" id="container-arch">
    <h2>FIGURE 1: LOCAL-FIRST LAN ARCHITECTURE POWERED BY MICROSOFT SQL SERVER</h2>
    <div class="mermaid" id="diagram-arch">
flowchart TB
    subgraph LocalCounter["THE ROYAL BAKERY - LOCAL HIGH-PERFORMANCE LAN (Zero-Lag / 100% Offline Resilience)"]
        subgraph MasterNode["Master Counter Station (Central Server Terminal)"]
            MSSQL[("Microsoft SQL Server (MSSQL Instance)\nSub-5ms Query Latency | ACID Transactions\n├── DanuPOS_DB (Retail POS, Inventory, Barcodes)\n└── TRB_PreOrder_DB (Custom Cakes, Advance, Kitchen)")]
            
            DanuPOSApp["DanuPOS Desktop Terminal\n(C# .NET / ADO.NET Direct Connection)\nCounter 1 Retail Walk-in Sales"]
            PreOrderServer["Pre-Order Local Web Engine\n(Node.js / Fastify with mssql Driver)\nPre-Order Billing API"]

            DanuPOSApp <-->|"Direct ADO.NET Connection"| MSSQL
            PreOrderServer <-->|"High-Speed Local Connection"| MSSQL
        end

        subgraph LANStations["Multi-Terminal Showroom & Kitchen Display (Local Wi-Fi / LAN)"]
            Counter2["Counter Terminal 2\n(Web Browser Client)"]
            Counter3["Counter Terminal 3\n(Tablet / Laptop)"]
            KitchenKDS["Kitchen / Chef Display\n(Live Baking Schedules)"]
        end

        Counter2 <-->|"Local LAN (0ms Internet Lag)"| PreOrderServer
        Counter3 <-->|"Local LAN (0ms Internet Lag)"| PreOrderServer
        KitchenKDS <-->|"Local LAN (0ms Internet Lag)"| PreOrderServer

        subgraph Peripherals["Counter Hardware Peripherals"]
            ThermalPrinter["80mm Thermal Receipt Printer\n(Direct ESC/POS USB/LAN)"]
            A5Printer["A5 / A4 Invoice Printer\n(Detailed Cake Pickup Vouchers)"]
            CashDrawer["Electronic Cash Drawer"]
        end

        MasterNode --> ThermalPrinter
        MasterNode --> A5Printer
        MasterNode --> CashDrawer
    end

    subgraph CloudLayer["SECURE CLOUD PLATFORM (Background Non-Blocking Sync)"]
        CloudServer["Cloud API Gateway & Sync Worker"]
        CloudDB[("Encrypted Cloud Database\n(Off-site Auto Backup)")]
        OwnerApp["Management / Owner Smartphone App\n(Real-Time Sales, Revenue & Baking Analytics)"]

        PreOrderServer -.->|"Async Sync (When Internet Active)"| CloudServer
        CloudServer <--> CloudDB
        CloudServer --> OwnerApp
    end

    classDef mssql fill:#1A365D,stroke:#0F2942,stroke-width:2px,color:#ffffff;
    classDef app fill:#EBF8FF,stroke:#3182CE,stroke-width:2px,color:#2B6CB0;
    classDef client fill:#F7FAFC,stroke:#C59B27,stroke-width:2px,color:#1A202C;
    classDef cloud fill:#FEFCBF,stroke:#B7791F,stroke-width:2px,color:#744210;

    class MSSQL mssql;
    class DanuPOSApp,PreOrderServer app;
    class Counter2,Counter3,KitchenKDS,ThermalPrinter,A5Printer,CashDrawer client;
    class CloudServer,CloudDB,OwnerApp cloud;
    </div>
  </div>

  <div class="diagram-container" id="container-erd">
    <h2>FIGURE 2: MICROSOFT SQL SERVER RELATIONAL DATABASE SCHEMA (ERD)</h2>
    <div class="mermaid" id="diagram-erd">
erDiagram
    USERS ||--o{ ORDERS : "enters"
    USERS ||--o{ PAYMENTS : "collects"
    CUSTOMERS ||--o{ ORDERS : "places"
    MAIN_CATEGORIES ||--o{ SUB_CATEGORIES : "contains"
    SUB_CATEGORIES ||--o{ PRODUCTS : "groups"
    MAIN_CATEGORIES ||--o{ PRODUCTS : "classifies"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "included_in"
    ORDERS ||--o{ PAYMENTS : "paid_via"

    USERS {
        INT id PK
        NVARCHAR username
        NVARCHAR role "Admin, Cashier, Accountant, Kitchen"
        NVARCHAR full_name
        BIT is_active
    }

    CUSTOMERS {
        INT id PK
        NVARCHAR title "Mr, Mrs, Miss, Dr, Rev"
        NVARCHAR first_name
        NVARCHAR mobile UK
        NVARCHAR telephone
        NVARCHAR delivery_address
    }

    MAIN_CATEGORIES {
        INT id PK
        NVARCHAR code UK "MCAT1, MCAT2..."
        NVARCHAR name "Bread, Cake, Pastry, Shoteats..."
        NVARCHAR chef_in_charge "e.g., Cheff Premaratna"
    }

    SUB_CATEGORIES {
        INT id PK
        NVARCHAR code UK
        INT main_category_id FK
        NVARCHAR name "Buns, Cake Pieces, Drawing Cakes..."
    }

    PRODUCTS {
        INT id PK
        NVARCHAR product_code UK
        INT main_category_id FK
        INT sub_category_id FK
        NVARCHAR name "e.g., Egg Bun, Ribbon Cake"
        DECIMAL price
        NVARCHAR net_weight
        BIT is_discountable
        NVARCHAR status "Available, Out_of_Stock"
    }

    ORDERS {
        INT id PK
        NVARCHAR invoice_no UK "e.g., RB-0177558"
        INT customer_id FK
        INT ordered_by_user_id FK
        DATE order_date
        DATE delivery_date
        TIME delivery_time
        NVARCHAR delivery_address
        DECIMAL subtotal
        DECIMAL discount_amount
        DECIMAL delivery_charge
        DECIMAL net_total
        DECIMAL advance_paid
        DECIMAL balance_due
        NVARCHAR payment_status "Unpaid, Partial, Paid"
        NVARCHAR order_status "Pending, Authorized, In_Kitchen, Delivered, Cancelled"
        BIT is_authorized
    }

    ORDER_ITEMS {
        INT id PK
        INT order_id FK
        INT product_id FK
        NVARCHAR product_name
        DECIMAL unit_price
        INT quantity
        DECIMAL line_total
        NVARCHAR greeting_milestone "1st, 2nd, ... 29th"
        NVARCHAR greeting_occasion "Birthday, Anniversary..."
        NVARCHAR greeting_custom_text "Name/Text on Cake"
        NVARCHAR special_instructions
    }

    PAYMENTS {
        INT id PK
        INT order_id FK
        NVARCHAR receipt_no UK
        NVARCHAR payment_phase "Advance, Settlement, Full"
        NVARCHAR payment_method "Cash, Card, Cheque, Staff"
        DECIMAL amount
        INT collected_by_user_id FK
        DATETIME2 payment_date
    }
    </div>
  </div>

  <div class="diagram-container" id="container-flow">
    <h2>FIGURE 3: PRE-ORDER BILLING & KITCHEN LIFECYCLE WORKFLOW</h2>
    <div class="mermaid" id="diagram-flow">
flowchart TD
    Start([Customer Walk-in / Phone Order]) --> CustCheck{Customer Exists?}
    CustCheck -- Yes --> SearchCust[Quick Mobile Search in MSSQL & Auto-fill Profile]
    CustCheck -- No --> CreateCust[One-Click In-Line Customer Registration in MSSQL]

    SearchCust --> SelectItems[Select Bakery Products / Custom Cakes]
    CreateCust --> SelectItems

    SelectItems --> CakeCustom{Is Custom Cake?}
    CakeCustom -- Yes --> EnterDetails[Configure Greetings: Occasion, Milestone, Custom Icing Text & Date/Time]
    CakeCustom -- No --> SetDelivery[Set Pickup / Delivery Date & Time Window]
    EnterDetails --> SetDelivery

    SetDelivery --> CalcBill[Real-Time Financials: Subtotal, Discount %, Service %, Delivery Charge]
    CalcBill --> RecordAdvance[Collect Advance Deposit via Cash / Card / Cheque]
    RecordAdvance --> SaveMSSQL[(Atomic ACID Save to Microsoft SQL Server)]
    SaveMSSQL --> PrintOrder[Direct Thermal Slip 80mm & Formal A5 Invoice Printed]

    PrintOrder --> AuthCheck{High-Value / Custom Cake?}
    AuthCheck -- Yes --> SupAuth[Supervisor Bill Authorization]
    AuthCheck -- No --> SchedKitchen[Automatic Kitchen Production Scheduling]
    SupAuth --> SchedKitchen

    SchedKitchen --> KitchenPrep[Chef Departmental Worksheets: Cake, Pastry, Kitchen Bakes]
    KitchenPrep --> ReadyDispatch[Order Baked, Decorated & Ready in Showroom]

    ReadyDispatch --> CustArrive([Customer Pickup / Dispatch])
    CustArrive --> BalCheck{Balance Remaining?}
    BalCheck -- Yes --> MakePayment[Collect Balance on DanuPOS / Web Terminal via Cash or Card]
    BalCheck -- No --> Handover[Handover Baked Items & Final Delivery Receipt]
    MakePayment --> SettleMSSQL[(Atomic MSSQL Balance Settlement & Drawer Balancing)]
    SettleMSSQL --> Handover
    Handover --> OrderComplete([Order Fulfilled & Shift Reconciled])

    classDef proc fill:#1A365D,stroke:#0F2942,stroke-width:2px,color:#ffffff;
    classDef decision fill:#FEFCBF,stroke:#B7791F,stroke-width:2px,color:#744210;
    classDef term fill:#E2E8F0,stroke:#4A5568,stroke-width:2px,color:#1A202C;
    classDef mssql fill:#2B6CB0,stroke:#1A365D,stroke-width:2px,color:#ffffff;

    class Start,CustArrive,OrderComplete term;
    class CustCheck,CakeCustom,AuthCheck,BalCheck decision;
    class SearchCust,CreateCust,SelectItems,EnterDetails,SetDelivery,CalcBill,RecordAdvance,PrintOrder,SupAuth,SchedKitchen,KitchenPrep,ReadyDispatch,MakePayment,Handover proc;
    class SaveMSSQL,SettleMSSQL mssql;
    </div>
  </div>

  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
</body>
</html>
`;

async function generateDiagrams() {
  console.log('Launching browser to re-render diagrams with Microsoft SQL Server...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 2600, deviceScaleFactor: 2 } });
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const diagrams = [
    { id: '#container-arch', file: 'figure_1_system_architecture.png' },
    { id: '#container-erd', file: 'figure_2_entity_relationship_diagram.png' },
    { id: '#container-flow', file: 'figure_3_order_lifecycle_workflow.png' }
  ];

  for (const d of diagrams) {
    const el = await page.$(d.id);
    if (el) {
      const outPath = path.join(OUT_DIR, d.file);
      await el.screenshot({ path: outPath });
      console.log(`Saved: ${outPath}`);
    } else {
      console.warn(`Element not found: ${d.id}`);
    }
  }

  await browser.close();
  console.log('All diagrams re-generated successfully with Microsoft SQL Server!');
}

generateDiagrams().catch(console.error);
