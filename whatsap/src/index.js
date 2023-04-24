const express = require('express');
const body_parser =require('body-parser');
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const app = express().use(body_parser.json());

let response =""
let msg = "hello"
const token = process.env.TOKEN;
const mytoken=process.env.MYTOKEN;
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



app.listen(8000 || process.env.PORT,()=>{
    console.log("webhook is listening")
});
//httpget
app.get("/webhook",(req,res)=>{
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    

    if(mode && token){
        if(mode === "subscribe" && token === mytoken){
            res.status(200).send(challenge);
        }else{
            res.status(400)
        }
    }

    
});

//httppost openai
async function api(){
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role:"system",content:"you are a politician from India, representing the Indian National Congress Party and standing as a candidate for the MLA post in the upcoming Karnataka election for the first time and people are asking you a question as a part of campaign your job is to answer and convince them to vote for you.reply them in short as possible"},
            {role: "user", content: msg}
        ]
      });
      response = completion.data.choices[0].message.content;
      console.log(response)

      

}




//httppost whatsapp
app.post("/webhook",(req,res) =>{
    let body_param = req.body;
    console.log(JSON.stringify(body_param,null,2));
    if(body_param.object){
        if(body_param.entry &&
            body_param.entry[0].changes[0].value.message &&
            body_param.entry[0].changes[0].value.message[0]){
                let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
                msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
                msg = msg_body;
       
                axios({
                    method:"POST",
                    url:"https://graph.facebook.com/v16.0/"+phone_no_id+"/messages?access_token="+token,
                    data:{
                        "messaging_product": "whatsapp",    
                        "recipient_type": "individual",
                        "to": from,
                        "type": "text",
                        "text": {
                            "preview_url": false,
                            "body": response
                        },
                        headers:{
                            "Content-Type":"application/json"
                        }
                    }
                });
                res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }
    }
})