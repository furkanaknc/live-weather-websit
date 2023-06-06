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
  res.render("index");
});

app.post("/", function (req, res) {
  const query = req.body.cityName;
  const weatherApiKey = process.env.WEATHER_API;
  const unit = "metric";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${weatherApiKey}&units=${unit}`;

  https.get(weatherUrl, function (response) {
    console.log(response.statusCode);

    response.on("data", function (data) {
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const description = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const weatherImageUrl = `https://openweathermap.org/img/wn/${icon}.png`;

      res.render("weather", {
        city: query,
        temperature: temp,
        description: description,
        weatherImageUrl: weatherImageUrl,
      });
      
    });
  });
});

const mailchimpApiKey = process.env.MAILCHIMP_API;
const mailchimpListId = process.env.MAILCHIMP_LIST_ID;

app.get("/signup", function (req, res) {
  res.render("signup");
});

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
    auth: `anystring:${mailchimpApiKey}`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mailchimpUrl = `https://us21.api.mailchimp.com/3.0/lists/${mailchimpListId}`;

  const request = https.request(mailchimpUrl, options, function (response) {
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
