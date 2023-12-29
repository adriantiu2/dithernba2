var playerData;
var playerStats;
var playerStats2;
var playerStats3;
var api = "https://www.balldontlie.io/api/v1/players?search=";
var api2 = "https://www.balldontlie.io/api/v1/season_averages?season=2018&player_ids[]=";
// var input;
var playerDataPic;
var playerData2;
// var apipic = "https://nba-players.herokuapp.com/players/";
var apipic = "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/";
var buttonpic;
var inputpic;
let img;
let img2;
var playerId;
var playerSeason;
let s;
let s2;
let s3;
let datap;
let keys;
let values;
let randomNum;
var urlpic;
var apiPlayers ="https://www.balldontlie.io/api/v1/players/";
let isLoading = false;
var current_season;
var start_season = 2023;
var end_season = 2023;
let frame_pos = {};
let frame_calls = {};  // to keep track of calls
let players_json = {};
let players = [];
var pic_only = false;  // if we're only make a pic
var pic_only_canvas;
var pic_scale = 1;
var img_height = 291;   // force height of image
const nameMapping = {
  "Kevin Knox II": "Kevin Knox",
  "Cam Reddish": "Cameron Reddish",
  "Nic Claxton": "Nicolas Claxton",
  "P.J. Tucker": "PJ Tucker",
  "AJ Green": "A.J. Green",
  "Bones Hyland": "Nah'Shon Hyland",
  // Add more mappings as needed
};

// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  players_json = loadJSON('/assets/players2023.json');
}


function setup() {
  console.log('setup');
    params = getURLParams();
    players = players_json['league']['standard'];
    pic_only = false;

    firstname = createInput();
    firstname.style('margin-right', '5px');
    firstname.style('background-color', 'black');
    firstname.style('color', 'white');
    firstname.style('border', '1px solid white');
    firstname.style('padding', '5px 10px');
    firstname.style('outline', 'none');
    firstname.attribute('placeholder', 'First Name');
    firstname.style('display', 'none');
    input2 = createInput();
    input2.style('margin-right', '5px');
    input2.style('background-color', 'black');
    input2.style('color', 'white');
    input2.style('border', '1px solid white');
    input2.style('padding', '5px 10px');
    input2.style('outline', 'none');
    input2.attribute('placeholder', 'Last Name');
    input2.style('display', 'none');

    // for testing
    // input2 = createInput('clarkson'); firstname = createInput('jordan');
    // input2 = createInput('gilgeous-alexander'); firstname = createInput('shai');

    ix = params["ix"];   // if id is given, go straight to making canvas pic
    if (ix != undefined) {
      do_pic_only( ix );
      return;
    }
    var canvas_w = 460;
    var canvas_h = 540;
    cnv = createCanvas(canvas_w * (end_season-start_season+1), canvas_h);
    cnv.position( 0, 165 );

              // Detect mobile device and set font size accordingly
  if (isMobileDevice()) {
    cnv.position( 0, 287 );
    cnv.style('width', '101%');
    cnv.style('height', 'auto');
  } else {
  }
  random_player();
}

function isMobileDevice() {
  return windowWidth < 768; // You can adjust the threshold as needed
}


function showLoading() {
  // Show the loading GIF
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  // Hide the loading GIF
  document.getElementById('loading').style.display = 'none';
}



//PLAYER SUGGESTING
async function fetchPlayerData() {
  try {
    const response = await fetch('../assets/playerSuggestLive.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching player data:', error);
    return [];
  }
}

// Function to filter player names based on user input
// Function to filter player names based on user input
async function filterPlayerNames() {
  var inputElement = document.getElementById('playerNameInput');
  var suggestionList = document.getElementById('suggestionList');
  suggestionList.innerHTML = ""; // Clear previous suggestions

  var inputValue = inputElement.value.toLowerCase();
  var playersData = await fetchPlayerData();

  var suggestions = playersData
    .filter(player => player.toLowerCase().includes(inputValue))
    .map(player => {
      var suggestionItem = document.createElement("div");
      suggestionItem.textContent = player;

      // Add click event listener to each suggestion
      suggestionItem.addEventListener('click', function () {
        // Set the input value to the clicked suggestion
        inputElement.value = player;
        // Trigger the get_player function
        get_player();
        // Clear the suggestion list
        suggestionList.classList.remove('visible'); // Hide the suggestion list
      });

      suggestionList.appendChild(suggestionItem);
    });
      if (suggestions.length > 0) {
    suggestionList.classList.add('visible'); // Show the suggestion list
  } else {
    suggestionList.classList.remove('visible'); // Hide the suggestion list
  }
}

