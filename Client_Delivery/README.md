# 🎂 The Royal Bakery (Est. 1906) - Pre-Order & Production POS
## 📦 Standalone Client Delivery Package

This package contains the compiled, production-ready, standalone binary edition of **The Royal Bakery POS**.

---

## 🔒 Security & Code Protection

- **Zero Plaintext Source Code**: All backend logic, models, controllers, and database access routines are fully compiled into `backend/trb-pos-backend.exe`.
- **Standalone Runtime**: Node.js is embedded inside the executable — the client machine **does not need Node.js installed**.
- **External Configuration**: SQL Server database connection and port settings can be modified at any time via `backend/.env`.

---

## 📁 Package Structure

```
Client_Delivery/
├── backend/                  # Standalone Compiled Backend
│   ├── trb-pos-backend.exe   # 🔒 Standalone Executable Binary (Protected Code)
│   ├── .env                  # ⚙️ Editable SQL Server Database & Port Config
│   ├── .env.example          # Reference configuration template
│   └── start_backend.bat     # ⚡ Double-click backend runner
│
├── dist/                     # Compiled React 18 + Vite Production Frontend
│   ├── assets/               # Bundled JavaScript & CSS
│   ├── connection.txt        # 🔗 LAN & Backend IP configuration file
│   ├── index.html            # Main web entry
│   ├── logo.webp             # The Royal Bakery emblem
│   └── *.jpg                 # Bakery showcase imagery
│
├── database/                 # Microsoft SQL Server Database Scripts
│   ├── TRB_PreOrder_Database_Schema.sql  # Complete schema & master data
│   └── setup_database.bat    # 1-Click SQLCMD executor
│
├── start_pos_system.bat      # 🚀 1-Click System Launcher
└── README.txt                # Plaintext deployment guide
```

---

## ⚙️ SQL Server Database Configuration (`backend/.env`)

Open `backend/.env` in Notepad to update database connection settings:

```ini
PORT=5000

# Microsoft SQL Server Connection
DB_SERVER=127.0.0.1
DB_NAME=TRB_PreOrder_DB
DB_USER=sa
DB_PASSWORD=sqladmin
DB_PORT=1433
DB_ENCRYPT=false
```

Save the file and double-click `backend/start_backend.bat` or `start_pos_system.bat`. The `.exe` binary will automatically load the updated settings!

---

## 🔗 Multi-Device LAN Network Configuration (`dist/connection.txt`)

To connect multiple Counter PCs, Kitchen Tablets, or Manager Laptops across the local network:

1. On the Main Server PC, open Command Prompt and run `ipconfig` to find the local IP (e.g. `192.168.1.100`).
2. Open `dist/connection.txt` in Notepad.
3. Update the first line:
   ```
   http://192.168.1.100:5000
   ```
4. Save the file.
5. On any other device on the LAN, open the browser and navigate to `http://192.168.1.100:5000`.

---

## 👥 Default Test Accounts

| Role | Username | Password |
| :--- | :--- | :--- |
| 👑 **System Administrator** | `admin` | `Royal508501` |
| 💼 **Counter Cashier 01** | `cashier1` | `Cashier@TRB1` |
| ⭐ **Counter Supervisor** | `supervisor` | `Super@TRB2026` |
| 🎂 **Kitchen Head Chef** | `chef_prema` | `Chef@Prema2026` |

---

**The Royal Bakery** • No. 508, Galle Road, Colombo 06, Sri Lanka  
*Est. 1906 • 100% Offline Resilient Local POS System*
