import mongoose from "mongoose";

// Creating data schema for each post
const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: String,
  tags: [String],
  selectedFile: String, //image will be converted to string using base64
  likes: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});
// Turning post schema into model
const PostMessage = mongoose.model("PostMessage", postSchema);

export default PostMessage;
