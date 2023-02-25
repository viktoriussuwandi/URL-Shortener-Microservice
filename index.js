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

//1.function to manage local file storage (File data.json)
function dataManagement(action, input) {
  let filePath = './public/data.json';
  //check if file exist -> create new file if not exist
  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, 'w'));
  }

  //read file data.json
  let file = fs.readFileSync(filePath);
  
  //screnario for save input into data
  if (action == 'save data' && input != null) {
      //check if file is empty
    if (file.length == 0) {
      //add new data to json file
      fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else {
      //append input to data.json file
      let data = JSON.parse(file.toString());
      //check if input.original_url already exist
      let inputExist = [];
      inputExist  = data.map(d => d.original_url);
      let check_input = inputExist.includes(input.original_url);     
      if (check_input === false) {
        //add input element to existing data json object
        data.push(input);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }
    }
  }

  //screnario for load the data
  else if (action == 'load data' && input == null) {
    if (file.length == 0) { return; }
    else {
      let dataArray = JSON.parse(file);
      return dataArray;
    }
  }
}

//2.function for random short_url (using Math.random())
function gen_shorturl() {
  let all_Data   = dataManagement('load data');
  // generate random number between 1 to data_length*1000
  let min = 1; let max = 1000; 
  if ( all_Data != undefined && all_Data.length > 0 ) { max = all_Data.length*1000 }
  else { max = 1000; }
  let short = Math.ceil(Math.random()* (max - min + 1) + min);
  
  //get all existing short url
  if (all_Data === undefined) { return short; }
  else {
    //check if short url already exist
    let shortExist  = all_Data.map(d => d.short_url);
    let check_short = shortExist.includes(short);
    if ( check_short ) {gen_shorturl(); } else { return short; }
  }
  
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
  let input    = Number(req.params.shorturl);
  let all_Data = dataManagement('load data');
  
  //check if short url already exist
  let shortExist  = all_Data.map(d => d.short_url);
  let check_short = shortExist.includes(input);
  if (check_short && all_Data != undefined) {
    data_found = all_Data[shortExist.indexOf(input)];
    // res.json({data : data_found, short : input, existing : shortExist});
    res.redirect(data_found.original_url);
  }
  else {
    res.json({data : 'No matching data', short : input, existing : shortExist});
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