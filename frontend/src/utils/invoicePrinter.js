/**
 * Direct Invoice & Thermal Receipt Printer for The Royal Bakery POS
 * Prints cleanly via a hidden iframe (no page screenshot artifacts, no second confirmation modal).
 * Supports:
 *   - mode: 'a5'      -> A5 Invoice layout
 *   - mode: 'receipt' -> 80mm Thermal POS Receipt layout
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney(val) {
  const num = parseFloat(val || 0);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatInvoiceDate(dateVal) {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) return trimmed;
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return trimmed;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

function formatItemDescription(item) {
  const parts = [];
  if (item.item_notes) parts.push(item.item_notes);
  const greetingParts = [];
  if (item.greeting_occasion && item.greeting_occasion !== 'None') greetingParts.push(item.greeting_occasion);
  if (item.greeting_milestone && item.greeting_milestone !== 'None') greetingParts.push(item.greeting_milestone);
  if (item.greeting_info2) greetingParts.push(`"${item.greeting_info2}"`);
  if (greetingParts.length > 0) parts.push(greetingParts.join(' '));
  return parts.join(' - ');
}

function buildA5Html(order, items, payments) {
  const custName = (order.customer_name || '').trim() || '-';
  const address = (order.delivery_address || order.customer_profile_address || '').trim();
  const mobile = (order.customer_mobile || '').trim();
  const invNo = order.order_number || `INV-${order.order_id}`;
  const orderDate = formatInvoiceDate(order.order_date || order.created_at);
  const enterBy = order.ordered_by || order.cashier_name || 'Admin';
  const deliveryDate = formatInvoiceDate(order.delivery_date);
  const deliveryTime = order.delivery_time || '';

  const subTotal = parseFloat(order.sub_total || order.total_amount || 0);
  const discountPct = parseFloat(order.discount_percent || 0);
  const discountAmt = parseFloat(order.discount_amount || 0);
  const serviceCharge = parseFloat(order.service_charge || 0);
  const deliveryCharge = parseFloat(order.delivery_charge || 0);
  const afterDiscount = Math.max(0, subTotal - discountAmt);
  const totalAmount = parseFloat(order.total_amount || (afterDiscount + serviceCharge + deliveryCharge));
  const advanceAmount = parseFloat(order.advance_amount || 0);
  const balanceAmount = parseFloat(order.balance_amount !== undefined ? order.balance_amount : Math.max(0, totalAmount - advanceAmount));
  const payMethod = (payments && payments.length > 0 && payments[0].payment_method)
    ? payments[0].payment_method
    : 'Cash';

  const serviceChargeRow = serviceCharge > 0 ? `
      <tr class="summary-row">
        <td colspan="4">Add-Service Charge</td>
        <td class="col-num">${formatMoney(serviceCharge)}</td>
      </tr>` : '';

  const deliveryChargeRow = deliveryCharge > 0 ? `
      <tr class="summary-row">
        <td colspan="4">Add-Delivery Charge</td>
        <td class="col-num">${formatMoney(deliveryCharge)}</td>
      </tr>` : '';

  const itemRowsHtml = (items && items.length > 0)
    ? items.map(item => `
        <tr>
          <td class="col-item">${escapeHtml(item.product_name)}</td>
          <td class="col-desc">${escapeHtml(formatItemDescription(item))}</td>
          <td class="col-num">${formatMoney(item.unit_price)}</td>
          <td class="col-qty">${escapeHtml(item.quantity)}</td>
          <td class="col-num">${formatMoney(item.total_price)}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td class="col-item">${escapeHtml(order.items_summary || 'Bakery Pre-Order Items')}</td>
          <td class="col-desc"></td>
          <td class="col-num">${formatMoney(totalAmount)}</td>
          <td class="col-qty">1</td>
          <td class="col-num">${formatMoney(totalAmount)}</td>
        </tr>
      `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice - ${escapeHtml(invNo)}</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 8mm 10mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      margin: 0;
      padding: 4px 6px;
      font-size: 11.5px;
      line-height: 1.4;
      background: #fff;
    }
    .vat-line {
      font-size: 11px;
      margin-bottom: 6px;
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .header p {
      margin: 2px 0;
      font-size: 11px;
    }
    .invoice-title {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      margin: 8px 0 12px 0;
      letter-spacing: 0.5px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 11.5px;
    }
    .meta-table td {
      padding: 2.5px 4px;
      vertical-align: top;
    }
    .meta-label {
      width: 19%;
      white-space: nowrap;
    }
    .meta-val {
      width: 31%;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 11.5px;
    }
    .items-table thead th {
      background-color: #e5e7eb;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      padding: 6px 6px;
      font-weight: 700;
      border-bottom: 1px solid #9ca3af;
      text-align: left;
    }
    .items-table thead th.col-num,
    .items-table thead th.col-qty {
      text-align: right;
    }
    .items-table tbody td {
      padding: 6px 6px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    .col-item { width: 32%; }
    .col-desc { width: 30%; color: #333; font-size: 10.5px; }
    .col-num { text-align: right; white-space: nowrap; width: 14%; }
    .col-qty { text-align: right; white-space: nowrap; width: 10%; }
    .summary-row td {
      padding: 5px 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    .subtotal-line {
      border-top: 1px solid #111 !important;
      font-weight: 600;
    }
    .balance-val {
      font-weight: 700;
      border-bottom: 3px double #111 !important;
    }
    .divider {
      border-top: 1px solid #cbd5e1;
      margin-top: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 11px;
    }
    .footer p {
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div class="vat-line">V.A.T No: 409010172-7000</div>

  <div class="header">
    <h1>The Royal Bakery</h1>
    <p>No # 202, Galle Road, Colombo 06</p>
    <p>Hotline - 011-2588476, 011-2500991, 011-4341542, Fax: 011-2523176</p>
  </div>

  <div class="invoice-title">INVOICE</div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Cust. Name:</td>
      <td class="meta-val">${escapeHtml(custName)}</td>
      <td class="meta-label">Inv. No:</td>
      <td class="meta-val">${escapeHtml(invNo)}</td>
    </tr>
    <tr>
      <td class="meta-label">Address :</td>
      <td class="meta-val">${escapeHtml(address)}</td>
      <td class="meta-label">Order Date :</td>
      <td class="meta-val">${escapeHtml(orderDate)}</td>
    </tr>
    <tr>
      <td class="meta-label">Mobile :</td>
      <td class="meta-val">${escapeHtml(mobile)}</td>
      <td class="meta-label">Enter By :</td>
      <td class="meta-val">${escapeHtml(enterBy)}</td>
    </tr>
    <tr>
      <td class="meta-label">Delivery Date :</td>
      <td class="meta-val">${escapeHtml(deliveryDate)}</td>
      <td class="meta-label"></td>
      <td class="meta-val"></td>
    </tr>
    <tr>
      <td class="meta-label">Delivery Time :</td>
      <td class="meta-val">${escapeHtml(deliveryTime)}</td>
      <td class="meta-label"></td>
      <td class="meta-val"></td>
    </tr>
  </table>

  <table class="items-table">
    <thead>
      <tr>
        <th class="col-item">Item</th>
        <th class="col-desc">Description</th>
        <th class="col-num">Price</th>
        <th class="col-qty">Qty</th>
        <th class="col-num">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRowsHtml}
      <tr class="summary-row">
        <td colspan="4"></td>
        <td class="col-num subtotal-line">${formatMoney(subTotal)}</td>
      </tr>
      <tr class="summary-row">
        <td colspan="4">Less-Discount ${discountPct.toFixed(2)}%</td>
        <td class="col-num">${formatMoney(discountAmt)}</td>
      </tr>
      <tr class="summary-row">
        <td colspan="4"></td>
        <td class="col-num subtotal-line">${formatMoney(afterDiscount)}</td>
      </tr>
      ${serviceChargeRow}
      ${deliveryChargeRow}
      <tr class="summary-row">
        <td colspan="4">Total</td>
        <td class="col-num subtotal-line">${formatMoney(totalAmount)}</td>
      </tr>
      <tr class="summary-row">
        <td colspan="4">Less-Advance payment (${escapeHtml(payMethod)})</td>
        <td class="col-num">${formatMoney(advanceAmount)}</td>
      </tr>
      <tr class="summary-row">
        <td colspan="4">Balance payment:</td>
        <td class="col-num balance-val">${formatMoney(balanceAmount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="divider"></div>

  <div class="footer">
    <p>THANK YOU PLEASE COME AGAIN !</p>
  </div>
</body>
</html>`;
}

function buildReceiptHtml(order, items, payments) {
  const custName = (order.customer_name || '').trim() || '-';
  const address = (order.delivery_address || order.customer_profile_address || '').trim();
  const mobile = (order.customer_mobile || '').trim();
  const invNo = order.order_number || `INV-${order.order_id}`;
  const orderDate = formatInvoiceDate(order.order_date || order.created_at);
  const invoicedBy = order.ordered_by || order.cashier_name || 'Admin';
  const deliveryDate = formatInvoiceDate(order.delivery_date);
  const deliveryTime = formatTime12h(order.delivery_time);

  const discountAmt = parseFloat(order.discount_amount || 0);
  const serviceCharge = parseFloat(order.service_charge || 0);
  const deliveryCharge = parseFloat(order.delivery_charge || 0);
  const totalAmount = parseFloat(order.total_amount || 0);
  const advanceAmount = parseFloat(order.advance_amount || 0);
  const balanceAmount = parseFloat(order.balance_amount !== undefined ? order.balance_amount : Math.max(0, totalAmount - advanceAmount));
  const payMethod = (payments && payments.length > 0 && payments[0].payment_method)
    ? payments[0].payment_method
    : 'Cash';

  const receiptExtrasHtml = [
    discountAmt > 0 ? `<tr><td colspan="4">Less-Discount</td><td class="num-col">-${formatMoney(discountAmt)}</td></tr>` : '',
    serviceCharge > 0 ? `<tr><td colspan="4">Service Charge</td><td class="num-col">${formatMoney(serviceCharge)}</td></tr>` : '',
    deliveryCharge > 0 ? `<tr><td colspan="4">Delivery Charge</td><td class="num-col">${formatMoney(deliveryCharge)}</td></tr>` : ''
  ].join('');

  const itemRowsHtml = (items && items.length > 0)
    ? items.map(item => `
        <tr>
          <td>${escapeHtml(item.product_name)}</td>
          <td class="desc-col">${escapeHtml(formatItemDescription(item))}</td>
          <td class="num-col">${escapeHtml(item.quantity)}</td>
          <td class="num-col">${formatMoney(item.unit_price)}</td>
          <td class="num-col">${formatMoney(item.total_price)}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td>${escapeHtml(order.items_summary || 'Bakery Pre-Order')}</td>
          <td class="desc-col"></td>
          <td class="num-col">1</td>
          <td class="num-col">${formatMoney(totalAmount)}</td>
          <td class="num-col">${formatMoney(totalAmount)}</td>
        </tr>
      `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Receipt - ${escapeHtml(invNo)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 2mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      color: #000;
      margin: 0 auto;
      padding: 4px;
      width: 76mm;
      font-size: 11px;
      line-height: 1.35;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 8px;
    }
    .header h1 {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .header p {
      margin: 1px 0;
      font-size: 10.5px;
    }
    .invoice-title {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      margin: 6px 0 8px 0;
      letter-spacing: 0.5px;
    }
    .field-block {
      margin-bottom: 5px;
    }
    .field-label {
      font-weight: 700;
      padding-left: 14px;
    }
    .field-val {
      font-size: 11.5px;
      padding-left: 2px;
      min-height: 14px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 10.5px;
    }
    .items-table thead th {
      background-color: #e5e7eb;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      padding: 4px 3px;
      font-weight: 700;
      border-bottom: 1px solid #333;
      text-align: left;
    }
    .items-table thead th.num-col {
      text-align: right;
    }
    .items-table tbody td {
      padding: 3.5px 3px;
      vertical-align: top;
    }
    .desc-col {
      font-size: 9.5px;
    }
    .num-col {
      text-align: right;
      white-space: nowrap;
    }
    .total-top {
      border-top: 1px solid #000;
    }
    .balance-val {
      font-weight: 700;
      border-top: 1px solid #000;
      border-bottom: 3px double #000;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 10.5px;
      text-align: center;
    }
    .sig-box {
      width: 46%;
      border-top: 1px solid #000;
      padding-top: 3px;
    }
    .footer {
      text-align: center;
      margin-top: 14px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>The Royal Bakery</h1>
    <p>No: 202, Galle Road, Colombo 06.</p>
    <p>011-2588476, 011-2500991, 011-4341642</p>
  </div>

  <div class="invoice-title">INVOICE</div>

  <div class="field-block">
    <div class="field-label">Name:</div>
    <div class="field-val">${escapeHtml(custName)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Inv. No:</div>
    <div class="field-val">${escapeHtml(invNo)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Address :</div>
    <div class="field-val">${escapeHtml(address)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Order Date :</div>
    <div class="field-val">${escapeHtml(orderDate)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Mobile :</div>
    <div class="field-val">${escapeHtml(mobile)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Invoiced By :</div>
    <div class="field-val">${escapeHtml(invoicedBy)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Delivery Date :</div>
    <div class="field-val">${escapeHtml(deliveryDate)}</div>
  </div>
  <div class="field-block">
    <div class="field-label">Delivery Time :</div>
    <div class="field-val">${escapeHtml(deliveryTime)}</div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th class="num-col">Qty</th>
        <th class="num-col">Price</th>
        <th class="num-col">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRowsHtml}
      ${receiptExtrasHtml}
      <tr>
        <td colspan="4">Total</td>
        <td class="num-col total-top">${formatMoney(totalAmount)}</td>
      </tr>
      <tr>
        <td colspan="4">Less-Advance payment (${escapeHtml(payMethod)})</td>
        <td class="num-col">${formatMoney(advanceAmount)}</td>
      </tr>
      <tr>
        <td colspan="4">Balance payment:</td>
        <td class="num-col balance-val">${formatMoney(balanceAmount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">Customer Signature</div>
    <div class="sig-box">Authorized By:</div>
  </div>

  <div class="footer">
    <p>THANK YOU PLEASE COME AGAIN !</p>
  </div>
</body>
</html>`;
}

/**
 * Trigger direct print via an isolated hidden iframe — no second confirmation modal, no page screenshot!
 */
export function printOrderInvoice(order, items = [], payments = [], mode = 'receipt') {
  const html = mode === 'a5'
    ? buildA5Html(order, items, payments)
    : buildReceiptHtml(order, items, payments);

  // Remove any leftover print iframe
  const existing = document.getElementById('trb-direct-print-frame');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'trb-direct-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Wait briefly for layout/fonts, then trigger native printer directly
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Direct print failed:', err);
    }
    // Clean up iframe after print dialog closes
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 30000);
  }, 200);
}
