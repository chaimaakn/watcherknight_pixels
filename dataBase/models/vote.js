const mongoose=require("mongoose");


const voteSchema = new mongoose.Schema({
    userId: { type:mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    voted: { type: Boolean, required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
  });
  
  const Vote = mongoose.model('Vote', voteSchema);
  module.exports = Vote;