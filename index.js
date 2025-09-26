import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

// কনফিগারেশন ভেরিয়েবল
const BOT_TOKEN = '8218346503:AAHsqaOVlc7OBS3r0GRoigrHe7Gyd0dJaIE'; // তোর TG Bot API Token
const ADMIN_UID = '6161065848'; // তোর Admin UID (যেখানে রিকোয়েস্ট মেসেজ যাবে)
const PORT = process.env.PORT || 3000; 

const app = express();

// Middleware সেটআপ
app.use(cors()); 
app.use(express.json()); 

// টেলিগ্রাম API-এ মেসেজ পাঠানোর ফাংশন
async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: ADMIN_UID, 
            text: message,
            parse_mode: 'HTML' 
        })
    });
    
    return response.json();
}

// হোম রুট
app.get('/', (req, res) => {
    res.status(200).send("Earn & Reward Bot Backend is running smoothly.");
});


// পেমেন্ট রিকোয়েস্ট প্রসেস করার রুট
app.post('/request-payment', async (req, res) => {
    const { telegramUser, user, amount } = req.body; 

    if (!telegramUser || !user || !amount) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required fields: telegramUser, ID/Number, or amount." 
        });
    }

    const message = `
<b>💰 New Withdrawal Request</b>
-------------------------------
<b>Telegram User:</b> <code>${telegramUser}</code>
<b>Bkash/FFUID:</b> <code>${user}</code>
<b>Points:</b> <code>${amount}</code>
`;
    
    try {
        const result = await sendTelegramMessage(message);

        if (result.ok) {
            res.json({ 
                success: true, 
                message: "Payment request sent successfully!" 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: "Failed to send notification to Admin. (TG Error)" 
            });
        }

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Internal server error." 
        });
    }
});

// সার্ভার চালু করা
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
