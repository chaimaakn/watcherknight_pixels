const express=require("express");
const router=express.Router();
const userModel=require("../dataBase/models/users.js");
const jwt=require("../util/jwt.js");
const hashUtile=require("../util/hash.js");
const eventModel=require("../dataBase/models/events.js");
const authenticate = require("../middelwer/authM.js");

router.post("/register",async function(req,res){
const email=req.body.email;
const password=req.body.password;
const name=req.body.name;
const role=req.body.role;

if(!email || !password || !name || !role){
    res.json("Invalid body !! email or name or password not intred");
    return;
}
try{
const hashedPassword=await hashUtile.hashPassword(password);
await userModel.create({name,password: hashedPassword,email,role});

res.json("user created succesfuly");
}
catch(error){
console.log(error);    
res.json("an error has been detected");
}

});


router.post("/login",async function(req,res){
const email=req.body.email;
const password=req.body.password;


const user = await userModel.findOne({email:email});
if(!user){res.json("user not found");
    return;
}

const isValid=await hashUtile.comparePassword(user.password,password);
if(!isValid){
    res.json("password incorrect");
    return;
    
}
const token=jwt.genertatoken(user._id);
res.json({token});


});

router.post("/create/event",async function(req,res){

const eventName=req.body.eventName;
const candidates=req.body.candidates;
const  eventDate=req.body.eventDate;
const ouvert=req.body.ouvert;

const email=req.body.email;
const password=req.body.password;

    if(!email || !password || !eventName || !candidates || !eventDate|| ouvert===undefined){
        res.status(401).json("Invalid body !! ");
        return;
    }

    try{
 
        const user = await userModel.findOne({email:email});
        if(!user){res.status(401).json("user not found");
            return;
        }
        
        const isValid=await hashUtile.comparePassword(user.password,password);
        if(!isValid){
            res.status(401).json("password incorrect");
            return;
            
        }
        
        if(user.role !== "Admin")
        {
            res.status(401).json("vous n'etes pas administrateur impossible de créer un événement");
            return;
        }
        
        const event= await eventModel.findOne({eventDate:eventDate});
        if(event){
          res.status(401).json("il existe déja un évenement dans ce jour la ");
          return;
        }
        const token=jwt.genertatoken(user._id);
        const formattedCandidates = candidates.map(candidateId => ({
            candidateId,
            votes: 0
        }));

        const event2 = new eventModel({
            eventName,
            candidates: formattedCandidates,
            eventDate,
            ouvert
        });

        await event2.save();
    
    res.json("event created succesfully");
    }
    catch(error){
    console.log(error);    
    res.json("an error has been detected");
    }
    
    }
);
router.put("/update/event/:id", async function(req, res) {
    const id = req.params.id; 
    const { eventName, candidates, eventDate, ouvert, email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            res.status(401).json("user not found");
            return;
        }
        
        const isValid = await hashUtile.comparePassword(user.password, password);
        if (!isValid) {
            res.status(401).json("password incorrect");
            return;
        }

        if (user.role !== "Admin") {
            res.status(401).json("vous n'êtes pas administrateur, impossible de modifier un événement");
            return;
        }

        const event = await eventModel.findById(id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        if (eventName) event.eventName = eventName;
        if (candidates) {
            const formattedCandidates = candidates.map(candidateId => ({
                candidateId,
                votes: 0
            }));
            event.candidates = formattedCandidates;
        }
        if (eventDate) event.eventDate = eventDate;
        if (ouvert !== undefined) event.ouvert = ouvert;

        await event.save();

        res.json("event updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/delete/event/:id", async function(req, res) {
    const id = req.params.id;
    const email=req.body.email;
    const password=req.body.password;
    try {

        const user = await userModel.findOne({email:email});
        if(!user){res.status(401).json("user not found");
            return;
        }
        
        const isValid=await hashUtile.comparePassword(user.password,password);
        if(!isValid){
            res.status(401).json("password incorrect");
            return;
            
        }
        if(user.role !== "Admin")
        {
            res.status(401).json("vous n'etes pas administrateur impossible de supprimer un event");
            return;
        }

        const event = await eventModel.findOneAndDelete({ _id: id });

        if (!event) {
            return res.status(404).json({ error: "event not found" });
        }

        res.json({ message: "event deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get('/events/all', authenticate, async (req, res) => {
    try {
      let events;
      
        events = await eventModel.find({});
        res.json(events);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


  router.post("/event/winner", async (req, res) => 
  {
    const  eventId  = req.body.eventId;
    const email=req.body.email;
    const password=req.body.password;

   try{   
        const user = await userModel.findOne({email:email});
        if(!user){res.status(401).json("user not found");
            return;
        }
        
        const isValid=await hashUtile.comparePassword(user.password,password);
        if(!isValid){
            res.status(401).json("password incorrect");
            return;
            
        }
        if(user.role !== "Admin")
        {
            res.status(401).json("vous n'etes pas administrateur impossible de moddifier les vinceurs");
            return;
        } 
   }
   catch(error)
   {
    console.error("Erreur lors de la recherche de l'utilisateur:", error);
    return res.status(500).json("Erreur lors de la recherche de l'utilisateur");
  
   }
    
    if (!eventId) {
        res.status(400).json("Invalid body, eventId is required.");
        return;
    }

    try {
        const event = await eventModel.findById(eventId).populate('candidates.candidateId');
        if (!event) {
            res.status(404).json("Event not found");
            return;
        }
        
        if (event.candidates.length === 0) {
            res.status(404).json("No candidates found for this event");
            return;
        }
        if(event.ouvert){
            res.status(404).json("Vote pas encore terminé");
            return; 
        }
        let winner = null;
        let maxVotes = -1;

        event.candidates.forEach(candidate => {
            if (candidate.votes > maxVotes) {
                maxVotes = candidate.votes;
                winner = candidate.candidateId;
            }
        });

        if (winner) {
            event.winner = winner._id;
            await event.save();
            res.json({ winner: winner.name });
        } else {
            res.status(404).json("No votes found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json("An error has been detected");
    }
});



  

module.exports=router;