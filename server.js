const express = require("express");
const app = express();
const path = require("path");
const readXlsxFile = require("read-excel-file/node");
var Busboy = require("busboy");
var fs = require("fs");
var smtpTransport = require("nodemailer-smtp-transport");
const nodemailer = require("nodemailer");
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "client", "build")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

var list = null;
var email = "";
var pswd = "";

async function parseExcel(str) {
  readXlsxFile(str).then((rows) => {
    //  console.log(rows);
    list = rows;
  });
}

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

app.post("/upload", (req, res) => {
  // console.log(req.headers);
  var busboy = new Busboy({ headers: req.headers });
  var saveTo;
  busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
    saveTo = path.join(__dirname, "public", filename);
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on("finish", function () {
    parseExcel(saveTo);
    res.send({ name: "xxx.png", status: "done" });
  });
  return req.pipe(busboy);
});

app.get("/getEmails", (req, res) => {
  if (list == null) return res.send();

  return res.send(list);
});

app.post("/login", (req, res) => {
  email = req.body.user;
  pswd = req.body.pswd;

  console.log(email, pswd);

  if (email && pswd) return res.send();
  else return res.status(400).send();
});

app.post("/submit", async (req, res) => {
  console.log(req.body);

  var to = "";
  list.forEach((i) => {
    to += i[0] + ",";
  });

  let transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: email,
        pass: pswd,
      },
    })
  );

  let info = await transporter.sendMail({
    from: email, // sender address
    to: to, // list of receivers
    subject: req.body.subject,
    html: req.body.body, // html body
  });

  console.log("Message sent: %s", info.messageId);
});

app.listen(PORT, () => {
  console.log("server started");
});
