#!/usr/bin/env node

//create and upload based on the spreadsheer

//oct: https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=41348090

let serverHost = "https://authoring.nzhts.digital.health.nz/fhir/"

const fs = require('fs');
const axios = require('axios')

//the file is a tsv saved from the spreadsheet with the first row removed
let vsFileName = "./octoberVS.tsv"
//let vsFileName = "./aprilVS.tsv"


const clientSecret = "965jNRvSMhX0skvZtYWLcGweiktZ6xpy"
const clientId = "canshare"

makeVS = function(vo) {
    console.log(vo)




    let vs = {resourceType:"ValueSet",id:vo.id}
    vs.language = "en-x-sctlang-23162100-0210105"
    vs.url = `https://nzhts.digital.health.nz/fhir/ValueSet/${vo.id}`
    vs.status = "active"
    vs.date = "2023-11-01"
    vs.name = vo.id
    vs.title = vo.title
    vs.experimental = false
    vs.version = "20231101"
    vs.identifier = [{system:"http://canshare.co.nz/fhir/NamingSystem/valuesets",value:vo.id}]
    vs.publisher = "Te Aho o Te Kahu"
    vs.contact = [{telecom:[{system:"email",value:"info@teaho.govt.nz"}]}]
    if (vo.description) {
      vs.description = vo.description
    }
  
  
    //let filter = {property:"concept",op:"in",value:vo.refset}
    let filter = {property:"constraint",op:"=",value:`^${vo.refset}`}


    let include = {system:"http://snomed.info/sct",version:"http://snomed.info/sct/21000210109",filter:[filter]}
    vs.compose = {include:[include]}
  
    return vs
  }

async function getAccessToken() {
    url = "https://authenticate.nzhts.digital.health.nz/auth/realms/nzhts/protocol/openid-connect/token"
    let body =`grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    
    try {
        let result = await axios.post(url,body)    
        return result.data['access_token']
    } catch (ex) {
        console.log(ex)
    }
    
}



//upload all contents of a bundle
getAccessToken().then(
    async function(at) {

        let config = {headers:{authorization:'Bearer ' + at}}
        config['Content-Type'] = "application/fhir+json"

        //iterate through the input file
        let vsFile = fs.readFileSync(vsFileName).toString()
        let arLines = vsFile.split('\r\n')

        console.log(arLines.length)
        for (const lne of arLines){
            //console.log(lne)
            let ar = lne.split('\t')
            let vo = {}
            let name = ar[0]
            vo.id = ar[0]
            vo.refset = ar[1]
            vo.title = ar[2]
            vo.description = ar[3] 

            if (vo.id.length <= 64) {
             
            
                let vs = makeVS(vo)

                let qry = `${serverHost}ValueSet/${name}`
                
                try {
                    console.log(qry)
                    //let response = await axios.get(qry,config)
                    let response = await axios.put(qry,vs,config)
            


                // break

                } catch(ex) {
                
                
                    if (ex.response) {
                    
                        console.log(ex.response.status)
                        console.log(JSON.stringify(ex.response.data,null,2))
                    } else {
                        console.log(ex)
                    }

                    break
                    
                
                }

            }


        }

       

        //update the include


        //write it back






/*
        let qry = `${serverHost}ValueSet/canshare-data-absent-reason`
        try {
            let response = await axios.get(qry,config)

            let vs = response.data //a single resporce
            //console.log(JSON.stringify(vs,null,2))

            console.log(vs.compose.include[0].filter)

            //change the compose
            let inc = vs.compose.include[0]
            let filt = inc.filter[0]

            filt.property = "constraint"
            filt.op = '='
            filt.value = "^" + filt.value

            vs.compose.include[0].filter[0] = filt

            console.log(vs.compose.include[0].filter)




            //await axios.put(qry,vs,config)



            } catch (ex) {
                console.log(ex.response.data)
            }

            */

    }
)

