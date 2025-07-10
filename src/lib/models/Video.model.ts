import mongoose, { Model, Schema } from "mongoose";
import videoTypes from "../../types/video.type";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema:Schema<videoTypes> = new Schema({
   videoFile: {
    type: String,
    required: true,
   },
   thumbnail: {
    type: String,
    required: true,
   },
   title: {
    type: String,
    required: true,
   },
   description: {
    type: String,
    required: true,
   },
   duration: {
    type: Number,
    required: true,
   },
   views: {
    type: Number,
    default: 0,
   },
   isPublished: {
    type: Boolean,
    default: true,
   },
   owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
   }
}, {
    timestamps: true,
});

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video:Model<videoTypes> = mongoose.model("Video", VideoSchema);