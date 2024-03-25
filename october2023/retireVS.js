#!/usr/bin/env node

//retire a set of vs



let serverHost = "https://authoring.nzhts.digital.health.nz/fhir/"

const fs = require('fs');
const axios = require('axios')

let lstToRetire = []
/*lstToRetire.push("canshare-haematology-histology")
lstToRetire.push("canshare-haematology-myeloid-histology")
lstToRetire.push("canshare-haematology-histiocytic-histology")
lstToRetire.push("canshare-haematology-b-cell-histology")
lstToRetire.push("canshare-haematology-t-nk-cell-histology")
lstToRetire.push("canshare-haematology-stroma-histology")
*/
lstToRetire.push("canshare-who-haematology-extranodal-nk-t-cell-lymphoma-histology")


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


        for (const id of lstToRetire) {
            console.log(id)
            let qry = `${serverHost}ValueSet/${id}`
            try {
                let response = await axios.get(qry,config)
                let vs = response.data
                vs.status = 'retired'
                
                let responseUpdate = await axios.put(qry,vs,config)


                console.log(response.data)
            } catch (ex ){
                //? not found

            }


           
        }


        //let qry = `${serverHost}ValueSet?status=retired`



    }
)


/**  "property": "concept",
            "op": "in",
            "value": "253111000210109" */