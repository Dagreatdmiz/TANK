import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8")

pdf = r"C:\Users\REAL TIME\Downloads\TANK_MVP_Developer_Project_Specification.pdf"
reader = PdfReader(pdf)
print(f"pages {len(reader.pages)}")
for index, page in enumerate(reader.pages, start=1):
    print(f"\n--- PAGE {index} ---\n")
    print(page.extract_text() or "")
