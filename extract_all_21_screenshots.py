import pdfplumber
import os
from PIL import Image

pdf_path = r"E:\Pre Order Web\Screanshot\Next-Generation Local-First Pre-Order & Billing Management System.pdf"
out_dir = r"E:\Pre Order Web\output\individual_screenshots"
os.makedirs(out_dir, exist_ok=True)

with pdfplumber.open(pdf_path) as pdf:
    counter = 0
    for page_idx, page in enumerate(pdf.pages):
        # We can crop the page based on the bounding boxes of each image, or extract the stream
        # Cropping the rendered high-res page ensures we get the exact visual screenshot clearly!
        # Let's render page to high-res PIL image
        page_img = page.to_image(resolution=200)
        
        # Or let's see each image bbox
        for img_idx, img in enumerate(page.images):
            counter += 1
            x0 = img["x0"]
            top = img["top"]
            x1 = img["x1"]
            bottom = img["bottom"]
            
            # Crop using pdfplumber crop or PIL crop
            # In pdfplumber, crop takes (x0, top, x1, bottom)
            cropped_page = page.crop((x0, top, x1, bottom))
            cropped_img = cropped_page.to_image(resolution=200).original
            
            out_file = os.path.join(out_dir, f"screenshot_{counter:02d}_page_{page_idx+1}_img_{img_idx+1}.png")
            cropped_img.save(out_file)
            print(f"Saved: {out_file} (Size: {cropped_img.size})")

print(f"\nAll {counter} individual screenshots successfully extracted!")
