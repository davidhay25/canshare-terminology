#!/usr/bin/env node

//Syndication API

//https://ontoserver.csiro.au/docs/6/openapi.html


let serverHost = "https://authoring.nzhts.digital.health.nz/"

const fs = require('fs');
const axios = require('axios')


const cmFileName = "./canshare-scripted-december.json"

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

getAccessToken().then(
    async function(at) {

        let config = {headers:{authorization:'Bearer ' + at}}
        config['Content-Type'] = "application/fhir+json"

        try {
           
            let qry = `${serverHost}fhir/ValueSet?identifier=http://canshare.co.nz/fhir/NamingSystem/valuesets%7c`
            console.log(qry)
            let response = await axios.get(qry,config)
            let bundle = response.data
            for (const entry of bundle.entry) {
                let vs = entry.resource
                console.log(vs.id,vs.status)

                let qry = `${serverHost}synd/getSyndicationStatus?id=${vs.id}&resourceType=ValueSet`  
                console.log(qry)

                let config = {headers:{authorization:'Bearer ' + at}}
                config['Content-Type'] = "application/fhir+json"
                let response = await axios.get(qry,config)
                console.log(response.data)


                /*
                if (vs.status == 'active') {
                    console.log('    >>> updating')

                    const options = {
                        method: 'POST',
                        url: `${serverHost}synd/setSyndicationStatus`,
                        params: {resourceType: 'ValueSet', id: vs.id, syndicate: 'true'},
                        headers: {'Content-Type': 'application/json', authorization:'Bearer ' + at},
            
                      };
                      
                      const { data } = await axios.request(options);

                }
                */

            }

            //console.log(response.data)

        } catch(ex) {

            if (ex.response) {
            
                console.log(ex.response.status)
                console.log(JSON.stringify(ex.response.data,null,2))
            } else {
                console.log(ex)
            }

                
        }
    })

return


//upload all contents of a bundle
getAccessToken().then(
    async function(at) {

        let id = "canshare-data-absent-reason"


        let qry = `${serverHost}synd/getSyndicationStatus?id=${id}&resourceType=ValueSet`  
        console.log(qry)

        let config = {headers:{authorization:'Bearer ' + at}}
        config['Content-Type'] = "application/fhir+json"
     
        try {
            console.log(qry)
            
            let response = await axios.get(qry,config)
            console.log(response.data)
 
        } catch(ex) {
        
            if (ex.response) {
            
                console.log(ex.response.status)
                console.log(JSON.stringify(ex.response.data,null,2))
            } else {
                console.log(ex)
            }

                  
        }

/*
        //update
        const options = {
            method: 'POST',
            url: `${serverHost}synd/setSyndicationStatus`,
            params: {resourceType: 'ValueSet', id: id, syndicate: 'true'},
            headers: {'Content-Type': 'application/json', authorization:'Bearer ' + at},

          };
          
          try {
            const { data } = await axios.request(options);
            console.log(data);
          } catch (error) {
            console.error(error);
          }
*/



    }
)

