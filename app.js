require('dotenv').config();
const express = require("express");
const https = require("https");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");




app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  const apiKey =  process.env.nasaApi;
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

  https.get(url, function (response) {
    console.log(response.statusCode);
    response.on("data", function (data) {
      const apodData = JSON.parse(data);
      const imageURL = apodData.hdurl;

      res.render("index", { backgroundImageURL: imageURL });
    });
  });
});

app.post("/", function (req, res) {
  const query = req.body.cityName;
  const apiKey = process.env.weatherApi;
  const unit = "metric";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${unit}`;

  https.get(url, function (response) {
    console.log(response.statusCode);

    response.on("data", function (data) {
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const description = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const imageURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      const apiKey = "KGc5Rn8SPqO8pvfKCUA5kCfXdGWVMTgIhTEBhDdb";
      const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

      https.get(url, function (response) {
        console.log(response.statusCode);
        response.on("data", function (data) {
          const apodData = JSON.parse(data);
          const backgroundImageURL = apodData.hdurl;

          res.render("weather", {
            city: query,
            temperature: temp,
            description: description,
            imageURL: imageURL,
            backgroundImageURL: backgroundImageURL,
          });
        });
      });
    });
  });
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

const apiKey =  process.env.mailchimpApi;
const listId =  process.env.mailchimpListId;

app.post("/signup", function (req, res) {
  const mailData = {
    members: [
      {
        email_address: req.body.Email,
        status: "subscribed",
        merge_fields: {
          FNAME: req.body.fName,
          LNAME: req.body.lName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(mailData);

  const options = {
    method: "POST",
    auth: `furkan:${apiKey}`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mailUrl = `https://us21.api.mailchimp.com/3.0/lists/${listId}`;

  const request = https.request(mailUrl, options, function (response) {
    console.log(response.statusCode);

    if (response.statusCode === 200) {
      res.redirect("/");
    } else {
      res.render("error");
    }
  });

  request.write(jsonData);
  request.end();
});




app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port " + (process.env.PORT || 3000));
});

