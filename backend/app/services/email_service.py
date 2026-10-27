"""
Servicio para enviar emails usando SMTP.
"""

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv
import os

# ⚠️ IMPORTANTE: Cargar .env ANTES de leer las variables
load_dotenv()

# Configuración desde variables de entorno
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", ""),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Ecocampus"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def enviar_codigo_recuperacion(
    email_destino: EmailStr,
    codigo: str,
    nombre_usuario: str = "Usuario",
) -> bool:
    """
    Envía un email con el código de recuperación de contraseña.
    
    Returns:
        True si se envió correctamente, False si hubo error
    """
    try:
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                }}
                .content {{
                    padding: 40px 30px;
                    color: #333;
                }}
                .content p {{
                    line-height: 1.6;
                    margin-bottom: 15px;
                }}
                .codigo-box {{
                    background: #e8f5e9;
                    border: 2px dashed #4caf50;
                    border-radius: 10px;
                    padding: 25px;
                    text-align: center;
                    margin: 30px 0;
                }}
                .codigo {{
                    font-size: 42px;
                    font-weight: bold;
                    color: #1b4332;
                    letter-spacing: 8px;
                    margin: 10px 0;
                }}
                .footer {{
                    background: #f5f5f5;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }}
                .advertencia {{
                    background: #fff3e0;
                    border-left: 4px solid #ff9800;
                    padding: 12px;
                    margin-top: 20px;
                    font-size: 13px;
                    color: #e65100;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌱 Ecocampus</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Recuperación de Contraseña</p>
                </div>
                <div class="content">
                    <p>Hola <strong>{nombre_usuario}</strong>,</p>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Ecocampus.</p>
                    <p>Tu código de verificación es:</p>
                    
                    <div class="codigo-box">
                        <div class="codigo">{codigo}</div>
                        <p style="margin: 0; color: #666; font-size: 14px;">Válido por 15 minutos</p>
                    </div>
                    
                    <p>Ingresa este código en la página de recuperación de contraseña para crear una nueva contraseña.</p>
                    
                    <div class="advertencia">
                        ⚠️ Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual sigue siendo segura.
                    </div>
                </div>
                <div class="footer">
                    <p>© 2026 Ecocampus - Análisis Predictivo de Sostenibilidad Universitaria</p>
                    <p>Este es un mensaje automático, no respondas a este correo.</p>
                </div>
            </div>
        </body>
        </html>
        """

        message = MessageSchema(
            subject="🔐 Código de recuperación de contraseña - Ecocampus",
            recipients=[email_destino],
            body=html_body,
            subtype=MessageType.html,
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True

    except Exception as e:
        print(f"❌ Error al enviar email: {e}")
        return False