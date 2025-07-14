from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
import io
import os
from datetime import datetime


app = Flask(__name__)

# Absolute path base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths
FONT_PATH = os.path.join(BASE_DIR, "fonts", "OldEnglish.ttf")
TEMPLATE_PATH = os.path.join(BASE_DIR, "templates", "dip2.jpg")
now = datetime.now()
month_year = now.strftime("%B %Y")

# Font sizes
NAME_FONT_SIZE = 48
STATE_FONT_SIZE = 36
TITLE_FONT_SIZE = 48
Footer_Font_Size = 42

# Check paths
if not os.path.exists(FONT_PATH):
    raise RuntimeError(f"Font file not found: {FONT_PATH}")
if not os.path.exists(TEMPLATE_PATH):
    raise RuntimeError(f"Template image not found: {TEMPLATE_PATH}")

# Load fonts
try:
    name_font = ImageFont.truetype(FONT_PATH, NAME_FONT_SIZE)
    state_font = ImageFont.truetype(FONT_PATH, STATE_FONT_SIZE)
    title_font = ImageFont.truetype(FONT_PATH, TITLE_FONT_SIZE)
    footer_font = ImageFont.truetype(FONT_PATH,Footer_Font_Size)
except Exception as e:
    raise RuntimeError(f"Font loading failed: {e}")

@app.route("/diploma")
def generate_diploma():
    name = request.args.get("name", "Student Name")
    state = request.args.get("state", "Your State")
    grade_raw = request.args.get("grade", "Unknown")
    line1 = "Given  at your city, your state,"
    line2 = f"this month of {month_year}"

    # Normalize grade
    try:
        grade = int(''.join(filter(str.isdigit, grade_raw)))
    except:
        grade = None

    if grade is not None:
        if grade <= 5:
            diploma_title = "Elementary School Diploma"
        elif grade <= 8:
            diploma_title = "Middle School Diploma"
        else:
            diploma_title = "High School Diploma"
    else:
        diploma_title = "Academic Diploma"


    try:
        bg = Image.open(TEMPLATE_PATH).convert("RGB")
        draw = ImageDraw.Draw(bg)

        width, height = bg.size

        # Positions
        name_x, name_y = width // 2, 410
        state_x, state_y = width // 2 - 190, 260
        title_x, title_y = width // 2, name_y + 160

        line1_x,line1_y = width//2,title_y+70
        line2_x,line2_y = width//2,title_y+110

        draw.text((name_x, name_y), name, font=name_font, fill=(58, 58, 58), anchor="mm")
        draw.text((state_x, state_y), state, font=state_font, fill=(58, 58, 58), anchor="mm")
        draw.text((title_x, title_y), diploma_title, font=title_font, fill=(58, 58, 58), anchor="mm")
        draw.text((line1_x, line1_y), line1, font=footer_font, fill=(58, 58, 58), anchor="mm")
        draw.text((line2_x, line2_y), line2, font=footer_font, fill=(58, 58, 58), anchor="mm")

        img_io = io.BytesIO()
        bg.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/png', as_attachment=True, download_name="diploma.png")

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    print("Font path:", FONT_PATH)
    print("Template path:", TEMPLATE_PATH)
    app.run(debug=True, port=5001)