// Function to hide suggestion list when clicking away
function hideSuggestionsOnClickOutside(event) {
  var inputElement = document.getElementById('playerNameInput');
  var suggestionList = document.getElementById('suggestionList');

  // Check if the click is outside the input and suggestion list
  if (!inputElement.contains(event.target) && !suggestionList.contains(event.target)) {
    suggestionList.classList.remove('visible'); // Hide the suggestion list
  }
}

// Attach the filter function to the input field's input event
document.getElementById('playerNameInput').addEventListener('input', filterPlayerNames);

// Attach click event listener to the document body
document.body.addEventListener('click', hideSuggestionsOnClickOutside);


// Function to handle keypress events in the input field
document.getElementById('playerNameInput').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    // If Enter key is pressed, trigger the functionality associated with clicking the submit button
    get_player();
    // Optionally, prevent the default behavior of the Enter key (form submission)
    event.preventDefault();
  }
});


function do_pic_only( player_ix) {
    pic_only = true;
    pic_scale = 8.0;
    // pic_scale = 2;
    player = players[player_ix];
    console.log('player', player);
    pic_only_canvas = createCanvas(canvas_w * pic_scale, canvas_h * pic_scale);
    pic_only_canvas.position( 0, 0 );
    make_frames( player );
}

function setup_pic() {
    var elt = pic_only_canvas.elt;
    // var img = elt.toDataURL('image/png');
    // img = img.replace("image/png", "image/octet-stream"); 
    var img = elt.toDataURL('image/png').replace("image/png", "image/octet-stream"); 
    document.write('<img id="pic" src="'+img+'"/>');

}

function random_player() {
  ix = Math.floor(Math.random() * (players.length-1));
  make_frames( players[ix] );
}

function get_player() {
  player = null;
  // first_name = firstname.value();
  // last_name = input2.value();

    var fullName = document.getElementById('playerNameInput').value;

     // Check if there's a mapping for the full name
    const mappedFullName = nameMapping[fullName] || fullName;


    for (var i = 0; i < players.length; i++) {
      const playerFullName = (players[i]['firstName'] + ' ' + players[i]['lastName']).toLowerCase();
      if (fullName != mappedFullName) {
        console.log('mappedfull name:', mappedFullName);
        var editedPlayerName = mappedFullName;
        //new code to make it use the mappedFullName as the player name for the make_pic_frame() Function
      }
    }

  // Check if the input contains a space
  var spaceIndex = fullName.indexOf(' ');

  if (spaceIndex !== -1) {
    // If space is found, separate into first and last names
    var first_name = fullName.substring(0, spaceIndex);
    var last_name = fullName.substring(spaceIndex + 1);
    
    // Now you have firstName and lastName variables
    console.log('First Name:', first_name);
    console.log('Last Name:', last_name);

    // Continue with the rest of your code, using firstName and lastName as needed
    // ...

  } else {
    clear();
    hideLoading();
    textSize(15*sc);
    text('ERROR: Invalid input, please enter both first and last names.', 20, 100);
    // Handle the case where the input is missing a space
  }
  for (var i=0 ; i < players.length ; i++) {
    if (players[i]['firstName'].toLowerCase() == first_name.toLowerCase() &&
        players[i]['lastName'].toLowerCase() == last_name.toLowerCase()) {
        player = players[i];
        break;
    }
  }
  if (player == null) {
    clear();
    hideLoading();
    textSize(15*sc);
    text('ERROR: Player not found, check spelling.', 20, 100);
    return;
  }
  make_frames( player, editedPlayerName );
}

function clear_and_show_name() {
  // clear frame background
  clear();
  // background(0);
  // fill(0);
  // rect(0,0, 500, 600);
  // background( 'rgb(0,255,0)' );

  // Show player name
  fill(255);
  showLoading();
  sc = pic_scale;
  textSize(23.3*sc);
                                                // text('Pero Antic', 20*sc, 34*sc);
  text(playerData.firstName + ' ' + playerData.lastName, 20*sc, 34*sc);
  console.log('text x:', 20*sc);

}

function make_frames( player, editedPlayerName ) {
  playerData = player;
  current_season = start_season;
  console.log(editedPlayerName);

  clear_and_show_name();

  // make frame positions
  for(j = start_season; j<=end_season; j++) {
    frame_pos[j] = (j-start_season) * 420;
  }
                                                // var urlpic = "assets/i.png";
  var urlpic = apipic + playerData['personId'] + '.png';
  console.log('pic:', urlpic)
  loadImage(urlpic, function(pic) {
  make_pic_frame(pic, editedPlayerName);
});
}

