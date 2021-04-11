import FriendsFacade from "../facades/DummyDB-facade";
import { IFriend } from "../interfaces/IFriend";
import Joi from "joi";
import express from "express";
import { ApiError } from "../errors/apierror";
import authMiddleware from "../middleware/basic-auth";

var router = express.Router();
router.use(express.json());
const schema = Joi.object({
  id: Joi.number(),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().min(3).required(),
  password: Joi.string().min(3).required(),
});

const friend = new FriendsFacade();

router.use(authMiddleware);

router.get("/demo", (req, res) => {
  res.send("Server is up");
});

router.get("/allfriends", async (req, res, next) => {
  try {
    const friends = await friend.getAllFriends();
    if (friends == null) {
      throw new ApiError("No friends found", 404);
    }
    const friendsDTO = friends.map((friend) => {
      const { firstName, lastName, email } = friend;
      return { firstName, lastName, email };
    });
    res.json(friends);
  } catch (err) {
    next(err);
  }
});

router.post("/addfriend", (req, res) => {
  const postObj: IFriend = {
    id: (friend.friends.length + 1).toString(),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };
  const { error } = schema.validate(postObj);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  friend.addFriend(postObj);
  res.json(postObj);
});

router.delete("/deletefriend/:email", async (req, res, next) => {
  try {
    const result = await friend.deleteFriend(req.params.email);
    res.json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
// Med sikkerhed
router.delete("/me", async (req: any, res, next) => {
  try {
    const email = req.credentials.userName;
    const result = await friend.deleteFriend(email);
    res.json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export default router;
