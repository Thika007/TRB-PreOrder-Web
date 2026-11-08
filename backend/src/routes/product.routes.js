const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// Helper to record audit logs
async function logAuditEvent(actionType, userId, description, ipAddress) {
    try {
        const query = `
            INSERT INTO dbo.AuditLogs (action_type, user_id, description, ip_address, log_time)
            VALUES (@actionType, @userId, @description, @ipAddress, GETDATE())
        `;
        const params = [
            { name: 'actionType', type: sql.VarChar(50), value: actionType },
            { name: 'userId', type: sql.Int, value: userId || null },
            { name: 'description', type: sql.NVarChar(sql.MAX), value: description },
            { name: 'ipAddress', type: sql.VarChar(50), value: ipAddress || '127.0.0.1' }
        ];
        await executeQuery(query, params);
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
}

// Helper to calculate the next MCAT ID (e.g. MCAT9)
async function getNextCategoryId() {
    const res = await executeQuery('SELECT main_cat_id FROM dbo.MainCategories');
    let maxNum = 0;
    (res.recordset || []).forEach(r => {
        const match = (r.main_cat_id || '').match(/MCAT(\d+)/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    return `MCAT${maxNum + 1}`;
}

// =========================================================================
// 1. GET NEXT MAIN CATEGORY ID (e.g. MCAT9)
// =========================================================================
router.get('/categories/next-id', async (req, res) => {
    try {
        const nextId = await getNextCategoryId();
        res.json({ success: true, next_cat_id: nextId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. GET MAIN PRODUCT CATEGORIES
// Corresponds to Menu 2.4: Main Categories (/manage-categories) [Screenshot #05]
// =========================================================================
router.get('/categories', async (req, res) => {
    try {
        const includeInactive = req.query.include_inactive === 'true' || req.query.all === 'true';
        let query = `
            SELECT main_cat_id, category_name, chef_description, display_order, is_active, created_at
            FROM dbo.MainCategories
        `;
        if (!includeInactive) {
            query += ` WHERE is_active = 1`;
        }
        query += ` ORDER BY display_order ASC, main_cat_id ASC`;
        const result = await executeQuery(query);

        // Sort numerically by MCAT number
        const sorted = (result.recordset || []).sort((a, b) => {
            const numA = parseInt((a.main_cat_id || '').replace(/\D/g, ''), 10) || 0;
            const numB = parseInt((b.main_cat_id || '').replace(/\D/g, ''), 10) || 0;
            return numA - numB;
        });

        res.json({ success: true, count: sorted.length, categories: sorted });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. CREATE NEW MAIN CATEGORY
// Corresponds to FEED MAIN CATEGORIES form (/manage-categories)
// =========================================================================
router.post('/categories', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        let { main_cat_id, category_name, chef_description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({ success: false, error: 'Main Category name is required.' });
        }

        const cleanName = category_name.trim();
        const cleanDesc = chef_description && chef_description.trim() ? chef_description.trim() : null;

        if (!main_cat_id || !main_cat_id.trim()) {
            main_cat_id = await getNextCategoryId();
        } else {
            main_cat_id = main_cat_id.trim().toUpperCase();
        }

        // Check duplicate ID
        const checkId = await executeQuery(
            'SELECT main_cat_id FROM dbo.MainCategories WHERE UPPER(main_cat_id) = @id',
            [{ name: 'id', type: sql.VarChar(20), value: main_cat_id }]
        );
        if (checkId.recordset.length > 0) {
            return res.status(409).json({ success: false, error: `Category ID "${main_cat_id}" already exists.` });
        }

        // Calculate next display_order
        const orderRes = await executeQuery('SELECT ISNULL(MAX(display_order), 0) + 1 AS next_order FROM dbo.MainCategories');
        const nextOrder = orderRes.recordset[0]?.next_order || 1;

        const insertQuery = `
            INSERT INTO dbo.MainCategories (main_cat_id, category_name, chef_description, display_order, is_active, created_at)
            OUTPUT INSERTED.*
            VALUES (@main_cat_id, @category_name, @chef_description, @display_order, 1, GETDATE())
        `;
        const params = [
            { name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id },
            { name: 'category_name', type: sql.VarChar(100), value: cleanName },
            { name: 'chef_description', type: sql.NVarChar(200), value: cleanDesc },
            { name: 'display_order', type: sql.Int, value: nextOrder }
        ];

        const result = await executeQuery(insertQuery, params);
        const newCategory = result.recordset[0];

        await logAuditEvent(
            'CATEGORY_CREATED', 
            null, 
            `Created Main Category "${cleanName}" (${main_cat_id}) with supervisor/chef "${cleanDesc || 'None'}"`, 
            clientIp
        );

        console.log(`✅ [Category Master] New category registered: ${main_cat_id} - ${cleanName}`);

        res.status(201).json({
            success: true,
            message: `Main Category "${cleanName}" (${main_cat_id}) created successfully.`,
            category: newCategory
        });
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 4. UPDATE EXISTING MAIN CATEGORY
// =========================================================================
router.put('/categories/:id', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        const catId = req.params.id.trim();
        const { category_name, chef_description, is_active } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({ success: false, error: 'Main Category name is required.' });
        }

        const cleanName = category_name.trim();
        const cleanDesc = chef_description && chef_description.trim() ? chef_description.trim() : null;

        const updateQuery = `
            UPDATE dbo.MainCategories
            SET category_name = @category_name,
                chef_description = @chef_description,
                is_active = ISNULL(@is_active, is_active)
            OUTPUT INSERTED.*
            WHERE main_cat_id = @id
        `;
        const params = [
            { name: 'category_name', type: sql.VarChar(100), value: cleanName },
            { name: 'chef_description', type: sql.NVarChar(200), value: cleanDesc },
            { name: 'is_active', type: sql.Bit, value: is_active !== undefined ? (is_active ? 1 : 0) : null },
            { name: 'id', type: sql.VarChar(20), value: catId }
        ];

        const result = await executeQuery(updateQuery, params);
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, error: `Category "${catId}" not found.` });
        }

        await logAuditEvent(
            'CATEGORY_UPDATED', 
            null, 
            `Updated Main Category "${catId}" -> Name: "${cleanName}", Chef/Supervisor: "${cleanDesc || 'None'}"`, 
            clientIp
        );

        res.json({
            success: true,
            message: `Category "${catId}" updated successfully.`,
            category: result.recordset[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 5. DELETE / DEACTIVATE MAIN CATEGORY
// =========================================================================
router.delete('/categories/:id', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        const catId = req.params.id.trim();

        // Check if subcategories exist
        const subCheck = await executeQuery('SELECT COUNT(*) AS cnt FROM dbo.SubCategories WHERE main_cat_id = @id', [
            { name: 'id', type: sql.VarChar(20), value: catId }
        ]);
        const subCount = subCheck.recordset[0]?.cnt || 0;

        // Check if products exist
        const prodCheck = await executeQuery('SELECT COUNT(*) AS cnt FROM dbo.Products WHERE main_cat_id = @id', [
            { name: 'id', type: sql.VarChar(20), value: catId }
        ]);
        const prodCount = prodCheck.recordset[0]?.cnt || 0;

        if (subCount > 0 || prodCount > 0) {
            // Soft-deactivate to preserve database relations
            await executeQuery('UPDATE dbo.MainCategories SET is_active = 0 WHERE main_cat_id = @id', [
                { name: 'id', type: sql.VarChar(20), value: catId }
            ]);
            await logAuditEvent(
                'CATEGORY_DEACTIVATED', 
                null, 
                `Deactivated category "${catId}" (Contains ${subCount} subcategories and ${prodCount} products)`, 
                clientIp
            );

            return res.json({
                success: true,
                message: `Category "${catId}" is associated with ${subCount} subcategory items and ${prodCount} products. Category deactivated instead of permanent deletion.`
            });
        }

        // Hard delete if clean
        await executeQuery('DELETE FROM dbo.MainCategories WHERE main_cat_id = @id', [
            { name: 'id', type: sql.VarChar(20), value: catId }
        ]);
        await logAuditEvent('CATEGORY_DELETED', null, `Permanently removed category "${catId}"`, clientIp);

        res.json({
            success: true,
            message: `Category "${catId}" permanently removed.`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper to calculate the next SCAT ID (e.g. SCAT71)
async function getNextSubCategoryId() {
    const res = await executeQuery('SELECT sub_cat_id FROM dbo.SubCategories');
    let maxNum = 0;
    (res.recordset || []).forEach(r => {
        const match = (r.sub_cat_id || '').match(/SCAT(\d+)/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    return `SCAT${maxNum + 1}`;
}

// =========================================================================
// 6. GET NEXT SUB CATEGORY ID (e.g. SCAT71)
// =========================================================================
router.get('/subcategories/next-id', async (req, res) => {
    try {
        const nextId = await getNextSubCategoryId();
        res.json({ success: true, next_sub_cat_id: nextId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 7. GET SUB CATEGORIES (Optional filter by main_cat_id)
// Corresponds to Menu 2.5: Sub Categories (/manage-sub-categories) [Screenshot #06]
// =========================================================================
router.get('/subcategories', async (req, res) => {
    try {
        const { main_cat_id, all } = req.query;
        let query = `
            SELECT 
                s.sub_cat_id, 
                s.main_cat_id, 
                m.category_name AS main_category_name, 
                s.sub_category_name, 
                s.description, 
                s.is_active,
                s.created_at
            FROM dbo.SubCategories s
            INNER JOIN dbo.MainCategories m ON s.main_cat_id = m.main_cat_id
            WHERE 1=1
        `;
        const params = [];

        if (all !== 'true') {
            query += ` AND s.is_active = 1`;
        }

        if (main_cat_id) {
            query += ` AND s.main_cat_id = @main_cat_id`;
            params.push({ name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id });
        }

        const result = await executeQuery(query, params);

        // Sort naturally by sub_cat_id number
        const sorted = (result.recordset || []).sort((a, b) => {
            const numA = parseInt((a.sub_cat_id || '').replace(/\D/g, ''), 10) || 0;
            const numB = parseInt((b.sub_cat_id || '').replace(/\D/g, ''), 10) || 0;
            return numA - numB;
        });

        res.json({ success: true, count: sorted.length, subcategories: sorted });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 8. CREATE NEW SUB CATEGORY
// Corresponds to FEED SUB CATEGORIES form (/manage-sub-categories)
// =========================================================================
router.post('/subcategories', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        let { sub_cat_id, main_cat_id, sub_category_name, description } = req.body;

        if (!main_cat_id || !main_cat_id.trim()) {
            return res.status(400).json({ success: false, error: 'Main Category is required.' });
        }
        if (!sub_category_name || !sub_category_name.trim()) {
            return res.status(400).json({ success: false, error: 'Sub Category name is required.' });
        }

        const cleanName = sub_category_name.trim();
        const cleanDesc = description && description.trim() ? description.trim() : null;

        if (!sub_cat_id || !sub_cat_id.trim()) {
            sub_cat_id = await getNextSubCategoryId();
        } else {
            sub_cat_id = sub_cat_id.trim().toUpperCase();
        }

        // Verify main_cat_id exists
        const mainCatCheck = await executeQuery('SELECT category_name FROM dbo.MainCategories WHERE main_cat_id = @id', [
            { name: 'id', type: sql.VarChar(20), value: main_cat_id }
        ]);
        if (mainCatCheck.recordset.length === 0) {
            return res.status(400).json({ success: false, error: `Main Category "${main_cat_id}" does not exist.` });
        }
        const mainCategoryName = mainCatCheck.recordset[0].category_name;

        // Check duplicate ID
        const checkId = await executeQuery(
            'SELECT sub_cat_id FROM dbo.SubCategories WHERE UPPER(sub_cat_id) = @id',
            [{ name: 'id', type: sql.VarChar(20), value: sub_cat_id }]
        );
        if (checkId.recordset.length > 0) {
            return res.status(409).json({ success: false, error: `Sub Category ID "${sub_cat_id}" already exists.` });
        }

        const insertQuery = `
            INSERT INTO dbo.SubCategories (sub_cat_id, main_cat_id, sub_category_name, description, is_active, created_at)
            OUTPUT INSERTED.*
            VALUES (@sub_cat_id, @main_cat_id, @sub_category_name, @description, 1, GETDATE())
        `;
        const params = [
            { name: 'sub_cat_id', type: sql.VarChar(20), value: sub_cat_id },
            { name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id },
            { name: 'sub_category_name', type: sql.VarChar(100), value: cleanName },
            { name: 'description', type: sql.NVarChar(255), value: cleanDesc }
        ];

        const result = await executeQuery(insertQuery, params);
        const newSubCat = result.recordset[0];
        newSubCat.main_category_name = mainCategoryName;

        await logAuditEvent(
            'SUBCATEGORY_CREATED',
            null,
            `Created Sub Category "${cleanName}" (${sub_cat_id}) under Main Category "${mainCategoryName}" (${main_cat_id})`,
            clientIp
        );

        console.log(`✅ [SubCategory Master] New subcategory registered: ${sub_cat_id} - ${cleanName} [${mainCategoryName}]`);

        res.status(201).json({
            success: true,
            message: `Sub Category "${cleanName}" (${sub_cat_id}) created successfully.`,
            subcategory: newSubCat
        });
    } catch (error) {
        console.error('Create SubCategory Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 9. UPDATE EXISTING SUB CATEGORY
// =========================================================================
router.put('/subcategories/:id', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        const subCatId = req.params.id.trim();
        const { main_cat_id, sub_category_name, description, is_active } = req.body;

        if (!main_cat_id || !main_cat_id.trim()) {
            return res.status(400).json({ success: false, error: 'Main Category is required.' });
        }
        if (!sub_category_name || !sub_category_name.trim()) {
            return res.status(400).json({ success: false, error: 'Sub Category name is required.' });
        }

        const cleanName = sub_category_name.trim();
        const cleanDesc = description && description.trim() ? description.trim() : null;

        const updateQuery = `
            UPDATE dbo.SubCategories
            SET main_cat_id = @main_cat_id,
                sub_category_name = @sub_category_name,
                description = @description,
                is_active = ISNULL(@is_active, is_active)
            OUTPUT INSERTED.*
            WHERE sub_cat_id = @id
        `;
        const params = [
            { name: 'main_cat_id', type: sql.VarChar(20), value: main_cat_id.trim() },
            { name: 'sub_category_name', type: sql.VarChar(100), value: cleanName },
            { name: 'description', type: sql.NVarChar(255), value: cleanDesc },
            { name: 'is_active', type: sql.Bit, value: is_active !== undefined ? (is_active ? 1 : 0) : null },
            { name: 'id', type: sql.VarChar(20), value: subCatId }
        ];

        const result = await executeQuery(updateQuery, params);
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, error: `Sub Category "${subCatId}" not found.` });
        }

        await logAuditEvent(
            'SUBCATEGORY_UPDATED',
            null,
            `Updated Sub Category "${subCatId}" -> Name: "${cleanName}", MainCat: "${main_cat_id}"`,
            clientIp
        );

        res.json({
            success: true,
            message: `Sub Category "${subCatId}" updated successfully.`,
            subcategory: result.recordset[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 10. DELETE / DEACTIVATE SUB CATEGORY
// =========================================================================
router.delete('/subcategories/:id', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        const subCatId = req.params.id.trim();

        // Check if products reference this subcategory
        const prodCheck = await executeQuery('SELECT COUNT(*) AS cnt FROM dbo.Products WHERE sub_cat_id = @id', [
            { name: 'id', type: sql.VarChar(20), value: subCatId }
        ]);
        const prodCount = prodCheck.recordset[0]?.cnt || 0;

        if (prodCount > 0) {
            // Soft deactivate
            await executeQuery('UPDATE dbo.SubCategories SET is_active = 0 WHERE sub_cat_id = @id', [
                { name: 'id', type: sql.VarChar(20), value: subCatId }
            ]);
            await logAuditEvent(
                'SUBCATEGORY_DEACTIVATED',
                null,
                `Deactivated Sub Category "${subCatId}" (Contains ${prodCount} products)`,
                clientIp
            );
            return res.json({
                success: true,
                message: `Sub Category "${subCatId}" is associated with ${prodCount} products. Deactivated instead of permanent deletion.`
            });
        }

        // Hard delete if clean
        await executeQuery('DELETE FROM dbo.SubCategories WHERE sub_cat_id = @id', [
            { name: 'id', type: sql.VarChar(20), value: subCatId }
        ]);
        await logAuditEvent('SUBCATEGORY_DELETED', null, `Permanently removed Sub Category "${subCatId}"`, clientIp);

        res.json({
            success: true,
            message: `Sub Category "${subCatId}" permanently removed.`
        });
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

