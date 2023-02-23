require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/*-----------------------------------------------------------------------------------------*/
/*---------------------------------------MY CODE-------------------------------------------*/
/*-----------------------------------------------------------------------------------------*/

app.post('/api/shorturl', (req,res) => {
  //1.Create variable needs
  let input = '', domain = '', param = '', short = 0;
  
  //2.Post url from user input
  input = req.body.url;
  //2a.matches a string with regular expression => return array
  //   url should contains : http:// or https://
  domain = input.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/igm);
  //2b.search a string with regular expression, and replace the string -> delete https://
  param = domain[0].replace(/^https?:\/\//i, "");

  //3.Validate the url
  dns.lookup(param, (err, address)=>{
    if (err) {
      //3a.If url is not valid -> respond error
      return res.json({ error: 'invalid url' }); 
    }
    else {
      //3a.If url is valid -> generate short url
      short = Math.ceil(Math.random(10));
      dict = {original_url : input, short_url : short};
      return res.json(dict);
    }
  });
});

app.get(`/api/shorturl/:shorturl`, (req,res) => {
  url = req.params.shorturl;
  if (url == '') {
  }
  else {
    console.log(url);
    res.json({});
    // res.redirect(dict.input);  
  }
  
});

/*=========================================================================================*/

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


// function testDict() {
//   let dict = {name : '', age : 20};
//   dict.name = "Angela Yu";
//   dict.age  = 35;
//   console.log(`Name : ${dict.name}`);
//   console.log(`Age  : ${dict.age}`);
// }

// testDict();
