#!/usr/bin/env node

//Test that we can update - there's a permissions issue ATM

let serverHost = "https://authoring.nzhts.digital.health.nz/fhir/"

const fs = require('fs');
const axios = require('axios')


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

        let qry = `${serverHost}ValueSet?status=retired`

        console.log(qry)
        try {
            let response = await axios.get(qry,config)

            let vs = response.data //a single resporce
            console.log(JSON.stringify(vs,null,2))

            console.log(vs.compose.include[0].filter)

            //change the compose
            let inc = vs.compose.include[0]
            let filt = inc.filter[0]

            filt.property = "constraint"
            filt.op = '='
            filt.value = "^" + filt.value

            vs.compose.include[0].filter[0] = filt

            console.log(vs.compose.include[0].filter)



            //vs.status = 'active'

          //  await axios.put(qry,vs,config)


            //console.log(response.data)


            } catch (ex) {
                console.log(ex.response.data)
            }


    }
)


/**  "property": "concept",
            "op": "in",
            "value": "253111000210109" */