#!/usr/bin/env node

//Syndication API
//ensure that all canShare active ValueSets are set to be syndicated

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


            //set the codesystem
            let csId = "canshare-unpublished-concepts"
            console.log(`Syndicating CodeSystem ${csId}...`)

        

            const csOptions = {
                method: 'POST',
                url: `${serverHost}synd/setSyndicationStatus`,
                params: {resourceType: 'CodeSystem', id: csId, syndicate: 'true'},
                headers: {'Content-Type': 'application/json', authorization:'Bearer ' + at},
    
              };
              
            const { csData } = await axios.request(csOptions);

            console.log('...and done')



    

            //Set ConceptMaps. Only a specific CM for now - and a 1-off....
           
    
            let cmId = "canshare-select-valueset-map"

            console.log(`Syndicating ConceptMap ${cmId}...`)

            let qryCm = `${serverHost}synd/getSyndicationStatus?id=${cmId}&resourceType=ConceptMap`  
            let cmResponse = await axios.get(qryCm,config)

            //console.log(cmResponse.data)

            const options = {
                method: 'POST',
                url: `${serverHost}synd/setSyndicationStatus`,
                params: {resourceType: 'ConceptMap', id: cmId, syndicate: 'true'},
                headers: {'Content-Type': 'application/json', authorization:'Bearer ' + at},
    
              };
              
            const { data } = await axios.request(options);
            console.log('...and done')

            console.log('and now the ValueSets')
    

           //now the ValueSets
            let qry = `${serverHost}fhir/ValueSet?identifier=http://canshare.co.nz/fhir/NamingSystem/valuesets%7c&_count=5000`
            console.log(qry)
            let response = await axios.get(qry,config)
            let bundle = response.data
            for (const entry of bundle.entry) {
                let vs = entry.resource

                //console.log(vs.id,vs.status)

                let qry = `${serverHost}synd/getSyndicationStatus?id=${vs.id}&resourceType=ValueSet`  
                //console.log(qry)

                let config = {headers:{authorization:'Bearer ' + at}}
                config['Content-Type'] = "application/fhir+json"
                let response = await axios.get(qry,config)
                
                
                //console.log(response.data)

                let parameterResource = response.data //a parameters resource
                let isSyndicated = false
                for (const param of parameterResource.parameter) {
                    if (param.name == 'isSyndicated') {
                        isSyndicated = param.valueBoolean
                    }
                }

                console.log(`url: ${vs.id}   status:${vs.status}   isSyndicated:${isSyndicated}`)

                if (! isSyndicated) {
                    console.log('')
                    console.log('to be syndicated....')
                    const options = {
                        method: 'POST',
                        url: `${serverHost}synd/setSyndicationStatus`,
                        params: {resourceType: 'ValueSet', id: vs.id, syndicate: 'true'},
                        headers: {'Content-Type': 'application/json', authorization:'Bearer ' + at},
            
                      };
                      
                      const { data } = await axios.request(options);
                      console.log('...and done')
                      console.log('')
                }


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

