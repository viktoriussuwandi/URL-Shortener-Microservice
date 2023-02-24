require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const fs = require('fs');
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

//1.function for File data.json
function dataManagement(action, input) {
  let filePath = './public/data.json';
  //check if file exist -> create new file if not exist
  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, 'w'));
  }

  //read file
  const file = fs.readFileSync(filePath);
  if (action == 'save data' && input != null) {
      //check if file is empty
    if (file.length == 0) {
      //add data to json file
      fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else {
      //append input to data.json file
      let data = JSON.parse(file.toString());
      //add input element to existing data json object
      data.push(input);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  }
  else if (action == 'load data' && input == null) {
    if (file.length == 0) { alert('No data saved'); return; }
    else {
      let dataArray = JSON.parse(file);
      return dataArray;
    }
  }
}

//2.function for random Math
function gen_shorturl() {
  let Alldata      = dataManagement('load data');
  let short = Math.ceil(Math.random(10));
  Alldata.forEach(d => {
    if ( short == d.short_url ) { gen_shorturl(); }
  });
  return short;
}

//3.middleware to handle user url input
app.post('/api/shorturl', (req,res) => {
  //Create variable needs
  let input = '', domain = '', param = '', short = 0;
  
  //Post url from user input
  input = req.body.url;
  if (input === null || input === '') { 
    return res.json({ error: 'invalid url' }); 
  }
  
  //matches a string with regular expr => return array
  //url should contains : http:// or https://
  domain = input.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/igm);
  //search a string with regular expr, and replace the string -> delete https://
  param = domain[0].replace(/^https?:\/\//i, "");

  //Validate the url
  dns.lookup(param, (err, url_Ip) => {
    if (err) {
      //If url is not valid -> respond error
      console.log(url_Ip);
      return res.json({ error: 'invalid url' });
    }
    else {
      //If url is valid -> generate short url
      short = gen_shorturl();
      dict = {original_url : input, short_url : short};
      dataManagement("save data", dict);
      return res.json(dict);
    }
  });
});

//4.middleware to handle existing short url
app.get('/api/shorturl/:shorturl', (req,res) => {
  let input = req.params.shorturl;
  Alldata      = dataManagement('load data');
  let findData = {};
  Alldata.forEach(d => {
    if ( input == d.short_url ) { console.log(d); }
  });
    
  res.json({type : typeof data, data : Alldata});
  // res.redirect(dict.input);
  
});

/*=========================================================================================*/

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});