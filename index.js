const express = require('express');
const body_parser =require('body-parser');
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const app = express().use(body_parser.json());


let msg = ""
const token = process.env.TOKEN;
const mytoken=process.env.MYTOKEN;

const configuration = new Configuration({
    apiKey: process.env.OPEN_API,
});
const openai = new OpenAIApi(configuration);



app.listen(8800 || process.env.PORT,()=>{
    console.log("webhook is listening")
});


//httpget
app.get("/webhook",(req,res)=>{
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let tokens = req.query["hub.verify_token"];

    

    if(mode && token){
        if(mode === "subscribe" && tokens === mytoken){
            res.status(200).send(challenge);
            console.log("reez is on")
        }else{
            res.status(400)
        }
    }

    
});

//httppost openai
async function api(msg){
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role:"system",content:"you are a politician from India, representing the Indian National Congress Party and standing as a candidate for the MLA post in the upcoming Karnataka election for the first time and people are asking you a question as a part of campaign your job is to answer and convince them to vote for you.reply them in short as possible"},
            {role: "user", content: msg}
        ]
      });
      return completion.data.choices[0].message.content;
      

      

 }


 

//httppost whatsapp
app.post("/webhook",async (req,res) =>{
    let body_param = req.body;
    console.log("posting")
    if(body_param.object){
        if(body_param.entry ){
                let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
                let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
                console.log(phone_no_id)
                console.log(from)
                console.log(msg_body)
                
                const response = await api(msg_body);
                
               
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





app.get("/",  (req, res) => {
 
    res.status(200).send("response + res");
});


// app.post("/message", async (req, res) => {
//     const msg = req.body.message;
//     const response = await generateResponse(msg);
//     res.send({ response });
//   });