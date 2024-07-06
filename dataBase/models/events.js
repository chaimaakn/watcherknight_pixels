const mongoose =require("mongoose");

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    candidates: [{ 
      candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
      votes: { type: Number, default: 0 }
    }],
    eventDate: { type: Date, required: true },
    winner:{type: mongoose.Schema.Types.ObjectId,default: null},
    ouvert:{type:Boolean,required:true},
  });
  
  const Event = mongoose.model('Event', eventSchema);
  module.exports = Event;
  