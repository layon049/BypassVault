<div align="center">

# 🛡️ BypassVault Web SaaS v2.0
### **Plataforma Web de Desofuscación, Salto de Acortadores y Destrucción de Popups**

**Salta acortadores con publicidad invasiva (Linkvertise, AdFly, ShrinkMe), neutraliza popups y popunders en memoria, avanza temporizadores artificiales y extrae enlaces de descarga directos (MediaFire, Drive, Mega) 100% en el navegador.**

---

[![Web en Vivo](https://img.shields.io/badge/Demo%20en%20Vivo-GitHub%20Pages-00f2fe?style=for-the-badge&logo=github)](https://layon049.github.io/BypassVault/)
[![Versión](https://img.shields.io/badge/Versión-v2.0%20Cyberpunk%20SaaS-6366f1?style=for-the-badge)](https://layon049.github.io/BypassVault/)
[![Google Indexado](https://img.shields.io/badge/Google%20Search%20Console-Indexado%20%26%20Verificado-10b981?style=for-the-badge&logo=google)](https://layon049.github.io/BypassVault/)
[![Pasarela de Pago](https://img.shields.io/badge/Checkout-PayPal%202.99€%20EUR-f59e0b?style=for-the-badge&logo=paypal)](https://www.paypal.com/ncp/payment/Z2NDNVYKJBBKY)
[![Plataforma](https://img.shields.io/badge/Plataforma-Web%20Universal%20(PC%2C%20Mac%2C%20Móvil)-a855f7?style=for-the-badge)](https://layon049.github.io/BypassVault/)

[**🌐 Abrir BypassVault Web**](https://layon049.github.io/BypassVault/) • [**✨ Novedades v2.0**](#-novedades-de-la-versión-20) • [**⚡ Funciones Principales**](#-funciones-principales) • [**💳 Planes y Monetización**](#-sistema-de-pago-y-planes-pro) • [**🚀 Despliegue**](#-despliegue-en-github-pages)

---

<img src="./banner.jpg" alt="BypassVault Banner" width="100%" style="border-radius: 14px; margin-top: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

---

</div>

## 📖 ¿Qué es BypassVault Web SaaS?

**BypassVault Web** es una aplicación SaaS de última generación que funciona **100% en el navegador web** del usuario, sin requerir la descarga ni instalación de ningún software ejecutable, script o extensión.

Su motor client-side analiza la URL proporcionada, destruye las trampas publicitarias, ignora las ventanas emergentes (popups y popunders) en memoria y decodifica el destino real en menos de **20 milisegundos**.

---

## ✨ Novedades de la Versión 2.0

Esta versión representa una evolución completa tanto a nivel visual como en infraestructura y monetización:

* 🌌 **Nueva Skin Cyberpunk & Dark Glassmorphism:** 
  - Interfaz de estética futurista inspirada en herramientas de seguridad de alto rendimiento.
  - Orbes de luz ambientales dinámicos flotantes en el fondo (`ambient-glow orb-1/2/3`) con animaciones fluidas por CSS puro.
* 🖱️ **Cursor Glow Spotlight Interactivo:**
  - Las tarjetas principales (`glow-card`) reaccionan al movimiento del cursor del usuario en tiempo real con un resplandor radial suave y bordes reactivos.
* 📊 **Terminal de Desofuscación con Métricas en Vivo:**
  - Consola estilo hacker que registra cada acción, temporizador y URL resuelta.
  - Contadores en tiempo real de:
    - 🛡️ Popups bloqueados
    - 🔗 Enlaces resueltos
    - ⏱️ Tiempo estimado ahorrado
* 💳 **Pasarela de Pago Oficial PayPal Hosted Checkout (2.99€ EUR):**
---

## ⚡ Funciones Principales

### 1. 🛡️ Destructor de Popups en Memoria
Inhabilita los scripts de apertura de publicidad agresiva, redirecciones ocultas y popunders antes de que puedan desplegarse en pantalla.

### 2. ⏩ Salto de Temporizadores y Trampas Anti-Adblock
Evita esperas artificiales de 15 a 60 segundos comunes en sitios como Linkvertise, AdFly, ShrinkMe y Sub2Unlock.

### 3. 📦 Extracción Directa de Servidores CDN y Nube
* **Google Drive:** Transforma enlaces de visualización en enlaces directos de descarga instantánea vía CDN (`/uc?export=download&id=...`).
* **MediaFire:** Detecta y extrae el enlace directo de descarga sin pasar por páginas intermedias con publicidad.
* **Mega.nz:** Limpia parámetros y extrae identificadores para descarga directa.
* **Dropbox:** Convierte enlaces compartidos en descargas inmediatas automáticas con `?dl=1`.
* **PixelDrain:** Genera llamadas API directas (`/api/file/{id}?download`).

### 4. 🥞 Modo Masivo por Lotes (Plan PRO)
Permite ingresar listas completas de URLs y procesarlas en bloque. Incluye herramientas para abrir pestañas de forma inteligente en **grupos de 3 o 5** para no saturar la memoria RAM del navegador.

---

## 💳 Sistema de Pago y Planes PRO

| Característica | Plan Gratuito (Default) | Paquete PRO (+20 Usos) 👑 |
| :--- | :---: | :---: |
| **Cuota Diaria** | **5 Enlaces / día** (Recarga automática cada 24h) | **+20 Créditos Acumulables** |
| **Procesamiento por Lotes** | ❌ 1 enlace a la vez | **✅ Modo Masivo Ilimitado** |
| **Apertura de Pestañas Regulada** | Estándar | **✅ Grupos de 3 y 5 pestañas** |
| **Soporte CDN Prioritario** | Estándar | **⚡ Máxima Velocidad** |
| **Precio** | **0.00€** | **2.99€ EUR (Pago Único)** |
| **Activación** | Automática | **Inmediata tras el pago** |

---

## 📁 Estructura del Proyecto

```bash
BypassVault/
├── index.html                  # Estructura semántica, metaetiquetas SEO y modal de pago
├── style.css                   # Sistema de diseño Cyberpunk Glassmorphism y animaciones
├── app.js                      # Algoritmo de desofuscación, gestor de cuotas y lógica de pago
├── googlea756ccce665a0d67.html # Token de verificación oficial de Google Search Console
├── banner.jpg                  # Banner gráfico promocional del proyecto
├── icon.jpg                    # Icono de marca de BypassVault
└── README.md                   # Documentación completa del proyecto
```

---

## ⚖️ Aviso Legal

*BypassVault es una herramienta web orientada a la productividad, automatización y accesibilidad. Los usuarios son los únicos responsables de los enlaces que decidan procesar y del cumplimiento de las leyes de propiedad intelectual y términos de servicio de los sitios de destino.*

---

<div align="center">

**Diseñado con pasión para una web más rápida, limpia y sin publicidad invasiva.**

[**🚀 Ir a BypassVault Web**](https://layon049.github.io/BypassVault/)

</div>
