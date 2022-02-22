// Routes

import express from "express";

import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
} from "../controllers/posts.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// cannot be reached by localhost:5000/
// can be reach by localhost:5000/posts because prefix was added
// adding auth middle to check user permission before performing actions
// auth can populate req, which can be use in the next action
router.get("/", getPosts);
router.post("/", auth, createPost);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/likePost", auth, likePost);

export default router;
