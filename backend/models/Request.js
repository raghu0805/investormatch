import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupProfile",
      required: true,
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestorProfile",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;





// import mongoose from "mongoose";

// const requestSchema = new mongoose.Schema(
//     {
//         senderId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },

//         receiverId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },

//         startupId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "StartupProfile",
//             default: null
//         },

//         investorId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "InvestorProfile",
//             default: null
//         },

//         status: {
//             type: String,
//             enum: ["pending", "accepted", "rejected"],
//             default: "pending"
//         },

//         message: {
//             type: String,
//             default: ""
//         }
//     },
//     { timestamps: true }
// );

// const Request = mongoose.model("Request", requestSchema);

// export default Request;
