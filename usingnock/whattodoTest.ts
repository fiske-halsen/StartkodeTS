const expect = require("chai").expect;
import app from "./whattodo";
import supertest from "supertest";
import nock from "nock";

describe("What to do endpoint", function () {
  before(() => {
    nock("https://www.boredapi.com")
      .get("/api/activity")
      .reply(200, { activity: "drink a single beer" });

    nock("https://api.genderize.io?name=")
      .get("/")
      .query(true)
      .reply(200, { name: "hans", gender: "male" });
    nock("https://api.nationalize.io?name=")
      .get("/")
      .query(true)
      .reply(200, { country: [{ country_id: "DK" }] });
    nock("https://api.agify.io?name=")
      .get("/")
      .query(true)
      .reply(200, { age: 60 });
  });

  it("Should eventually provide 'drink a single beer'", async function () {
    const response = await supertest(app).get("/whattodo");
    expect(response.body.activity).to.be.equal("drink a single beer");
  });

  it("Should eventually provide xxx'", async function () {
    const response = await supertest(app).get("/nameinfo/:name");
    expect(response.body.gender).to.be.equal("male");
  });
});
