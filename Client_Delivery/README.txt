================================================================================
           THE ROYAL BAKERY (EST. 1906) - PRE-ORDER & PRODUCTION POS
                         CLIENT DELIVERY PACKAGE
================================================================================

PACKAGE CONTENTS:
-----------------
1. [backend/]
   - 'trb-pos-backend.exe': Standalone compiled binary (Zero plaintext source code).
   - Node.js is embedded inside the .exe (No Node.js installation needed!).
   - '.env': External database configuration file (Editable in Notepad).
   - 'start_backend.bat': Double-click to launch backend server.

2. [dist/]
   - Production compiled Web Application (React 18 + Vite).
   - 'connection.txt': LAN Network IP address configuration file.
   - All static assets, fonts, icons, and cake/pastry branding imagery.

3. [database/]
   - 'TRB_PreOrder_Database_Schema.sql': Complete Microsoft SQL Server database script.
   - Creates [TRB_PreOrder_DB] with all 10 tables, indexes, and initial master data.
   - 'setup_database.bat': 1-click database creator script.

4. [start_pos_system.bat]
   - 1-click launcher that starts the backend binary and opens the POS in browser.


================================================================================
HOW TO CONFIGURE SQL SERVER CONNECTION (.env):
================================================================================
You can change the database connection parameters anytime without touching
any code!

1. Open 'backend/.env' in Notepad:
     PORT=5000
     DB_SERVER=127.0.0.1
     DB_NAME=TRB_PreOrder_DB
     DB_USER=sa
     DB_PASSWORD=sqladmin
     DB_PORT=1433
     DB_ENCRYPT=false

2. Change 'DB_SERVER' to your SQL Server IP or instance (e.g. 192.168.1.100 or .\SQLEXPRESS).
3. Change 'DB_PASSWORD' to your SQL Server password.
4. Save the file.
5. When 'trb-pos-backend.exe' starts, it will automatically connect to your
   configured SQL Server!


================================================================================
HOW TO CONFIGURE FOR LAN MULTI-DEVICE ACCESS (connection.txt):
================================================================================
If other Counter PCs, Manager Laptops, or Kitchen Tablets need to connect:

1. On the Main Server PC, check the local IP address (Run 'ipconfig' in cmd).
   Example: 192.168.1.100
2. Open 'dist/connection.txt' in Notepad.
3. Change the first line to:
   http://192.168.1.100:5000
4. Save 'dist/connection.txt'.
5. From any other PC or Tablet on the LAN, open the browser and visit:
   http://192.168.1.100:5000


================================================================================
STEP-BY-STEP INSTALLATION GUIDE:
================================================================================
1. Run 'database/setup_database.bat' or execute 'TRB_PreOrder_Database_Schema.sql' in SSMS.
2. Verify/Edit 'backend/.env' with your SQL credentials.
3. Double-click 'start_pos_system.bat' (or 'backend/start_backend.bat').
4. The POS portal will launch at http://localhost:5000.
5. On the Login screen, click "Test Accounts" to select Admin, Cashier, Supervisor, or Chef.


================================================================================
DEFAULT SYSTEM STAFF & ADMIN TEST ACCOUNTS:
================================================================================
Role                     Username         Password
--------------------------------------------------------------------------------
👑 System Administrator  admin            Royal508501
💼 Counter Cashier 01    cashier1         Cashier@TRB1
⭐ Counter Supervisor   supervisor       Super@TRB2026
🎂 Kitchen Head Chef     chef_prema       Chef@Prema2026
================================================================================
