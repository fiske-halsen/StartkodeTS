import { IFriend } from "../interfaces/IFriend";
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from "../errors/apierror";
import Joi, { ValidationError } from "joi";

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().required(),
});

class FriendsFacade {
  db: Db;
  friendCollection: Collection;

  constructor(db: Db) {
    this.db = db;
    this.friendCollection = db.collection("friends");
  }

  /**
   *
   * @param friend
   * @throws ApiError if validation fails
   */
  async addFriend(friend: IFriend): Promise<{ id: String }> {
    const status = USER_INPUT_SCHEMA.validate(friend);

    if (status.error) {
      throw new ApiError(status.error.message, 400);
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw, role: "user" };
    const result = await this.friendCollection.insertOne({
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      password: f.password,
      role: f.role,
    });
    const generatedId = result.insertedId;
    if (generatedId === null) {
      throw new Error("Could not insert the given friend obj");
    }
    return new Promise((resolve, reject) => {
      resolve({ id: generatedId });
    });
  }

  /**
   * TODO
   * @param userEmail
   * @param friend
   * @throws ApiError if validation fails or friend was not found
   */
  async editFriend(
    userEmail: string,
    friend: IFriend
  ): Promise<{ modifiedCount: number }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400);
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const { firstName, lastName, email, password } = {
      ...friend,
      password: hashedpw,
    };

    const result = await this.friendCollection.updateOne(
      { email: userEmail },
      {
        $set: {
          firstName,
          lastName,
          email,
          password,
        },
      }
    );

    console.log(result.modifiedCount);

    const modifiedCount = result.modifiedCount;

    return new Promise((resolve, reject) => {
      resolve({ modifiedCount: modifiedCount });
    });
  }
  /**
   *
   * @param friendEmail
   * @returns true if deleted otherwise false
   */
  async deleteFriend(friendEmail: string): Promise<boolean> {
    let isDeleted = true;
    const status = await this.friendCollection.deleteOne({
      email: friendEmail,
    });
    if (status.result.n === 0) {
      isDeleted = false;
    }
    return new Promise((resolve, reject) => {
      resolve(isDeleted);
    });
  }

  async getAllFriends(): Promise<Array<IFriend>> {
    const users: unknown = await this.friendCollection.find({}).toArray();
    return users as Array<IFriend>;
  }

  /**
   *
   * @param friendEmail
   * @returns
   * @throws ApiError if not found
   */
  async getFrind(friendEmail: string): Promise<IFriend> {
    const result = await this.friendCollection.findOne({ email: friendEmail });
    if (result === null) {
      throw new ApiError("Could not find a user with the given email");
    }
    return new Promise((resolve, reject) => {
      resolve(result);
    });
  }

  /**
   * Use this method for authentication
   * @param friendEmail
   * @param password
   * @returns the user if he could be authenticated, otherwise null
   */
  async getVerifiedUser(
    friendEmail: string,
    password: string
  ): Promise<IFriend | null> {
    const friend: IFriend = await this.friendCollection.findOne({
      email: friendEmail,
    });
    if (friend && (await bcrypt.compare(password, friend.password))) {
      return friend;
    }
    return null;
  }
}

export default FriendsFacade;
