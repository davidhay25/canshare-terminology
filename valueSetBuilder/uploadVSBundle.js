#!/usr/bin/env node

//Upload a VS bundle after being created by makeAllVs.js


//todo - comment out this line when ready. It's a safety measre...
//return

const fs = require('fs');
const axios = require('axios')

let filename = `./vsBundle.json`
//this is the bundle of VS that will be uploaded

let bundle = JSON.parse(fs.readFileSync(filename).toString())



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
        try {

            for (const entry of bundle.entry) {
                let updateQry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet/${entry.resource.id}`
                console.log(updateQry)

                try {
                    console.log(entry.resource.id)
                    await axios.put(updateQry,entry.resource,config)
                   

                } catch (ex) {
                    console.log(ex.response.data)
                }
                    
            }
        } catch (ex) {
            console.log(ex.response.data)
        }



    })