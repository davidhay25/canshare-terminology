#!/usr/bin/env node

//Query against term server

//https://ontoserver.csiro.au/docs/6/openapi.html


//let serverHost = "https://authoring.nzhts.digital.health.nz/"
let serverHost = "https://nzhts.digital.health.nz/"

const fs = require('fs');
const axios = require('axios')


const cmFileName = "./canshare-scripted-december.json"

const clientSecret = "965jNRvSMhX0skvZtYWLcGweiktZ6xpy"
const clientId = "canshare"



async function getAccessToken() {
    let url = "https://authenticate.nzhts.digital.health.nz/auth/realms/nzhts/protocol/openid-connect/token"
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
           

            
            let qry = `${serverHost}fhir/ValueSet/canshare-tnm8-breast-cm`
            //let qry = `${serverHost}fhir/ValueSet?identifier=http://canshare.co.nz/fhir/NamingSystem/valuesets%7c`
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
    })



