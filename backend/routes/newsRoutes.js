import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://n8ninvestormatch.tech/webhook/startup-investor-news');
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

export default router;
