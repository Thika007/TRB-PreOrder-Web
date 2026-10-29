import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# --- Color Palette ---
COLOR_NAVY_HEX = "1B365D"       # Deep Navy (Primary)
COLOR_GOLD_HEX = "C59B27"       # Royal Gold (Secondary)
COLOR_CHARCOAL_HEX = "2D3748"   # Dark Slate text
COLOR_LIGHT_BG_HEX = "F7FAFC"   # Light Slate Background
COLOR_BORDER_HEX = "E2E8F0"     # Light Border Gray
COLOR_CARD_BG_HEX = "EDF2F7"    # Card Fill
COLOR_MUTED_HEX = "718096"      # Muted Gray
COLOR_WHITE_HEX = "FFFFFF"
COLOR_RED_ALERT_HEX = "C53030"   # Red Alert for Scope boundary

RGB_NAVY = RGBColor(27, 54, 93)
RGB_GOLD = RGBColor(197, 155, 39)
RGB_CHARCOAL = RGBColor(45, 55, 72)
RGB_MUTED = RGBColor(113, 128, 150)
RGB_WHITE = RGBColor(255, 255, 255)
RGB_RED_ALERT = RGBColor(197, 48, 48)

def set_cell_background(cell, color_hex):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_border(cell, top=None, bottom=None, left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    borders_elm = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    
    for side, color in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        if color == 'none' or color is None:
            side_elm = parse_xml(f'<w:{side} {nsdecls("w")} w:val="none"/>')
        else:
            side_elm = parse_xml(f'<w:{side} {nsdecls("w")} w:val="single" w:sz="6" w:space="0" w:color="{color}"/>')
        borders_elm.append(side_elm)
    tcPr.append(borders_elm)

def add_callout(doc, title, text_paragraphs, border_color_hex=COLOR_GOLD_HEX, bg_color_hex="FFFDF5", title_color=RGB_NAVY):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color_hex)
    set_cell_margins(cell, top=160, bottom=160, left=220, right=180)
    
    # Left border highlight
    tcPr = cell._tc.get_or_add_tcPr()
    borders_elm = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders_elm)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"■ {title}")
    run_t.font.name = "Segoe UI"
    run_t.font.size = Pt(11)
    run_t.font.bold = True
    run_t.font.color.rgb = title_color
    
    for text in text_paragraphs:
        p2 = cell.add_paragraph()
        p2.paragraph_format.space_before = Pt(2)
        p2.paragraph_format.space_after = Pt(4)
        run_b = p2.add_run(text)
        run_b.font.name = "Segoe UI"
        run_b.font.size = Pt(10)
        run_b.font.color.rgb = RGB_CHARCOAL
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Segoe UI"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = RGB_NAVY
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(13)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Segoe UI"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGB_GOLD
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(9)
    h.paragraph_format.space_after = Pt(3)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Segoe UI"
    run.font.size = Pt(10.5)
    run.font.bold = True
    run.font.color.rgb = RGB_NAVY
    return h

def add_body_paragraph(doc, text, bold_prefix=None, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Segoe UI"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGB_NAVY
    r = p.add_run(text)
    r.font.name = "Segoe UI"
    r.font.size = Pt(10)
    r.font.color.rgb = RGB_CHARCOAL
    return p

def add_bullet_point(doc, text, bold_title=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_title:
        r_pre = p.add_run(bold_title)
        r_pre.font.name = "Segoe UI"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGB_NAVY
    r = p.add_run(text)
    r.font.name = "Segoe UI"
    r.font.size = Pt(10)
    r.font.color.rgb = RGB_CHARCOAL
    return p

def add_figure_container(doc, image_path, fig_num, caption, notes=None):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "FAFAFC")
    set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
    set_cell_border(cell, top=COLOR_BORDER_HEX, bottom=COLOR_BORDER_HEX, left=COLOR_BORDER_HEX, right=COLOR_BORDER_HEX)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(6)
    
    if os.path.exists(image_path):
        run_img = p.add_run()
        run_img.add_picture(image_path, width=Inches(6.1))
    else:
        run_ph = p.add_run("[DIAGRAM PLACEHOLDER: Image will be rendered here]")
        run_ph.font.name = "Segoe UI"
        run_ph.font.size = Pt(10)
        run_ph.font.italic = True
        run_ph.font.color.rgb = RGB_MUTED
        
    p_cap = cell.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(6)
    p_cap.paragraph_format.space_after = Pt(2)
    run_cap = p_cap.add_run(f"Figure {fig_num}: {caption}")
    run_cap.font.name = "Segoe UI"
    run_cap.font.size = Pt(9.5)
    run_cap.font.bold = True
    run_cap.font.color.rgb = RGB_NAVY
    
    if notes:
        p_notes = cell.add_paragraph()
        p_notes.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_notes.paragraph_format.space_before = Pt(0)
        p_notes.paragraph_format.space_after = Pt(4)
        run_n = p_notes.add_run(notes)
        run_n.font.name = "Segoe UI"
        run_n.font.size = Pt(8.5)
        run_n.font.italic = True
        run_n.font.color.rgb = RGB_MUTED

    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def style_table(table, col_widths, headers, data_rows, alignments=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header Row
    hdr_cells = table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], COLOR_NAVY_HEX)
        set_cell_margins(hdr_cells[i], top=140, bottom=140, left=120, right=120)
        set_cell_border(hdr_cells[i], top=COLOR_NAVY_HEX, bottom=COLOR_GOLD_HEX, left=COLOR_NAVY_HEX, right=COLOR_NAVY_HEX)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        if alignments and i < len(alignments):
            p.alignment = alignments[i]
        run = p.add_run(h_text)
        run.font.name = "Segoe UI"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGB_WHITE
        
    # Data Rows
    for r_idx, row_data in enumerate(data_rows):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = COLOR_WHITE_HEX if r_idx % 2 == 0 else COLOR_LIGHT_BG_HEX
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].width = col_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=120, right=120)
            set_cell_border(row_cells[c_idx], top=COLOR_BORDER_HEX, bottom=COLOR_BORDER_HEX, left="none", right="none")
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if alignments and c_idx < len(alignments):
                p.alignment = alignments[c_idx]
            run = p.add_run(str(val))
            run.font.name = "Segoe UI"
            run.font.size = Pt(9)
            run.font.color.rgb = RGB_CHARCOAL

