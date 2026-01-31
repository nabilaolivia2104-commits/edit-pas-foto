from PIL import Image
import os

def proses_semua_foto():
    INPUT_DIR = "input"
    OUTPUT_DIR = "output"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    PAGE_W, PAGE_H = 2480, 3508
    DPI = 300

    W_34, H_34 = 354, 472
    W_46, H_46 = 472, 708

    BORDER = 3
    GAP = 25
    MARGIN_X = 40
    MARGIN_Y = 40

    COL_34, ROW_34 = 6, 3
    COL_46, ROW_46 = 4, 2

    files = [
        f for f in os.listdir(INPUT_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    if not files:
        print("❌ Folder input kosong")
        return

    for file in files:
        print(f"📸 Proses: {file}")

        foto = Image.open(os.path.join(INPUT_DIR, file)).convert("RGB")
        canvas = Image.new("RGB", (PAGE_W, PAGE_H), "white")

        y = MARGIN_Y

        foto_34 = foto.resize((W_34, H_34))
        for r in range(ROW_34):
            for c in range(COL_34):
                frame = Image.new(
                    "RGB",
                    (W_34 + 2*BORDER, H_34 + 2*BORDER),
                    "black"
                )
                frame.paste(foto_34, (BORDER, BORDER))
                x = MARGIN_X + c * (W_34 + GAP + 2*BORDER)
                canvas.paste(frame, (x, y))
            y += H_34 + GAP + 2*BORDER

        y += GAP * 2

        foto_46 = foto.resize((W_46, H_46))
        for r in range(ROW_46):
            for c in range(COL_46):
                frame = Image.new(
                    "RGB",
                    (W_46 + 2*BORDER, H_46 + 2*BORDER),
                    "black"
                )
                frame.paste(foto_46, (BORDER, BORDER))
                x = MARGIN_X + c * (W_46 + GAP + 2*BORDER)
                canvas.paste(frame, (x, y))
            y += H_46 + GAP + 2*BORDER

        name, _ = os.path.splitext(file)
        output_path = os.path.join(OUTPUT_DIR, f"{name}_A4.jpg")

        canvas.save(output_path, dpi=(DPI, DPI), quality=95)
        print(f"✅ Selesai: {output_path}")

    print("\n🎉 SEMUA FOTO BERHASIL DIPROSES")


if __name__ == "__main__":
    proses_semua_foto()
