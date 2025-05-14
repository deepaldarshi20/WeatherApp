//initialization of all vars
const mapContain =document.getElementById('mapid');
//all the tile url for different maps
const mapType=['https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
                'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
                'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}']; 
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
//gets all elements to update the texts
const cinput=document.getElementById("cInp");
const tempDis=document.getElementById("temp");
const humid=document.getElementById("humid");
const cordLat=document.getElementById("lats");
const cordLng=document.getElementById("lngs");
const mWea=document.getElementById("mainWea");
const dWea=document.getElementById("desWea");
const tDif=document.getElementById("tDiff");
const cont=document.getElementById("cont");
const windD1=document.getElementById("windD1");
const windD2=document.getElementById("windD2");
const rainLh=document.getElementById("rainLh");
const MapI=document.getElementById("mapType");
const restLoc=document.getElementById("resetLoc");
const timeP=document.getElementById("timeP");
const timeL=document.getElementById("timeL");
const sub=document.getElementById("subInp");
const list=document.getElementById("cities");
const tview=document.getElementById("ti");
var loc;
var timeZ=0;
var nowTZ=0;


//list of countries
var countries=[];
var cities=[];


//Fills the datalist of countries from array

//sets default cursor
document.body.style.cursor = "default";
mapContain.style.cursor = 'default'

//Updates marker time and local time
setInterval(() => {
    if(loc&&Math.abs(loc[0])<=90&&Math.abs(loc[1])<=180){
        const dd=new Date();
        //time diffrence in secs
        var td=nowTZ-timeZ;
        //calculates time of marked location
        var totSec=dd.getHours()*3600+dd.getMinutes()*60+dd.getSeconds()+td;
        if(totSec<0)
        {
            totSec+=3600*24;
        }
        var h=(Math.floor(totSec/3600));
        var m=(Math.floor((totSec%3600)/60));
        var s=(Math.floor((totSec%3600)%60+Math.abs(td/23))%60);
        //calculates local time
        timeP.textContent=((h%12)<10?'0'+(h%12):(h%12))+':'+(m<10?'0'+m:m)+':'+(s<10?'0'+s:s)+(h>=12?' PM':' AM');
        h=dd.getHours();
        m=dd.getMinutes();
        s=dd.getSeconds();
        timeL.textContent=((h%12)<10?'0'+(h%12):(h%12))+':'+(m<10?'0'+m:m)+':'+(s<10?'0'+s:s)+(h>=12?' PM':' AM');
        
    }
}, 1000);

//resetsLocation on button click
resetLoc.addEventListener('click',e=>
{
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(data=>{
    loc=[data.coords.latitude,data.coords.longitude];
    marker.setLatLng(loc);
    mymap.panTo(loc,{
        animate:true,
        duration:0.25,
        easeLinearity:0.25,
        noMoveStart:false
    });
    mymap.setView(loc,13);
    getData(loc,true);
    });
});

