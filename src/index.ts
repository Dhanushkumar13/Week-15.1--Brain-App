import express,{ Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import { UserModel, ContentModel } from './db';
import {JWT_PASSWORD} from './config'
import { userMiddleware } from './middleware';

const app = express();

app.use(express.json())

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
        const title = req.body.title
        await ContentModel.create({
            link,
            title,
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

app.post('/api/v1/brain/share', (req,res)=>{
    
})

app.get('/api/v1/brain/:shareLink', (req,res)=>{
    
})

app.listen(3000);
console.log('Running on port 3000');