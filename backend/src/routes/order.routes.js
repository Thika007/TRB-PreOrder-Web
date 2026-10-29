const express = require('express');
const router = express.Router();
const { sql, getPool, executeQuery } = require('../config/db');

// Helper to generate a sequential order number e.g. TRB-20261029-0001
async function generateOrderNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TRB-${dateStr}`;

    const query = `
        SELECT TOP 1 order_number 
        FROM dbo.Orders 
        WHERE order_number LIKE '${prefix}%' 
        ORDER BY order_id DESC
    `;
    const result = await executeQuery(query);

    let nextSeq = 1;
    if (result.recordset.length > 0) {
        const lastOrder = result.recordset[0].order_number;
        const parts = lastOrder.split('-');
        if (parts.length === 3) {
            nextSeq = parseInt(parts[2], 10) + 1;
        }
    }
    return `${prefix}-${String(nextSeq).padStart(4, '0')}`;
}

// =========================================================================
// 1. CREATE PRE-ORDER (Atomic Counter Intake Transaction)
// Corresponds to Menu 3.1: Create Orders (/add-order) [Screenshot #08]
// =========================================================================
router.post('/', async (req, res) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        const {
            customer_id,
            ordered_by,
            delivery_date,
            delivery_time,
            delivery_type,
            delivery_address,
            sub_total,
            discount_amount,
            total_amount,
            advance_amount,
            payment_method,
            items,              // Array of items with cake greeting specifications
            created_by_user_id
        } = req.body;

        if (!customer_id || !delivery_date || !delivery_time || !items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Customer, Delivery date, Delivery time, and Items are required.' });
        }

        const order_number = await generateOrderNumber();
        const total = parseFloat(total_amount) || 0;
        const advance = parseFloat(advance_amount) || 0;
        const balance = total - advance;
        const payment_status = balance <= 0 ? 'Fully Paid' : (advance > 0 ? 'Advance Paid' : 'Unpaid');
        const order_status = 'Pending';

        await transaction.begin();

        // 1. Insert Order Header
        const orderReq = new sql.Request(transaction);
        orderReq.input('order_number', sql.VarChar(50), order_number);
        orderReq.input('customer_id', sql.Int, customer_id);
        orderReq.input('ordered_by', sql.NVarChar(100), ordered_by || null);
        orderReq.input('delivery_date', sql.Date, delivery_date);
        orderReq.input('delivery_time', sql.VarChar(30), delivery_time);
        orderReq.input('delivery_type', sql.VarChar(30), delivery_type || 'Showroom Pickup');
        orderReq.input('delivery_address', sql.NVarChar(500), delivery_address || null);
        orderReq.input('sub_total', sql.Decimal(18, 2), parseFloat(sub_total) || total);
        orderReq.input('discount_amount', sql.Decimal(18, 2), parseFloat(discount_amount) || 0);
        orderReq.input('total_amount', sql.Decimal(18, 2), total);
        orderReq.input('advance_amount', sql.Decimal(18, 2), advance);
        orderReq.input('balance_amount', sql.Decimal(18, 2), balance);
        orderReq.input('order_status', sql.VarChar(30), order_status);
        orderReq.input('payment_status', sql.VarChar(30), payment_status);
        orderReq.input('created_by_user_id', sql.Int, created_by_user_id || 1);

        const orderRes = await orderReq.query(`
            INSERT INTO dbo.Orders (
                order_number, customer_id, ordered_by, delivery_date, delivery_time,
                delivery_type, delivery_address, sub_total, discount_amount, total_amount,
                advance_amount, balance_amount, order_status, payment_status, created_by_user_id
            )
            OUTPUT INSERTED.order_id, INSERTED.order_number
            VALUES (
                @order_number, @customer_id, @ordered_by, @delivery_date, @delivery_time,
                @delivery_type, @delivery_address, @sub_total, @discount_amount, @total_amount,
                @advance_amount, @balance_amount, @order_status, @payment_status, @created_by_user_id
            )
        `);

        const orderId = orderRes.recordset[0].order_id;

        // 2. Insert Order Items & Cake Customization details
        for (const item of items) {
            const itemReq = new sql.Request(transaction);
            itemReq.input('order_id', sql.Int, orderId);
            itemReq.input('product_id', sql.Int, item.product_id);
            itemReq.input('product_name', sql.NVarChar(200), item.product_name);
            itemReq.input('quantity', sql.Decimal(10, 2), item.quantity || 1);
            itemReq.input('unit_price', sql.Decimal(18, 2), item.unit_price);
            itemReq.input('total_price', sql.Decimal(18, 2), item.total_price);
            itemReq.input('item_notes', sql.NVarChar(500), item.item_notes || null);
            
            // Exact trbsys.net Cake Greeting fields:
            itemReq.input('greeting_milestone', sql.VarChar(30), item.greeting_milestone || 'None');
            itemReq.input('greeting_occasion', sql.VarChar(100), item.greeting_occasion || 'None');
            itemReq.input('greeting_icing_text', sql.NVarChar(500), item.greeting_icing_text || null);
            itemReq.input('cake_shape_flavor', sql.VarChar(100), item.cake_shape_flavor || null);
            itemReq.input('cake_colour_theme', sql.VarChar(100), item.cake_colour_theme || null);

            const itemRes = await itemReq.query(`
                INSERT INTO dbo.OrderItems (
                    order_id, product_id, product_name, quantity, unit_price, total_price,
                    item_notes, greeting_milestone, greeting_occasion, greeting_icing_text,
                    cake_shape_flavor, cake_colour_theme
                )
                OUTPUT INSERTED.order_item_id
                VALUES (
                    @order_id, @product_id, @product_name, @quantity, @unit_price, @total_price,
                    @item_notes, @greeting_milestone, @greeting_occasion, @greeting_icing_text,
                    @cake_shape_flavor, @cake_colour_theme
                )
            `);

            const orderItemId = itemRes.recordset[0].order_item_id;

            // 3. Queue in Kitchen Production Worksheet
            const kitchenReq = new sql.Request(transaction);
            kitchenReq.input('order_item_id', sql.Int, orderItemId);
            kitchenReq.input('assigned_chef', sql.NVarChar(100), item.assigned_chef || null);
            kitchenReq.input('scheduled_bake_date', sql.Date, delivery_date);
            kitchenReq.input('delivery_time_slot', sql.VarChar(30), delivery_time);

            await kitchenReq.query(`
                INSERT INTO dbo.KitchenProduction (order_item_id, assigned_chef, scheduled_bake_date, delivery_time_slot)
                VALUES (@order_item_id, @assigned_chef, @scheduled_bake_date, @delivery_time_slot)
            `);
        }

        // 4. Record Initial Payment (Advance Deposit) if paid
        let receiptNo = null;
        if (advance > 0) {
            receiptNo = `RCP-${order_number.replace('TRB-', '')}-01`;
            const payReq = new sql.Request(transaction);
            payReq.input('order_id', sql.Int, orderId);
            payReq.input('receipt_no', sql.VarChar(50), receiptNo);
            payReq.input('payment_type', sql.VarChar(30), 'Advance Deposit');
            payReq.input('payment_method', sql.VarChar(30), payment_method || 'Cash');
            payReq.input('amount_paid', sql.Decimal(18, 2), advance);
            payReq.input('cashier_user_id', sql.Int, created_by_user_id || 1);

            await payReq.query(`
                INSERT INTO dbo.OrderPayments (order_id, receipt_no, payment_type, payment_method, amount_paid, cashier_user_id)
                VALUES (@order_id, @receipt_no, @payment_type, @payment_method, @amount_paid, @cashier_user_id)
            `);
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            order_id: orderId,
            order_number,
            receipt_no: receiptNo,
            total_amount: total,
            advance_amount: advance,
            balance_amount: balance,
            message: 'Order created successfully and scheduled in kitchen production queue.'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Order Creation Transaction Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. GET ORDERS GRID (With Status Tabs, Date Filters & Search)
// Corresponds to Menu 3.2: Manage Orders (/manage_orders) [Screenshots #08, #12]
// =========================================================================
router.get('/', async (req, res) => {
    try {
        const { status, delivery_date, search, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        let whereClause = `WHERE 1=1`;
        const params = [
            { name: 'offset', type: sql.Int, value: offset },
            { name: 'limit', type: sql.Int, value: parseInt(limit, 10) }
        ];

        if (status && status !== 'All') {
            whereClause += ` AND o.order_status = @status`;
            params.push({ name: 'status', type: sql.VarChar(30), value: status });
        }
        if (delivery_date) {
            whereClause += ` AND o.delivery_date = @delivery_date`;
            params.push({ name: 'delivery_date', type: sql.Date, value: delivery_date });
        }
        if (search) {
            whereClause += ` AND (o.order_number LIKE '%' + @search + '%' OR c.mobile LIKE @search + '%' OR c.first_name LIKE '%' + @search + '%')`;
            params.push({ name: 'search', type: sql.NVarChar(100), value: search.trim() });
        }

        const dataQuery = `
            SELECT 
                o.order_id,
                o.order_number,
                o.order_date,
                o.delivery_date,
                o.delivery_time,
                o.delivery_type,
                o.total_amount,
                o.advance_amount,
                o.balance_amount,
                o.order_status,
                o.payment_status,
                c.customer_id,
                c.title,
                c.first_name + ' ' + ISNULL(c.last_name, '') AS customer_name,
                c.mobile AS customer_mobile,
                (SELECT COUNT(*) FROM dbo.OrderItems oi WHERE oi.order_id = o.order_id) AS item_count
            FROM dbo.Orders o
            INNER JOIN dbo.Customers c ON o.customer_id = c.customer_id
            ${whereClause}
            ORDER BY o.delivery_date ASC, o.delivery_time ASC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS total_count FROM dbo.Orders o INNER JOIN dbo.Customers c ON o.customer_id = c.customer_id ${whereClause};
        `;

        const result = await executeQuery(dataQuery, params);
        res.json({
            success: true,
            total: result.recordsets[1][0].total_count,
            page: parseInt(page, 10),
            orders: result.recordsets[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. GET SINGLE ORDER DETAILS (Including Cake Inscriptions & Receipts)
// Used for Order Details Modal & A5 Invoice Printing
// =========================================================================
router.get('/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        const headerQuery = `
            SELECT 
                o.*,
                c.first_name + ' ' + ISNULL(c.last_name, '') AS customer_name,
                c.mobile AS customer_mobile,
                c.landline AS customer_landline,
                c.delivery_address AS customer_profile_address,
                u.full_name AS cashier_name
            FROM dbo.Orders o
            INNER JOIN dbo.Customers c ON o.customer_id = c.customer_id
            LEFT JOIN dbo.Users u ON o.created_by_user_id = u.user_id
            WHERE o.order_id = @orderId
        `;

        const itemsQuery = `
            SELECT 
                oi.*,
                p.product_code,
                p.net_weight,
                kp.assigned_chef,
                kp.production_status
            FROM dbo.OrderItems oi
            INNER JOIN dbo.Products p ON oi.product_id = p.product_id
            LEFT JOIN dbo.KitchenProduction kp ON oi.order_item_id = kp.order_item_id
            WHERE oi.order_id = @orderId
        `;

        const paymentsQuery = `
            SELECT p.*, u.full_name AS cashier_name
            FROM dbo.OrderPayments p
            LEFT JOIN dbo.Users u ON p.cashier_user_id = u.user_id
            WHERE p.order_id = @orderId
            ORDER BY p.payment_date ASC
        `;

        const params = [{ name: 'orderId', type: sql.Int, value: orderId }];

        const [headerRes, itemsRes, paymentsRes] = await Promise.all([
            executeQuery(headerQuery, params),
            executeQuery(itemsQuery, params),
            executeQuery(paymentsQuery, params)
        ]);

        if (headerRes.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found.' });
        }

        res.json({
            success: true,
            order: headerRes.recordset[0],
            items: itemsRes.recordset,
            payments: paymentsRes.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 4. MAKE PAYMENT (Counter Balance Settlement)
// Corresponds to Menu 3.3: Make Payment Modal [Screenshot #08]
// =========================================================================
router.post('/:id/pay', async (req, res) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        const orderId = req.params.id;
        const { amount_paid, payment_method = 'Cash', cashier_user_id = 1, notes } = req.body;
        const paymentAmount = parseFloat(amount_paid);

        if (!paymentAmount || paymentAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Valid payment amount required.' });
        }

        await transaction.begin();

        // 1. Fetch current balance
        const checkReq = new sql.Request(transaction);
        checkReq.input('orderId', sql.Int, orderId);
        const checkRes = await checkReq.query(`
            SELECT order_id, order_number, total_amount, advance_amount, balance_amount, payment_status, order_status
            FROM dbo.Orders WITH (UPDLOCK)
            WHERE order_id = @orderId
        `);

        if (checkRes.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: 'Order not found.' });
        }

        const currentOrder = checkRes.recordset[0];
        const newBalance = Math.max(0, currentOrder.balance_amount - paymentAmount);
        const newAdvance = currentOrder.advance_amount + paymentAmount;
        const newPaymentStatus = newBalance <= 0 ? 'Fully Paid' : 'Advance Paid';
        const newOrderStatus = (currentOrder.order_status === 'Ready' && newBalance <= 0) ? 'Delivered' : currentOrder.order_status;

        // 2. Generate Receipt No
        const receiptNo = `RCP-${currentOrder.order_number.replace('TRB-', '')}-02`;

        // 3. Insert Payment Record
        const payReq = new sql.Request(transaction);
        payReq.input('order_id', sql.Int, orderId);
        payReq.input('receipt_no', sql.VarChar(50), receiptNo);
        payReq.input('payment_type', sql.VarChar(30), newBalance <= 0 ? 'Balance Settlement' : 'Additional Advance');
        payReq.input('payment_method', sql.VarChar(30), payment_method);
        payReq.input('amount_paid', sql.Decimal(18, 2), paymentAmount);
        payReq.input('notes', sql.NVarChar(255), notes || null);
        payReq.input('cashier_user_id', sql.Int, cashier_user_id);

        await payReq.query(`
            INSERT INTO dbo.OrderPayments (order_id, receipt_no, payment_type, payment_method, amount_paid, notes, cashier_user_id)
            VALUES (@order_id, @receipt_no, @payment_type, @payment_method, @amount_paid, @notes, @cashier_user_id)
        `);

        // 4. Update Order Balance & Status
        const updateReq = new sql.Request(transaction);
        updateReq.input('orderId', sql.Int, orderId);
        updateReq.input('advance_amount', sql.Decimal(18, 2), newAdvance);
        updateReq.input('balance_amount', sql.Decimal(18, 2), newBalance);
        updateReq.input('payment_status', sql.VarChar(30), newPaymentStatus);
        updateReq.input('order_status', sql.VarChar(30), newOrderStatus);

        await updateReq.query(`
            UPDATE dbo.Orders
            SET advance_amount = @advance_amount,
                balance_amount = @balance_amount,
                payment_status = @payment_status,
                order_status = @order_status,
                updated_at = GETDATE()
            WHERE order_id = @orderId
        `);

        await transaction.commit();

        res.json({
            success: true,
            receipt_no: receiptNo,
            amount_paid: paymentAmount,
            remaining_balance: newBalance,
            payment_status: newPaymentStatus,
            order_status: newOrderStatus,
            message: 'Payment recorded and order balance settled.'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Make Payment Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

