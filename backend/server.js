const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

// Configurar CORS para permitir cualquier origen
app.use(cors({
    origin: '*', // Permitir solicitudes desde cualquier origen
    methods: ['GET', 'POST'], // Métodos permitidos
    allowedHeaders: ['Content-Type'] // Encabezados permitidos
}));

app.use(express.json());

// Puerto dinámico para producción o 3000 en local
const PORT = process.env.PORT || 3000;

app.post('/getNickname', async (req, res) => {
    const { profileUrl } = req.body;

    console.log('URL recibida:', profileUrl); // Log para depuración

    // Validación básica de URL
    if (!profileUrl || !profileUrl.startsWith('https://www.tiktok.com/@')) {
        return res.status(400).json({ error: 'URL de perfil no válida' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Configuración necesaria para entornos de producción
        });
        const page = await browser.newPage();
        await page.goto(profileUrl, { waitUntil: 'networkidle2' });

        // Usando el selector correcto para obtener el apodo
        const nickname = await page.evaluate(() => {
            const element = document.querySelector('h2[data-e2e="user-subtitle"]');
            return element ? element.innerText : null;
        });

        await browser.close();

        console.log('Apodo obtenido:', nickname); // Log para depuración

        if (!nickname) {
            return res.status(500).json({ error: 'No se pudo obtener el apodo del perfil' });
        }

        // Verifica si el apodo contiene el emoji 🥃
        const hasEmoji = nickname.includes('🥃');
        res.json({ nickname, whatsappLink: hasEmoji ? 'https://chat.whatsapp.com/BOxxs1cigCqFORZkQf2au0' : null });

    } catch (error) {
        console.error('Error al obtener el apodo:', error);
        res.status(500).json({ error: 'Error al procesar el perfil de TikTok' });
    }
});

// Iniciar el servidor en el puerto dinámico o en el 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
