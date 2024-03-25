#!/usr/bin/env node
//Fix the April VS - name and url



let serverHost = "https://authoring.nzhts.digital.health.nz/fhir/"

const fs = require('fs');
const axios = require('axios')

let vsFileName = "./aprilVS.tsv"


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

        //iterate through the input file
        let vsFile = fs.readFileSync(vsFileName).toString()
        let arLines = vsFile.split('\r\n')

      //  console.log(arLines)
        console.log(arLines.length)
        console.log('==============')
        for (const lne of arLines){
            //console.log(lne)
            let ar = lne.split('\t')
            let name = ar[0]
            let refset = ar[1]
            let title = ar[2]
            let description = ar[3] 
            let previous = ar[5]


             //get the existing file based on the name
             let qry = `${serverHost}ValueSet/${name}`
             try {
                console.log(`Getting ${name}`)
                let response = await axios.get(qry,config)
                //console.log(`${name} retrieved`)


             } catch(ex) {
               
               
                
                if (ex.response) {
                   
                    if (ex.response.status == '404') {
                        console.log(`     >>>  not found`)
                    } else {
                        console.log(ex.response.status)
                    }

                } else {
                    console.log(ex)
                }
                
               
             }


        }

       

        //update the include


        //write it back






/*
        let qry = `${serverHost}ValueSet/canshare-data-absent-reason`
        try {
            let response = await axios.get(qry,config)

            let vs = response.data //a single resporce
            //console.log(JSON.stringify(vs,null,2))

            console.log(vs.compose.include[0].filter)

            //change the compose
            let inc = vs.compose.include[0]
            let filt = inc.filter[0]

            filt.property = "constraint"
            filt.op = '='
            filt.value = "^" + filt.value

            vs.compose.include[0].filter[0] = filt

            console.log(vs.compose.include[0].filter)




            //await axios.put(qry,vs,config)



            } catch (ex) {
                console.log(ex.response.data)
            }

            */

    }
)

