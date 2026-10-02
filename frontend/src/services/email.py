import random
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

def generar_codigo_recuperacion():
    return str(random.randint(100000, 999999))

async def enviar_correo_codigo(email_to: str, codigo: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2e7d32;">Recuperación de Contraseña - UI GreenMetric</h2>
        <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
        <h1 style="background-color: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; color: #1976d2;">{codigo}</h1>
        <p>Este código vencerá en unos minutos. Si no solicitaste este cambio, ignora este mensaje.</p>
    </div>
    """

    message = MessageSchema(
        subject="Código de Recuperación de Contraseña",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)