#!/usr/bin/env node

//Upload the ConceptMap created by makeConceptMapFromSS.js


let serverHost = "https://authoring.nzhts.digital.health.nz/fhir/"

const fs = require('fs');
const axios = require('axios')


const cmFileName = "./conceptmap.json"

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
console.log(at)
        let config = {headers:{authorization:'Bearer ' + at}}
        config['Content-Type'] = "application/fhir+json"

        let cmString = fs.readFileSync(cmFileName).toString()
        let cm = JSON.parse(cmString)

        let qry = `${serverHost}ConceptMap/${cm.id}`

        console.log(cm)
        console.log(qry)
                
        try {
            console.log(qry)
            
            let response = await axios.put(qry,cm,config)
 
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

