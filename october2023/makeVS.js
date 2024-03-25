#!/usr/bin/env node

// make a bundle of all VS using ECL syntax

makeVS = function(vo) {
    console.log(vo)
    let vs = {resourceType:"ValueSet",id:vo.id}
    vs.language = "en-x-sctlang-23162100-0210105"
    vs.url = `https://nzhts.digital.health.nz/fhir/ValueSet/${vo.id}`
    vs.status = "active"
    let ar = vo.id.split('-')
    let name = ""
    ar.forEach(function(segment){
        name += segment.charAt(0).toUpperCase() + segment.slice(1)
    })
    vs.name = name
    vs.title = vo.title
    vs.experimental = false
    vs.version = "20231005"
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
  let data = fs.readFileSync("./octoberVS.tsv").toString()
  let arValueSets = data.split(/\r?\n/)
  //console.log(arValueSets)
  
  let bundle = {resourceType:"Bundle",type:"batch",entry:[]}
  
  
  arValueSets.forEach(function(row,inx){
    if (inx > 0 && inx < 2  ) {   //limit for now
      let arData = row.split(/\t/)
      console.log(arData)
      let vo = {id:arData[0],refset:arData[1],title:arData[2],description:arData[3]}
      let vs = makeVS(vo)
      console.log(vs.id)
  
      let entry = {resource:vs,request:{method:"PUT",url:`ValueSet/${vs.id}`}}
      bundle.entry.push(entry)
  
      console.log(JSON.stringify(vs,null,2))
  
  
  
      //let filename = `./valuesets/${vo.id}.json`
      //fs.writeFileSync(filename,JSON.stringify(vs,null,2))
    }
  
    let filename = `./valuesets/bundle.json`
    //fs.writeFileSync(filename,JSON.stringify(bundle,null,2))
  })
  
  