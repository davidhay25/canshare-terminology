#!/usr/bin/env node

//compare the VS on the Term server, flagging those that don't appear in the 
//vs bundle. These need to be deleted as they are no longer valid
//This is a fixit as I uploaded the VS before the detaiuls were fonalized :(

const fs = require('fs');
const axios = require('axios')

let filename = `./valuesets/bundle.json`
//this is the bundle of VS that will be uploaded

let hashReal = {}
let bundleOfVS  =  JSON.parse(fs.readFileSync(filename).toString())
bundleOfVS.entry.forEach(function(entry){
    hashReal[entry.resource.id] = true
})

console.log(hashReal)

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
/*

        let qry1 = 'https://authoring.nzhts.digital.health.nz/fhir/ValueSet/canshare-staging-system'


        try {
            let result = await axios.get(qry1,config)
            //console.log(result.data)
        } catch (ex) {
            console.log(ex.response.data)
        }

        return
*/
        let qry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet?identifier=http://canshare.co.nz/fhir/NamingSystem/valuesets%7c` 
        console.log(qry)

        try {
            let result = await axios.get(qry,config)
            //console.log(result.data)

            let bundle = result.data
            //console.log(bundle)
            for (const entry of bundle.entry) {
            //bundle.entry.forEach(function(entry){
                if (! hashReal[entry.resource.id]) {
                    console.log("Extraneous: ",entry.resource.id)



                    //deactivating for safety!
                    if (true) {
                        console.log("will delete " + entry.resource.id)

                        let deleteQry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet/${entry.resource.id}`
                        console.log(deleteQry)

                        try {
                            await axios.delete(deleteQry,config)
                            console.log('deleted')

                        } catch (ex) {
                            console.log(ex.response.data)
                        }
                        



                   }


                } else {
                    console.log("OK: ",entry.resource.id)
                }
            }




        } catch (ex) {
            console.log(ex.response.data)
        }



    })