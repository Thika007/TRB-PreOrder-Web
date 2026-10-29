import pdfplumber
import os

pdf_path = r"E:\Pre Order Web\Screanshot\Next-Generation Local-First Pre-Order & Billing Management System.pdf"
out_dir = r"E:\Pre Order Web\output\extracted_images"
os.makedirs(out_dir, exist_ok=True)

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages in PDF: {len(pdf.pages)}")
    total_imgs = 0
    img_counter = 0
    for page_idx, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        first_line = text.split("\n")[0] if text else "(No text)"
        imgs = page.images
        print(f"\n--- Page {page_idx + 1} (Images: {len(imgs)}) ---")
        print(f"Header text: {first_line[:80]}")
        total_imgs += len(imgs)
        for img_idx, img in enumerate(imgs):
            img_counter += 1
            w = img.get("width")
            h = img.get("height")
            x0 = img.get("x0")
            top = img.get("top")
            print(f"  [Img #{img_counter}] Page {page_idx + 1}, Pos: ({x0:.1f}, {top:.1f}), Size: {w:.1f}x{h:.1f}")

    print(f"\nTotal image objects detected: {total_imgs}")
