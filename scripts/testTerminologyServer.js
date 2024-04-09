#!/usr/bin/env node

//Test that the terminology server is available

console.log('Attempting to retrieve ConceptMaps from Terminology server as a connectivity test...')


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
        //console.log("Access log retrieved")
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

    
        let qry = `${serverHost}ConceptMap`

        console.log('Query: GET ' + qry)
                
        try {
            console.log(qry)
            
            let response = await axios.get(qry,config)
            console.log("Query succeeded")
 
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

