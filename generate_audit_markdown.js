import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const JSON_PATH = path.resolve('output', 'live_inspection', 'live_pages_structure.json');
const MD_OUT_PATH = path.resolve('docs', 'TRBSYS_LIVE_SYSTEM_STRUCTURE_ANALYSIS.md');

export function generateMarkdown() {
  if (!existsSync(JSON_PATH)) {
    console.error('JSON file not found:', JSON_PATH);
    return;
  }

  const raw = readFileSync(JSON_PATH, 'utf-8');
  const pages = JSON.parse(raw);

  let md = `# The Royal Bakery (TRB) - Live System Structure & Functional Specification Analysis\n\n`;
  md += `**Target System:** \`https://trbsys.net/\` (Production Bakery Portal by EzyCode)  \n`;
  md += `**Inspection Mode:** Read-Only Audit & Attribute Extraction  \n`;
  md += `**Audited Pages:** ${pages.length} Production Routes  \n`;
  md += `**Generated Date:** ${new Date().toLocaleString()}  \n\n`;

  md += `---\n\n`;
  md += `## 📋 Executive Overview & Page Directory\n\n`;
  md += `The live production system at \`trbsys.net\` consists of the following 19 active functional pages, grouped by functional menu:\n\n`;

  md += `| # | Functional Menu | Screen Name | Production URL | Forms / Inputs | Data Tables | Action Buttons |\n`;
  md += `|:---:|:---|:---|:---|:---:|:---:|:---:|\n`;

  pages.forEach(p => {
    const inputs = p.inputsCount || 0;
    const tables = p.tablesCount || 0;
    const buttons = p.buttonsCount || 0;
    md += `| **${String(p.index).padStart(2, '0')}** | ${p.menu} | **${p.name}** | \`${p.targetUrl.replace('https://trbsys.net', '')}\` | ${inputs} fields | ${tables} tables | ${buttons} buttons |\n`;
  });

  md += `\n---\n\n`;
  md += `## 🔍 Detailed Screen-by-Screen Structural Analysis\n\n`;

  pages.forEach(p => {
    md += `### ${String(p.index).padStart(2, '0')}. ${p.name}\n`;
    md += `- **Menu Hierarchy:** \`${p.menu}\`\n`;
    md += `- **URL:** \`${p.targetUrl}\`\n`;
    md += `- **Page Title:** *"${p.pageTitle || 'N/A'}"*\n`;
    md += `- **Screen Header:** *"${p.heading || 'N/A'}"*\n`;
    md += `- **Load Time:** \`${p.loadTimeMs || 0}ms\`\n`;
    if (p.screenshot) {
      md += `- **Screenshot Archive:** \`output/live_inspection/screenshots/${p.screenshot}\`\n`;
    }
    md += `\n`;

    // Inputs & Forms
    if (p.inputs && p.inputs.length > 0) {
      md += `#### Form Fields & Interactive Controls (${p.inputs.length} elements):\n`;
      md += `| Input Name | Field Type | Label / Meaning | Placeholder / Default | Options / Details |\n`;
      md += `|:---|:---:|:---|:---|:---|\n`;
      p.inputs.forEach(inp => {
        let opts = '-';
        if (inp.options && inp.options.length > 0) {
          const sampleOpts = inp.options.slice(0, 5).map(o => `"${o.text}"`).join(', ');
          opts = `${inp.optionsCount} options (e.g. ${sampleOpts}${inp.optionsCount > 5 ? '...' : ''})`;
        }
        md += `| \`${inp.name || inp.id || 'unnamed'}\` | \`${inp.type}\` | ${inp.label || '-'} | ${inp.placeholder || inp.value || '-'} | ${opts} |\n`;
      });
      md += `\n`;
    } else {
      md += `*No interactive form fields on this screen.*\n\n`;
    }

    // Tables
    if (p.tables && p.tables.length > 0) {
      md += `#### Data Tables (${p.tables.length} tables):\n`;
      p.tables.forEach((t, tIdx) => {
        md += `**Table ${tIdx + 1} (${t.totalRows} rows recorded):**\n`;
        if (t.headers && t.headers.length > 0) {
          md += `- **Columns:** ` + t.headers.map(h => `\`${h}\``).join(' | ') + `\n`;
        }
        if (t.sampleRows && t.sampleRows.length > 0) {
          md += `- **Sample Data Row:** ` + t.sampleRows[0].slice(0, 8).map(c => `"${c.replace(/\n/g, ' ')}"`).join(', ') + `\n`;
        }
        md += `\n`;
      });
    }

    // Buttons
    if (p.buttons && p.buttons.length > 0) {
      const btnList = p.buttons.map(b => `\`[${b.text}]\``).join(', ');
      md += `- **Action Buttons:** ${btnList}\n\n`;
    }

    md += `---\n\n`;
  });

  md += `## ⚖️ Gap Analysis: Live System vs. Our Rebuilt Local System\n\n`;
  md += `### 1. Fully Aligned Features:\n`;
  md += `- **Authentication & Role Guards**: Admin, Cashier, Supervisor, Chef roles with JWT & Bcrypt.\n`;
  md += `- **Customer Instant Lookup**: Phone number indexed sub-15ms search.\n`;
  md += `- **Cake Customization**: Milestone greetings (1st-29th), occasions, custom icing text (\`greetings info2\`).\n`;
  md += `- **Chef Production Worksheet**: \`/reports_cheff\` daily baking list by chef.\n`;
  md += `- **Delivery Run Sheet**: \`/delivery\` collection list.\n\n`;

  md += `### 2. Discovered Additional Report Pages from trbsys.net:\n`;
  md += `The console audit discovered additional granular reports currently on trbsys.net:\n`;
  md += `1. \`/reports_all\` - All Report (Invoice breakdown)\n`;
  md += `2. \`/overall-invoices\` - Overall Invoices\n`;
  md += `3. \`/reports_products_only\` - All Product Sales\n`;
  md += `4. \`/reports-overall\` - Overall Sales Summary\n`;
  md += `5. \`/all-payment\` - By Payment collection report\n\n`;

  md += `### 3. Step-by-Step Implementation Roadmap:\n`;
  md += `We will align our local system screen-by-screen in the exact order requested by the client.\n`;

  writeFileSync(MD_OUT_PATH, md, 'utf-8');
  console.log('Successfully generated Markdown specification at:', MD_OUT_PATH);
}

if (process.argv[1].endsWith('generate_audit_markdown.js')) {
  generateMarkdown();
}

