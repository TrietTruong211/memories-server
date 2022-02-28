// Controllers responding to each routes, this is where all the logics happen

import PostMessage from "../models/postMessage.js";
import mongoose from "mongoose";

export const getPosts = async (req, res) => {
  const { page } = req.query;
  //finding something takes time, hence async
  try {
    const LIMIT = 8; //limit how many posts per page
    //Calculate the starting index of this page, to get only posts for this page
    const startIndex = (Number(page) - 1) * LIMIT; //page is a string when passed through to server, hence convert that to number again
    const total = await PostMessage.countDocuments({});
    //find takes time, hence await
    const posts = await PostMessage.find()
      .sort({ _id: -1 }) //sort({ _id: -1 }) = sort from newest to oldest
      .limit(LIMIT) // return limited number of posts per page
      .skip(startIndex); // skip() to skip getting posts from pages we already have

    // console.log(postMessages);
    // returning the posts with the current page and total number of pages
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostMessage.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// params and query are different in req
// QUERY -> /posts?page=1 -> page = 1
// PARAMS -> /posts/123 -> id = 123
export const getPostBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;

  try {
    const title = new RegExp(searchQuery, "i"); //turn into regular expression, 'i' = ignore case, everything become lowercase
    console.log(req);
    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    }); //$or = match either or, $in = is any in the array equal to
    res.json({ data: posts });
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

export const commentPost = async (req, res) => {
  const { id } = req.params; //get id of post
  const { comment } = req.body; //get the comment

  const post = await PostMessage.findById(id);
  post.comments.push(comment);

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.json(updatedPost);
};
