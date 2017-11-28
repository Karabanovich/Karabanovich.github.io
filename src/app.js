var Name;
var  search_div= document.createElement('div');
var videosDiv=document.createElement('div');
search_div.innerHTML = `
<button class = "button" onclick = "send()" search>
    <p class = "material-icons">search</p>
</button>
<input type="text" class="searchBox">`;
search_div.className = 'search';
videosDiv.className='videosDiv';
document.body.appendChild(search_div);
document.body.appendChild(videosDiv);
var children=[];
var footer = document.createElement("div");
footer.className="footer";
document.body.appendChild(footer);
var tablepx=320;
var tableCap = Math.floor(window.innerWidth/tablepx);
var tablecnt=15;
var curTable=0;
function scrollTo(num)
{
  var margin = num * tablepx ;
  videosDiv.style.transform = 'translate3D(-' +margin + 'px,0px,0px)';
  for (var j = 0; j < children.length; j++) {
    if ((children[j].offsetLeft - margin > window.innerWidth -tablepx)||(-children[j].offsetLeft + margin > 0))
      children[j].style.opacity = 0
     else
      children[j].style.opacity = 1
  }
}



function activateButton(i)
{
  for(var k=0;k<footer.children.length;k++)
  {
    footer.children[k].style="background-color: #E3E3E3;";
  }
  footer.children[i].style="background-color: #3D3D3D;";
  curTable=i*tableCap;
}

function rebutton()
{
  var buttonArr=document.getElementsByClassName('footer')[0];
  while(buttonArr.children.length>0)
  {
    buttonArr.removeChild(buttonArr.children[0]);
  }
  tableCap = Math.floor(window.innerWidth/tablepx);
  for(var j=0;j<Math.ceil(tablecnt/tableCap);j++)
  {
    var scr=  document.createElement("div");
    scr.className="scroll";
    (function (j){
    scr.addEventListener('click',function (){scrollTo(j*tableCap);activateButton(j);});
  })(j);
    footer.appendChild(scr);
  }
}

var xPos=0;
addEventListener("touchstart", down);
addEventListener("touchend", up);
addEventListener("mousedown", down);
addEventListener("mouseup",up);

function down(event){
   if(event.path[0].className!='searchBox'){
    xPos=event.pageX||event.touches[0].pageX;
    event.preventDefault();
  }
}
function up(event){
  if(event.path[0].className!='searchBox'){
  let X=event.pageX||event.changedTouches[event.changedTouches.length-1].pageX;
  let vector=(X-xPos)/Math.abs(X-xPos);
  if(vector<0)
  {
    if(curTable<(tablecnt-tableCap))
    {
      scrollTo(curTable+tableCap);
      activateButton(Math.floor(curTable/tableCap)+1);
    }
  }
  else
  if(vector>0)
  {
    if(curTable>=tableCap)
    {
      scrollTo(curTable-tableCap);
      activateButton(Math.floor(curTable/tableCap)-1);
    }
  }
}
}



window.addEventListener('resize', function () {
  rebutton();
  scrollTo(curTable);
})



function initial() {
    gapi.client.setApiKey("AIzaSyDaRiYEdHpX6OAOwuo-Ljrs2QAMet0zZug");
    gapi.client.load("youtube", "v3");
}
function send()
{
  videosDiv.innerHTML=``;
  Name = document.getElementsByClassName("searchBox")[0].value;
  defineRequest();
}
function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
      var value = properties[p];
      if (p && p.substr(-2, 2) == '[]') {
        var adjustedName = p.replace('[]', '');
        if (value) {
          normalizedProps[adjustedName] = value.split(',');
        }
        delete normalizedProps[p];
      }
    }
    for (var p in normalizedProps) {
      // Leave properties that don't have values out of inserted resource.
      if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
        var propArray = p.split('.');
        var ref = resource;
        for (var pa = 0; pa < propArray.length; pa++) {
          var key = propArray[pa];
          if (pa == propArray.length - 1) {
            ref[key] = normalizedProps[p];
          } else {
            ref = ref[key] = ref[key] || {};
          }
        }
      };
    }
    return resource;
  }

function removeEmptyParams(params) {
    for (var p in params) {
      if (!params[p] || params[p] == 'undefined') {
        delete params[p];
      }
    }
    return params;
  }
function buildApiRequest(requestMethod, path, params, properties) {
    params = removeEmptyParams(params);
    var request;
    if (properties) {
      var resource = createResource(properties);
      request = gapi.client.request({
          'body': resource,
          'method': requestMethod,
          'path': path,
          'params': params
      });
    } else {
      request = gapi.client.request({
          'method': requestMethod,
          'path': path,
          'params': params
      });
    }
    executeRequest(request);
  }


  
function defineRequest() {
  buildApiRequest('GET',
                '/youtube/v3/search',
                {'maxResults': '15',
                 'part': 'snippet',
                 'q': Name,
                 'type': ''});

}
function executeRequest(request) {
    request.execute(function(response) {
      var req=response;
      let ids='';
      for(let i=0;i<response.items.length;i++)
        ids+=response.items[i].id.videoId+' , '; 
      let stat = gapi.client.youtube.videos.list({ 
         id: ids, 
         part: 'statistics',  
      });    
      stat.execute(function(response){
        makeVideos(response,req);
      });
    });
  }
function makeVideos(stat,response){
    for(let i=0;i<stat.items.length;i++)
    {
   let video = document.createElement('div');
    video.className='video';
    video.innerHTML=`
    <img class = "videoPicture" src = ${response.items[i].snippet.thumbnails.medium.url}>
    <a class = "videoHref" href = ${"https://www.youtube.com/watch?v=" + response.items[i].id.videoId}>
      ${response.items[i].snippet.title}
    </a>
    <div class = "personIcon">
      <i class="material-icons">account_box</i>
    </div>
    <div class = "personName">
      ${response.items[i].snippet.channelTitle}
    </div>
    <div class="date">
      <div class = "personIcon">
        <i class="material-icons">date_range</i>
      </div> 
      <div class = "personName">
        ${response.items[i].snippet.publishedAt.substr(0, 10)}
      </div>
    </div>
    <div class="date">
      <div class = "personIcon">
          <i class="material-icons">visibility</i>
      </div>
      <div class = "personName">
        ${stat.items[i].statistics.viewCount}
      </div>
    </div>
    <div class="description">
      ${response.items[i].snippet.description}
    </div>`;
    videosDiv.appendChild(video);
    children[i]=video;
  }
  scrollTo(0);
  rebutton();
  activateButton(0);
}
