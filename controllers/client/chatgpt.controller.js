// [GET] /chat-gpt
module.exports.index = (req, res) => {
    res.render("client/pages/chatgpt/index", {
        pageTile: "CHAT GPT"
    })
};

// [POST] /chat-gpt
module.exports.post = async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await _openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: prompt }
            ],
        });

        
        res.status(200).send({
            bot: response.choices[0].message.content 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send(error || 'Something went wrong');
    }

}

