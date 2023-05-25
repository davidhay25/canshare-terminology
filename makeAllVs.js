#!/usr/bin/env node

//web page https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=922098860]

//export as valuesets.tsv 

//download the google doc and generate VS
// page: 
//check that all id's are unique

makeVS = function(vo) {
  console.log(vo)
  let vs = {resourceType:"ValueSet",id:vo.id}
  vs.language = "en-x-sctlang-23162100-0210105"
  vs.url = `https://nzhts.digital.health.nz/fhir/ValueSet/${vo.id}`
  vs.status = "active"
  vs.name = vo.id
  vs.title = vo.title
  vs.experimental = false
  vs.version = "20230525"
  vs.identifier = [{system:"http://canshare.co.nz/fhir/NamingSystem/valuesets",value:vo.id}]
  vs.publisher = "Te Aho o Te Kahu"
  vs.contact = [{telecom:[{system:"email",value:"info@teaho.govt.nz"}]}]
  if (vo.description) {
    vs.description = vo.description
  }


  let filter = {property:"concept",op:"in",value:vo.refset}
  let include = {system:"http://snomed.info/sct",version:"http://snomed.info/sct/21000210109",filter:[filter]}
  vs.compose = {include:[include]}

  return vs
}

const fs = require("fs")
let data = fs.readFileSync("./valuesets.tsv").toString()
let arValueSets = data.split(/\r?\n/)
//console.log(arValueSets)

let bundle = {resourceType:"Bundle",type:"batch",entry:[]}


arValueSets.forEach(function(row,inx){
  if (inx > 0 ) {   //limit for now
    let arData = row.split(/\t/)
    console.log(arData)
    let vo = {id:arData[0],refset:arData[1],title:arData[2],description:arData[3]}
    let vs = makeVS(vo)
    console.log(vs.id)

    let entry = {resource:vs,request:{method:"PUT",url:`ValueSet/${vs.id}`}}
    bundle.entry.push(entry)

    //console.log(JSON.stringify(vs,null,2))



    //let filename = `./valuesets/${vo.id}.json`
    //fs.writeFileSync(filename,JSON.stringify(vs,null,2))
  }

  let filename = `./valuesets/bundle.json`
  fs.writeFileSync(filename,JSON.stringify(bundle,null,2))



})



/*

let url = "https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=922098860"

// Get the ID
const spreadsheetId = "1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE" //url.match(/d\/(\d+)/)[1];

// Get the tab name
const tabName = "Refsets (P1)"  //url.match(/gid\=(\w+)/)[1];

console.log(spreadsheetId,tabName)

const https = require('https');

// Create a new request
const request = https.request(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${tabName}`, (res) => {
  // Handle the response
  res.on('data', (chunk) => {
    // Do something with the data
    console.log(chunk.toString())
  });

  res.on('end', () => {
    // The request is complete
  });
});

// Send the request
request.end();
*/

/*
const request = axios.get(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=tsv&gid=${tabName}`);

// Handle the response
request.then((response) => {
  // Save the file
  console.log(response.data)
  //response.data.save("your-file.tsv");
});

// Handle the error
request.catch((error) => {
    console.log(error)
  // Handle the error
});

*/
//in the VS
//  use the id for id, url & name
//  set the title
//  make a name from the id