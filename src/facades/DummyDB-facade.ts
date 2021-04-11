import { IFriend } from "../interfaces/IFriend";

function singleValuePromise<T>(val: T | null): Promise<T | null> {
  return new Promise<T | null>((resolve, reject) => {
    setTimeout(() => resolve(val), 0);
  });
}
function arrayValuePromise<T>(val: Array<T>): Promise<Array<T>> {
  return new Promise<Array<T>>((resolve, reject) => {
    setTimeout(() => resolve(val), 0);
  });
}

export default class FriendsFacade {
  friends: Array<IFriend> = [
    {
      id: "id1",
      firstName: "Peter",
      lastName: "Pan",
      email: "pp@b.dk",
      password: "secret",
    },
    {
      id: "id2",
      firstName: "Donald",
      lastName: "Duck",
      email: "dd@b.dk",
      password: "secret",
    },
  ];
  async addFriend(friend: IFriend): Promise<IFriend> {
    this.friends.push(friend);
    const promise = (await singleValuePromise<IFriend>(friend)) as IFriend;
    return promise;
  }
  async deleteFriend(friendEmail: string): Promise<IFriend> {
    // Loop thru friends, find friend object given email
    let obj;
    for (let index = 0; index < this.friends.length; index++) {
      const element = this.friends[index];
      if (element.email === friendEmail) {
        obj = element;
      }
    }
    // Use the splice method to remove the found friend obj
    if (obj === undefined) {
      throw Error(
        `No friend obj was found with the given email ${friendEmail}`
      );
    }
    const index = this.friends.indexOf(obj);
    this.friends.splice(index, 1);
    return (await singleValuePromise<IFriend>(obj)) as IFriend;
  }
  async getAllFriends(): Promise<Array<IFriend>> {
    const f: Array<IFriend> = this.friends;
    return arrayValuePromise<IFriend>(this.friends);
  }
  async getFrind(friendEmail: string): Promise<IFriend | null> {
    let friend: IFriend | null;
    friend = this.friends.find((f) => f.email === friendEmail) || null;
    return singleValuePromise<IFriend>(friend);
  }
}
