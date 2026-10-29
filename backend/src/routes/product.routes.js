const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// =========================================================================
// 1. GET MAIN PRODUCT CATEGORIES
// Corresponds to Menu 2.4: Main Categories (/manage-categories) [Screenshot #05]
// =========================================================================
router.get('/categories', async (req, res) => {
    try {
        const query = `
            SELECT main_cat_id, category_name, chef_description, display_order, is_active
            FROM dbo.MainCategories
            WHERE is_active = 1
            ORDER BY display_order ASC, category_name ASC
        `;
        const result = await executeQuery(query);
        res.json({ success: true, categories: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. GET SUB CATEGORIES (Optional filter by main_cat_id)
// Corresponds to Menu 2.5: Sub Categories (/manage-sub-categories) [Screenshot #06]
// =========================================================================
router.get('/subcategories', async (req, res) => {
    try {
        const { main_cat_id } = req.query;
        let query = `
            SELECT s.sub_cat_id, s.main_cat_id, m.category_name AS main_category_name, s.sub_category_name, s.description, s.is_active
            FROM dbo.SubCategories s
            INNER JOIN dbo.MainCategories m ON s.main_cat_id = m.main_cat_id
            WHERE s.is_active = 1
        `;
        const params = [];

        if (main_cat_id) {
            query += ` AND s.main_cat_id = @main_cat_id`;
            params.push({ name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id });
        }

        query += ` ORDER BY s.sub_category_name ASC`;
        const result = await executeQuery(query, params);
        res.json({ success: true, subcategories: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. GET PRODUCTS CATALOG (850+ Items with Fast Autocomplete & Filter)
// Corresponds to Menu 2.3: Manage Product (/add-product) [Screenshot #04]
// & /add-order product dropdowns
// =========================================================================
router.get('/', async (req, res) => {
    try {
        const { main_cat_id, sub_cat_id, search, is_available } = req.query;
        let query = `
            SELECT 
                p.product_id,
                p.product_code,
                p.product_name,
                p.main_cat_id,
                m.category_name AS main_category_name,
                p.sub_cat_id,
                s.sub_category_name,
                p.net_weight,
                p.unit_price,
                p.is_discountable,
                p.is_available,
                p.danupos_item_code,
                p.description
            FROM dbo.Products p
            LEFT JOIN dbo.MainCategories m ON p.main_cat_id = m.main_cat_id
            LEFT JOIN dbo.SubCategories s ON p.sub_cat_id = s.sub_cat_id
            WHERE 1=1
        `;
        const params = [];

        if (main_cat_id) {
            query += ` AND p.main_cat_id = @main_cat_id`;
            params.push({ name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id });
        }
        if (sub_cat_id) {
            query += ` AND p.sub_cat_id = @sub_cat_id`;
            params.push({ name: 'sub_cat_id', type: sql.VarChar(20), value: sub_cat_id });
        }
        if (is_available !== undefined) {
            query += ` AND p.is_available = @is_available`;
            params.push({ name: 'is_available', type: sql.Bit, value: is_available === 'true' || is_available === '1' ? 1 : 0 });
        }
        if (search) {
            query += ` AND (p.product_name LIKE '%' + @search + '%' OR p.product_code LIKE @search + '%' OR p.danupos_item_code LIKE @search + '%')`;
            params.push({ name: 'search', type: sql.NVarChar(100), value: search.trim() });
        }

        query += ` ORDER BY p.product_name ASC`;
        const result = await executeQuery(query, params);
        res.json({
            success: true,
            count: result.recordset.length,
            products: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 4. CREATE PRODUCT
// Corresponds to Menu 2.3: FEED PRODUCT DATA form (/add-product) [Screenshot #04]
// =========================================================================
router.post('/', async (req, res) => {
    try {
        const { main_cat_id, sub_cat_id, product_name, product_code, net_weight, unit_price, is_discountable, description, danupos_item_code } = req.body;

        if (!main_cat_id || !product_name || unit_price === undefined) {
            return res.status(400).json({ success: false, error: 'Main Category, Product Name, and Price are required.' });
        }

        const insertQuery = `
            INSERT INTO dbo.Products (
                main_cat_id, sub_cat_id, product_name, product_code, net_weight, 
                unit_price, is_discountable, is_available, description, danupos_item_code
            )
            OUTPUT INSERTED.product_id, INSERTED.product_name, INSERTED.unit_price
            VALUES (
                @main_cat_id, @sub_cat_id, @product_name, @product_code, @net_weight, 
                @unit_price, @is_discountable, 1, @description, @danupos_item_code
            )
        `;

        const params = [
            { name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id },
            { name: 'sub_cat_id', type: sql.VarChar(20), value: sub_cat_id || null },
            { name: 'product_name', type: sql.NVarChar(200), value: product_name.trim() },
            { name: 'product_code', type: sql.VarChar(50), value: product_code || null },
            { name: 'net_weight', type: sql.VarChar(50), value: net_weight || null },
            { name: 'unit_price', type: sql.Decimal(18, 2), value: parseFloat(unit_price) },
            { name: 'is_discountable', type: sql.Bit, value: is_discountable ? 1 : 0 },
            { name: 'description', type: sql.NVarChar(sql.MAX), value: description || null },
            { name: 'danupos_item_code', type: sql.VarChar(50), value: danupos_item_code || null }
        ];

        const result = await executeQuery(insertQuery, params);
        res.status(201).json({ success: true, product: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

