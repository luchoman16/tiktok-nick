const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Usar el puerto asignado por el entorno o el 3000 por defecto
const PORT = process.env.PORT || 3000;

app.post('/getNickname', async (req, res) => {
    const { profileUrl } = req.body;

    console.log('URL recibida:', profileUrl); // Log para depuración

    if (!profileUrl || !profileUrl.startsWith('https://www.tiktok.com/@')) {
        return res.status(400).json({ error: 'URL de perfil no válida' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necesario para entornos de producción
        });
        const page = await browser.newPage();
        await page.goto(profileUrl, { waitUntil: 'networkidle2' });

        // Usando el nuevo selector
        const nickname = await page.evaluate(() => {
            const element = document.querySelector('h2[data-e2e="user-subtitle"]');
            return element ? element.innerText : null;
        });

        await browser.close();

        console.log('Apodo obtenido:', nickname); // Log para depuración

        if (!nickname) {
            return res.status(500).json({ error: 'No se pudo obtener el apodo del perfil' });
        }

        const hasEmoji = nickname.includes('🥃');
        res.json({ nickname, whatsappLink: hasEmoji ? 'https://chat.whatsapp.com/BOxxs1cigCqFORZkQf2au0' : null });

    } catch (error) {
        console.error('Error al obtener el apodo:', error);
        res.status(500).json({ error: 'Error al procesar el perfil de TikTok' });
    }
});

// Usar el puerto dinámico en producción o 3000 en local
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
