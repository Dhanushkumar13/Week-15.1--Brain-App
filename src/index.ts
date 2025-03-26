import express,{ Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import { UserModel, ContentModel, LinkModel } from './db';
import {JWT_PASSWORD} from './config'
import { userMiddleware } from './middleware';
import { random } from './util';
import cors from 'cors';

const app = express();

app.use(express.json())
app.use(cors());

app.post('/api/v1/signup', async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

   try {
    await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "User signed up!"
    })
   } catch (error) {
    res.json({
        message: "User already exists"
    })
   }
})

app.post('/api/v1/signin',async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    }else{
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }
})

app.post('/api/v1/content', userMiddleware,async (req,res)=>{
    try{
        const link = req.body.link;
        const title = req.body.title;
        const type = req.body.type
        await ContentModel.create({
            link,
            title,
            type,
            //@ts-ignore
            userId: req.userId,
            tags: []
        })
        res.json({
            message: "Content added"
    })
    }catch(err){
        res.json({
            message: "Content not found:", err
        })
    }

})

app.get('/api/v1/content', userMiddleware, async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.userId;
        console.log("UserID:", userId);

        const content = await ContentModel.find({ userId }).populate('userId',"username");
        console.log("Content:", content);

        res.json({ content });
    } catch (error) {
        console.error("Error fetching content:", error);
        res.status(500).json({
            message: "Error occurred",
            error: error
        });
    }
});


app.delete('/api/v1/content',async (req,res)=>{
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        //@ts-ignore
        userId: req.userId,
        contentId
    })
})

app.post('/api/v1/brain/share', userMiddleware, async (req,res)=>{
    const share = req.body.share;
    const hash =  random(10);
    if(share){
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash
        })
        res.json({
            message: "/api/v1/brain/" + hash 
        })
    }else{
        await LinkModel.deleteOne({
                      //@ts-ignore
            userId: req.userId,
        })
        res.json({
            message: "Removed Link"
        })
    }

})

app.get('/api/v1/brain/:shareLink', async (req,res)=>{
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash: hash
    });

    if(!link){
        res.status(411).json({
            messaage:"Sorry incorrect link"
        })
        return;
    }

    const user = await UserModel.findOne({
        userId: link.userId
    })

    const content = await ContentModel.find({
        userId: link.userId
    })

    res.json({
        username: user?.username,
        content: content
    })
})

app.listen(3000);
console.log('Running on port 3000');