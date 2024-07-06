const express = require('express');
const router = express.Router();
const eventModel = require("../dataBase/models/events");
const voteModel = require('../dataBase/models/vote.js');
const authenticate = require('../middelwer/authM.js');
const userModel = require("../dataBase/models/users.js");

router.get("/affiche/:eventid", async function(req, res) {
    const eventId = req.params.eventid;
    
    try {
      const event = await eventModel.findById(eventId);
  
      if (!event) {
        return res.status(404).json("Event not found");
      }
  
      // Récupérer tous les IDs des candidats
      const candidateIds = event.candidates.map(candidate => candidate.candidateId);
  
      // Trouver tous les utilisateurs correspondant à ces IDs
      const users = await userModel.find({
        '_id': { $in: candidateIds }
      }, 'name'); // On ne récupère que le champ 'name'
  
      // Créer un objet pour faciliter la correspondance entre ID et nom
      const userMap = {};
      users.forEach(user => {
        userMap[user._id.toString()] = user.name;
      });
  
      // Formater les données des candidats pour la réponse
      const candidates = event.candidates.map(candidate => ({
        id: candidate.candidateId.toString(),
        name: userMap[candidate.candidateId.toString()],
        votes: candidate.votes
      }));
  
      res.json({
        eventName: event.eventName,
        eventDate: event.eventDate,
        candidates: candidates
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json("An error has been detected");
    }
  });
router.post("/:eventid", authenticate, async function(req, res) {
    const candidateId = req.body.candidateId;
    
    try {
        const userId = req.user._id;
        const eventId = req.params.eventid;
        const event = await eventModel.findOne({_id: eventId});

        if (!event) {
            res.status(401).json("Cet événement n'existe pas");
            return;
        }

        const vote = await voteModel.findOne({ userId: userId, eventId: eventId });
        if (vote && vote.voted) {
            res.status(401).json("Vous avez déjà voté pour cet événement");
            return;
        }

        const candidate = event.candidates.find(candidate => candidate.candidateId.toString() === candidateId);
        if (!candidate) {
            res.status(401).json("Candidat non trouvé dans cet événement");
            return;
        }

        // Incrémenter le nombre de votes du candidat
        candidate.votes += 1;

        // Mettre à jour ou créer le vote
        if (vote) {
            vote.voted = true;
            vote.candidateId = candidateId;
            await vote.save();
        } else {
            await voteModel.create({
                userId: userId,
                eventId: eventId,
                voted: true,
                candidateId: candidateId
            });
        }

        // Sauvegarder les changements dans l'événement
        await event.save();

        res.json("Vote successfully");
    } catch (error) {
        console.log(error);
        res.status(500).json("An error has been detected");
    }
});

module.exports = router;
