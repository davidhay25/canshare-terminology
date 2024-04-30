#!/usr/bin/env node

//Upload ta single artifact

//const fileToUpload = "./StructureDefinition-canshare-depends-on.json"
const fileToUpload = "./codesystem.json"


let serverHost = "https://authoring.nzhts.digital.health.nz/"


const fs = require('fs');
const axios = require('axios')



const clientSecret = "965jNRvSMhX0skvZtYWLcGweiktZ6xpy"
const clientId = "canshare"

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
        //console.log(at)
        let config = {headers:{authorization:'Bearer ' + at}}
        config['Content-Type'] = "application/fhir+json"

        let jsonString = fs.readFileSync(fileToUpload).toString()
        let json = JSON.parse(jsonString)


        let qry = `${serverHost}fhir/${json.resourceType}/$validate`

        try {
            console.log(qry)

            //upload the Artifact
            console.log(`Validating ${fileToUpload} ...`)

            let response = await axios.post(qry,json,config)

            console.log(response.data)
            fs.writeFileSync("./OO.json",JSON.stringify(response.data))
            console.log('...and done')
            console.log('')

            
 
        } catch(ex) {
        
            if (ex.response) {
            
                console.log(ex.response.status)
                console.log(JSON.stringify(ex.response.data,null,2))
            } else {
                console.log(ex)
            }

                  
        }

    }
)