function make_pic_frame( pic, editedPlayerName ) {
  img = pic;
  var spaceIndex = str(editedPlayerName).indexOf(' ');
  var statsFirstName = str(editedPlayerName).substring(0, spaceIndex);
  var statsLastName = str(editedPlayerName).substring(spaceIndex + 1);
  console.log('Headshot First Name:', playerData['firstName']);
  console.log('(If diff) Stats First Name:', statsFirstName);
  if ((statsFirstName !== playerData['firstName'] || statsLastName !== playerData['LastName']) && statsFirstName.length>1){
      input2.value( statsLastName ); 
    firstname.value( statsFirstName);
    console.log('Not Same Name');
  }
  else{

        input2.value( playerData['lastName'] ); 
    firstname.value( playerData['firstName'] );
    console.log('Same Name');
  }
  // get stats BEFORE pic
  var pageUrl = "https://www.balldontlie.io/api/v1/players?search="+input2.value()+"&page=";
  var pageMax = 5;
  // var pageMax = playerData.meta.total_pages
                                                          // playerId = 2049;
  playerId= null;
  frame_calls = {}
  var currentPage;
  for(j = 1; j<pageMax; j++){
    currentPage = pageUrl + j;
    // loadJSON(currentPage, make_stats_frame);
    loadJSON(currentPage, 'json', make_stats_frame, handle_json_error);
    if (statsFirstName == "Gary"){
      playerId = 3089;
      console.log('gary:', playerId);
    }
    if (playerId != null) break;   // stop when we find the player
  }
}

function handle_json_error( error ) {
  console.log('****call json error** ', error);
  hideLoading();
  textSize(15*sc);
  text( "ERROR: Too many requests, try again later.", 20, 100 );

}


function make_stats_frame( data ) {
  if (playerId == null) {
    data = data.data
    for (var x = 0; x<data.length; x++) {
      if (data[x].first_name.toLowerCase() == firstname.value().toLowerCase()) {
          playerId = parseInt(data[x].id);
          break;
      }        
    }      
  }
  if (playerId != null) {
    frame_key = current_season + playerId.toString();  // track calls
    if (frame_calls[ frame_key ] != 1) {
      frame_calls[ frame_key ] = 1;
      statUrl = "https://www.balldontlie.io/api/v1/season_averages?season=" + current_season.toString() + "&player_ids[]=" + playerId;
      let statData = loadJSON(statUrl);
      console.log('****call**', statUrl);
      console.log('length', statUrl.length);
      // loadJSON(statUrl, make_frame, 'json');
      loadJSON(statUrl, 'json', make_frame, handle_json_error);
    }
  }
}

