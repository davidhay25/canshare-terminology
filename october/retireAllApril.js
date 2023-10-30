#!/usr/bin/env node

//mark all the current canshare VS as retired. This is because some of the id's of valuesets were
//changed so we're retiring all then re-creating them.

let serverHost = "https://authoring.nzhts.digital.health.nz/fhir/"

const fs = require('fs');
const axios = require('axios')
/*
let filename = `./valuesets/bundle.json`
//this is the bundle of VS that will be uploaded

let hashReal = {}
let bundleOfVS  =  JSON.parse(fs.readFileSync(filename).toString())
bundleOfVS.entry.forEach(function(entry){
    hashReal[entry.resource.id] = true
})

console.log(hashReal)
*/
//return

const clientSecret = "965jNRvSMhX0skvZtYWLcGweiktZ6xpy"
const clientId = "canshare"

async function getAccessToken() {

    url = "https://authenticate.nzhts.digital.health.nz/auth/realms/nzhts/protocol/openid-connect/token"
   
    let body =`grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    
    try {
        let result = await axios.post(url,body)
        //console.log(result.data['access_token'])
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

        //retrieve all the VS

        //let qry = `${serverHost}ValueSet?identifier=http://canshare.co.nz/fhir/NamingSystem/valuesets%7c`
        let qry = `${serverHost}ValueSet/canshare-data-absent-reason`

        console.log(qry)
        try {
            let response = await axios.get(qry,config)

            let vs = response.data //a single resporce
            console.log(JSON.stringify(vs,null,2))
            vs.status = 'retired'

            await axios.put(qry,vs,config)


            console.log(response.data)

            //this is the update all code - to do once the permissions stuff has changed
            if (false) {
                let bundle = {}         //this will be the bundle retrieved by the GET all by identifier
                bundle.entry.forEach(function(entry){
                    let vs = entry.resource
                    vs.status = 'retired'
                    await axios.put(qry,vs,config)

                })
            }

            } catch (ex) {
                console.log(ex.response.data)
            }


    }
)