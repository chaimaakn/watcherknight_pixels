const mongoose=require("mongoose");
const UserSchema= new mongoose.Schema(
    {
    name: {type : String,
           required:true,
    },
    email : {type:String,
        required:true,  
        },
        
    password: {type : String,
        required:true,
 },
    role: { 
        type: String, enum: ['Admin', 'user'], required: true 
    }

    }
);
const UserSchemaModle=mongoose.model(
    "user",UserSchema
);
module.exports=UserSchemaModle;