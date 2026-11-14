const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// =========================================================================
// 1. GET REAL-TIME DASHBOARD KPI METRICS
// Queries MSSQL directly for live Current Month & Prior Month operations
// =========================================================================
router.get('/stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                -- Current Month Operations (Active Cycle)
                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Orders 
                    WHERE MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE())
                ), 0) AS this_month_total_orders,

                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Orders 
                    WHERE order_status = 'Pending' 
                      AND MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE())
                ), 0) AS this_month_pending_orders,

                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Orders 
                    WHERE order_status = 'Cancelled' 
                      AND MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE())
                ), 0) AS this_month_cancelled_orders,

                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Orders 
                    WHERE order_status = 'Delivered' 
                      AND MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE())
                ), 0) AS this_month_delivered_orders,

                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Customers 
                    WHERE MONTH(created_at) = MONTH(GETDATE()) 
                      AND YEAR(created_at) = YEAR(GETDATE())
                ), 0) AS this_month_new_customers,

                ISNULL((
                    SELECT SUM(total_amount) 
                    FROM dbo.Orders 
                    WHERE MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE()) 
                      AND order_status != 'Cancelled'
                ), 0) AS this_month_total_revenue,

                ISNULL((
                    SELECT SUM(advance_amount) 
                    FROM dbo.Orders 
                    WHERE MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE()) 
                      AND order_status != 'Cancelled'
                ), 0) AS this_month_advance_collected,

                ISNULL((
                    SELECT SUM(balance_amount) 
                    FROM dbo.Orders 
                    WHERE MONTH(order_date) = MONTH(GETDATE()) 
                      AND YEAR(order_date) = YEAR(GETDATE()) 
                      AND order_status != 'Cancelled'
                ), 0) AS this_month_balance_due,
                
                -- Prior Month Benchmark (Closed Cycle)
                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Orders 
                    WHERE MONTH(order_date) = MONTH(DATEADD(month, -1, GETDATE())) 
                      AND YEAR(order_date) = YEAR(DATEADD(month, -1, GETDATE()))
                ), 0) AS last_month_total_orders,

                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Orders 
                    WHERE order_status = 'Pending' 
                      AND MONTH(order_date) = MONTH(DATEADD(month, -1, GETDATE())) 
                      AND YEAR(order_date) = YEAR(DATEADD(month, -1, GETDATE()))
                ), 0) AS last_month_pending_orders,

                ISNULL((
                    SELECT COUNT(*) 
                    FROM dbo.Customers 
                    WHERE MONTH(created_at) = MONTH(DATEADD(month, -1, GETDATE())) 
                      AND YEAR(created_at) = YEAR(DATEADD(month, -1, GETDATE()))
                ), 0) AS last_month_new_customers,

                ISNULL((
                    SELECT SUM(total_amount) 
                    FROM dbo.Orders 
                    WHERE MONTH(order_date) = MONTH(DATEADD(month, -1, GETDATE())) 
                      AND YEAR(order_date) = YEAR(DATEADD(month, -1, GETDATE())) 
                      AND order_status != 'Cancelled'
                ), 0) AS last_month_total_revenue,

                -- Lifetime Database Aggregates
                ISNULL((SELECT COUNT(*) FROM dbo.Orders), 0) AS all_time_orders,
                ISNULL((SELECT COUNT(*) FROM dbo.Orders WHERE order_status = 'Pending'), 0) AS all_time_pending,
                ISNULL((SELECT COUNT(*) FROM dbo.Customers), 0) AS all_time_customers
        `;

        const result = await executeQuery(query);
        const row = result.recordset[0] || {};

        res.json({
            success: true,
            server_time: new Date(),
            stats: {
                thisMonth: {
                    totalOrders: Number(row.this_month_total_orders || 0),
                    pendingOrders: Number(row.this_month_pending_orders || 0),
                    cancelledOrders: Number(row.this_month_cancelled_orders || 0),
                    deliveredOrders: Number(row.this_month_delivered_orders || 0),
                    newCustomers: Number(row.this_month_new_customers || 0),
                    totalRevenue: parseFloat(row.this_month_total_revenue || 0),
                    advanceCollected: parseFloat(row.this_month_advance_collected || 0),
                    balanceDue: parseFloat(row.this_month_balance_due || 0)
                },
                lastMonth: {
                    totalOrders: Number(row.last_month_total_orders || 0),
                    pendingOrders: Number(row.last_month_pending_orders || 0),
                    newCustomers: Number(row.last_month_new_customers || 0),
                    totalRevenue: parseFloat(row.last_month_total_revenue || 0)
                },
                allTime: {
                    totalOrders: Number(row.all_time_orders || 0),
                    pendingOrders: Number(row.all_time_pending || 0),
                    totalCustomers: Number(row.all_time_customers || 0)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. GET RECENT SHOWROOM ORDERS (With full customer & item details)
// =========================================================================
router.get('/recent-orders', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const query = `
            SELECT TOP (@limit)
                o.order_id,
                o.order_number,
                o.order_date,
                o.delivery_date,
                o.delivery_time,
                o.delivery_type,
                o.delivery_address,
                o.sub_total,
                o.discount_amount,
                o.total_amount,
                o.advance_amount,
                o.balance_amount,
                o.order_status,
                o.payment_status,
                c.customer_id,
                c.title,
                c.first_name + ' ' + ISNULL(c.last_name, '') AS customer_name,
                c.mobile AS customer_mobile,
                (SELECT COUNT(*) FROM dbo.OrderItems oi WHERE oi.order_id = o.order_id) AS item_count,
                ISNULL((
                    SELECT STRING_AGG(
                        oi.product_name + ' - ' + 
                        CASE 
                            WHEN oi.quantity = FLOOR(oi.quantity) THEN CAST(CAST(oi.quantity AS INT) AS VARCHAR(20))
                            ELSE CAST(oi.quantity AS VARCHAR(20))
                        END, 
                        ', '
                    ) 
                    FROM dbo.OrderItems oi 
                    WHERE oi.order_id = o.order_id
                ), '') AS items_summary
            FROM dbo.Orders o
            LEFT JOIN dbo.Customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_id DESC
        `;
        const result = await executeQuery(query, [{ name: 'limit', type: sql.Int, value: limit }]);
        res.json({
            success: true,
            count: result.recordset.length,
            orders: result.recordset
        });
    } catch (error) {
        console.error('Error fetching recent orders for dashboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
