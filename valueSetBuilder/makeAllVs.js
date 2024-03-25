#!/usr/bin/env node

//old page web page https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=922098860]

//latest page https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=878499402

// Instructions
//1. download as valuesets.tsv in this folder. don't remove the first row (it gets ignored)
//2. change the vs.version in the makeVS to an appropriate date
//3. execute this script - will build 
//download the google doc and generate VS


const fs = require("fs")
let data = fs.readFileSync("./valuesets.tsv").toString()
let arValueSets = data.split(/\r?\n/)
//console.log(arValueSets)

let filename = `./vsBundle.json`  //the bundle of created ValueSets

let bundle = {resourceType:"Bundle",type:"batch",entry:[]}


//the codesystem to use for unpublished (when this is implemented).
let systemUnpublished = "http://canshare.co.nz/fhir/CodeSystem/snomed-unpublished"


makeVS = function(vo) {
  //console.log(vo)
  let vs = {resourceType:"ValueSet",id:vo.id}
  vs.language = "en-x-sctlang-23162100-0210105"
  vs.url = `https://nzhts.digital.health.nz/fhir/ValueSet/${vo.id}`
  vs.status = "active"
  vs.name = vo.id
  vs.title = vo.title
  vs.experimental = false
  //vs.version = "20230525"
  vs.version = "20240318"
  vs.identifier = [{system:"http://canshare.co.nz/fhir/NamingSystem/valuesets",value:vo.id}]
  vs.publisher = "Te Aho o Te Kahu"
  vs.contact = [{telecom:[{system:"email",value:"info@teaho.govt.nz"}]}]
  if (vo.description) {
    vs.description = vo.description
  }

  /*

  //clean the ECL. We need to remove the concept names
  let t = vo.ecl
  let cleanedEcl = ""
  let ar = t.split('OR')    //
  ar.forEach(function(item){
    let lne = item.trim()
    let ar1 = lne.split('|')
    cleanedEcl += ar1[0].trim() + " OR "
  })

  cleanedEcl = cleanedEcl.slice(0,cleanedEcl.length - 4)
  cleanedEcl = cleanedEcl.trim()


  console.log(vo.ecl," === ",cleanedEcl + "||")
*/
  //add the ecl as a filter
  let filter = {property:"constraint",op:"=",value:vo.ecl}
  let include = {system:"http://snomed.info/sct",version:"http://snomed.info/sct/21000210109",filter:[filter]}
  vs.compose = {include:[include]}

  //todo - need to process display concepts and unpublished concepts 
  //the poc app updateValueSet has a UI and code for this
  //will need to update the CodeSystem resource as well so worth checking the updateValueSet code...


  return vs
}




arValueSets.forEach(function(row,inx){
  if (inx > 0 ) {   //limit for now
    let arData = row.split(/\t/)
    //console.log(arData)

    if (arData[1] !== 'Retired') {
      console.log(arData[0])


      let id = arData[0].replace(/\s/g, "")

      let vo = {id:id,status:arData[1],title:arData[2],description:arData[3], ecl:arData[4]}

      //We've added space for display terms and display concepts - not not yet using tem
      vo.displayConcept = arData[5]   //if present, add a concept/s containing the contents to the ValueSet as well as the ecl 
      vo.unpublished = arData[6]   //if present, add concepts in the unpublished concepts namesystem
      let vs = makeVS(vo)
      //console.log(vs.id)
  
      let entry = {resource:vs,request:{method:"PUT",url:`ValueSet/${vs.id}`}}
      bundle.entry.push(entry)
    }

  }

  
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