def main():
    doc = Document()
    
    # 1. Page Setup (1-inch margins)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.header.is_linked_to_previous = False
        
        # Header setup
        p_hdr = section.header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("THE ROYAL BAKERY | PROJECT PROPOSAL & SCOPE AGREEMENT")
        r_hdr.font.name = "Segoe UI"
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGB_MUTED
        
        # Footer setup
        p_ftr = section.footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r_ftr1 = p_ftr.add_run("Confidential — The Royal Bakery Pre-Order Billing Project")
        r_ftr1.font.name = "Segoe UI"
        r_ftr1.font.size = Pt(8.5)
        r_ftr1.font.color.rgb = RGB_MUTED

    # ==========================================
    # COVER PAGE
    # ==========================================
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(24)
    p_top.paragraph_format.space_after = Pt(12)
    r_top = p_top.add_run("AGILE SOFTWARE DEVELOPMENT PROPOSAL & SCOPE SPECIFICATION")
    r_top.font.name = "Segoe UI"
    r_top.font.size = Pt(10)
    r_top.font.bold = True
    r_top.font.color.rgb = RGB_GOLD

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("PROJECT PROPOSAL & AGILE SCOPE AGREEMENT")
    r_title.font.name = "Segoe UI"
    r_title.font.size = Pt(23)
    r_title.font.bold = True
    r_title.font.color.rgb = RGB_NAVY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(22)
    r_sub = p_sub.add_run("Local-First Pre-Order Billing, Cake Customization & Kitchen Production System\n"
                          "Built on Microsoft SQL Server | 3-Phase Agile Delivery | Strict 1-to-1 Scope Definition")
    r_sub.font.name = "Segoe UI"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGB_CHARCOAL

    add_callout(
        doc,
        "EXECUTIVE PROJECT OVERVIEW",
        [
            "Client Organization: The Royal Bakery (TRB Systems - Colombo / Outlets)",
            "System Objective: Replace Slow trbsys.net Portal with an Ultra-Fast Local System on Microsoft SQL Server",
            "Development Timeline: Minimum 3 Months (12 Weeks) Delivered via Agile Sprints",
            "Commercial Structure: Zero Baseline Capital Fee | LKR 100,000 Initial Non-Refundable Mobilization Advance",
            "Combined Monthly Retainer: LKR 30,000 / Month (LKR 15,000 for 2 Existing POS Systems + LKR 15,000 for New Pre-Order System)",
            "Inflation Adjustment Clause: Monthly Retainer Locked for 2 Years (24 Months); Indexed to Inflation Thereafter",
            "Maintenance Period: 1-Year Comprehensive Operational Maintenance from Official Live Launch Date",
            "Strict Scope Boundary: Exact Rebuild of 21 Screens from trbsys.net (New Features Subject to Custom Change Requests)",
            "Database Engine: Microsoft SQL Server (MSSQL) — Natively Shared with DanuPOS Retail System"
        ],
        border_color_hex=COLOR_GOLD_HEX,
        bg_color_hex="F7FAFC"
    )

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(28)
    p_meta.paragraph_format.space_after = Pt(4)
    r_meta1 = p_meta.add_run("Target Client: ")
    r_meta1.font.bold = True
    r_meta1.font.color.rgb = RGB_NAVY
    p_meta.add_run("The Royal Bakery Management & Executive Operations Team\n")
    
    r_meta2 = p_meta.add_run("Document Version: ")
    r_meta2.font.bold = True
    r_meta2.font.color.rgb = RGB_NAVY
    p_meta.add_run("2.2 — Managed Retainer & Commercial Service Agreement\n")
    
    r_meta3 = p_meta.add_run("Date of Submission: ")
    r_meta3.font.bold = True
    r_meta3.font.color.rgb = RGB_NAVY
    p_meta.add_run("September 2026\n")

    r_meta4 = p_meta.add_run("Prepared By: ")
    r_meta4.font.bold = True
    r_meta4.font.color.rgb = RGB_NAVY
    p_meta.add_run("Lead Systems Engineering Architect & Development Team")

    doc.add_page_break()

    # ==========================================
    # TABLE OF CONTENTS & LIST OF FIGURES
    # ==========================================
    add_heading_1(doc, "TABLE OF CONTENTS")
    
    toc_items = [
        ("1. Executive Summary & Purpose", "3"),
        ("2. Strict Scope Boundary & Change Request (CR) Policy", "4"),
        ("    2.1 Complete Audit Table of the 21 Production System Screenshots", "4"),
        ("3. Exact System Menus & Page Specification (Matching trbsys.net 1-to-1)", "6"),
        ("    3.1 Menu 1: Dashboard (/dashboard) [Screenshot #01]", "6"),
        ("    3.2 Menu 2: Main Access [Screenshots #02 - #07]", "6"),
        ("        • System Users: Create User & Manage Users [Screenshots #02 & #03]", "6"),
        ("        • Manage Product / Create Product (/add-product) [Screenshot #04]", "7"),
        ("        • Product Categories: Main & Sub Categories [Screenshots #05 & #06]", "7"),
        ("        • Customer List (/customer_list - High-Speed Directory) [Screenshot #07]", "8"),
        ("    3.3 Menu 3: Orders [Screenshots #08 - #12]", "8"),
        ("        • Create Orders (/add-order - Counter Intake & Cake Greetings)", "8"),
        ("        • Manage Orders (/manage_orders - Order Grid & Status Badges) [Screenshots #08 & #12]", "9"),
        ("        • Make Payment Modal (Counter Balance Settlement)", "9"),
        ("        • Cancelled Orders (/cancel_orders - Audit Trail) [Screenshot #09]", "10"),
        ("        • Authorize Bills (/bill_authorized - Supervisor Queue) [Screenshots #10 & #11]", "10"),
        ("    3.4 Menu 4: Chef Reports (/reports_cheff - 'Order Reports') [Screenshot #13]", "10"),
        ("    3.5 Menu 5: Delivery (/delivery - 'Today's Delivery Reports') [Screenshot #21]", "11"),
        ("    3.6 Menu 6: Reports (Invoice, Product & Payment Reports) [Screenshots #14 - #19]", "11"),
        ("    3.7 Menu 7: SMS Promotions (/Promotions - 'Promotion SMS') [Screenshot #20]", "12"),
        ("    3.8 Dual Printing Engine (Direct 80mm Slip & Formal A5 Invoice)", "12"),
        ("4. Agile 3-Phase Delivery Framework (Minimum 3 Months / 12 Weeks)", "13"),
        ("5. Technical Architecture: Microsoft SQL Server & DanuPOS Integration", "15"),
        ("6. Non-Functional Quality Benchmarks (Speed, Offline, Reliability)", "17"),
        ("7. Commercial Agreement: Mobilization Advance, Combined Retainer & Inflation Revision", "18"),
        ("8. 1-Year Maintenance & Support Agreement, Training & Sign-Off", "20"),
        ("Appendix: Table of Architectural Figures & Flowcharts", "21")
    ]
    
    table_toc = doc.add_table(rows=len(toc_items), cols=2)
    table_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_toc.autofit = False
    for idx, (title, page) in enumerate(toc_items):
        c0, c1 = table_toc.rows[idx].cells
        c0.width = Inches(5.6)
        c1.width = Inches(0.9)
        set_cell_background(c0, COLOR_WHITE_HEX if idx % 2 == 0 else "FAFAFC")
        set_cell_background(c1, COLOR_WHITE_HEX if idx % 2 == 0 else "FAFAFC")
        set_cell_margins(c0, top=50, bottom=50, left=70, right=70)
        set_cell_margins(c1, top=50, bottom=50, left=70, right=70)
        set_cell_border(c0, top="none", bottom=COLOR_BORDER_HEX, left="none", right="none")
        set_cell_border(c1, top="none", bottom=COLOR_BORDER_HEX, left="none", right="none")
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(title)
        r0.font.name = "Segoe UI"
        r0.font.size = Pt(9)
        if not (title.startswith("    ") or title.startswith("        ")):
            r0.font.bold = True
            r0.font.color.rgb = RGB_NAVY
        elif title.startswith("    ") and not title.startswith("        "):
            r0.font.bold = True
            r0.font.color.rgb = RGB_CHARCOAL
        else:
            r0.font.color.rgb = RGB_MUTED
            
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(f"Page {page}")
        r1.font.name = "Segoe UI"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGB_MUTED

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    add_heading_2(doc, "LIST OF FIGURES & ARCHITECTURAL CHARTS")
    fig_items = [
        ("Figure 1", "Local-First LAN Architecture (Microsoft SQL Server & DanuPOS Shared Instance)", "Page 15"),
        ("Figure 2", "Microsoft SQL Server Relational Entity Relationship Diagram (ERD)", "Page 15"),
        ("Figure 3", "End-to-End Pre-Order Billing, Cake Customization & Kitchen Workflow", "Page 13")
    ]
    table_fig = doc.add_table(rows=len(fig_items), cols=3)
    table_fig.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_fig.autofit = False
    for idx, (f_num, f_name, f_pg) in enumerate(fig_items):
        c0, c1, c2 = table_fig.rows[idx].cells
        c0.width = Inches(1.1)
        c1.width = Inches(4.5)
        c2.width = Inches(0.9)
        set_cell_background(c0, "FAFAFC")
        set_cell_background(c1, "FAFAFC")
        set_cell_background(c2, "FAFAFC")
        set_cell_margins(c0, top=50, bottom=50, left=70, right=70)
        set_cell_margins(c1, top=50, bottom=50, left=70, right=70)
        set_cell_margins(c2, top=50, bottom=50, left=70, right=70)
        set_cell_border(c0, top="none", bottom=COLOR_BORDER_HEX, left="none", right="none")
        set_cell_border(c1, top="none", bottom=COLOR_BORDER_HEX, left="none", right="none")
        set_cell_border(c2, top="none", bottom=COLOR_BORDER_HEX, left="none", right="none")
        
        r0 = c0.paragraphs[0].add_run(f_num)
        r0.font.bold = True
        r0.font.color.rgb = RGB_GOLD
        r1 = c1.paragraphs[0].add_run(f_name)
        r1.font.color.rgb = RGB_CHARCOAL
        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r2 = p2.add_run(f_pg)
        r2.font.color.rgb = RGB_MUTED

    doc.add_page_break()

    # ==========================================
    # 1. EXECUTIVE SUMMARY
    # ==========================================
    add_heading_1(doc, "1. EXECUTIVE SUMMARY & PURPOSE")
    add_body_paragraph(
        doc,
        "The Royal Bakery (TRB) is one of the most respected bakeries in Sri Lanka. Every day, the bakery takes in hundreds "
        "of custom celebration cakes, daily bread orders, and catering orders from walk-in customers, hotels, and schools. "
        "Currently, TRB uses a cloud website called trbsys.net for this pre-order billing. However, this system causes severe "
        "delays: counter screens freeze, cashiers wait seconds for items to load, and if the showroom internet disconnects, "
        "billing stops completely."
    )
    add_body_paragraph(
        doc,
        "This project will replace trbsys.net with a modern, ultra-fast Local-First Counter System running on Microsoft SQL Server. "
        "It runs directly on TRB's counter computers, meaning zero internet lag and 100% offline billing reliability. "
        "Furthermore, because it uses Microsoft SQL Server, it shares the exact same database engine as TRB's retail POS (DanuPOS), "
        "making future integration simple, clean, and unified."
    )
    add_body_paragraph(
        doc,
        "To make this modernization financially frictionless and avoid large capital barriers, the engagement eliminates traditional "
        "large baseline development fees (LKR 0 baseline fee). Instead, the project is structured under an attractive operational partnership: "
        "a one-time initial non-refundable advance of LKR 100,000 upon contract signing, followed by a consolidated monthly retainer "
        "of LKR 30,000 per month. This monthly fee comprehensively bundles ongoing maintenance and operations for TRB's two existing POS "
        "systems (Bakery POS and Restaurant POS at LKR 15,000/mo) and this new Pre-Order Counter System (at LKR 15,000/mo)."
    )

    # ==========================================
    # 2. STRICT SCOPE & ANTI-SCOPE CREEP POLICY
    # ==========================================
    add_heading_1(doc, "2. STRICT SCOPE BOUNDARY & CHANGE REQUEST (CR) POLICY")
    add_body_paragraph(
        doc,
        "To ensure that this project is delivered strictly within the minimum 3-month timeline and commercial framework, it is essential that both "
        "The Royal Bakery and the development team have a crystal-clear understanding of the project boundaries."
    )

    add_callout(
        doc,
        "STRICT SCOPE AGREEMENT & ANTI-SCOPE CREEP CLAUSE",
        [
            "1. Exact Feature Copy: The scope of this project is strictly limited to rebuilding the exact functional menus, pages, and features currently present in the production trbsys.net portal as documented across the 21 production screenshots and counter intake workflows. No more, no less.",
            "2. 1-Year Maintenance Scope: The included 1-year operational maintenance period strictly covers bug fixes, database tuning, and counter printer support for the rebuilt trbsys.net system. It does NOT include adding new features, extra screens, or novel business logic.",
            "3. Out-of-Scope Items: Any new capability not present in the current trbsys.net portal (such as customer online ordering apps, online payment gateways, automated SMS marketing blasts, general accounting ledgers, or attendance systems) is strictly out-of-scope for this baseline contract.",
            "4. Change Request (CR) Process: If TRB requests any new feature, extra screen, or functional change that does not exist in the current system, it must be submitted as a written Change Request (CR). Each CR will receive a separate commercial quotation and timeline, and will be developed under custom development rates.",
            "5. Sign-Off Protection: This scope boundary protects both parties against misunderstandings, guarantees on-time delivery, and ensures the highest quality of engineering."
        ],
        border_color_hex=COLOR_RED_ALERT_HEX,
        bg_color_hex="FFF5F5",
        title_color=RGB_RED_ALERT
    )

    # Complete Audit Table of the 21 Production System Screenshots
    add_heading_2(doc, "2.1 Complete Audit Table of the 21 Production System Screenshots (from Client PDF)")
    add_body_paragraph(
        doc,
        "The client provided an operational walkthrough PDF containing 21 individual screen captures showing every menu, "
        "form, and table used across The Royal Bakery. Every single one of these 21 screenshots has been cataloged and verified below:"
    )

    sc_headers = ["Screenshot #", "PDF Page", "Menu / Area", "URL Route & Screen Title", "Captured Elements & Key Controls"]
    sc_rows = [
        ["Screenshot #01", "Page 1 (Top)", "Dashboard", "/dashboard\nOperational Dashboard", "Top navbar, KPI cards: Total Orders, Total Pending Orders, Total New Customers (This Month admin & Last Month)"],
        ["Screenshot #02", "Page 1 (Bottom)", "Main Access > System Users", "/create-users\nCreate User", "Main Access menu hover; User Name*, Password*, Confirm Password*, User Type* (Select Level), Submit, Cancel"],
        ["Screenshot #03", "Page 2 (Top)", "Main Access > System Users", "/manage-users\nManage Users", "System Users submenu; User list table: User Name, User Role, Action (Edit pen, Delete cross)"],
        ["Screenshot #04", "Page 2 (Bottom)", "Main Access > Manage Product", "/add-product\nCreate Product", "FEED PRODUCT DATA form (Main Cat, Sub Cat, Name, Price, Net Weight, Description, Discount); 850+ Product Table"],
        ["Screenshot #05", "Page 3 (Top)", "Main Access > Product Categories", "/manage-categories\nManage Main Categories", "CAT ID#, Main Category, Main Category Description (Chef in charge, e.g. Cheff Premaratna); 8 Categories Table"],
        ["Screenshot #06", "Page 3 (Bottom)", "Main Access > Product Categories", "/manage-sub-categories\nManage Sub Categories", "SUB CAT ID#, Main Category dropdown, Sub Category, Sub Category Description; Sub Categories Table"],
        ["Screenshot #07", "Page 4 (Top)", "Main Access", "/customer_list\nCustomer List", "Customer directory table: Customer Name, Mobile, LandLine, Address, Email, Search bar"],
        ["Screenshot #08", "Page 4 (Bottom)", "Orders", "/manage_orders\nManage Orders", "Orders menu dropdown (Manage Orders, Cancelled, Authorize); Total Amount badge: 217,550; Orders Table"],
        ["Screenshot #09", "Page 5 (Top)", "Orders", "/cancel_orders\nCancelled Orders", "Orders submenu; Cancelled orders audit table: Invoice Id, Reason (CXL), Cancelled By (Admin), Date"],
        ["Screenshot #10", "Page 5 (Bottom)", "Orders", "/bill_authorized\nAuthorize Bills", "Orders submenu; Authorize Bills table: Invoice ID, Name, Delivery Date, Total, Balance, Print-A5, Bill Authorize"],
        ["Screenshot #11", "Page 6 (Top)", "Orders", "/bill_authorized\nAuthorize Bills (Full View)", "Clean full screen view of Authorize Bills queue without dropdown overlay; Pagination controls"],
        ["Screenshot #12", "Page 6 (Bottom)", "Orders", "/manage_orders\nManage Orders (Full View)", "Clean full screen view of Manage Orders table; Total Amount badge, Print 80mm & A5, Edit Order, Cancel Order"],
        ["Screenshot #13", "Page 7 (Top)", "Chef Reports", "/reports_cheff\nOrder Reports", "Main-Product-Type*, Sub-Product-Type, Product, Date Range, Print Reoprt, Export; Delivery Date, Product, Description (cake greeting), Qty"],
        ["Screenshot #14", "Page 7 (Bottom)", "Reports > By Invoice", "/reports_all\nAll Report", "Reports menu; By Invoice submenu; Print Reoprt, Export, Bill Authorized; Order list with Make Payment, Status, Due"],
        ["Screenshot #15", "Page 8 (Top)", "Reports > By Invoice", "/overall-invoices\nOverall Invoices", "By Invoice submenu; Date Range filter (mm/dd/yyyy to mm/dd/yyyy)"],
        ["Screenshot #16", "Page 8 (Bottom)", "Reports > By Product", "/reports_products_only\nAll Product Sales", "By Product submenu; Item Category, Sub Category, Item, Time Range, Search; Table: Main Cat, Sub Cat, Name, Price, Qty, Total Sales"],
        ["Screenshot #17", "Page 9 (Top)", "Reports > By Product", "/reports-overall\nReports Overall (Select)", "Customer dropdown selector"],
        ["Screenshot #18", "Page 9 (Bottom)", "Reports > By Product", "/reports-overall\nReports Overall (Filters)", "Full filters: Customer, Item Category, Sub Category, Item, Time Range, Payment Method, Search; Print Reoprt, Export"],
        ["Screenshot #19", "Page 10 (Full)", "Reports > By Payment", "/all-payment\nPayment Reports", "By Payment submenu; Date Range, All Payment Type, Search, Print Reoprt, Export; Table: Invoice ID, Cus Name, Payment Method, Paid Amount"],
        ["Screenshot #20", "Page 11 (Top)", "SMS Promotions", "/Promotions\nPromotion SMS", "PROMOTION SMS template screen: Text area 'Type your message here', Submit, Cancel"],
        ["Screenshot #21", "Page 11 (Bottom)", "Delivery", "/delivery\nToday's Delivery Reports", "Date of Delivery picker, Search, Print Reoprt; Table: Date of Delivery, Invoice ID, Name and Qty, Cus Name, Address, Phone"]
    ]
    sc_widths = [Inches(1.1), Inches(0.8), Inches(1.3), Inches(1.4), Inches(1.9)]
    table_sc = doc.add_table(rows=len(sc_rows) + 1, cols=5)
    style_table(table_sc, sc_widths, sc_headers, sc_rows)

    doc.add_page_break()

    # ==========================================
    # 3. EXACT PAGE-BY-PAGE SPECIFICATION
    # ==========================================
    add_heading_1(doc, "3. EXACT SYSTEM MENUS & PAGE SPECIFICATION (MATCHING TRBSYS.NET 1-TO-1)")
    add_body_paragraph(
        doc,
        "To make it effortless for Royal Bakery management and counter cashiers to verify the scope, the modules below "
        "are organized using the exact menu structure, page names, and field titles found in the production trbsys.net portal, "
        "cross-referenced directly to the 21 screenshots verified in Section 2.1."
    )

    # 3.1 Menu 1: Dashboard
    add_heading_2(doc, "3.1 Menu 1: Dashboard (/dashboard) [Screenshot #01]")
    add_bullet_point(doc, "Page heading matches 'This Month admin' and 'Last Month' cards showing TOTAL ORDERS, TOTAL PENDING ORDERS, and TOTAL NEW CUSTOMERS.", "• Key Performance Cards: ")
    add_bullet_point(doc, "Notification alert banner at the top displaying real-time order intake and status updates.", "• Alerts Banner: ")
    add_bullet_point(doc, "Navigation sidebar giving instant one-click access to all system menus.", "• Navigation: ")

    # 3.2 Menu 2: Main Access
    add_heading_2(doc, "3.2 Menu 2: Main Access [Screenshots #02, #03, #04, #05, #06, #07]")
    add_bullet_point(doc, "Create User form (/create-users) [Screenshot #02] with User Name*, Password*, Confirm Password*, and User Type* (Admin, Accountant, Cashier, Kitchen). Manage Users (/manage-users) [Screenshot #03] table with Edit and Delete options.", "• System Users: ")
    add_bullet_point(doc, "Manage Product / Create Product (/add-product) [Screenshot #04] containing Product Main Category, Product Sub Category, Product Name*, Product Price*, Net Weight*, Description*, and Discount* (Discount/Non Discount). Searchable table of all 850+ items with Status filter (Show all, Available, Out of Stock).", "• Manage Product / Create Product: ")
    add_bullet_point(doc, "Main Categories (/manage-categories) [Screenshot #05] managing 8 categories (Bread, Cake, Pastry, Kitchen, Restaurant, Shoteats, Showroom) with Chef in charge assignment (e.g., Cheff Premaratna, Cheff Wickramapala). Sub Categories (/manage-sub-categories) [Screenshot #06] managing sub-groups (Buns, Cake Pieces, Drawing Cakes).", "• Product Categories: ")
    add_bullet_point(doc, "Customer List (/customer_list) [Screenshot #07] displaying Customer Name, Mobile, LandLine, Address, and Email. Equipped with high-speed indexing and pagination to eliminate the 60-second loading timeout of the previous system.", "• Customer List: ")

    # 3.3 Menu 3: Orders
    add_heading_2(doc, "3.3 Menu 3: Orders [Screenshots #08, #09, #10, #11, #12]")
    add_bullet_point(doc, "Main showroom intake screen (/add-order). Cashier enters customer mobile number or name for instant auto-fill of Title (Mr/Mrs/Miss/Dr/Rev), First Name, Mobile, Telephone, and Delivery Address. New customers registered in 1 step.", "• Create Orders (Customer Profile): ")
    add_bullet_point(doc, "Cascading selector: Main-Product-Type* -> Sub-Product-Type -> Product (850+ items). Price and net weight load automatically. Cashier enters Quantity (odr_qty) and Item Notes (odr_gre_des).", "• Create Orders (Product Selection): ")
    add_bullet_point(doc, "Milestone Greetings* (None, 1st, 2nd, ... 29th) + Occasion Greetings* (None, Happy Birthday, Happy Anniversary, Happy Holy Communion, Congratulations, Happy Valentine's Day) + Custom Icing Name/Text (Greetings info2).", "• Create Orders (Cake Customization): ")
    add_bullet_point(doc, "Date of Delivery (d_delivery), Time (time), Delivery Address (d_address), Ordered By cashier name. Line-item table, Discount %, Service Charge %, Delivery Charge, Gross Total (tot), Advance Paid (odr_adv), Balance Due. Payment type: Cash, Card, Cheque, Staff.", "• Create Orders (Delivery & Billing): ")
    add_bullet_point(doc, "Order management grid (/manage_orders) [Screenshots #08 & #12] with Total Amount badge (e.g., LKR 217,550), status filter tabs (Show all, Pending, Paid, Un Paid, Delivered), instant search, and columns: Invoice ID (e.g. RB-0178099), Make Payment, Name & Qty, Date of Delivery, Total, Status, Balance Due, Print (Print 80mm, Print-A5), Actions (Edit Order, Cancel Order).", "• Manage Orders: ")
    add_bullet_point(doc, "Quick pop-up modal triggered by 'Make Payment' button in Manage Orders. Displays Invoice ID, Customer Name, and Balance Due. Cashier inputs payment amount and method (Cash or Card), instantly updating the status to 'Paid / Delivered' and printing receipt.", "• Make Payment Modal: ")
    add_bullet_point(doc, "Cancelled Orders audit screen (/cancel_orders) [Screenshot #09] logging Invoice Id, Reason (e.g., CXL), Cancelled By username, and Date.", "• Cancelled Orders: ")
    add_bullet_point(doc, "Authorize Bills queue (/bill_authorized) [Screenshots #10 & #11] for supervisor approval of high-value cakes, special catering, or credit orders with Print-A5 and 'Bill Authorize' button.", "• Authorize Bills: ")

    # 3.4 Menu 4: Chef Reports
    add_heading_2(doc, "3.4 Menu 4: Chef Reports (/reports_cheff - 'Order Reports') [Screenshot #13]")
    add_bullet_point(doc, "Dedicated kitchen screen for baking chefs. Filterable by Main-Product-Type*, Sub-Product-Type, Product, Date Range (Select two dates), and Status.", "• Kitchen Filters: ")
    add_bullet_point(doc, "Columns: Delivery Date, Invoice ID, Product Name, Description (containing exact cake greeting & icing inscription), and Quantity. Includes 'Print Reoprt' and 'Export' buttons.", "• Production Grid: ")

    # 3.5 Menu 5: Delivery
    add_heading_2(doc, "3.5 Menu 5: Delivery (/delivery - 'Today's Delivery Reports') [Screenshot #21]")
    add_bullet_point(doc, "Run sheet for delivery dispatchers and drivers. Filter by Date of Delivery, Status, and Search.", "• Dispatch Run Sheet: ")
    add_bullet_point(doc, "Columns: Date of Delivery, Invoice ID, Name and Qty, Cus Name, Cus Delivery Address, Phone. Includes 'Print Reoprt' button.", "• Dispatch Columns: ")

    # 3.6 Menu 6: Reports
    add_heading_2(doc, "3.6 Menu 6: Reports [Screenshots #14, #15, #16, #17, #18, #19]")
    add_bullet_point(doc, "All Report (/reports_all) [Screenshot #14] and Overall Invoices (/overall-invoices) [Screenshot #15] filterable by Date Range, Cashier User, Payment Method, and Status. Columns: Invoice ID, Cus Name, Delivery Date, Payment Method, subTotal, Paid Amount, Due, Order Status. Export and Print.", "• Reports By Invoice: ")
    add_bullet_point(doc, "All Product Sales (/reports_products_only) [Screenshot #16] and Overall (/reports-overall) [Screenshots #17 & #18] displaying Main Cat, Sub Cat, Product Name, Price, Quantity, and Total Sales across custom date ranges.", "• Reports By Product: ")
    add_bullet_point(doc, "Payment Reports (/all-payment) [Screenshot #19] filterable by Date Range and Payment Type (Cash, Card, Cheque, Staff). Shows Invoice ID, Cus Name, Payment Method, and Paid Amount for daily cashier drawer balancing.", "• Reports By Payment: ")

    # 3.7 Menu 7: SMS Promotions
    add_heading_2(doc, "3.7 Menu 7: SMS Promotions (/Promotions - 'Promotion SMS') [Screenshot #20]")
    add_bullet_point(doc, "Promotion SMS drafting screen with text area 'Type your message here' with Submit and Cancel options for promotional message templates.", "• Promotion SMS: ")

    # 3.8 Dual Printing Engine
    add_heading_2(doc, "3.8 Dual Printing Engine (Integrated)")
    add_bullet_point(doc, "Instant 80mm thermal receipt printed directly to counter receipt printer for advance deposits and customer pickup vouchers with barcode.", "• 80mm POS Slip: ")
    add_bullet_point(doc, "Formal A5 cake invoice containing complete greeting text, cake artwork notes, and terms of collection.", "• Formal A5 Invoice: ")

    doc.add_page_break()

    # ==========================================
    # 4. AGILE 3-PHASE DELIVERY FRAMEWORK
    # ==========================================
    add_heading_1(doc, "4. AGILE 3-PHASE DELIVERY FRAMEWORK (MINIMUM 3 MONTHS / 12 WEEKS)")
    add_body_paragraph(
        doc,
        "The project will be delivered using the Agile Methodology, structured into 3 clear monthly phases spanning a minimum duration of 3 months (12 calendar weeks). "
        "At the end of each phase, a live working milestone demonstration will be presented to TRB management for review and approval."
    )

    agile_headers = ["Agile Phase & Period", "Deliverable Scope (Exact Menus Covered)", "Milestone Review & Sign-Off"]
    agile_rows = [
        [
            "PHASE 1 (Month 1)\nWeeks 1 - 4\n\nFoundation & Master Setup",
            "• Provision Local Master PC with Microsoft SQL Server (MSSQL)\n"
            "• Migrate all 850+ Products, Categories & Customer Database\n"
            "• Menu 1: Dashboard (/dashboard - 'This Month admin')\n"
            "• Menu 2: Main Access complete suite:\n"
            "   - System Users: Create User & Manage Users\n"
            "   - Manage Product / Create Product (850+ items)\n"
            "   - Product Categories: Main & Sub Categories\n"
            "   - Customer List (High-speed indexed directory)\n"
            "• Dual Hardware Printer Drivers (80mm & A5)",
            "Milestone 1 Demo & Sign-Off:\n"
            "Live demonstration of Microsoft SQL Server database, 850+ product catalog, and sub-15ms offline search."
        ],
        [
            "PHASE 2 (Month 2)\nWeeks 5 - 8\n\nCounter Intake & Printing",
            "• Menu 3: Orders core counter intake:\n"
            "   - Create Orders (/add-order) with Cake Customization\n"
            "   - Milestone Greetings* (1st-29th) & Occasions\n"
            "   - Custom Icing Text (Greetings info2)\n"
            "   - Advance Deposit & Balance Calculations\n"
            "• Menu 3: Manage Orders (/manage_orders) & Filter Tabs\n"
            "• Menu 3: Make Payment Modal (Balance Settlement)\n"
            "• Direct Hardware Printing Engine (80mm Thermal Slip & A5 Formal Invoice)",
            "Milestone 2 Demo & Sign-Off:\n"
            "Live demonstration of end-to-end counter order creation, cake greeting configuration, and instant receipt printing."
        ],
        [
            "PHASE 3 (Month 3)\nWeeks 9 - 12\n\nKitchen, Reports & Launch",
            "• Menu 3: Cancelled Orders (/cancel_orders) & Authorize Bills (/bill_authorized)\n"
            "• Menu 4: Chef Reports (/reports_cheff - 'Order Reports')\n"
            "• Menu 5: Delivery (/delivery - 'Today's Delivery Reports')\n"
            "• Menu 6: Reports (By Invoice, By Product & Payment Reports)\n"
            "• Menu 7: SMS Promotions (/Promotions - 'Promotion SMS')\n"
            "• DanuPOS Shared Microsoft SQL Server Integration Testing\n"
            "• Comprehensive Staff Training (Cashiers, Chefs, Supervisors) & Live Production Cutover",
            "Milestone 3 Demo & Sign-Off:\n"
            "Final User Acceptance Testing (UAT), staff sign-off, and live production deployment at TRB counters."
        ]
    ]
    agile_widths = [Inches(1.5), Inches(3.2), Inches(1.8)]
    table_agile = doc.add_table(rows=len(agile_rows) + 1, cols=3)
    style_table(table_agile, agile_widths, agile_headers, agile_rows)

    # Workflow Figure
    fig3_path = os.path.join(os.getcwd(), "output", "proposal_figures", "figure_3_order_lifecycle_workflow.png")
    add_figure_container(
        doc,
        fig3_path,
        3,
        "End-to-End Pre-Order Billing, Cake Customization & Kitchen Workflow",
        "Illustrates the complete customer order journey from booking to kitchen baking and final balance settlement."
    )

    doc.add_page_break()

    # ==========================================
    # 5. TECHNICAL ARCHITECTURE (MSSQL & DANUPOS)
    # ==========================================
    add_heading_1(doc, "5. TECHNICAL ARCHITECTURE: MICROSOFT SQL SERVER & DANUPOS INTEGRATION")
    add_body_paragraph(
        doc,
        "To ensure the new system operates with zero lag and seamlessly connects with TRB's retail POS (DanuPOS), "
        "the system is built on Microsoft SQL Server (MSSQL)."
    )

    add_callout(
        doc,
        "WHY MICROSOFT SQL SERVER IS THE STRATEGIC CHOICE FOR TRB",
        [
            "1. Same Engine as DanuPOS: DanuPOS runs on Microsoft SQL Server. Using the same engine allows both systems to live side-by-side on the counter PC with zero compatibility issues.",
            "2. Shared Products & Customers: Pre-orders and DanuPOS retail counters can reference the exact same product and customer records. No duplicate entries or syncing errors.",
            "3. Atomic Balance Settlements: When a customer pays their remaining balance at the DanuPOS counter, a single SQL transaction updates the pre-order status to 'Delivered' and balances the cashier drawer simultaneously.",
            "4. Single Automated Backup: One daily .bak file backup scheduled at night protects both retail POS sales and pre-orders together.",
            "5. Free SQL Server Express Edition: SQL Server Express is 100% free with a 10GB limit (over 10+ years of bakery billing capacity), avoiding expensive software licenses."
        ],
        border_color_hex=COLOR_NAVY_HEX,
        bg_color_hex="F7FAFC"
    )

    fig1_path = os.path.join(os.getcwd(), "output", "proposal_figures", "figure_1_system_architecture.png")
    add_figure_container(
        doc,
        fig1_path,
        1,
        "Local-First LAN Architecture (Microsoft SQL Server & DanuPOS Shared Instance)",
        "Shows the Master Counter Station hosting Microsoft SQL Server, serving both DanuPOS and Pre-Order Terminals over the local LAN."
    )

    fig2_path = os.path.join(os.getcwd(), "output", "proposal_figures", "figure_2_entity_relationship_diagram.png")
    add_figure_container(
        doc,
        fig2_path,
        2,
        "Microsoft SQL Server Relational Database Entity Relationship Diagram (ERD)",
        "Depicts the 8 relational entities: Users, Customers, Main Categories, Sub Categories, Products, Orders, Order Items, and Payments."
    )

    doc.add_page_break()

    # ==========================================
    # 6. NON-FUNCTIONAL REQUIREMENTS
    # ==========================================
    add_heading_1(doc, "6. NON-FUNCTIONAL QUALITY BENCHMARKS")
    add_body_paragraph(
        doc,
        "The new system is engineered around strict performance and reliability standards:"
    )

    nfr_headers = ["Quality Requirement", "Target Metric", "How It Is Achieved"]
    nfr_rows = [
        ["Counter Speed", "Sub-50ms screen response; < 15ms search", "Local Fastify API, indexed MSSQL queries, zero internet round-trips"],
        ["Offline Reliability", "100% operational without internet", "All billing runs on the local counter PC; internet is never required to bill"],
        ["Printing Speed", "< 1 second print dispatch", "Direct raw ESC/POS driver spooling to 80mm printer; no browser preview wait"],
        ["Data Accuracy", "Zero balance discrepancies", "ACID compliant SQL Server transactions with automatic rollback on error"],
        ["Multi-Terminal", "Up to 15 counter/kitchen devices", "Local Wi-Fi/LAN sharing powered by lightweight Node.js connection pooling"]
    ]
    nfr_widths = [Inches(1.5), Inches(2.2), Inches(2.8)]
    table_nfr = doc.add_table(rows=len(nfr_rows) + 1, cols=3)
    style_table(table_nfr, nfr_widths, nfr_headers, nfr_rows)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ==========================================
    # 7. COMMERCIAL AGREEMENT: MOBILIZATION ADVANCE, CONSOLIDATED RETAINER & INFLATION CLAUSE
    # ==========================================
    add_heading_1(doc, "7. COMMERCIAL AGREEMENT: MOBILIZATION ADVANCE, CONSOLIDATED RETAINER & INFLATION CLAUSE")
    add_body_paragraph(
        doc,
        "To eliminate heavy upfront capital expenditure for The Royal Bakery, this project is delivered under a strategic operational partnership model. "
        "The traditional large baseline development fee is completely waived (**LKR 0 Baseline Development Fee**). "
        "Instead, the commercial agreement consists of a one-time non-refundable setup advance and a predictable, consolidated monthly service fee that covers all of TRB's retail and pre-order operational software."
    )

    add_callout(
        doc,
        "KEY COMMERCIAL & FINANCIAL HIGHLIGHTS",
        [
            "1. Baseline Development Capital Fee: LKR 0 (Zero Upfront License/Development Fee).",
            "2. Initial Non-Refundable Mobilization Advance: LKR 100,000 payable upon contract signing.",
            "3. Consolidated Monthly Service Retainer: LKR 30,000 / month single invoice covering all 3 counter software systems:",
            "   • Existing Systems: TRB Bakery Counter POS & TRB Restaurant POS (LKR 15,000 / month)",
            "   • New System: Local Pre-Order, Cake Customization & Kitchen Production System (LKR 15,000 / month)",
            "4. Inflation Adjustment & 2-Year Price Lock: The LKR 30,000 monthly fee is strictly locked for 2 full years (24 months); subject to annual revision based on Sri Lanka's official inflation rate thereafter.",
            "5. Development Timeline: Minimum of 3 Months (12 Weeks) required for complete development, testing, and rollout.",
            "6. Operational Maintenance: 1 Year (12 months) of comprehensive operational support included, commencing from the official Go-Live date.",
            "7. Strict Scope Integrity: Maintenance covers the exact rebuilt trbsys.net system only. Any new features requested are charged separately via Change Requests (CR)."
        ],
        border_color_hex=COLOR_GOLD_HEX,
        bg_color_hex="FFFDF5"
    )

    add_heading_2(doc, "7.1 Commercial Fee Structure & Inclusions:")
    budget_headers = ["Commercial Component", "Operational Scope & Coverage", "Billing Terms", "Amount (LKR)"]
    budget_rows = [
        [
            "Initial Mobilization & Setup Advance",
            "Non-refundable setup fee covering Local Master PC provisioning, Microsoft SQL Server installation, complete migration of 850+ items and customer history, dual printer spooling driver configuration, and Agile Sprint 1 kickoff.",
            "One-Time (On Contract Signing)",
            "LKR 100,000\n(Non-Refundable)"
        ],
        [
            "Consolidated Monthly Service Retainer\n(All Systems Combined)",
            "Single consolidated monthly operational & maintenance fee covering:\n"
            "• TRB Existing POS Systems (Bakery Counter POS + Restaurant POS): LKR 15,000/mo\n"
            "• New Pre-Order & Kitchen Production System: LKR 15,000/mo\n"
            "Includes database maintenance, backup verification, and cashier technical support across all counter systems.",
            "Monthly Recurring\n(Price-Locked for 2 Years)",
            "LKR 30,000 / month\n(Consolidated Bill)"
        ],
        [
            "Baseline Development Investment Fee",
            "Full 21-screen system development, MSSQL schema engineering, custom cake greeting engine, chef production sheets, and DanuPOS bridge alignment.",
            "Capital Cost Waiver",
            "LKR 0\n(Fully Waived)"
        ]
    ]
    budget_widths = [Inches(1.8), Inches(3.1), Inches(1.2), Inches(1.1)]
    table_bud = doc.add_table(rows=len(budget_rows) + 1, cols=4)
    alignments = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT]
    style_table(table_bud, budget_widths, budget_headers, budget_rows, alignments)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    add_heading_2(doc, "7.2 Inflation Adjustment & 2-Year Price Protection Clause:")
    add_body_paragraph(
        doc,
        "To ensure budget predictability and peace of mind for The Royal Bakery, the agreed consolidated monthly retainer of **LKR 30,000** "
        "is subject to a guaranteed **Two-Year (24 Months) Price Lock**:"
    )
    add_bullet_point(doc, "The consolidated monthly fee of LKR 30,000 is 100% fixed and will not increase under any circumstances for the first 24 calendar months following contract signing.", "• 24-Month Price Freeze: ")
    add_bullet_point(doc, "Following the completion of the 2-year period, the monthly retainer fee may be reviewed and adjusted annually based on the official prevailing national inflation rate published by the Central Bank of Sri Lanka (CBSL / Colombo Consumer Price Index - CCPI).", "• Inflation Indexing (Post-Year 2): ")
    add_bullet_point(doc, "Any post-2-year revision will be calculated transparently based on published economic indicators and formally communicated with at least 30 days' advance notice.", "• Transparent Notice: ")

    add_heading_2(doc, "7.3 Agile Delivery Milestones (Minimum 3-Month Timeline):")
    add_body_paragraph(
        doc,
        "System development, database integration, and counter rollout require a **minimum duration of three (3) months (12 weeks)**. "
        "Progress is linked to concrete Agile milestones:"
    )
    pay_headers = ["Agile Sprint / Milestone", "Target Timeline", "Milestone Deliverables & Acceptance Criteria"]
    pay_rows = [
        [
            "Sprint 1: Foundation & Master Setup",
            "Month 1 (Weeks 1 - 4)",
            "• Contract signing & receipt of LKR 100,000 non-refundable advance\n"
            "• Setup Master PC with Microsoft SQL Server (MSSQL)\n"
            "• Migration of all 850+ product records & customer directory\n"
            "• Delivery of Dashboard and Main Access (Users, Categories, Products)\n"
            "• Live Milestone 1 working demonstration to TRB management"
        ],
        [
            "Sprint 2: Counter Intake & Printing",
            "Month 2 (Weeks 5 - 8)",
            "• Counter Pre-Order Intake screen (/add-order) with sub-15ms search\n"
            "• Custom Cake Greetings engine (1st-29th milestones, custom icing text)\n"
            "• Order Grid, status tabs, and Make Payment balance collection modal\n"
            "• Direct hardware driver spooling for 80mm thermal slip & A5 invoice\n"
            "• Live Milestone 2 counter demonstration to TRB management"
        ],
        [
            "Sprint 3: Kitchen, Delivery & Go-Live",
            "Month 3 (Weeks 9 - 12)\n(Minimum Delivery)",
            "• Chef Reports, Kitchen Baking Sheets, and Daily Delivery Dispatch\n"
            "• Supervisor Bill Authorization queue and Cancelled Orders audit\n"
            "• Full integration testing on shared DanuPOS MSSQL instance\n"
            "• Comprehensive staff training (Cashiers, Chefs, Supervisors)\n"
            "• Official Go-Live Cutover (Commences 1-Year Maintenance Period)"
        ]
    ]
    pay_widths = [Inches(1.8), Inches(1.5), Inches(3.9)]
    table_pay = doc.add_table(rows=len(pay_rows) + 1, cols=3)
    pay_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    style_table(table_pay, pay_widths, pay_headers, pay_rows, pay_align)

    doc.add_page_break()

    # ==========================================
    # 8. 1-YEAR MAINTENANCE, TRAINING & SIGN-OFF
    # ==========================================
    add_heading_1(doc, "8. 1-YEAR MAINTENANCE & SUPPORT AGREEMENT, TRAINING & SIGN-OFF")
    
    add_heading_2(doc, "8.1 1-Year Operational Maintenance Period (From Live Launch Date)")
    add_body_paragraph(
        doc,
        "Comprehensive operational maintenance for the new Pre-Order System is provided for a period of **exactly one (1) year (12 calendar months)**, "
        "commencing officially from the date of the live production launch (Go-Live Cutover) at TRB counter stations."
    )
    add_bullet_point(doc, "Immediate investigation and resolution of any software errors, runtime exceptions, or calculation bugs across the 21 rebuilt screens.", "• Defect & Bug Rectification: ")
    add_bullet_point(doc, "Routine query optimization, database transaction log truncation, and scheduled automated night backup verification.", "• Database Health & Optimization: ")
    add_bullet_point(doc, "Support for counter thermal receipt printer spoolers and A5 formal invoice printing.", "• Hardware & Printer Stability: ")
    add_bullet_point(doc, "Direct priority phone and remote desktop technical assistance for TRB cashiers, supervisors, and management during operating hours.", "• Operational Support: ")

    add_heading_2(doc, "8.2 Strict Exclusion of New Features & Change Request (CR) Policy")
    add_callout(
        doc,
        "CRITICAL CONTRACTUAL CLAUSE: FREE MAINTENANCE VS. NEW FEATURES",
        [
            "1. Boundary of 1-Year Maintenance: The 1-year maintenance included under the monthly retainer strictly covers maintaining, repairing, and tuning the exact 21 production screens rebuilt from the current trbsys.net system.",
            "2. Exclusion of New Features: Free maintenance does NOT include adding new features, extra screens, new operational modules, or novel business logic that did not exist in the original trbsys.net system.",
            "3. Paid Change Request (CR) Requirement: If TRB requests any new functionality (for example: customer-facing mobile apps, online payment gateway integrations, automated SMS marketing campaigns, loyalty points engines, or external accounting integrations), such work will NOT be performed under routine maintenance.",
            "4. Commercial Quoting for CRs: Any newly requested feature will be formally documented under an independent Change Request (CR). A separate commercial quotation (scope, fee, and timeline) will be submitted to TRB management, and work will begin only upon mutual written approval.",
            "5. Mutual Benefit: This strict boundary ensures uninterrupted system stability, protects developer availability, and guarantees transparent, predictable business operations for both parties."
        ],
        border_color_hex=COLOR_RED_ALERT_HEX,
        bg_color_hex="FFF5F5"
    )

    add_heading_2(doc, "8.3 Hands-On Staff Training Program")
    add_body_paragraph(
        doc,
        "Before live production launch, complete hands-on training will be conducted for TRB personnel:"
    )
    add_bullet_point(doc, "Fast pre-order intake, mobile search autocomplete, cake greetings, advance deposits, and balance settlement.", "• Counter Cashiers: ")
    add_bullet_point(doc, "Order editing, bill authorization approval queue, and cancellation audit logs.", "• Floor Supervisors: ")
    add_bullet_point(doc, "Accessing daily baking schedules, chef worksheets, and item summaries.", "• Kitchen Chefs: ")
    add_bullet_point(doc, "Daily sales collection reports, payment method reconciliation, and cashier drawer balancing.", "• Accounts & Management: ")

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Acceptance Sign-off Box
    add_heading_2(doc, "8.4 Project Acceptance & Contractual Sign-Off Agreement")
    add_body_paragraph(
        doc,
        "By signing below, both parties confirm their agreement to the complete terms set forth in this proposal: "
        "the exact 21-screen scope matching trbsys.net, zero baseline capital fee, LKR 100,000 non-refundable advance, "
        "consolidated LKR 30,000 monthly retainer (covering existing Bakery POS, Restaurant POS, and new Pre-Order system), "
        "2-year inflation price lock, minimum 3-month development timeline, 1-year operational maintenance from Go-Live date, "
        "and the strict exclusion of new features from maintenance without separate Change Request (CR) billing."
    )
    
    table_sign = doc.add_table(rows=3, cols=2)
    table_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_sign.autofit = False
    sign_widths = [Inches(3.2), Inches(3.2)]
    
    headers_sign = ["For: The Royal Bakery (Client Organization)", "For: Systems Development Team (Engineering)"]
    for i, h in enumerate(headers_sign):
        c = table_sign.rows[0].cells[i]
        c.width = sign_widths[i]
        set_cell_background(c, COLOR_NAVY_HEX)
        set_cell_margins(c, top=100, bottom=100, left=120, right=120)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Segoe UI"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGB_WHITE
        
    sign_rows = [
        ["Authorized Signature: _______________________\n\nName: ___________________________________\n\nTitle: Managing Director / General Manager\n\nDate: ____________________________________",
         "Authorized Signature: _______________________\n\nName: ___________________________________\n\nTitle: Lead Systems Engineering Architect\n\nDate: ____________________________________"],
        ["Company Seal / Stamp:\n\n\n",
         "Company Seal / Stamp:\n\n\n"]
    ]
    for r_idx, r_data in enumerate(sign_rows):
        row_cells = table_sign.rows[r_idx + 1].cells
        for c_idx, val in enumerate(r_data):
            row_cells[c_idx].width = sign_widths[c_idx]
            set_cell_background(row_cells[c_idx], "FAFAFC")
            set_cell_margins(row_cells[c_idx], top=120, bottom=120, left=120, right=120)
            set_cell_border(row_cells[c_idx], top=COLOR_BORDER_HEX, bottom=COLOR_BORDER_HEX, left=COLOR_BORDER_HEX, right=COLOR_BORDER_HEX)
            p = row_cells[c_idx].paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Segoe UI"
            r.font.size = Pt(9)
            r.font.color.rgb = RGB_CHARCOAL

    # Save output
    out_dir = os.path.join(os.getcwd(), "docs")
    os.makedirs(out_dir, exist_ok=True)
    out_path_main = os.path.join(out_dir, "The_Royal_Bakery_PreOrder_System_Proposal.docx")
    
    try:
        doc.save(out_path_main)
        print(f"Successfully generated proposal DOCX: {out_path_main}")
    except PermissionError:
        print(f"Notice: '{out_path_main}' is currently open in Microsoft Word. Skipping overwrite.")

if __name__ == "__main__":
    main()
