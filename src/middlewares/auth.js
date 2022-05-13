const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");

const authenticate = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-Api-key"];
    if (!token)
      return res.status(400).send({ status: false, msg: "token is mandatory" });

    let decodeToken = jwt.verify(token, "project-one");
    if (!decodeToken)
      return res.status(401).send({ status: false, msg: "invalid Token" });

    next();
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message });
  }
};

const authorise = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    let decodeToken = jwt.verify(token, "project-one");

    let author_Id = decodeToken.author_Id;
    let pathBlog = req.params.blogId;
    let queryData = req.query;


    if (pathBlog) {
      let pathAuthors = await blogModel.findById({ _id: pathBlog }).select({ authorId: 1, _id: 0 });
      if (pathAuthors.authorId != author_Id)
        return res.status(400).send({ status: false, msg: "user not authorised" });
    } else {
      let queryAuthors = await blogModel.find({$and: [queryData, { authorId: author_Id }],});

      if (!queryAuthors.length)
        return res.status(400).send({ status: false, msg: "No data matching your request" });

      let checkData;

      for (let i = 0; i < queryAuthors.length; i++) {
        checkData = queryAuthors[i].authorId;
      }

      if (checkData != author_Id)
        return res.status(400).send({ status: false, msg: "user not authorised" });
    }

    next();
  } catch {
    res.status(500).send({ status: false, msg: "err" });
  }
};

module.exports.authenticate = authenticate;
module.exports.authorise = authorise;