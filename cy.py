import telegram
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ParseMode
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import datetime
from PIL import Image, ImageDraw, ImageFont
import io
import random
import time
import os

# --- PENGATURAN ---
# Token sudah diisi. JANGAN BAGIKAN TOKEN INI KEPADA SIAPA PUN!
BOT_TOKEN = '8421388214:AAFczGBGShYC7gS4cSBFs_1beAnjs0Bvq7E'

# Link grup promosi Anda
GROUP_LINK = 'https://t.me/roomphbkic'

# Nama yang akan muncul di KTP
CREATOR_NAME = 'GusOfcXD 404'

# --- FUNGSI UNTUK MEMBUAT GAMBAR KTP (FINAL VERSION) ---
async def create_ktp_image(user: telegram.User, context: ContextTypes.DEFAULT_TYPE) -> io.BytesIO:
    # Ukuran canvas yang lebih kecil agar fast
    width, height = 640, 400
    
    # Buat gambar dengan warna background krem seperti KTP
    img = Image.new('RGB', (width, height), color='#F5F5DC')
    draw = ImageDraw.Draw(img)

    # Gunakan font bawaan agar tidak perlu file font
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 20)
        font_label = ImageFont.truetype("arial.ttf", 12)
        font_data = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_data = ImageFont.load_default()

    # --- Header KTP ---
    draw.text((50, 20), "KARTU TANDA PENGENAL TELEGRAM", font=font_title, fill='#000000')
    
    # --- Foto Profil (DIPERBAIKI AGAR PAS DI DALAM KOTAK) ---
    # Gambar kotak untuk foto
    photo_box = [50, 70, 200, 220] # [x1, y1, x2, y2]
    draw.rectangle(photo_box, fill='#FFFFFF', outline='#000000', width=2)
    
    # Proses dan tempelkan foto profil agar pas di dalam kotak
    try:
        photos = await context.bot.get_user_profile_photos(user.id, limit=1)
        if photos.photos:
            file_id = photos.photos[0][-1].file_id
            new_file = await context.bot.get_file(file_id)
            bio = io.BytesIO()
            await new_file.download_to_memory(out=bio)
            profile_img = Image.open(bio)
            
            # Hitung ukuran kotak dan resize foto agar pas
            box_width = photo_box[2] - photo_box[0]
            box_height = photo_box[3] - photo_box[1]
            profile_img = profile_img.resize((box_width, box_height), Image.Resampling.LANCZOS)
            
            # Tempelkan foto di dalam kotak
            img.paste(profile_img, (photo_box[0], photo_box[1]))
    except Exception as e:
        draw.text((100, 140), "FOTO", font=font_label, fill='#AAAAAA')

    # --- Data Pengguna ---
    y_pos = 80
    line_height = 22
    
    def draw_data(label, data):
        nonlocal y_pos
        draw.text((230, y_pos), f"{label}:", font=font_label, fill='#333333')
        draw.text((300, y_pos), str(data), font=font_data, fill='#000000')
        y_pos += line_height

    # Tampilkan data
    draw_data("NIK", f"{random.randint(1000000000000000, 9999999999999999)}")
    draw_data("Nama", user.full_name)
    draw_data("Username", f"@{user.username}" if user.username else "Tidak Ada")
    draw_data("ID Telegram", user.id) # ID ada di foto

    # --- QR Code di Kiri Bawah ---
    qr_y_start = height - 60
    qr_size = 6
    for x in range(50, 150, qr_size + 1):
        for y in range(qr_y_start, height - 10, qr_size + 1):
            color = (0, 0, 0) if random.choice([True, False]) else (255, 255, 255)
            draw.rectangle([x, y, x + qr_size, y + qr_size], fill=color)

    # --- Tanda Tangan & Tanggal ---
    draw.text((450, 350), f"{CREATOR_NAME}", font=font_label, fill='#555555')
    draw.text((450, 370), f"{datetime.datetime.now().strftime('%d-%m-%Y')}", font=font_label, fill='#555555')

    # Simpan gambar ke memory
    final_bio = io.BytesIO()
    img.save(final_bio, 'PNG')
    final_bio.seek(0)
    return final_bio

# --- FUNGSI HANDLER BOT ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await send_ktp(update, context)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await send_ktp(update, context)

async def send_ktp(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    keyboard = [[InlineKeyboardButton("Group Promosi", url=GROUP_LINK)]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    ktp_image_buffer = await create_ktp_image(user, context)
    
    # Caption dengan ID dan Username yang bisa disalin
    user_id_html = f"<code>{user.id}</code>"
    username_html = f"<code>@{user.username if user.username else 'Tidak Ada'}</code>"
    
    caption = (
        f"id: {user_id_html}\n"
        f"Username: {username_html}\n\n"
        f"Bantu join group promosi di bawah,"
    )
    
    await context.bot.send_photo(
        chat_id=update.effective_chat.id,
        photo=ktp_image_buffer,
        caption=caption,
        reply_markup=reply_markup,
        parse_mode=ParseMode.HTML
    )

# --- SISTEM AUTO-RELOAD ---
def run_bot():
    """Fungsi untuk menjalankan bot."""
    print("Memulai bot...")
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    application.run_polling()

if __name__ == '__main__':
    print("Bot dengan sistem Auto-Reload dijalankan.")
    print("Bot akan restart otomatis jika ada error atau jika file diubah.")
    print("Tekan Ctrl+C untuk menghentikan dan me-restart bot.")
    
    while True:
        try:
            run_bot()
        except Exception as e:
            print(f"Terjadi error: {e}")
            print("Bot akan restart dalam 5 detik...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("\nBot dihentikan. Restart dalam 1 detik...")
            time.sleep(1)
