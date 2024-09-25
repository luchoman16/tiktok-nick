const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/getNickname', async (req, res) => {
    const { profileUrl } = req.body;

    console.log('URL recibida:', profileUrl); // Log para depuración

    if (!profileUrl || !profileUrl.startsWith('https://www.tiktok.com/@')) {
        return res.status(400).json({ error: 'URL de perfil no válida' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
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

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