function make_frame( player_stats ) {

  x_pos = frame_pos[ current_season ] + 16.5;
  console.log('frame pos:', frame_pos[ current_season ]);
  sc = pic_scale;
  x_pos *= sc;
  if (player_stats.data[0]) {

    stats = player_stats.data[0]
    s = (stats.pts) +
        (1.2*(stats.reb)) +
        (1.5*(stats.ast)) +
        (3*(stats.stl)) +
        (3*(stats.blk)) -
        (stats.turnover);
        if (s>0){
          player_score = round(Math.round( s * 100 + Number.EPSILON ) / 100, 1).toPrecision(3);
        }
        else{
          player_score = 0.00;
        }
    if (player_score<1){
      player_score=round(player_score).toPrecision(3);
    }

    y_top = 50*sc;  // top most y position of the frame / space taken by the name
    x_margin = 10*sc;  // left margin from x_pos
    mug_top_padding = 56*sc;   // NOT USED top spacing on mug image

    // headshot
    if (player_score>0.01){
      img.resize(float(s)*5, 0);  // scale to score
      makeDithered(img, 1)
      img.resize( 0, img_height*sc );    // scale back up
    }
    else{
      console.log('less than 0 s =', s);
      img.resize(2, 2);
      makeDithered(img, 1)
      img.resize( 0, img_height*sc ); 
    }
    img.width = 400;
    imageMode( CENTER );
    img_x = x_pos + x_margin + (img.width / 2);   // center x
    img_y = y_top + img.height / 2; // center y
    image(img, img_x, img_y  + mug_top_padding);
    mug_height = img.height + mug_top_padding;  // update mug height with padding
    mug_y = img_y + mug_top_padding/2;    // update the mug y position
    filter(THRESHOLD, 0.4);
    // stats
    stroke_size = 3.8*sc;   // frame stroke size
    top_margin = stroke_size + 16*sc;  // bottom space after mug
    top_padding = 12*sc;  // top leading of text
    left_padding = 14*sc;  // left padding of text
    line_height1 = 15*sc;
    line_height = 13*sc;
    stats_top = y_top + mug_height + top_margin + top_padding;
    textAlign( LEFT, CENTER );

    // left column
    xs = x_pos + left_padding; 
    textSize(15*sc);
    textStyle(BOLD);

    texts = [
      '2024',
      // 'stats['season']',
      "Games: " + stats['games_played'],
      "Mins: " + stats['min'],
      ]
    for (var i = 0; i < texts.length; i++) {      
      textAlign( LEFT, TOP )
      text( texts[i], xs, stats_top + (i*line_height1) );
    }
    textStyle(NORMAL);
    // right column
    column_width = 80*sc;
    y_lines = 5;   // number of lines per column
    xs = x_pos + 140*sc; 
    textSize(12*sc);
    fill(255);
    yi = 0;
    xi = 0;
    no_show = ['games_played', 'player_id', 'season', 'min', 'ftm', 'fta', 'pf'];
    for (const [key, value] of Object.entries(stats)) {
      if (no_show.includes(key)) continue;
      values = `${key.toUpperCase()}: ${value.toPrecision(2)}`;
      textAlign( LEFT, TOP )
      text(values, xs + xi, stats_top + yi*line_height);
      yi ++;
      if (yi >= y_lines) {
        yi = 0;
        xi += column_width;
      }
    }

    // frame outline
    strokeWeight( stroke_size );
    stroke(255);
    noFill();
    rectMode( CENTER );

    // top
    // fill( 'rgb(0,255,0)' );
    rx = img_x;
    ry = mug_y;
    r_padding = 10*sc;  // margin all around
    r_width =  img.width + r_padding;
    r_height = mug_height + r_padding;
    rect( rx, ry, r_width, r_height);

    // bottom
    ry = img_y;
    r_height = (y_lines+1.4)*line_height;
    ry = stats_top + r_height/2.0 - r_padding;
    rect( rx, ry, r_width, r_height);

    // player score
    r_width = img.width * 0.28; // relative to image width
    r_height = 60*sc;
    rx = img.width - (r_width/2) + 14*sc;   
    ry = y_top - stroke_size;
    text_size = 50*sc;
    fill(0);
    noStroke();
    rect( rx, ry, r_width, r_height);  // erase
    stroke(255);
    strokeWeight( stroke_size );
    rect( rx, ry, r_width, r_height); 
    noStroke();
    noFill();
    fill(255);
    textSize( text_size );
    textStyle( NORMAL );
    textAlign( CENTER, CENTER );
    text(player_score, rx+text_size*0.03, ry+text_size*0.06);
  } 
  else{
    textSize(15*sc);
    text('ERROR: Player unavailable', 20, 100);
  }   

  textStyle( NORMAL );
  textAlign( LEFT, BOTTOM );  // restore back
  rectMode( CORNER );  // restore back
  imageMode( CORNER );  // restore back


  // make the next year
  if ( current_season < end_season ) {
    current_season += 1;
    make_stats_frame( null );
  }

  // if pic_only mode - do save
  if (pic_only) setup_pic();
  hideLoading();
}



//p5 filter

function makeDithered(img,steps) {
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtindex(img, x, y);
      let oldR = red(clr);
      let oldG = green(clr);
      let oldB = blue(clr);
      let newR = closestStep(255, steps, oldR);
      let newG = closestStep(255, steps, oldG);
      let newB = closestStep(255, steps, oldB);

      let newClr = color(newR, newG, newB);
      setColorAtIndex(img, x, y, newClr);

      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;

      distributeError(img, x, y, errR, errG, errB);
    }
  }

  img.updatePixels();
  // img.resize(400,0);  // resize happens in make_frame
}

function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
}

function getColorAtindex(img, x, y) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  let red = pix[idx];
  let green = pix[idx + 1];
  let blue = pix[idx + 2];
  let alpha = pix[idx + 3];
  return color(red, green, blue, alpha);
}

function setColorAtIndex(img, x, y, clr) {
  let idx = imageIndex(img, x, y);

  let pix = img.pixels;
  pix[idx] = red(clr);
  pix[idx + 1] = green(clr);
  pix[idx + 2] = blue(clr);
  pix[idx + 3] = alpha(clr);
}

// Finds the closest step for a given value
// The step 0 is always included, so the number of steps
// is actually steps + 1
function closestStep(max, steps, value) {
  return round(steps * value / 255) * floor(255 / steps);
}



function distributeError(img, x, y, errR, errG, errB) {
  addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
  addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
  addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
  addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
}

function addError(img, factor, x, y, errR, errG, errB) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
  let clr = getColorAtindex(img, x, y);
  let r = red(clr);
  let g = green(clr);
  let b = blue(clr);
  clr.setRed(r + errR * factor);
  clr.setGreen(g + errG * factor);
  clr.setBlue(b + errB * factor);

  setColorAtIndex(img, x, y, clr);
}