// Controllers responding to each routes, this is where all the logics happen

import PostMessage from "../models/postMessage.js";
import mongoose from "mongoose";

export const getPosts = async (req, res) => {
  //finding something takes time, hence async
  try {
    const postMessages = await PostMessage.find(); //find takes time, hence await
    // console.log(postMessages);
    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;

  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  }); //new Date().toISOString() current day

  // res.send({ newPost });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params; //getting object id from the url of req, rename id to _id
  const post = req.body; //getting value of the updated post

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that id"); //check if id exist to throw err

  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    { ...post, _id },
    {
      new: true,
    }
    //including all value from post (spreaded) with additional id field
  );

  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that id");

  await PostMessage.findByIdAndRemove(_id);

  res.json({ message: "Post deleted successfully" });
};

export const likePost = async (req, res) => {
  const { id: _id } = req.params;

  // req.userId was already populated by auth action, which happens before likePost
  if (!req.userId) return res.json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that id");

  const post = await PostMessage.findById(_id);

  // find the id of this user in the post's likes
  const index = post.likes.findIndex((id) => id === String(req.userId));
  // if index is -1, means user hasn't liked the post, else user has already liked the post
  if (index === -1) {
    //  Adding user to the list of users that liked the post, allow user to like the post
    post.likes.push(req.userId);
  } else {
    // Excluding user from the list of users that liked the post, allow user to dislike
    post.likes = post.likes.filter((id) => id !== String(req.userId));
  }
  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    // { likeCount: post.likeCount + 1 },
    post,
    { new: true }
  ); //thrid params, new:true required for updating

  res.json(updatedPost);
};