//submits the location for api to fetch
sub.addEventListener('click',e=>{
    upCity(e);
});
//sets icon for the marker
var myIcon = L.icon({
    iconUrl: './icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});
//document.getElementById("mapid").height=window.innerHeight;
const marker=L.marker([50.5, 30.5],{icon:myIcon}).addTo(mymap);
 
//tells leaflet to use which mapTiles
L.tileLayer(mapType[0], {
    minZoom:1.5,
    noWrap: true,
    // maxBounds: [
    //     [-90, -180],
    //     [90, 180]
    // ],
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, '+
    '&copy; <a href="https://carto.com/attribution">CARTO</a>, '+
    '&copy; <a href="https://maps.google.com">GoogleMaps</a> contributors'
}).addTo(mymap);
//updates the mapTiles as per selection box
MapI.addEventListener('click',e=>
{
    if(MapI.value!=='Satellite View')
    {   
        //all other work with default subdomains
        L.tileLayer(mapType[MapI.selectedIndex], {
        minZoom:1.5,
        noWrap: true,
        bounds: [
            [-90, -180],
            [90, 180]
        ],
        }).addTo(mymap);
    }
    else
    {   
        //google satellite view requires different subdomains
        L.tileLayer(mapType[MapI.selectedIndex], {
        minZoom:1.5,
        noWrap: true,
        bounds: [
            [-90, -180],
            [90, 180]
        ],
        subdomains:['mt0','mt1','mt2','mt3'],
        }).addTo(mymap);
    }
});

       
//gets the timezone of start location
async function getTZ(){
    const response=await fetch('https://api.openweathermap.org/data/2.5/weather?lat='+loc[0]+'&lon='+loc[1]+'&APPID=d1ee38bfc0fac62b4e03627a5f6f384e&unit=metric');
    const data= await response.json();
    timeZ=data.timezone;
}

//gets data from the openweathermap api with coords parameters then stores important vars
async function getData(loca,fromClic)
{
    if(loca&&Math.abs(loca[0])<=85&&Math.abs(loca[1])<=180)
    {
        const response=await fetch('https://api.openweathermap.org/data/2.5/weather?lat='+loca[0]+'&lon='+loca[1]+'&APPID=d1ee38bfc0fac62b4e03627a5f6f384e&unit=metric');
        const data= await response.json();
        //gets marker timezone
        nowTZ=data.timezone;
        if(data.name&&fromClic){
            cinput.value=data.name;
        }
        else if(fromClic){
            cinput.value='UNKNOWN';
        }
        if(data){
            //updates values
                upScreen(data);
        }      
    }      
}
//updates marker location
mymap.on('click', (e) => { 
    loc=[e.latlng.lat,e.latlng.lng];
    if(loc&&Math.abs(loc[0])<=85&&Math.abs(loc[1])<=180)
    {
        marker.setLatLng(loc);
        getData(loc,true);
    }
    else{
        alert('Please stay inside the map.')
    }
});
//sets and resets cursor when dragging
mymap.on('dragstart',(e) => { 
    mapContain.style.cursor = 'grab'
});
mymap.on('dragend',(e) => { 
    mapContain.style.cursor = 'default'
});
//gets data from the openweathermap api with loction name parameters then stores important vars
async function upCity(e)
{
    try{
    e.preventDefault();
    var inp=cinput.value;
    
    if(inp)
    {
        const response=await fetch('https://api.openweathermap.org/data/2.5/weather?q='+inp+'&APPID=d1ee38bfc0fac62b4e03627a5f6f384e&unit=metric');
        if(!response.ok){
            throw response;
        }
        const data= await response.json();
        mymap.panTo([data.coord.lat,data.coord.lon],{
        animate:true,
        duration:0.25,
        easeLinearity:0.25,
        noMoveStart:false
        });
        loc=[data.coord.lat,data.coord.lon];
        nowTZ=data.timezone;
        mymap.setView(loc,13);   
        marker.setLatLng([data.coord.lat,data.coord.lon]);
        if(data){
            //updates values
            upScreen(data);
        }
        
    }}
    catch(err)
    {
        alert('This location is not in the database please enter some other location or find it on the map.Thank You');
    }
}
//changes texts on the screen
function upScreen(data)
{
    if(data){
        if(data.main){
            tDif.textContent='Max Temperature: '+(parseFloat(data.main.temp_max)-273).toFixed(2)+'°, Min Temperature: '+(parseFloat(data.main.temp_min)-273).toFixed(2)+'°';
            humid.textContent='Feels like: '+(parseFloat(data.main.feels_like)-273).toFixed(2)+'° Humidity:'+data.main.humidity+'%';
            if(data.main.temp){
                tempDis.textContent=(parseFloat(data.main.temp)-273).toFixed(2)+'°';
                
            }
            else
            {
                tempDis.textContent='--°';
                tDif.textContent='Max Temperature: --°, Min Temperature: --°';
        
            }
        }
        if(data.coord)
        {
            cordLat.textContent=('Latitude: '+data.coord.lat.toFixed(3)+'°')
            cordLng.textContent=('Longitude:'+data.coord.lon.toFixed(3)+'°');
        }
        if(data.weather[0]){
            mWea.textContent=data.weather[0].main;
            dWea.textContent='('+data.weather[0].description+', cloudiness:'+data.clouds.all+'%)';
        }
        if(data.sys.country){
            const pos = countries.map(function(e) { return e.code; }).indexOf(data.sys.country);
            cont.textContent=countries[pos].name;
        }
        else
        {
            cont.textContent="UNKNOWN";
        }
        const sp=parseFloat(data.wind.speed);    
        const spd=cond(sp);
        windD1.textContent=spd;
        windD2.textContent='Wind speed:'+data.wind.speed+' m/s, Gust:'+data.wind.gust+' m/s';  
        if(data.rain)
        {
            rainLh.textContent='Rain in last hour:'+data.rain['1h']+'mm';  
        }
        else{
            rainLh.textContent='No Rain Data.';
        }
    }
        
}
//Displays text according to Beaufort Scale 
function cond(sp){
    const ein=['Hurricane','Violent Storm','Strom','Severe Gale','Gale','Near Gale','Strong Breeze','Fresh Breeze','Moderate Breeze','Gentle Breeze','Light Breeze','Light Air','Calm'];
    var sel=ein.length;
    if(sp<0.3)
    {
        sel-=1;
    }
    else if(sp<1.5)
    {
        sel-=2;
    }
    else if(sp<3.3)
    {
        sel-=3;
    }
    else if(sp<5.5)
    {
        sel-=4;
    }
    else if(sp<8.0)
    {
        sel-=5;
    }
    else if(sp<10.8)
    {
        sel-=6;
    }
    else if(sp<13.9)
    {
        sel-=7;
    }
    else if(sp<17.2)
    {
        sel-=8;
    }
    else if(sp<20.7)
    {
        sel-=9;
    }
    else if(sp<24.5)
    {
        sel-=10;
    }
    else if(sp<28.4)
    {
        sel-=11;
    }
    else if(sp<32.6)
    {
        sel-=12;
    }
    else
    {
        sel-=13;
    }
    return ein[sel];
}
//updates the data based on the coordinates ever 6 secs
setInterval(() => {
    if(loc&&Math.abs(loc[0])<=85&&Math.abs(loc[1])<=180)
    {
        marker.setLatLng(loc);
        getData(loc,false);
    }
}, 6000);
var prpt=false;
f();
async function f()
{
    const data=await navigator.permissions.query({ name: 'geolocation' });
        if(data.state==='prompt')
        {
            timeP.remove();
            tview.remove();
            prpt=true;
            return;
        }
        if(data.state==='denied')
        {
            timeP.remove();
            tview.remove();
            return;
        }
        if(data.state==='granted')
        {
            return;
        }    
}
//gets the current location of the user
navigator.geolocation.getCurrentPosition(data=>{
    
    loc=[data.coords.latitude,data.coords.longitude];
    marker.setLatLng(loc);
    mymap.panTo(loc,{
        animate:true,
        duration:0.25,
        easeLinearity:0.25,
        noMoveStart:false
    });
    if(prpt)
    {
        location.reload();
    }
    mymap.setView(loc,13);
    getTZ();
    getData(loc,true);
    
});
fetch("./countries.json").then(response=>response.json()).then(json=>{
    countries=json;
    countries.forEach(element => {
        var ele = document.createElement("option");
        ele.append(element.name);
        list.appendChild(ele);
    });
    
});
fetch("./cities.json").then(response=>response.json()).then(json=>{
    cities=json;
    cities.forEach(element => {
        var ele = document.createElement("option");
        ele.append(element.name);
        list.appendChild(ele);
    });
    
});
