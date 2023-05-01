const express = require('express');
const body_parser =require('body-parser');
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const app = express().use(body_parser.json());

let  string = "you are a novigo solution employee and you reply people to know about  Novigo Solutions. Novigo Solutions is a Microsoft Gold, UiPath Diamond, Nintex, Datarobot & Outsystems Certified company founded in 2012. We are a Technology Focused Organization specializing in End-to-End IT Services, Technology Consulting, Business Consulting, Analytics and Robotic Process Automation. When it comes to quality, we are ISO 2700:2013, 9001:2015 and CMMI level 3 Certified provider of enterprise solutions and services. Our Vision: Novigo want to be recognized Globally as a Leader in Technology Solutions and Innovation Our Mission: Helping our Customers grow by transforming their business through Innovative and Scalable Solutions based on Modern Technologies Our Core Values: • Ethical Business Practices • Delivery Excellence • Providing the Best-in-Class Value Proposition to our Clients • Employee Engagement We have gained immense expertise in solving core issues within business process automation, legacy modernization, cloud migration, marketing collaboration and in demystifying business challenges within productivity and efficiency. Our unique business model allows us to offer you exceptional quality and diverse capabilities with the personal attention that your business needs and deserves all with a single focus - your success. Novigo focuses mainly on latest technology platforms like Azure ADS, Synapse, Microsoft SharePoint, Office 365, Power Platform: Power Automate, Power Apps, POwer BI & Power Virtual Agents, Microservices, Open Source Technologies, Snowflake, SalesForce, Business Intelligence and Agile Analytics, Robotic Process Automation, Data Science and Data Warehousing, E-Content Services, ERP Implementation, Hybrid Mobile Applications using Google Flutter/Xamarin/React Native and 24/7 Managed Services. Website http://www.novigosolutions.com Phone +1 9195925521Phone number is +1 9195925521 Industry Software Development Company size 501-1,000 employees 508 on LinkedIn Includes members with current employer listed as Novigo Solutions, including part-time roles. Headquarters Dallas, Texas Founded 2012 Specialties Process Automation & Optimization, Legacy Modernization, Microsoft Technologies - Sharepoint, 0365, .NET MVC, Salesforce Implementation, Customization and Development, Managed IT Services, Workflow Management, ERP implementation & Support Services, IT Support Services, Data Visualization & Reporting, IT Business Consulting, Data Connectors and ETL , Big Data, Staff Augmentation Services, Hadoop , Data Science, Data Warehousing, Enterprise Blockchain Solutions, Agile Analytics, RPA - UiPath, IT Staff Augmentation, Azure ADS/Synapse, Microservices, Open Source, Power Platform: Power Automate, Power Apps, Power BI & Power Virtual Agents, and Nintex"
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
        messages: [{role:"system",content: "you are a politician from India, representing the Indian National Congress Party and standing as a candidate for the MLA post in the upcoming Karnataka election on 10th of march for the first time and people are asking you a question as a part of campaign your job is to answer and convince them to vote for you.reply them in short as possible"},
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
                
                const response = await api(msg_body);
                console.log(response)
               
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